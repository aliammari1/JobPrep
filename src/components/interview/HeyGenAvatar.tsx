"use client";

import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
	AvatarQuality,
	StreamingEvents,
	TaskType,
	VoiceChatTransport,
} from "@heygen/streaming-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Mic,
	MicOff,
	Volume2,
	VolumeX,
	Play,
	Square,
	Send,
	Loader2,
} from "lucide-react";

interface HeyGenAvatarProps {
	avatarId?: string;
	voiceId?: string;
	quality?: AvatarQuality;
	onError?: (error: string) => void;
	questionToSpeak?: string; // Auto-speak this question when it changes
}

export default function HeyGenAvatar({
  avatarId = "SilasHR_public",
  voiceId,
  quality = AvatarQuality.Low,
  onError,
  questionToSpeak,
}: HeyGenAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingVoiceChat, setIsLoadingVoiceChat] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    avatarName: string;
  } | null>(null);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const mediaStreamRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (avatarRef.current) {
        avatarRef.current.stopAvatar().catch(console.error);
      }
    };
  }, []);

  // Auto-speak question when it changes
  useEffect(() => {
    if (questionToSpeak && avatarRef.current && sessionData) {
      avatarRef.current.speak({
        text: questionToSpeak,
        task_type: TaskType.TALK,
      }).catch((error) => {
        console.error("Error speaking question:", error);
      });
    }
  }, [questionToSpeak, sessionData]);

  useEffect(() => {
    if (stream && mediaStreamRef.current) {
      mediaStreamRef.current.srcObject = stream;
      mediaStreamRef.current.onloadedmetadata = () => {
        mediaStreamRef.current?.play().catch(console.error);
      };
    }
  }, [stream]);

  const initializeAvatar = async () => {
    try {
      setIsLoadingSession(true);

      // Get token from API
      const tokenResponse = await fetch("/api/heygen/token", {
        method: "POST",
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        if (
          tokenResponse.status === 500 &&
          errorData.error?.includes("HEYGEN_API_KEY")
        ) {
          throw new Error(
            "HeyGen API key not configured. Please add HEYGEN_API_KEY to your .env.local file. See HEYGEN_SETUP.md for instructions.",
          );
        }
        throw new Error(
          `Failed to get HeyGen token: ${errorData.error || tokenResponse.statusText}`,
        );
      }

			const { data } = await tokenResponse.json();
			const token = data?.token;

			if (!token) {
				throw new Error("No token received from API");
			}

			console.log("Token received, initializing avatar...");

			// Initialize streaming avatar
			const avatar = new StreamingAvatar({ token });
			avatarRef.current = avatar;
			
			console.log("Avatar SDK initialized, creating session...");      // Setup event listeners
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log("Avatar started talking");
        setIsSpeaking(true);
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log("Avatar stopped talking");
        setIsSpeaking(false);
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        setStream(null);
        setSessionData(null);
        setIsVoiceChatActive(false);
      });

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail);
        const mediaStream = event.detail;
        setStream(mediaStream);
      });

      avatar.on(StreamingEvents.USER_START, () => {
        console.log("User started speaking");
        setIsListening(true);
      });

      avatar.on(StreamingEvents.USER_STOP, () => {
        console.log("User stopped speaking");
        setIsListening(false);
      });

      // Create and start avatar session
      console.log("Calling createStartAvatar with:", { 
        quality, 
        avatarName: avatarId, 
        language: "en" 
      });
      
      const session = await avatar.createStartAvatar({
        quality,
        avatarName: avatarId,
        language: "en",
        voiceChatTransport: VoiceChatTransport.WEBSOCKET,
        knowledgeBase: "You are an interview assistant. Your ONLY job is to read the interview questions exactly as provided to you. Do NOT add any business advice, commentary, suggestions, or extra information. Just read the questions word-for-word and wait for the candidate's response. Never talk about business topics unless specifically asked in the question itself.",
      });

      console.log("Avatar session created successfully:", session);

      setSessionData({
        sessionId: session.session_id,
        avatarName: avatarId,
      });
    } catch (error) {
      console.error("Error initializing avatar:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = "Failed to initialize avatar";

      if (error instanceof Error) {
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          errorMessage =
            "Network error: Could not connect to HeyGen API. This may indicate an invalid API key, incorrect avatar ID, or network issues. Try using avatarId='default' or check your API key.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          errorMessage =
            "Invalid HeyGen API key. Please check your HEYGEN_API_KEY in .env.local";
        } else if (error.message.includes("404")) {
          errorMessage = `Avatar '${avatarId}' not found. Try using avatarId='default' or check available avatars in your HeyGen dashboard.`;
        } else {
          errorMessage = error.message;
        }
      }

      onError?.(errorMessage);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const startVoiceChat = async () => {
    if (!avatarRef.current) return;

    try {
      setIsLoadingVoiceChat(true);
      await avatarRef.current.startVoiceChat({
        isInputAudioMuted: isMuted,
      });
      setIsVoiceChatActive(true);
      console.log("Voice chat started");
    } catch (error) {
      console.error("Error starting voice chat:", error);
      onError?.("Failed to start voice chat");
    } finally {
      setIsLoadingVoiceChat(false);
    }
  };

  const stopVoiceChat = async () => {
    if (!avatarRef.current) return;

    try {
      await avatarRef.current.closeVoiceChat();
      setIsVoiceChatActive(false);
      setIsListening(false);
      console.log("Voice chat stopped");
    } catch (error) {
      console.error("Error stopping voice chat:", error);
    }
  };

  const stopAvatar = async () => {
    if (!avatarRef.current) return;

    try {
      await avatarRef.current.stopAvatar();
      setStream(null);
      setSessionData(null);
      setIsVoiceChatActive(false);
      avatarRef.current = null;
      console.log("Avatar stopped");
    } catch (error) {
      console.error("Error stopping avatar:", error);
    }
  };

  const sendTextMessage = async () => {
    if (!avatarRef.current || !textInput.trim()) return;

    try {
      await avatarRef.current.speak({
        text: textInput,
        task_type: TaskType.TALK,
      });
      setTextInput("");
    } catch (error) {
      console.error("Error sending text:", error);
      onError?.("Failed to send message");
    }
  };

  const toggleMute = async () => {
    if (!avatarRef.current || !isVoiceChatActive) return;

    try {
      const newMutedState = !isMuted;
      // You can implement mute logic here if needed
      setIsMuted(newMutedState);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const interruptAvatar = async () => {
    if (!avatarRef.current) return;

    try {
      await avatarRef.current.interrupt();
      console.log("Avatar interrupted");
    } catch (error) {
      console.error("Error interrupting avatar:", error);
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Interview Avatar</h3>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <span className="flex items-center gap-1 text-sm text-blue-500">
              <Volume2 className="w-4 h-4 animate-pulse" />
              Speaking
            </span>
          )}
          {isListening && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <Mic className="w-4 h-4 animate-pulse" />
              Listening
            </span>
          )}
        </div>
      </div>

      {/* Video Stream */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {isLoadingSession ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Starting avatar session...</p>
              </div>
            ) : (
              <p className="text-sm">Avatar not started</p>
            )}
          </div>
        )}
        <video
          ref={mediaStreamRef}
          autoPlay
          playsInline
          aria-label="AI Avatar Video Stream"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Session Controls */}
      <div className="flex gap-2">
        {!sessionData ? (
          <Button
            onClick={initializeAvatar}
            disabled={isLoadingSession}
            className="flex-1"
          >
            {isLoadingSession ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Avatar
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={stopAvatar}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Avatar
            </Button>
            {!isVoiceChatActive ? (
              <Button
                onClick={startVoiceChat}
                disabled={isLoadingVoiceChat}
                className="flex-1"
              >
                {isLoadingVoiceChat ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Voice Chat
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopVoiceChat}
                variant="secondary"
                className="flex-1"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop Voice Chat
              </Button>
            )}
          </>
        )}
      </div>

      {/* Voice Chat Controls */}
      {isVoiceChatActive && (
        <div className="flex gap-2">
          <Button onClick={toggleMute} variant="outline" size="icon">
            {isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={interruptAvatar}
            variant="outline"
            className="flex-1"
          >
            <VolumeX className="w-4 h-4 mr-2" />
            Interrupt
          </Button>
        </div>
      )}

      {/* Session Info */}
      {sessionData && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Session ID: {sessionData.sessionId}</p>
          <p>Avatar: {sessionData.avatarName}</p>
        </div>
      )}
    </Card>
  );
}
