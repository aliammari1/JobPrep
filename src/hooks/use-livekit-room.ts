"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Track,
  LocalTrackPublication,
  RemoteTrackPublication,
  Participant,
  DataPacket_Kind,
} from 'livekit-client';

interface UseLiveKitRoomOptions {
  roomName: string;
  participantName: string;
  metadata?: string;
}

export interface ParticipantInfo {
  id: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  metadata?: string;
}

export function useLiveKitRoom({
  roomName,
  participantName,
  metadata,
}: UseLiveKitRoomOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);

  // Fetch token from API
  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          participantName,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      return data.token;
    } catch (err) {
      throw new Error('Could not fetch access token');
    }
  }, [roomName, participantName, metadata]);

  // Convert Participant to ParticipantInfo
  const participantToInfo = useCallback((participant: Participant, isLocal: boolean): ParticipantInfo => {
    const videoTrack = Array.from(participant.videoTrackPublications.values()).find(
      (pub) => pub.source === Track.Source.Camera
    );
    const audioTrack = Array.from(participant.audioTrackPublications.values()).find(
      (pub) => pub.source === Track.Source.Microphone
    );
    const screenTrack = Array.from(participant.videoTrackPublications.values()).find(
      (pub) => pub.source === Track.Source.ScreenShare
    );

    return {
      id: participant.sid,
      name: participant.name || participant.identity,
      isLocal,
      isSpeaking: participant.isSpeaking,
      isCameraEnabled: videoTrack?.isSubscribed ?? false,
      isMicrophoneEnabled: audioTrack?.isSubscribed ?? false,
      isScreenShareEnabled: screenTrack?.isSubscribed ?? false,
      metadata: participant.metadata,
    };
  }, []);

  // Update participants list
  const updateParticipants = useCallback((room: Room) => {
    const remoteParticipants = Array.from(room.remoteParticipants.values()).map(
      (p) => participantToInfo(p, false)
    );
    const local = room.localParticipant
      ? [participantToInfo(room.localParticipant, true)]
      : [];
    
    setParticipants([...local, ...remoteParticipants]);
  }, [participantToInfo]);

  // Connect to room
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const token = await fetchToken();
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      // Set up event listeners
      newRoom
        .on(RoomEvent.Connected, () => {
          setIsConnected(true);
          setIsConnecting(false);
          setLocalParticipant(newRoom.localParticipant);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.Disconnected, () => {
          setIsConnected(false);
          setParticipants([]);
        })
        .on(RoomEvent.ParticipantConnected, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.ParticipantDisconnected, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.TrackSubscribed, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.TrackUnsubscribed, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.LocalTrackPublished, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.LocalTrackUnpublished, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.ActiveSpeakersChanged, () => {
          updateParticipants(newRoom);
        });

      // Connect to the room
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
      await newRoom.connect(wsUrl, token);

      setRoom(newRoom);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, fetchToken, updateParticipants]);

  // Disconnect from room
  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setLocalParticipant(null);
      setParticipants([]);
    }
  }, [room]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (!localParticipant) return;
    const enabled = localParticipant.isCameraEnabled;
    await localParticipant.setCameraEnabled(!enabled);
    if (room) updateParticipants(room);
  }, [localParticipant, room, updateParticipants]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant) return;
    const enabled = localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(!enabled);
    if (room) updateParticipants(room);
  }, [localParticipant, room, updateParticipants]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;
    const enabled = localParticipant.isScreenShareEnabled;
    await localParticipant.setScreenShareEnabled(!enabled);
    if (room) updateParticipants(room);
  }, [localParticipant, room, updateParticipants]);

  // Send data message
  const sendDataMessage = useCallback(
    async (data: any, kind: DataPacket_Kind = DataPacket_Kind.RELIABLE) => {
      if (!localParticipant) return;
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(data));
      await localParticipant.publishData(encodedData, { reliable: kind === DataPacket_Kind.RELIABLE });
    },
    [localParticipant]
  );

  // Listen for data messages
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant
    ) => {
      const decoder = new TextDecoder();
      const message = decoder.decode(payload);
      try {
        const data = JSON.parse(message);
        // Emit custom event for data messages
        window.dispatchEvent(new CustomEvent('livekit-data', { detail: { data, participant } }));
      } catch (e) {
        console.error('Failed to parse data message', e);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return {
    room,
    isConnecting,
    isConnected,
    error,
    participants,
    localParticipant,
    connect,
    disconnect,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    sendDataMessage,
  };
}
