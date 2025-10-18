"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Camera,
  Settings,
  Download,
  Eye,
  Brain,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Clock,
  User,
  FileVideo,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";
import { VideoCallInterface } from "@/components/interview/video-call-interface";

interface EmotionAnalysis {
  confidence: number;
  engagement: number;
  stress: number;
  authenticity: number;
  eyeContact: number;
  facialExpressions: {
    happy: number;
    neutral: number;
    focused: number;
    concerned: number;
  };
}

interface RecordingSession {
  id: string;
  duration: number;
  timestamp: Date;
  emotionData: EmotionAnalysis;
  keyMoments: Array<{
    time: number;
    event: string;
    description: string;
  }>;
}

function VideoInterviewRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis>({
    confidence: 72,
    engagement: 85,
    stress: 28,
    authenticity: 91,
    eyeContact: 68,
    facialExpressions: {
      happy: 15,
      neutral: 60,
      focused: 20,
      concerned: 5,
    },
  });

  const [recordings, setRecordings] = useState<RecordingSession[]>([
    {
      id: "1",
      duration: 342,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      emotionData: {
        confidence: 78,
        engagement: 82,
        stress: 25,
        authenticity: 88,
        eyeContact: 75,
        facialExpressions: {
          happy: 20,
          neutral: 55,
          focused: 22,
          concerned: 3,
        },
      },
      keyMoments: [
        {
          time: 45,
          event: "High Engagement",
          description: "Strong eye contact and animated gestures",
        },
        {
          time: 120,
          event: "Confidence Peak",
          description: "Clear and articulate response",
        },
        {
          time: 200,
          event: "Stress Indicator",
          description: "Brief pause, possible nervousness",
        },
      ],
    },
  ]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Simulate real-time emotion updates
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setCurrentEmotion((prev) => ({
          confidence: Math.max(
            0,
            Math.min(100, prev.confidence + (Math.random() - 0.5) * 10)
          ),
          engagement: Math.max(
            0,
            Math.min(100, prev.engagement + (Math.random() - 0.5) * 8)
          ),
          stress: Math.max(
            0,
            Math.min(100, prev.stress + (Math.random() - 0.5) * 12)
          ),
          authenticity: Math.max(
            0,
            Math.min(100, prev.authenticity + (Math.random() - 0.5) * 5)
          ),
          eyeContact: Math.max(
            0,
            Math.min(100, prev.eyeContact + (Math.random() - 0.5) * 15)
          ),
          facialExpressions: {
            happy: Math.max(
              0,
              Math.min(
                100,
                prev.facialExpressions.happy + (Math.random() - 0.5) * 10
              )
            ),
            neutral: Math.max(
              0,
              Math.min(
                100,
                prev.facialExpressions.neutral + (Math.random() - 0.5) * 8
              )
            ),
            focused: Math.max(
              0,
              Math.min(
                100,
                prev.facialExpressions.focused + (Math.random() - 0.5) * 12
              )
            ),
            concerned: Math.max(
              0,
              Math.min(
                100,
                prev.facialExpressions.concerned + (Math.random() - 0.5) * 8
              )
            ),
          },
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    const newRecording: RecordingSession = {
      id: Date.now().toString(),
      duration: recordingTime,
      timestamp: new Date(),
      emotionData: currentEmotion,
      keyMoments: [
        {
          time: 30,
          event: "Recording Started",
          description: "Initial setup complete",
        },
        {
          time: Math.floor(recordingTime / 2),
          event: "Mid-point Analysis",
          description: "Consistent performance observed",
        },
        {
          time: recordingTime - 10,
          event: "Recording Ended",
          description: "Session completed successfully",
        },
      ],
    };

    setRecordings((prev) => [newRecording, ...prev]);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const getEmotionColor = (value: number, inverted = false) => {
    if (inverted) {
      if (value <= 30) return "text-green-600";
      if (value <= 60) return "text-yellow-600";
      return "text-red-600";
    } else {
      if (value >= 70) return "text-green-600";
      if (value >= 40) return "text-yellow-600";
      return "text-red-600";
    }
  };

  const getEmotionBarColor = (value: number, inverted = false) => {
    if (inverted) {
      if (value <= 30) return "bg-green-500";
      if (value <= 60) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      if (value >= 70) return "bg-green-500";
      if (value >= 40) return "bg-yellow-500";
      return "bg-red-500";
    }
  };

  const getDominantEmotion = () => {
    const emotions = currentEmotion.facialExpressions;
    const max = Math.max(...Object.values(emotions));
    const dominant = Object.entries(emotions).find(
      ([_, value]) => value === max
    )?.[0];

    switch (dominant) {
      case "happy":
        return { icon: Smile, color: "text-green-500", label: "Positive" };
      case "focused":
        return { icon: Eye, color: "text-blue-500", label: "Focused" };
      case "concerned":
        return { icon: Frown, color: "text-red-500", label: "Concerned" };
      default:
        return { icon: Meh, color: "text-gray-500", label: "Neutral" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                Video Interview Recorder
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced recording with real-time emotion detection and analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={isRecording ? "destructive" : "secondary"}
                className={cn(isRecording && "animate-pulse")}
              >
                {isRecording ? "● REC" : "● READY"}
              </Badge>
              {isRecording && (
                <div className="text-lg font-mono text-red-600">
                  {formatTime(recordingTime)}
                </div>
              )}
            </div>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <AnimatedContainer delay={0.1}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-gradient-to-br from-gray-900 to-gray-700">
                    {/* Simulated Video Feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isVideoEnabled ? (
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                              <User className="w-24 h-24 mx-auto mb-4 opacity-50" />
                              <p className="text-lg opacity-70">
                                Video Preview
                              </p>
                            </div>
                          </div>

                          {/* Recording Indicator */}
                          {isRecording && (
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full"
                            >
                              <div className="w-2 h-2 bg-white rounded-full" />
                              <span className="text-sm font-medium">REC</span>
                            </motion.div>
                          )}

                          {/* Emotion Overlay */}
                          {isRecording && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2 text-white">
                                {(() => {
                                  const emotion = getDominantEmotion();
                                  const Icon = emotion.icon;
                                  return (
                                    <>
                                      <Icon
                                        className={cn("w-5 h-5", emotion.color)}
                                      />
                                      <span className="text-sm">
                                        {emotion.label}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-white">
                          <VideoOff className="w-24 h-24 mx-auto mb-4" />
                          <p className="text-lg">Camera is off</p>
                        </div>
                      )}
                    </div>

                    {/* Recording Controls Overlay */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-2xl p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                          className={cn(
                            "rounded-full h-12 w-12 transition-colors",
                            isAudioEnabled
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
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
                          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                          className={cn(
                            "rounded-full h-12 w-12 transition-colors",
                            isVideoEnabled
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          )}
                        >
                          {isVideoEnabled ? (
                            <Video className="w-5 h-5" />
                          ) : (
                            <VideoOff className="w-5 h-5" />
                          )}
                        </Button>

                        {!isRecording ? (
                          <Button
                            onClick={startRecording}
                            size="lg"
                            className="rounded-full h-14 w-14 bg-red-500 hover:bg-red-600"
                          >
                            <Camera className="w-6 h-6" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={pauseRecording}
                              size="icon"
                              className="rounded-full h-12 w-12 bg-yellow-500 hover:bg-yellow-600"
                            >
                              {isPaused ? (
                                <Play className="w-5 h-5" />
                              ) : (
                                <Pause className="w-5 h-5" />
                              )}
                            </Button>
                            <Button
                              onClick={stopRecording}
                              size="icon"
                              className="rounded-full h-12 w-12 bg-gray-600 hover:bg-gray-700"
                            >
                              <Square className="w-5 h-5" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white"
                        >
                          <Settings className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Recording History */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Recording History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recordings.map((recording, index) => (
                      <motion.div
                        key={recording.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                            <FileVideo className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Session {recordings.length - index}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {recording.timestamp.toLocaleDateString()} at{" "}
                              {recording.timestamp.toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {formatTime(recording.duration)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right text-sm">
                            <div className="font-medium text-green-600">
                              {Math.round(recording.emotionData.confidence)}%
                              Confidence
                            </div>
                            <div className="text-muted-foreground">
                              {recording.keyMoments.length} key moments
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Real-time Analytics */}
          <div className="space-y-6">
            {/* Emotion Analysis */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Emotion Analysis
                    {isRecording && (
                      <Badge variant="secondary" className="animate-pulse">
                        Live
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Confidence",
                      value: currentEmotion.confidence,
                      inverted: false,
                    },
                    {
                      label: "Engagement",
                      value: currentEmotion.engagement,
                      inverted: false,
                    },
                    {
                      label: "Stress Level",
                      value: currentEmotion.stress,
                      inverted: true,
                    },
                    {
                      label: "Authenticity",
                      value: currentEmotion.authenticity,
                      inverted: false,
                    },
                    {
                      label: "Eye Contact",
                      value: currentEmotion.eyeContact,
                      inverted: false,
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span>{metric.label}</span>
                        <span
                          className={getEmotionColor(
                            metric.value,
                            metric.inverted
                          )}
                        >
                          {Math.round(metric.value)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <motion.div
                          className={cn(
                            "h-2 rounded-full",
                            getEmotionBarColor(metric.value, metric.inverted)
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Facial Expression Breakdown */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smile className="w-5 h-5" />
                    Expression Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(currentEmotion.facialExpressions).map(
                      ([emotion, value], index) => (
                        <motion.div
                          key={emotion}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">{emotion}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <motion.div
                                className="bg-blue-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {Math.round(value)}%
                            </span>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Real-time Tips */}
            <AnimatedContainer delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Performance Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isRecording ? (
                    [
                      {
                        type:
                          currentEmotion.eyeContact < 60
                            ? "warning"
                            : "success",
                        text:
                          currentEmotion.eyeContact < 60
                            ? "Try to maintain more eye contact with the camera"
                            : "Great eye contact! Keep it up.",
                      },
                      {
                        type:
                          currentEmotion.stress > 60 ? "warning" : "success",
                        text:
                          currentEmotion.stress > 60
                            ? "Take a deep breath to reduce stress levels"
                            : "You appear calm and composed.",
                      },
                      {
                        type:
                          currentEmotion.confidence < 50
                            ? "warning"
                            : "success",
                        text:
                          currentEmotion.confidence < 50
                            ? "Speak with more conviction to boost confidence"
                            : "Your confidence is showing through well.",
                      },
                    ].map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className={cn(
                          "flex items-start gap-2 p-3 rounded-lg",
                          tip.type === "warning"
                            ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                            : "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                        )}
                      >
                        {tip.type === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        )}
                        <p
                          className={cn(
                            "text-xs",
                            tip.type === "warning"
                              ? "text-yellow-700 dark:text-yellow-300"
                              : "text-green-700 dark:text-green-300"
                          )}
                        >
                          {tip.text}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        Start recording to see real-time tips
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <VideoInterviewRecorder />;
}
