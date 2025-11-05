"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PhoneOff,
  CircleDot,
  Square,
  MessageSquare,
  FileText,
  Settings,
  Maximize,
  Minimize,
  Download,
  Clock,
  Brain,
  Star,
  CheckCircle2,
  AlertTriangle,
  Send,
  Paperclip,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Zap,
  Loader2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInterviewStore } from "@/hooks/use-interview-store";
import { useAITranscription } from "@/hooks/use-ai-transcription";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function InterviewRoom() {
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [participantName, setParticipantName] = useState("User");
  const [token, setToken] = useState("");
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  
  // Interview store
  const {
    isRecording,
    recordingTime,
    chatMessages,
    aiInsights,
    transcripts,
    isAIAnalyzing,
    startRecording: storeStartRecording,
    stopRecording: storeStopRecording,
    updateRecordingTime,
    addChatMessage,
    addNote,
  } = useInterviewStore();

  // AI Transcription
  const { startTranscription, stopTranscription } = useAITranscription();

  // Get room name from URL and fetch token
  useEffect(() => {
    const initializeRoom = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const room = urlParams.get("room") || `interview-${Date.now()}`;
      const name = urlParams.get("name") || "User";
      
      setRoomName(room);
      setParticipantName(name);

      try {
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: room,
            participantName: name,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        }
      } catch (error) {
        console.error("Failed to get token:", error);
      } finally {
        setIsLoadingToken(false);
      }
    };

    initializeRoom();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        updateRecordingTime(recordingTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingTime, updateRecordingTime]);

  // Note: Browser-based AI interviewer replaced with LiveKit avatar agent
  // The avatar agent runs via Appwrite serverless function and joins the room directly

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        senderId: "local",
        senderName: participantName,
        message: chatMessage,
        timestamp: new Date(),
        type: "message" as const,
      };
      addChatMessage(newMessage);
      setChatMessage("");
    }
  };

  const saveNote = () => {
    if (currentNote.trim()) {
      addNote(currentNote);
      const newMessage = {
        id: Date.now().toString(),
        senderId: "local",
        senderName: participantName,
        message: currentNote,
        timestamp: new Date(),
        type: "note" as const,
      };
      addChatMessage(newMessage);
      setCurrentNote("");
    }
  };

  const handleRecording = () => {
    if (isRecording) {
      storeStopRecording();
      stopTranscription();
    } else {
      storeStartRecording();
      startTranscription();
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return CheckCircle2;
      case "suggestion":
        return Lightbulb;
      default:
        return AlertTriangle;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-500";
      case "suggestion":
        return "text-blue-500";
      default:
        return "text-yellow-500";
    }
  };

  const handleDownloadTranscript = () => {
    const transcriptText = transcripts
      .map((t) => `[${t.timestamp.toLocaleTimeString()}] ${t.participantName}: ${t.text}`)
      .join('\n');
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${roomName}-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadNotes = () => {
    const notesText = chatMessages
      .filter((m) => m.type === 'note')
      .map((m) => `[${m.timestamp.toLocaleTimeString()}] ${m.message}`)
      .join('\n\n');
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-notes-${roomName}-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.pdf,.doc,.docx';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const message = {
          id: Date.now().toString(),
          senderId: 'local',
          senderName: participantName,
          message: `📎 Shared file: ${file.name}`,
          timestamp: new Date(),
          type: 'message' as const,
        };
        addChatMessage(message);
      }
    };
    input.click();
  };

  const handleTemplate = (template: string) => {
    setChatMessage(template);
  };

  const handleSuggestQuestions = () => {
    const questions = [
      "Can you describe your experience with this technology?",
      "How do you handle challenging situations in your work?",
      "What are your long-term career goals?",
      "Can you walk me through a recent project you completed?",
    ];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const message = {
      id: Date.now().toString(),
      senderId: 'ai',
      senderName: 'AI Assistant',
      message: `💡 Suggested question: ${randomQuestion}`,
      timestamp: new Date(),
      type: 'question' as const,
    };
    addChatMessage(message);
  };

  const handlePerformanceAnalysis = () => {
    const analysis = {
      type: 'neutral' as const,
      category: 'overall' as const,
      message: `Performance Summary: ${transcripts.length} transcripts recorded. Average confidence: ${transcripts.length > 0 ? Math.round((transcripts.reduce((acc, t) => acc + t.confidence, 0) / transcripts.length) * 100) : 0}%. Speaking time: ${formatTime(recordingTime)}.`,
      timestamp: new Date(),
      confidence: 0.95,
    };
    useInterviewStore.getState().addAIInsight(analysis);
  };

  const handleInterviewGuide = () => {
    const guide = {
      type: 'suggestion' as const,
      category: 'overall' as const,
      message: "Remember to: 1) Maintain eye contact 2) Ask follow-up questions 3) Take notes on key points 4) Allow candidate time to think 5) Be mindful of time",
      timestamp: new Date(),
      confidence: 1.0,
    };
    useInterviewStore.getState().addAIInsight(guide);
  };

  const handleQuickAction = (action: string) => {
    if (currentNote.trim()) {
      const taggedNote = `[${action.toUpperCase()}] ${currentNote}`;
      addNote(taggedNote);
      const message = {
        id: Date.now().toString(),
        senderId: 'local',
        senderName: participantName,
        message: taggedNote,
        timestamp: new Date(),
        type: 'note' as const,
      };
      addChatMessage(message);
      setCurrentNote('');
    }
  };

  if (isLoadingToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Connecting to interview room...</span>
        </div>
      </div>
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "wss://jobprep-xundsxxf.livekit.cloud";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">Interview Room</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Room: {roomName}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(callDuration)}
                </div>
                {isRecording && (
                  <div className="flex items-center gap-1 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    REC {formatTime(recordingTime)}
                  </div>
                )}
                {isAIAnalyzing && (
                  <div className="flex items-center gap-1 text-purple-400">
                    <Brain className="w-4 h-4 animate-pulse" />
                    AI Analyzing...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">Live</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[calc(100vh-200px)]">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                style={{ height: "calc(100vh - 300px)" }}
                onConnected={() => {
                  console.log("Connected to room");
                  setCallDuration(0);
                }}
                onDisconnected={() => {
                  console.log("Disconnected from room");
                }}
              >
                <VideoConference />
                <RoomAudioRenderer />
                
                {/* Custom Controls */}
                <div className="flex items-center justify-center gap-4 mt-4 p-4 bg-gray-900 rounded-lg">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleRecording}
                    title={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isRecording ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <CircleDot className="w-4 h-4" />
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.querySelector('[value="chat"]')?.dispatchEvent(new Event('click', { bubbles: true }))}
                    title="Open chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadTranscript}
                    disabled={transcripts.length === 0}
                    title="Download transcript"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <div className="flex-1" />

                  <Button variant="destructive" onClick={() => window.close()}>
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </LiveKitRoom>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
              </TabsList>

              {/* Chat */}
              <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
                <Card className="flex-1 bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">
                      Chat & Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {message.senderName}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                message.type === "note"
                                  ? "bg-yellow-600"
                                  : "bg-blue-600"
                              )}
                            >
                              {message.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {message.timestamp ? message.timestamp.toLocaleTimeString() : "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 pl-2 border-l-2 border-gray-600">
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-gray-700 border-gray-600 text-white"
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button size="sm" onClick={sendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleFileUpload}
                        >
                          <Paperclip className="w-4 h-4 mr-1" />
                          File
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleTemplate("Thank you for joining this interview. Let's get started!")}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes" className="flex-1 flex flex-col space-y-4">
                <Card className="flex-1 bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">
                      Interview Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Add interview notes..."
                      className="min-h-[200px] bg-gray-700 border-gray-600 text-white"
                    />

                    <div className="flex gap-2">
                      <Button onClick={saveNote} className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Save Note
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadNotes}
                        disabled={chatMessages.filter(m => m.type === 'note').length === 0}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">
                        Quick Actions
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleQuickAction('highlight')}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Highlight
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleQuickAction('flag')}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Flag
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleQuickAction('positive')}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Positive
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleQuickAction('concern')}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Concern
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Insights */}
              <TabsContent value="ai" className="flex-1 flex flex-col space-y-4">
                <Card className="flex-1 bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm text-white">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Transcripts Section */}
                    {transcripts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Transcription
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-gray-900 rounded-lg">
                          {transcripts.map((transcript) => (
                            <div
                              key={transcript.id}
                              className="p-2 rounded bg-gray-800 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-400">
                                  {transcript.participantName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(transcript.confidence * 100)}%
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {transcript.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-200">
                                {transcript.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Insights Section */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Insights {isAIAnalyzing && <Loader2 className="w-3 h-3 animate-spin" />}
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {aiInsights.length === 0 && !isAIAnalyzing && (
                          <p className="text-sm text-gray-400 text-center py-4">
                            Start recording to receive AI insights
                          </p>
                        )}
                        {aiInsights.map((insight) => {
                          const Icon = getInsightIcon(insight.type);
                          return (
                            <div
                              key={`${insight.timestamp.getTime()}-${insight.message}`}
                              className="p-3 rounded-lg bg-gray-700 space-y-2"
                            >
                              <div className="flex items-start gap-2">
                                <Icon
                                  className={cn(
                                    "w-4 h-4 mt-0.5",
                                    getInsightColor(insight.type)
                                  )}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {insight.category}
                                    </Badge>
                                    <span className="text-xs text-gray-400">
                                      {Math.round(insight.confidence * 100)}%
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-200">
                                    {insight.message}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {insight.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">
                        AI Tools
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={handleSuggestQuestions}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Suggest Questions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={handlePerformanceAnalysis}
                          disabled={transcripts.length === 0}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Performance Analysis
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={handleInterviewGuide}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Interview Guide
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
