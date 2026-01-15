"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";

interface LiveKitVideoRoomProps {
  roomName: string;
  participantName: string;
  onDisconnect?: () => void;
}

export function LiveKitVideoRoom({
  roomName,
  participantName,
  onDisconnect,
}: LiveKitVideoRoomProps) {
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/livekit/token?roomName=${encodeURIComponent(
            roomName,
          )}&participantName=${encodeURIComponent(participantName)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const data = await response.json();
        setToken(data.token);
      } catch (err) {
        console.error("Error fetching LiveKit token:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect to video room",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [roomName, participantName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-900 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Connecting to video room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-900 rounded-lg">
        <div className="text-center max-w-md">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h3 className="text-red-400 font-semibold mb-2">
              Connection Error
            </h3>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <p className="text-gray-400 text-xs">
              Please check your LiveKit configuration in .env.local
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!serverUrl) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-900 rounded-lg">
        <div className="text-center">
          <p className="text-red-400">LiveKit URL not configured</p>
          <p className="text-gray-400 text-sm mt-2">
            Please set NEXT_PUBLIC_LIVEKIT_URL in your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      onDisconnected={onDisconnect}
      className="h-full rounded-lg overflow-hidden"
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
