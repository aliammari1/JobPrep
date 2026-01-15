"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCallInterfaceProps {
  isConnected?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  isMuted?: boolean;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  onToggleMute?: () => void;
  onEndCall?: () => void;
  onSettings?: () => void;
  participantName?: string;
  duration?: string;
  className?: string;
}

export function VideoCallInterface({
  isConnected = false,
  isAudioEnabled = true,
  isVideoEnabled = true,
  isMuted = false,
  onToggleAudio,
  onToggleVideo,
  onToggleMute,
  onEndCall,
  onSettings,
  participantName = "AI Interviewer",
  duration = "00:00",
  className,
}: VideoCallInterfaceProps) {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-black/95 border-none",
        className,
      )}
    >
      <CardContent className="p-0 relative h-full">
        {/* Video Background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 to-purple-900/20">
          {!isVideoEnabled && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-12 h-12" />
                </div>
                <p className="text-lg">{participantName}</p>
                <p className="text-sm text-white/70">Camera is off</p>
              </div>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 left-4 z-20">
          <Badge
            variant={isConnected ? "secondary" : "destructive"}
            className="bg-black/50 text-white border-none"
          >
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>

        {/* Call Info */}
        <div className="absolute top-4 right-4 z-20">
          <div className="text-right text-white">
            <p className="text-sm font-medium">{participantName}</p>
            <p className="text-xs text-white/70">{duration}</p>
          </div>
        </div>

        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
              onMouseEnter={() => setShowControls(true)}
            >
              <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-2xl p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleAudio}
                  className={cn(
                    "rounded-full h-12 w-12 transition-colors",
                    isAudioEnabled
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white",
                  )}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleVideo}
                  className={cn(
                    "rounded-full h-12 w-12 transition-colors",
                    isVideoEnabled
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white",
                  )}
                >
                  {isVideoEnabled ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleMute}
                  className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSettings}
                  className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onEndCall}
                  className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap to show controls overlay */}
        {!showControls && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => setShowControls(true)}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface AudioVisualizerProps {
  isActive?: boolean;
  className?: string;
}

export function AudioVisualizer({
  isActive = false,
  className,
}: AudioVisualizerProps) {
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="w-1 bg-green-500 rounded-full"
          animate={
            isActive
              ? {
                  height: [4, 12, 4],
                  opacity: [0.4, 1, 0.4],
                }
              : {
                  height: 4,
                  opacity: 0.4,
                }
          }
          transition={{
            duration: 0.5,
            repeat: isActive ? Infinity : 0,
            delay: bar * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
