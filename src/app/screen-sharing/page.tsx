"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Monitor,
  Share2,
  MousePointer,
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  Download,
  Upload,
  Users,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Settings,
  Palette,
  Grid,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Move,
  Star,
  MessageCircle,
  Timer,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";

interface Participant {
  id: string;
  name: string;
  role: "interviewer" | "candidate" | "observer";
  isOnline: boolean;
  cursor?: { x: number; y: number };
  color: string;
}

interface Annotation {
  id: string;
  type: "rectangle" | "circle" | "arrow" | "text" | "highlight";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  author: string;
  timestamp: Date;
}

interface ShareSettings {
  allowDrawing: boolean;
  allowPointing: boolean;
  allowAnnotations: boolean;
  autoSave: boolean;
  quality: "low" | "medium" | "high" | "ultra";
  frameRate: number;
}

export default function ScreenSharingPage() {
  const [isSharing, setIsSharing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "John Interviewer",
      role: "interviewer",
      isOnline: true,
      color: "#3B82F6",
    },
    {
      id: "2",
      name: "Sarah Candidate",
      role: "candidate",
      isOnline: true,
      color: "#10B981",
    },
    {
      id: "3",
      name: "Mike Observer",
      role: "observer",
      isOnline: true,
      color: "#8B5CF6",
    },
  ]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<
    "pointer" | "pen" | "rectangle" | "circle" | "text" | "eraser"
  >("pointer");
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    allowDrawing: true,
    allowPointing: true,
    allowAnnotations: true,
    autoSave: true,
    quality: "high",
    frameRate: 30,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSharing || isViewing) {
      timer = setInterval(() => {
        setSessionTime((prev) => prev + 1);
        if (isRecording) {
          setRecordingTime((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSharing, isViewing, isRecording]);

  const startScreenShare = () => {
    setIsSharing(true);
    setSessionTime(0);
  };

  const stopScreenShare = () => {
    setIsSharing(false);
    setIsRecording(false);
    setSessionTime(0);
    setRecordingTime(0);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addAnnotation = (x: number, y: number) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool as any,
      x: x,
      y: y,
      width: selectedTool === "rectangle" ? 100 : undefined,
      height: selectedTool === "rectangle" ? 50 : undefined,
      text: selectedTool === "text" ? "Sample text" : undefined,
      color: participants[0].color,
      author: participants[0].name,
      timestamp: new Date(),
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "pointer":
        return <MousePointer className="w-4 h-4" />;
      case "pen":
        return <Pencil className="w-4 h-4" />;
      case "rectangle":
        return <Square className="w-4 h-4" />;
      case "circle":
        return <Circle className="w-4 h-4" />;
      case "text":
        return <Type className="w-4 h-4" />;
      case "eraser":
        return <Eraser className="w-4 h-4" />;
      default:
        return <MousePointer className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Screen Sharing Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Collaborative screen sharing with real-time annotations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Share2 className="w-4 h-4 mr-2" />
                {participants.filter((p) => p.isOnline).length} Online
              </Badge>
              {(isSharing || isViewing) && (
                <Badge variant="outline" className="px-3 py-1">
                  <Timer className="w-4 h-4 mr-2" />
                  {formatTime(sessionTime)}
                </Badge>
              )}
            </div>
          </div>
        </AnimatedContainer>

        {!isSharing && !isViewing ? (
          <StaggeredContainer>
            {/* Start Screen Share */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Share Your Screen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Start Screen Sharing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Share your screen with interview participants and enable
                      collaborative annotations
                    </p>
                    <Button
                      onClick={startScreenShare}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      size="lg"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Start Sharing
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Join Session
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Session ID</Label>
                      <Input placeholder="Enter session ID to join" />
                    </div>
                    <div>
                      <Label>Your Role</Label>
                      <Select defaultValue="observer">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interviewer">
                            Interviewer
                          </SelectItem>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="observer">Observer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => setIsViewing(true)}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Join Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sharing Settings */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sharing Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Allow Drawing</Label>
                      <Switch
                        checked={shareSettings.allowDrawing}
                        onCheckedChange={(checked) =>
                          setShareSettings((prev) => ({
                            ...prev,
                            allowDrawing: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Allow Pointing</Label>
                      <Switch
                        checked={shareSettings.allowPointing}
                        onCheckedChange={(checked) =>
                          setShareSettings((prev) => ({
                            ...prev,
                            allowPointing: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto Save</Label>
                      <Switch
                        checked={shareSettings.autoSave}
                        onCheckedChange={(checked) =>
                          setShareSettings((prev) => ({
                            ...prev,
                            autoSave: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Video Quality</Label>
                      <Select
                        value={shareSettings.quality}
                        onValueChange={(value: any) =>
                          setShareSettings((prev) => ({
                            ...prev,
                            quality: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (720p)</SelectItem>
                          <SelectItem value="medium">Medium (1080p)</SelectItem>
                          <SelectItem value="high">High (1440p)</SelectItem>
                          <SelectItem value="ultra">Ultra (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Frame Rate</Label>
                      <Select
                        value={shareSettings.frameRate.toString()}
                        onValueChange={(value) =>
                          setShareSettings((prev) => ({
                            ...prev,
                            frameRate: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 FPS</SelectItem>
                          <SelectItem value="30">30 FPS</SelectItem>
                          <SelectItem value="60">60 FPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <h4 className="font-medium mb-2">Features Available:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Real-time annotations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Multi-user collaboration
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Session recording
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Cross-platform support
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "session-1",
                      title: "Frontend Developer Interview",
                      participants: 3,
                      duration: "45 min",
                      date: "2 hours ago",
                    },
                    {
                      id: "session-2",
                      title: "Technical Architecture Review",
                      participants: 5,
                      duration: "1h 20min",
                      date: "Yesterday",
                    },
                    {
                      id: "session-3",
                      title: "Code Review Session",
                      participants: 2,
                      duration: "30 min",
                      date: "2 days ago",
                    },
                  ].map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.participants} participants •{" "}
                          {session.duration} • {session.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggeredContainer>
        ) : (
          <StaggeredContainer>
            {/* Active Sharing Interface */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Screen Area */}
              <div className="xl:col-span-3 space-y-6">
                {/* Toolbar */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Drawing Tools */}
                        <div className="flex items-center gap-2">
                          {[
                            "pointer",
                            "pen",
                            "rectangle",
                            "circle",
                            "text",
                            "eraser",
                          ].map((tool) => (
                            <Button
                              key={tool}
                              variant={
                                selectedTool === tool ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedTool(tool as any)}
                            >
                              {getToolIcon(tool)}
                            </Button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAnnotations}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Undo className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Redo className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.max(25, zoom - 25))}
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium min-w-[60px] text-center">
                            {zoom}%
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.min(200, zoom + 25))}
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Recording Controls */}
                        <div className="flex items-center gap-2">
                          {isRecording ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={stopRecording}
                            >
                              <Square className="w-4 h-4 mr-2" />
                              Stop ({formatTime(recordingTime)})
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={startRecording}
                            >
                              <Circle className="w-4 h-4 mr-2" />
                              Record
                            </Button>
                          )}
                        </div>

                        {/* Session Controls */}
                        <Button variant="destructive" onClick={stopScreenShare}>
                          <Square className="w-4 h-4 mr-2" />
                          End Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Screen Canvas */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div
                      className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                      style={{ aspectRatio: "16/9" }}
                    >
                      {/* Mock Screen Content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Shared Screen Content</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Screen sharing active • {formatTime(sessionTime)}
                          </p>
                        </div>
                      </div>

                      {/* Canvas for Annotations */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          if (selectedTool !== "pointer") {
                            addAnnotation(x, y);
                          }
                        }}
                      />

                      {/* Render Annotations */}
                      {annotations.map((annotation) => (
                        <motion.div
                          key={annotation.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute pointer-events-none"
                          style={{
                            left: annotation.x,
                            top: annotation.y,
                            color: annotation.color,
                          }}
                        >
                          {annotation.type === "text" && (
                            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-sm">
                              {annotation.text}
                            </span>
                          )}
                          {annotation.type === "rectangle" && (
                            <div
                              className="border-2 border-current"
                              style={{
                                width: annotation.width,
                                height: annotation.height,
                              }}
                            />
                          )}
                        </motion.div>
                      ))}

                      {/* Participant Cursors */}
                      {participants.map(
                        (participant) =>
                          participant.cursor && (
                            <motion.div
                              key={participant.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute pointer-events-none"
                              style={{
                                left: participant.cursor.x,
                                top: participant.cursor.y,
                                color: participant.color,
                              }}
                            >
                              <MousePointer className="w-4 h-4" />
                              <span className="ml-2 text-xs bg-white dark:bg-gray-800 px-1 py-0.5 rounded shadow">
                                {participant.name}
                              </span>
                            </motion.div>
                          )
                      )}

                      {/* Grid Overlay */}
                      {showGrid && (
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Participants */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Participants (
                      {participants.filter((p) => p.isOnline).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: participant.color }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {participant.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {participant.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {participant.isOnline ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Annotation History */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Annotations ({annotations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: annotation.color }}
                          />
                          <span className="flex-1 truncate">
                            {annotation.type} by {annotation.author}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Annotations
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Grid</Label>
                      <Switch
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </StaggeredContainer>
        )}
      </div>
    </div>
  );
}
