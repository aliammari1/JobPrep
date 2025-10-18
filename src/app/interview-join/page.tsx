"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Video, Users, Brain, MessageSquare, FileText, Zap } from "lucide-react";
import Link from "next/link";

export default function InterviewRoomLanding() {
  const [roomName, setRoomName] = useState(`interview-${Date.now()}`);
  const [participantName, setParticipantName] = useState("");

  const joinRoom = () => {
    if (participantName.trim()) {
      window.location.href = `/interview-room?room=${roomName}&name=${encodeURIComponent(participantName)}`;
    }
  };

  const features = [
    {
      icon: Video,
      title: "HD Video & Audio",
      description: "Crystal clear video conferencing powered by LiveKit WebRTC technology",
    },
    {
      icon: Users,
      title: "Multi-Participant",
      description: "Support for multiple interviewers, candidates, and observers",
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Real-time transcription and AI-powered interview analysis",
    },
    {
      icon: MessageSquare,
      title: "Real-Time Chat",
      description: "In-meeting messaging and collaborative note-taking",
    },
    {
      icon: FileText,
      title: "Recording & Transcripts",
      description: "Automatic recording with speech-to-text transcription",
    },
    {
      icon: Zap,
      title: "Screen Sharing",
      description: "Share your screen for technical assessments and presentations",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Interview Room
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Professional Video Interviews with AI-Powered Insights
          </p>
          <p className="text-sm text-gray-400">
            Powered by LiveKit, Web Speech API, and Modern Web Technologies
          </p>
        </div>

        {/* Join Room Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Join Interview Room</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your details to start or join an interview session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room" className="text-white">Room Name</Label>
                <Input
                  id="room"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="interview-room-1"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400">
                  Share this room name with other participants
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Your Name</Label>
                <Input
                  id="name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                />
              </div>

              <Button
                onClick={joinRoom}
                disabled={!participantName.trim()}
                className="w-full"
                size="lg"
              >
                <Video className="w-5 h-5 mr-2" />
                Join Interview Room
              </Button>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                  Your browser will request camera and microphone permissions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Start */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">For Interviewers</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                    <li>Create a room with a unique name</li>
                    <li>Share the room name with candidates</li>
                    <li>Join the room and test your setup</li>
                    <li>Start recording when ready</li>
                    <li>Review AI insights during the interview</li>
                  </ol>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">For Candidates</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                    <li>Get the room name from your interviewer</li>
                    <li>Enter your name and join the room</li>
                    <li>Allow camera and microphone access</li>
                    <li>Test your audio and video</li>
                    <li>Be prepared and professional</li>
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="font-semibold text-white mb-3">Technical Requirements</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                  <li>✓ Modern browser (Chrome, Firefox, Safari, Edge)</li>
                  <li>✓ Webcam and microphone</li>
                  <li>✓ Stable internet connection (3+ Mbps)</li>
                  <li>✓ Allow browser permissions for camera/mic</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400 text-sm">
          <p>
            Built with Next.js, LiveKit, and AI • {" "}
            <Link href="/docs/INTERVIEW_ROOM.md" className="text-blue-400 hover:underline">
              Documentation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
