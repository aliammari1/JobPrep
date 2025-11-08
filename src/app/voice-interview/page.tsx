"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Settings,
  Brain,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Radio,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedContainer } from "@/components/ui/animated";
import { AIInterviewBot } from "@/components/interview/ai-interview-bot";
import { AudioVisualizer } from "@/components/interview/video-call-interface";

interface VoiceMetrics {
  speechClarity: number;
  pace: number;
  confidence: number;
  volume: number;
  fillerWords: string[];
  pauseFrequency: number;
}

interface Question {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "coding" | "system-design";
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
  hint?: string;
}

export default function RealTimeVoiceInterview() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "1",
    question:
      "Tell me about a challenging project you worked on recently. What made it challenging, and how did you overcome the obstacles?",
    type: "behavioral",
    difficulty: "medium",
    timeLimit: 5,
    hint: "Think about specific examples where you demonstrated problem-solving skills, teamwork, or leadership.",
  });

  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics>({
    speechClarity: 85,
    pace: 78,
    confidence: 72,
    volume: 65,
    fillerWords: ["um", "uh", "like"],
    pauseFrequency: 3.2,
  });

  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [aiStatus, setAiStatus] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  // Simulate live transcription
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const words = [
          "Well, I recently worked on a complex e-commerce platform",
          "where we had to integrate multiple payment systems.",
          "The main challenge was handling different APIs",
          "and ensuring data consistency across services.",
          "I approached this by first mapping out all the dependencies",
          "and creating a comprehensive integration plan.",
        ];

        const randomWord = words[Math.floor(Math.random() * words.length)];
        setLiveTranscript((prev) => prev + " " + randomWord);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Timer countdown
  useEffect(() => {
    if (isRecording && timeRemaining > 0) {
      const timer = setTimeout(
        () => setTimeRemaining((prev) => prev - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [isRecording, timeRemaining]);

  // Simulate AI status changes
  useEffect(() => {
    if (isRecording) {
      const statusInterval = setInterval(() => {
        const statuses: Array<typeof aiStatus> = [
          "listening",
          "thinking",
          "speaking",
        ];
        setAiStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }, 3000);

      return () => clearInterval(statusInterval);
    } else {
      setAiStatus("idle");
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setLiveTranscript("");
      setTimeRemaining(
        currentQuestion.timeLimit ? currentQuestion.timeLimit * 60 : 300
      );
    }
  };

  const submitAnswer = () => {
    setTranscript(liveTranscript);
    setLiveTranscript("");
    setIsRecording(false);
    setAiStatus("thinking");

    // Simulate AI processing
    setTimeout(() => {
      setAiStatus("speaking");
      setTimeout(() => setAiStatus("idle"), 3000);
    }, 2000);
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMetricBarColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                Real-Time Voice Interview
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered voice analysis with live transcription and feedback
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={isRecording ? "destructive" : "secondary"}
                className="animate-pulse"
              >
                {isRecording ? "● LIVE" : "● READY"}
              </Badge>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Audio Settings
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Avatar & Status */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    {/* AI Avatar */}
                    <motion.div
                      animate={
                        aiStatus === "speaking"
                          ? {
                              scale: [1, 1.05, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(147, 51, 234, 0.4)",
                                "0 0 0 20px rgba(147, 51, 234, 0)",
                                "0 0 0 0 rgba(147, 51, 234, 0)",
                              ],
                            }
                          : aiStatus === "listening"
                          ? {
                              scale: [1, 1.02, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                                "0 0 0 15px rgba(59, 130, 246, 0)",
                                "0 0 0 0 rgba(59, 130, 246, 0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: aiStatus !== "idle" ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto relative"
                    >
                      <Brain className="w-16 h-16 text-white" />
                      {(aiStatus === "listening" ||
                        aiStatus === "speaking") && (
                        <div className="absolute -bottom-2 -right-2">
                          <AudioVisualizer
                            isActive={true}
                            className="bg-white/20 p-2 rounded-full"
                          />
                        </div>
                      )}
                    </motion.div>

                    {/* Status Display */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">AI Interviewer</h3>
                      <div className="flex items-center justify-center gap-2">
                        {aiStatus === "listening" && (
                          <>
                            <Headphones className="w-5 h-5 text-blue-500" />
                            <span className="text-blue-600 font-medium">
                              Listening carefully...
                            </span>
                          </>
                        )}
                        {aiStatus === "thinking" && (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Brain className="w-5 h-5 text-purple-500" />
                            </motion.div>
                            <span className="text-purple-600 font-medium">
                              Analyzing your response...
                            </span>
                          </>
                        )}
                        {aiStatus === "speaking" && (
                          <>
                            <Radio className="w-5 h-5 text-green-500" />
                            <span className="text-green-600 font-medium">
                              Providing feedback...
                            </span>
                          </>
                        )}
                        {aiStatus === "idle" && (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600 font-medium">
                              Ready to begin
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="rounded-full"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        onClick={toggleRecording}
                        size="lg"
                        className={cn(
                          "rounded-full h-16 w-16 transition-all",
                          isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-green-500 hover:bg-green-600"
                        )}
                      >
                        {isRecording ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <Mic className="w-8 h-8" />
                        )}
                      </Button>

                      {isRecording && (
                        <Button
                          onClick={submitAnswer}
                          variant="outline"
                          className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit
                        </Button>
                      )}
                    </div>

                    {/* Timer */}
                    {isRecording && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 text-lg font-mono"
                      >
                        <Clock className="w-5 h-5" />
                        <span
                          className={cn(
                            timeRemaining < 60
                              ? "text-red-500 animate-pulse"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatTime(timeRemaining)}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Live Transcription */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Live Transcription
                    {isRecording && (
                      <Badge variant="secondary" className="animate-pulse">
                        <Radio className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[150px] p-4 bg-muted/30 rounded-lg">
                    {isRecording ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        <p className="text-sm text-muted-foreground">
                          You are saying:
                        </p>
                        <p className="text-lg leading-relaxed">
                          {liveTranscript || (
                            <span className="text-muted-foreground italic">
                              Start speaking to see live transcription...
                            </span>
                          )}
                          <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="inline-block w-0.5 h-6 bg-blue-500 ml-1"
                          />
                        </p>
                      </motion.div>
                    ) : transcript ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Your last response:
                        </p>
                        <p className="text-base leading-relaxed">
                          {transcript}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Click the microphone to start recording</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Current Question */}
            <AnimatedContainer delay={0.3}>
              <AIInterviewBot
                currentQuestion={currentQuestion}
                timeRemaining={timeRemaining}
                progress={75}
                isListening={aiStatus === "listening"}
              />
            </AnimatedContainer>

            {/* Voice Metrics */}
            <AnimatedContainer delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Voice Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Speech Clarity",
                      value: voiceMetrics.speechClarity,
                    },
                    { label: "Speaking Pace", value: voiceMetrics.pace },
                    { label: "Confidence", value: voiceMetrics.confidence },
                    { label: "Volume Level", value: voiceMetrics.volume },
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
                        <span className={getMetricColor(metric.value)}>
                          {metric.value}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <motion.div
                          className={cn(
                            "h-2 rounded-full",
                            getMetricBarColor(metric.value)
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Filler Words Detection */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">
                      Detected Filler Words
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {voiceMetrics.fillerWords.map((word, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Tips */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Real-time Tip
                        </h5>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Try to speak at a steady pace and avoid filler words
                          for better clarity.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
