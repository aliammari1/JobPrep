"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { ReactNode } from "react";

type InterviewLiveKitConferenceProps = {
  token: string;
  serverUrl: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  children?: ReactNode;
};

/** Isolated so LiveKit + styles stay out of the interview-room entry chunk until join. */
export function InterviewLiveKitConference({
  token,
  serverUrl,
  onConnected,
  onDisconnected,
  children,
}: InterviewLiveKitConferenceProps) {
  return (
    <LiveKitRoom
      video
      audio
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: "calc(100vh - 300px)" }}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
    >
      <VideoConference />
      <RoomAudioRenderer />
      {children}
    </LiveKitRoom>
  );
}
