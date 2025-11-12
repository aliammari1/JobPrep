import { useEffect, useCallback, useRef, useMemo } from "react";
import { RoomEvent } from "livekit-client";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "message" | "note" | "question";
}

interface FileShare {
  id: string;
  name: string;
  size: number;
  url: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}

export function useLiveKitChat(onMessageReceived: (message: ChatMessage) => void, onFileShared: (file: FileShare) => void) {
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Send message through LiveKit data channel
  const broadcastMessage = useCallback(
    (message: ChatMessage) => {
      try {
        const payload = {
          type: "chat_message",
          data: {
            id: message.id,
            senderId: message.senderId,
            senderName: message.senderName,
            message: message.message,
            timestamp: message.timestamp.toISOString(),
            messageType: message.type,
          },
        };

        // Send via window message event (custom event system)
        window.dispatchEvent(
          new CustomEvent("livekit-message", {
            detail: payload,
          })
        );
      } catch (error) {
        console.error("Failed to broadcast message:", error);
      }
    },
    []
  );

  // Send file through LiveKit data channel
  const broadcastFile = useCallback(
    (file: FileShare) => {
      try {
        const payload = {
          type: "file_share",
          data: {
            id: file.id,
            name: file.name,
            size: file.size,
            url: file.url,
            senderId: file.senderId,
            senderName: file.senderName,
            timestamp: file.timestamp.toISOString(),
          },
        };

        // Send via window message event (local simulation for now)
        window.dispatchEvent(
          new CustomEvent("livekit-message", {
            detail: payload,
          })
        );
      } catch (error) {
        console.error("Failed to broadcast file:", error);
      }
    },
    []
  );

  // Listen for incoming messages from other participants
  useEffect(() => {
    const handleDataReceived = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;

      try {
        const data = event.detail;

        if (data.type === "chat_message") {
          const messageData = data.data;
          const message: ChatMessage = {
            id: messageData.id,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            message: messageData.message,
            timestamp: new Date(messageData.timestamp),
            type: messageData.messageType,
          };
          onMessageReceived(message);
        } else if (data.type === "file_share") {
          const fileData = data.data;
          const file: FileShare = {
            id: fileData.id,
            name: fileData.name,
            size: fileData.size,
            url: fileData.url,
            senderId: fileData.senderId,
            senderName: fileData.senderName,
            timestamp: new Date(fileData.timestamp),
          };
          onFileShared(file);
        }
      } catch (error) {
        console.error("Failed to parse received data:", error);
      }
    };

    // Listen for data from room
    window.addEventListener("livekit-message", handleDataReceived);

    return () => {
      window.removeEventListener("livekit-message", handleDataReceived);
    };
  }, [onMessageReceived, onFileShared]);

  return {
    broadcastMessage,
    broadcastFile,
    isConnected: true, // Simple check - can be enhanced with actual room state
  };
}
