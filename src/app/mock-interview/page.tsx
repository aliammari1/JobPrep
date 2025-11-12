"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionDetailedView } from "@/components/interview/QuestionDetailedView";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Target,
  Star,
  Brain,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Award,
  BarChart3,
  Users,
  Lightbulb,
  Zap,
  Eye,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  BookOpen,
  FileText,
  Download,
  Share,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Coffee,
  User,
  Upload,
  Link as LinkIcon,
  Loader2,
  Edit,
  ChevronRight,
  MessageCircle,
  Square,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";
import HeyGenAvatar from "@/components/interview/HeyGenAvatar";

interface MockSession {
  id: string;
  title: string;
  type: "behavioral" | "technical" | "leadership" | "case-study";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  currentQuestion: number;
  totalQuestions: number;
  isActive: boolean;
  sessionTime: number;
  aiInterviewer: {
    name: string;
    personality: "professional" | "friendly" | "challenging";
    avatar: string;
  };
}

interface Question {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "case-study";
  followUps: string[];
  hints: string[];
  idealResponse: string;
  timeLimit?: number;
}

interface AIFeedback {
  overall: number;
  categories: {
    communication: number;
    technical: number;
    problemSolving: number;
    confidence: number;
  };
  strengths: string[];
  improvements: string[];
  insights: string[];
}

// Gemini AI Interview Types
interface GeminiQuestion {
  id: number;
  type: "technical" | "behavioral";
  question: string;
  idealAnswer: string;
  evaluationCriteria: string[];
}

interface QuestionEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
}

interface QuestionResult {
  question: GeminiQuestion;
  userAnswer: string;
  evaluation?: QuestionEvaluation;
  timeSpent: number;
}

interface FinalAssessment {
  overallRating: string;
  hiringRecommendation: string;
  summary: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  detailedFeedback: {
    technical: string;
    behavioral: string;
    communication: string;
  };
  developmentAreas: string[];
  nextSteps: string[];
  confidenceLevel: number;
}

export default function MockInterview() {
  const { data: session } = useSession();
  const [currentSession, setCurrentSession] = useState<MockSession | null>(
    null
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [questionTime, setQuestionTime] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvatar, setShowAvatar] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState<string[]>([]);
  
  // Setup states
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isScrapingLinkedin, setIsScrapingLinkedin] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [technicalQuestions, setTechnicalQuestions] = useState(12); // Default 12 technical
  const [behavioralQuestions, setBehavioralQuestions] = useState(8); // Default 8 behavioral

  // AI Interview states
  const [generatedQuestions, setGeneratedQuestions] = useState<GeminiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewResults, setInterviewResults] = useState<QuestionResult[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Initialize or re-initialize media recorder for Whisper transcription
  const initializeMediaRecorder = async () => {
    try {
      if (typeof window !== "undefined" && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = [];
          
          // Send to Whisper transcription API
          await transcribeAudio(audioBlob);
          
          // Stop current tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Re-initialize for next recording
          await initializeMediaRecorder();
        };

        setMediaRecorder(recorder);
        return recorder;
      }
    } catch (error) {
      console.log("⚠️ Media recorder not available:", error);
      return null;
    }
  };

  // Initialize media recorder on mount
  useEffect(() => {
    initializeMediaRecorder();

    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Transcribe audio using Whisper API
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      console.log("🎤 Sending audio to Whisper transcription...");

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Transcription failed:", errorData);
        setIsTranscribing(false);
        return;
      }

      const result = await response.json();
      console.log("✅ Transcription result:", result.text?.substring(0, 100));

      if (result.text) {
        setCurrentAnswer((prev) => (prev ? prev + " " + result.text : result.text));
      }

      setIsTranscribing(false);
    } catch (error) {
      console.error("Transcription error:", error);
      setIsTranscribing(false);
    }
  };

  // Toggle voice recording with Whisper
  const toggleVoiceRecording = () => {
    if (!mediaRecorder) {
      alert("Microphone access is required for voice recording. Please allow access and refresh.");
      return;
    }

    if (isRecording) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          const transformedSessions = (data.interviews || []).map(
            (interview: any, index: number) => ({
              id: interview.id,
              title: interview.title || `Interview Session ${index + 1}`,
              type: (interview.type || "technical") as
                | "behavioral"
                | "technical"
                | "leadership"
                | "case-study",
              difficulty: (interview.difficulty || "intermediate") as
                | "beginner"
                | "intermediate"
                | "advanced",
              duration: interview.duration || 60,
              currentQuestion: 1,
              totalQuestions: interview.questions?.length || 8,
              isActive: interview.status === "in-progress",
              sessionTime: 0,
              aiInterviewer: {
                name: "AI Interviewer",
                personality: "professional" as const,
                avatar: "",
              },
            })
          );
          setSessions(transformedSessions);
        }
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const mockSessions: MockSession[] = [
    {
      id: "1",
      title: "Senior Software Engineer - Full Stack",
      type: "technical",
      difficulty: "advanced",
      duration: 60,
      currentQuestion: 1,
      totalQuestions: 8,
      isActive: false,
      sessionTime: 0,
      aiInterviewer: {
        name: "Dr. Sarah Chen",
        personality: "professional",
        avatar: "/avatars/sarah.jpg",
      },
    },
    {
      id: "2",
      title: "Product Manager - Leadership Focus",
      type: "leadership",
      difficulty: "intermediate",
      duration: 45,
      currentQuestion: 1,
      totalQuestions: 6,
      isActive: false,
      sessionTime: 0,
      aiInterviewer: {
        name: "Alex Rodriguez",
        personality: "friendly",
        avatar: "/avatars/alex.jpg",
      },
    },
    {
      id: "3",
      title: "Data Scientist - Case Study",
      type: "case-study",
      difficulty: "advanced",
      duration: 90,
      currentQuestion: 1,
      totalQuestions: 4,
      isActive: false,
      sessionTime: 0,
      aiInterviewer: {
        name: "Dr. Michael Park",
        personality: "challenging",
        avatar: "/avatars/michael.jpg",
      },
    },
  ];

  // Get current question from Gemini-generated questions or fallback to demo question
  const currentGeminiQuestion = generatedQuestions[currentQuestionIndex];
  
  const currentQuestion: Question = currentGeminiQuestion
    ? {
        id: currentGeminiQuestion.id.toString(),
        text: currentGeminiQuestion.question,
        type: currentGeminiQuestion.type as "behavioral" | "technical" | "case-study",
        followUps: [],
        hints: currentGeminiQuestion.evaluationCriteria,
        idealResponse: currentGeminiQuestion.idealAnswer,
        timeLimit: 300,
      }
    : {
        id: "1",
        text: "Tell me about a time when you had to lead a project under tight deadlines. How did you manage the team and ensure delivery?",
        type: "behavioral",
        followUps: [
          "What specific challenges did you face with team coordination?",
          "How did you prioritize tasks when everything seemed urgent?",
          "What would you do differently if you faced a similar situation again?",
        ],
        hints: [
          "Structure your answer using the STAR method (Situation, Task, Action, Result)",
          "Quantify the impact of your leadership decisions",
          "Highlight specific communication and delegation strategies",
        ],
        idealResponse:
          "Strong answers should demonstrate leadership skills, time management, team coordination, and measurable outcomes.",
        timeLimit: 300,
      };

  const aiFeedback: AIFeedback = {
    overall: 85,
    categories: {
      communication: 88,
      technical: 82,
      problemSolving: 90,
      confidence: 78,
    },
    strengths: [
      "Clear and structured communication",
      "Strong problem-solving approach",
      "Good use of specific examples",
      "Demonstrates leadership qualities",
    ],
    improvements: [
      "Provide more quantifiable results",
      "Show more confidence in technical abilities",
      "Practice concise explanations of complex topics",
      "Include more stakeholder perspective",
    ],
    insights: [
      "Your communication style is naturally collaborative",
      "You show strong analytical thinking patterns",
      "Consider preparing more diverse examples",
      "Your technical knowledge is solid but could be articulated more confidently",
    ],
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive && currentSession) {
      interval = setInterval(() => {
        setQuestionTime((time) => time + 1);
        currentSession.sessionTime += 1;
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, currentSession]);

  const startSession = (session: MockSession) => {
    setCurrentSession({ ...session, isActive: true });
    setIsSessionActive(true);
    setQuestionTime(0);
    setSessionComplete(false);
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resumeSession = () => {
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setSessionComplete(true);
  };

  const nextQuestion = () => {
    if (
      currentSession &&
      currentSession.currentQuestion < currentSession.totalQuestions
    ) {
      setCurrentSession((prev) =>
        prev ? { ...prev, currentQuestion: prev.currentQuestion + 1 } : null
      );
      setQuestionTime(0);
    } else {
      endSession();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80";
      case "intermediate":
        return "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary/80";
      case "advanced":
        return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80";
      default:
        return "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "behavioral":
        return MessageSquare;
      case "technical":
        return Brain;
      case "leadership":
        return Users;
      case "case-study":
        return FileText;
      default:
        return BookOpen;
    }
  };

  const handleAvatarError = (error: string) => {
    console.error("Avatar error:", error);
    setAvatarErrors((prev) => [...prev, error]);
  };

  // File handling functions
  const handleJobDescriptionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "text/plain")) {
      setJobDescriptionFile(file);
      setIsProcessingFiles(true);
      
      try {
        if (file.type === "text/plain") {
          // Read text file directly
          const text = await file.text();
          setJobDescriptionText(text);
        } else if (file.type === "application/pdf") {
          // For PDF, we'll use a FormData to send to an API endpoint
          const formData = new FormData();
          formData.append("file", file);
          
          try {
            const response = await fetch("/api/extract-pdf", {
              method: "POST",
              body: formData,
            });
            
            const data = await response.json();
            
            // Check if we got text back (even from error response)
            if (data.text) {
              setJobDescriptionText(data.text);
            } else if (response.ok) {
              setJobDescriptionText(data.text || "No text extracted");
            } else {
              // Fallback: show file info if API failed
              console.error("PDF extraction failed:", data);
              setJobDescriptionText(`[PDF File: ${file.name}]\n\nFailed to extract text: ${data.details || data.error}\n\nPlease enter the job description manually.`);
            }
          } catch (apiError) {
            // API not available, show placeholder
            console.error("API error:", apiError);
            setJobDescriptionText(`[PDF File: ${file.name}]\n\nAPI error occurred.\n\nPlease enter the job description manually.`);
          }
        }
      } catch (error) {
        console.error("File reading error:", error);
        setJobDescriptionText(`Error reading file. Please try again or enter manually.`);
      } finally {
        setIsProcessingFiles(false);
      }
    }
  };

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "text/plain")) {
      setCvFile(file);
      setIsProcessingFiles(true);
      
      try {
        if (file.type === "text/plain") {
          // Read text file directly
          const text = await file.text();
          setSkillsText(text);
        } else if (file.type === "application/pdf") {
          // For PDF, we'll use a FormData to send to an API endpoint
          const formData = new FormData();
          formData.append("file", file);
          
          try {
            const response = await fetch("/api/extract-pdf", {
              method: "POST",
              body: formData,
            });
            
            const data = await response.json();
            
            // Check if we got text back (even from error response)
            if (data.text) {
              setSkillsText(data.text);
            } else if (response.ok) {
              setSkillsText(data.text || "No text extracted");
            } else {
              // Fallback: show file info if API failed
              console.error("PDF extraction failed:", data);
              setSkillsText(`[PDF File: ${file.name}]\n\nFailed to extract text: ${data.details || data.error}\n\nPlease enter your skills and experience manually.`);
            }
          } catch (apiError) {
            // API not available, show placeholder
            console.error("API error:", apiError);
            setSkillsText(`[PDF File: ${file.name}]\n\nAPI error occurred.\n\nPlease enter your skills and experience manually.`);
          }
        }
      } catch (error) {
        console.error("File reading error:", error);
        setSkillsText(`Error reading file. Please try again or enter manually.`);
      } finally {
        setIsProcessingFiles(false);
      }
    }
  };

  const handleLinkedinScrape = async () => {
    if (!linkedinUrl) return;
    setIsScrapingLinkedin(true);
    try {
      // Call LinkedIn scraping API
      const response = await fetch("/api/scrape-linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: linkedinUrl }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobDescriptionText(data.jobDescription);
      } else {
        // Fallback for demo purposes
        setJobDescriptionText(`[LinkedIn Job URL: ${linkedinUrl}]\n\nJob description will be scraped here.\n\nPlease enter the job description manually for now.`);
      }
    } catch (error) {
      console.error("LinkedIn scraping error:", error);
      setJobDescriptionText(`[LinkedIn Job URL: ${linkedinUrl}]\n\nUnable to scrape. Please enter the job description manually.`);
    } finally {
      setIsScrapingLinkedin(false);
    }
  };

  const handleSetupComplete = async () => {
    // Validate inputs - ONLY check for job description and skills
    if (!jobDescriptionText.trim() || !skillsText.trim()) {
      alert("Please provide job description (via LinkedIn) and employee skills (via PDF) before starting the interview.");
      return;
    }

    setIsGeneratingQuestions(true);

    try {
      // Call generate questions API with streaming
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescriptionText,
          employeeSkills: skillsText,
          technicalQuestions: technicalQuestions,
          behavioralQuestions: behavioralQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if it's a 503 service overload error
        if (response.status === 503 || errorData.retryable) {
          throw new Error("The AI service is currently experiencing high demand. Please try again in a few moments.");
        }
        
        throw new Error(errorData.error || "Failed to generate questions");
      }

      // Handle streaming response (NDJSON format)
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      const collectedQuestions: any[] = [];
      let totalQuestions = 0;
      let interviewStarted = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(line => line.trim());

          for (const line of lines) {
            try {
              const message = JSON.parse(line);

              if (message.type === "init") {
                totalQuestions = message.totalQuestions;
                console.log(`📊 Total questions to generate: ${totalQuestions}`);
              } else if (message.type === "question") {
                collectedQuestions.push(message.question);
                console.log(`✅ Question ${message.received}/${message.total} received`);
                
                // START INTERVIEW AS SOON AS FIRST QUESTION ARRIVES!
                if (!interviewStarted && collectedQuestions.length === 1) {
                  interviewStarted = true;
                  setIsGeneratingQuestions(false);
                  
                  // Store the questions we have so far
                  setGeneratedQuestions([...collectedQuestions]);
                  setCurrentQuestionIndex(0);
                  setInterviewResults([]);
                  setAnswerStartTime(Date.now());
                  
                  // Close setup and start the interview immediately
                  setShowSetup(false);
                  
                  // Start the interview session
                  const aiInterviewSession: MockSession = {
                    id: "ai-interview-" + Date.now(),
                    title: "AI-Generated Interview",
                    type: "technical",
                    difficulty: "intermediate",
                    duration: 60,
                    currentQuestion: 1,
                    totalQuestions: totalQuestions,
                    isActive: true,
                    sessionTime: 0,
                    aiInterviewer: {
                      name: "AI Interviewer",
                      personality: "professional",
                      avatar: "",
                    },
                  };
                  
                  setCurrentSession(aiInterviewSession);
                  setIsSessionActive(true);
                  setSessionComplete(false);
                  
                  console.log("🎬 Interview started with first question!");
                } else {
                  // Update questions as they arrive (in background while interview continues)
                  setGeneratedQuestions([...collectedQuestions]);
                  console.log(`📥 Updated questions array: ${collectedQuestions.length} total`);
                }
              } else if (message.type === "complete") {
                console.log(`📋 All ${message.totalQuestions} questions generated`);
              }
            } catch (parseError) {
              console.error("Error parsing stream message:", parseError, line);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Only throw error if no questions received at all
      if (collectedQuestions.length === 0) {
        throw new Error("No questions received from stream");
      }

      console.log(`✨ Final count: ${collectedQuestions.length} questions collected`);
      
      // Questions are already being updated in real-time during streaming
      // Final update with all collected questions (in case any were missed)
      setGeneratedQuestions([...collectedQuestions]);
      
    } catch (error) {
      console.error("Error generating questions:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate interview questions. Please try again.";
      alert(errorMessage);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    const currentQuestion = generatedQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Calculate time spent on this question
    const timeSpent = Math.floor((Date.now() - answerStartTime) / 1000);

    // Store the answer without evaluation
    const result: QuestionResult = {
      question: currentQuestion,
      userAnswer: currentAnswer,
      timeSpent,
    };

    const updatedResults = [...interviewResults, result];
    setInterviewResults(updatedResults);

    // Move to next question or finish interview
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
      setAnswerStartTime(Date.now());
      
      // Update session
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          currentQuestion: currentQuestionIndex + 2,
        });
      }
    } else {
      // All questions answered, now evaluate all at once
      setIsEvaluatingAnswer(true);
      await generateFinalAssessment(updatedResults);
      setIsEvaluatingAnswer(false);
    }
  };

  const generateFinalAssessment = async (results: QuestionResult[]) => {
    try {
      // First, evaluate all answers
      console.log("Evaluating all answers...");
      const evaluatedResults = await Promise.all(
        results.map(async (result) => {
          try {
            const response = await fetch("/api/evaluate-answer", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                question: result.question.question,
                userAnswer: result.userAnswer,
                idealAnswer: result.question.idealAnswer,
                evaluationCriteria: result.question.evaluationCriteria,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to evaluate answer");
            }

            const evaluation: QuestionEvaluation = await response.json();
            return { ...result, evaluation };
          } catch (error) {
            console.error("Error evaluating answer:", error);
            // Return with a default low score if evaluation fails
            return {
              ...result,
              evaluation: {
                score: 0,
                strengths: [],
                weaknesses: ["Evaluation failed"],
                suggestions: [],
                feedback: "Could not evaluate this answer",
                keyPointsCovered: [],
                keyPointsMissed: [],
              },
            };
          }
        })
      );

      // Update results with evaluations
      setInterviewResults(evaluatedResults);

      // Now generate final assessment
      console.log("Generating final assessment...");
      const response = await fetch("/api/final-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results: evaluatedResults }),
      });

      if (!response.ok) {
        console.error("Final assessment API error:", response.status, response.statusText);
        const errorData = await response.json().catch(() => null);
        console.error("Error details:", errorData);
        
        // Create a fallback assessment based on statistics
        const totalScore = evaluatedResults.reduce((sum: number, r) => sum + (r.evaluation?.score || 0), 0);
        const avgScore = totalScore / evaluatedResults.length;
        const percentage = (avgScore / 10) * 100;
        
        const fallbackAssessment = {
          overallRating: avgScore >= 7 ? "Good" : avgScore >= 5 ? "Fair" : "Needs Improvement",
          hiringRecommendation: avgScore >= 7 ? "Yes" : avgScore >= 5 ? "Maybe" : "No",
          summary: `You completed ${evaluatedResults.length} questions with an average score of ${avgScore.toFixed(1)}/10 (${percentage.toFixed(0)}%). AI evaluation service was temporarily unavailable, but your performance has been recorded.`,
          keyStrengths: ["Completed all questions", "Engaged with the interview process", "Provided responses to all questions"],
          keyWeaknesses: ["Review individual question feedback", "Practice more technical questions", "Work on response completeness"],
          detailedFeedback: {
            technical: `Overall performance: ${avgScore.toFixed(1)}/10. Review the detailed feedback for each question.`,
            behavioral: `Continue developing your soft skills and workplace scenario understanding.`,
            communication: `Communication skills were evaluated throughout the interview.`
          },
          developmentAreas: ["Review detailed feedback", "Practice similar questions", "Focus on weaker areas"],
          nextSteps: ["Study the feedback for each answer", "Continue practicing", "Apply learnings"],
          confidenceLevel: 70
        };
        
        setFinalAssessment(fallbackAssessment);
        setShowFinalReport(true);
        setIsSessionActive(false);
        setSessionComplete(true);
        return;
      }

      const data = await response.json();
      setFinalAssessment(data.assessment);
      setShowFinalReport(true);
      setIsSessionActive(false);
      setSessionComplete(true);
    } catch (error) {
      console.error("Error generating final assessment:", error);
      
      // Create a fallback assessment using interviewResults
      const totalScore = interviewResults.reduce((sum: number, r) => sum + (r.evaluation?.score || 0), 0);
      const avgScore = interviewResults.length > 0 ? totalScore / interviewResults.length : 0;
      const percentage = (avgScore / 10) * 100;
      
      const fallbackAssessment = {
        overallRating: avgScore >= 7 ? "Good" : avgScore >= 5 ? "Fair" : "Needs Improvement",
        hiringRecommendation: avgScore >= 7 ? "Yes" : avgScore >= 5 ? "Maybe" : "No",
        summary: `You completed ${interviewResults.length} questions with an average score of ${avgScore.toFixed(1)}/10 (${percentage.toFixed(0)}%). Your answers have been recorded and evaluated.`,
        keyStrengths: ["Completed all questions", "Engaged with the interview", "Demonstrated effort"],
        keyWeaknesses: ["Review individual feedback", "Practice more questions", "Work on completeness"],
        detailedFeedback: {
          technical: `Performance score: ${avgScore.toFixed(1)}/10. Check detailed feedback.`,
          behavioral: `Continue developing professional skills.`,
          communication: `Communication evaluated throughout.`
        },
        developmentAreas: ["Review feedback", "Practice more", "Focus on improvements"],
        nextSteps: ["Study feedback", "Keep practicing", "Apply learnings"],
        confidenceLevel: 70
      };
      
      setFinalAssessment(fallbackAssessment);
      setShowFinalReport(true);
      setIsSessionActive(false);
      setSessionComplete(true);
    }
  };

  // Show premium loading screen when evaluating final assessment
  if (isEvaluatingAnswer && currentQuestionIndex >= generatedQuestions.length - 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="bg-background/80 backdrop-blur-xl border-border shadow-2xl">
            <CardContent className="p-12 text-center space-y-8">
              {/* Animated Icon */}
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin" 
                     style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 bg-gradient-to-br from-background to-muted rounded-full flex items-center justify-center">
                  <Brain className="w-16 h-16 text-primary animate-pulse" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-foreground">
                  Analyzing Your Performance
                </h1>
                <p className="text-xl text-muted-foreground">
                  Our AI is evaluating your answers with Ollama
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Questions Answered</p>
                    <p className="text-muted-foreground text-sm">{generatedQuestions.length} responses recorded</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Evaluating Responses</p>
                    <p className="text-muted-foreground text-sm">Comparing against ideal answers</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-border opacity-50">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Generating Final Report</p>
                    <p className="text-muted-foreground text-sm">Creating comprehensive assessment</p>
                  </div>
                </div>
              </div>

              {/* Fun Fact */}
              <div className="pt-6 border-t border-border">
                <p className="text-muted-foreground text-sm">
                  💡 <strong className="text-foreground">Did you know?</strong> Our local Ollama AI analyzes your answers 10-20x faster than cloud-based solutions!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    // If we have a Gemini final assessment, show it
    if (showFinalReport && finalAssessment) {
      const stats = {
        totalScore: interviewResults.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0),
        averageScore: interviewResults.length > 0 
          ? (interviewResults.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0) / interviewResults.length).toFixed(1)
          : "0",
        percentage: interviewResults.length > 0 
          ? ((interviewResults.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0) / (interviewResults.length * 10)) * 100).toFixed(0)
          : "0",
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto p-6 md:p-8 lg:p-12 space-y-8">
            {/* Premium Header with Celebration */}
            <AnimatedContainer>
              <div className="text-center space-y-6 relative">
                {/* Celebration Badge */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-secondary/40 blur-3xl opacity-50 animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 rounded-full flex items-center justify-center mx-auto border-4 border-white dark:border-gray-800 shadow-2xl">
                    <Award className="w-16 h-16 text-primary dark:text-primary" />
                  </div>
                </div>
                
                {/* Title */}
                <div className="space-y-3">
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                    Interview Complete! 🎉
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    {finalAssessment.summary}
                  </p>
                </div>

                {/* Quick Stats Banner */}
                <div className="flex items-center justify-center gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{interviewResults.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.percentage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{finalAssessment.confidenceLevel}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>

            {/* Premium Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedContainer delay={0.1}>
                <Card className="bg-gradient-to-br from-primary to-primary/60 border-0 shadow-2xl text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                  <CardHeader className="relative">
                    <CardTitle className="text-white/90 text-lg">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent className="relative pb-8">
                    <div className="text-6xl font-bold mb-3">
                      {stats.percentage}%
                    </div>
                    <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                      {finalAssessment.overallRating}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer delay={0.2}>
                <Card className="bg-gradient-to-br from-primary to-primary/60 border-0 shadow-2xl text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                  <CardHeader className="relative">
                    <CardTitle className="text-white/90 text-lg">AI Confidence</CardTitle>
                  </CardHeader>
                  <CardContent className="relative pb-8">
                    <div className="text-6xl font-bold mb-3">
                      {finalAssessment.confidenceLevel}%
                    </div>
                    <p className="text-white/80 text-sm">Analysis Certainty</p>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer delay={0.3}>
                <Card className="bg-gradient-to-br from-secondary to-secondary/70 border-0 shadow-2xl text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                  <CardHeader className="relative">
                    <CardTitle className="text-white/90 text-lg">Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent className="relative pb-8">
                    <div className="text-3xl font-bold mb-3">
                      {finalAssessment.hiringRecommendation}
                    </div>
                    <p className="text-white/80 text-sm">
                      Based on {interviewResults.length} responses
                    </p>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>

            {/* Key Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-primary" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {finalAssessment.keyStrengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Areas for Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {finalAssessment.developmentAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {finalAssessment.detailedFeedback.technical}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Behavioral Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {finalAssessment.detailedFeedback.behavioral}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {finalAssessment.detailedFeedback.communication}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {finalAssessment.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Individual Question Results - NEW DETAILED VIEW */}
            <QuestionDetailedView 
              interviewResults={interviewResults}
              finalAssessment={finalAssessment}
              statistics={stats}
              candidateName={session?.user?.name || "Candidate"}
              jobTitle={jobDescriptionText.split('\n')[0].substring(0, 50) || "Mock Interview"}
              companyName=""
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Start New Interview
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Fallback to default completion screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6 space-y-8">
          <AnimatedContainer>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Interview Complete!</h1>
              <p className="text-muted-foreground">
                Great job! Here's your detailed performance analysis.
              </p>
            </div>
          </AnimatedContainer>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Score */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Overall Performance</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 56 * (1 - aiFeedback.overall / 100)
                        }`}
                        className="text-primary"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {aiFeedback.overall}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-primary/10 text-primary">
                      Excellent Performance
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      You demonstrated strong interview skills across all
                      categories.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Category Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatedContainer delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(aiFeedback.categories).map(
                      ([category, score], index) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="text-sm font-medium">
                              {score}%
                            </span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <AnimatedContainer delay={0.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <ThumbsUp className="w-5 h-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiFeedback.strengths.map((strength, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedContainer>

                {/* Improvements */}
                <AnimatedContainer delay={0.4}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <TrendingUp className="w-5 h-5" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiFeedback.improvements.map((improvement, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Target className="w-4 h-4 text-orange-500 mt-0.5" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedContainer>
              </div>

              {/* AI Insights */}
              <AnimatedContainer delay={0.5}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      AI Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiFeedback.insights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20"
                        >
                          <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5" />
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              {/* Actions */}
              <AnimatedContainer delay={0.6}>
                <div className="flex gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview active - show simplified interview UI
  if (currentSession && isSessionActive && generatedQuestions.length > 0) {
    const currentQuestion = generatedQuestions[currentQuestionIndex];
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden p-4 md:p-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="max-w-7xl mx-auto">
        <AnimatedContainer>
          {/* Premium Header with Stats Bar */}
          <div className="mb-8">
            {/* Top Bar - Title and End Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                  AI Interview Session
                </h1>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  Powered by Ollama AI • Real-time Evaluation
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to end the interview?")) {
                    setGeneratedQuestions([]);
                    setIsSessionActive(false);
                  }
                }}
                className="border-destructive/30 hover:bg-destructive/10"
              >
                End Interview
              </Button>
            </div>

            {/* Premium Stats Bar */}
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-muted ring-1 ring-primary/20 shadow-lg hover:shadow-xl transition">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-6">
                  {/* Progress with circular indicator */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="rgba(var(--primary-rgb),0.1)"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="white"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - (currentQuestionIndex / generatedQuestions.length))}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {Math.round((currentQuestionIndex / generatedQuestions.length) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Progress</p>
                      <p className="text-white font-bold text-2xl">
                        {currentQuestionIndex}/{generatedQuestions.length}
                      </p>
                    </div>
                  </div>

                  {/* Time Spent */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Time</p>
                      <p className="text-white font-bold text-2xl">
                        {Math.floor(questionTime / 60)}:{(questionTime % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  {/* Questions Completed */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Completed</p>
                      <p className="text-white font-bold text-2xl">{currentQuestionIndex}</p>
                    </div>
                  </div>

                  {/* Questions Remaining */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Remaining</p>
                      <p className="text-white font-bold text-2xl">
                        {generatedQuestions.length - currentQuestionIndex}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Redesigned Layout with Avatar Prominence */}
          <div className="space-y-6">
            {/* Top: Progress Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">
                    Question Progress
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {currentQuestionIndex + 1} of {generatedQuestions.length}
                  </span>
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / generatedQuestions.length) * 100} 
                  className="h-3 bg-muted rounded-full"
                />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(((currentQuestionIndex + 1) / generatedQuestions.length) * 100)}%
                </p>
              </div>
            </motion.div>

            {/* Main Section: Avatar (Left) + Question (Center) + Answer (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: AI Avatar - Prominent and Visible */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-3"
              >
                <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/40 shadow-xl h-full flex flex-col sticky top-6">
                  <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-xl pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      AI Interviewer
                    </CardTitle>
                    <p className="text-xs text-primary-foreground/80 mt-1">
                      {currentQuestion?.type === "technical" ? "🔧 Technical Question" : "💬 Behavioral Question"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
                        <HeyGenAvatar 
                          onError={handleAvatarError}
                          questionToSpeak={currentQuestion?.question}
                          compact={true}
                        />
                      </div>

                      {/* Mini Stats Below Avatar */}
                      <div className="space-y-3 pt-4 border-t border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Completed</span>
                          <span className="text-lg font-bold text-primary">{currentQuestionIndex}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Remaining</span>
                          <span className="text-lg font-bold text-secondary">{generatedQuestions.length - currentQuestionIndex}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Time</span>
                          <span className="text-lg font-bold font-mono text-blue-600">
                            {Math.floor(questionTime / 60)}:{(questionTime % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Avg Score</span>
                          <span className="text-lg font-bold text-purple-600">
                            {interviewResults.length > 0 
                              ? Math.round((interviewResults.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0) / (interviewResults.length * 10)) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>

                      {/* Avatar Errors */}
                      {avatarErrors.length > 0 && (
                        <div className="mt-4 space-y-2 pt-4 border-t border-destructive/20">
                          {avatarErrors.slice(0, 2).map((error, idx) => (
                            <div key={idx} className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                              {error}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CENTER: Question Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-4"
              >
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/25 shadow-xl h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-xl pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-base font-bold uppercase tracking-wide">
                          Question {currentQuestionIndex + 1}
                        </span>
                        <p className="text-xs text-primary-foreground/80">
                          of {generatedQuestions.length} total
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-300px)]">
                    <div className="space-y-5">
                      {/* Main Question */}
                      <div>
                        <p className="text-lg md:text-xl leading-relaxed font-bold text-foreground">
                          {currentQuestion?.question}
                        </p>
                      </div>

                      {/* Ideal Answer Preview */}
                      {currentQuestion?.idealAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                        >
                          <p className="text-xs font-bold text-primary/80 uppercase tracking-wider mb-2">
                            💡 Ideal Structure:
                          </p>
                          <p className="text-sm text-primary/70 italic leading-snug">
                            "{currentQuestion.idealAnswer}"
                          </p>
                        </motion.div>
                      )}

                      {/* Evaluation Criteria */}
                      {currentQuestion?.evaluationCriteria && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-2"
                        >
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            ✓ Evaluation Criteria:
                          </p>
                          <div className="space-y-2">
                            {currentQuestion.evaluationCriteria.map((criteria: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/60 border border-muted/40">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                                </div>
                                <span className="text-xs text-foreground/80">{criteria}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* RIGHT: Answer Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-5"
              >
                <Card className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-2 border-secondary/25 shadow-xl h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-t-xl pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-wide">Your Answer</h3>
                        <p className="text-xs text-secondary-foreground/80 mt-0.5">Be specific and include examples</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 flex flex-col justify-between space-y-3">
                    {/* Whisper Info */}
                    {typeof window !== 'undefined' && mediaRecorder && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-2"
                      >
                        <Mic className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Using AI Whisper for accurate transcription
                        </p>
                      </motion.div>
                    )}

                    {/* Answer Textarea */}
                    <div className="flex-1 relative min-h-[200px]">
                      <Textarea
                        placeholder="Share your answer here... Include specific examples, metrics, and outcomes."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        className="w-full h-full min-h-[200px] text-sm resize-none border-2 border-secondary/30 focus:border-secondary rounded-xl p-4 bg-white dark:bg-slate-950"
                        disabled={isEvaluatingAnswer}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                        {currentAnswer.length} / 500
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={isEvaluatingAnswer || !currentAnswer.trim()}
                        className="w-full h-10 text-sm font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all"
                      >
                        {isEvaluatingAnswer ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {currentQuestionIndex === generatedQuestions.length - 1 
                              ? 'Finalizing...'
                              : 'Evaluating...'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {currentQuestionIndex === generatedQuestions.length - 1 
                              ? 'Submit & View Results'
                              : 'Next Question'}
                          </>
                        )}
                      </Button>

                      {/* Voice Recording Button - Using Whisper */}
                      {typeof window !== 'undefined' && mediaRecorder && (
                        <Button
                          onClick={toggleVoiceRecording}
                          variant={isRecording ? "destructive" : "outline"}
                          size="sm"
                          className={cn(
                            "w-full font-semibold transition-all text-xs",
                            isRecording && "animate-pulse bg-destructive text-white border-destructive"
                          )}
                          disabled={isEvaluatingAnswer || isTranscribing}
                        >
                          {isTranscribing ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Transcribing...
                            </>
                          ) : isRecording ? (
                            <>
                              <Square className="w-3 h-3 mr-2" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="w-3 h-3 mr-2" />
                              Voice Record
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Recording Indicator */}
                    {isRecording && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-950/30 rounded-lg border-2 border-red-300 dark:border-red-800"
                      >
                        <div className="relative w-2 h-2">
                          <div className="absolute inset-0 bg-red-600 rounded-full animate-pulse" />
                          <div className="absolute inset-0 bg-red-600 rounded-full animate-ping" />
                        </div>
                        <span className="text-xs font-bold text-red-700 dark:text-red-300">
                          Recording...
                        </span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
  }

  // If showing setup flow, render that instead
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        
        <div className="py-16 px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button 
              onClick={() => setShowSetup(false)}
              className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Interview
            </button>
            
            {/* Header Section */}
            <div className="mb-16 space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                Setup Your Interview
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Customize your mock interview experience by providing a few key details. We'll use this to personalize your questions and feedback.
              </p>
            </div>

            {/* Step Indicator - More Prominent */}
            <div className="mb-16">
              <div className="flex items-center justify-between gap-2">
                {[1, 2, 3].map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-shrink-0 w-20">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                        step < setupStep ? 'bg-primary text-primary-foreground scale-110' :
                        step === setupStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step < setupStep ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          step
                        )}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground mt-2 text-center">
                        {step === 1 ? "Questions" : step === 2 ? "Job Details" : "Your Profile"}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-1 mx-2 transition-all ${
                        step < setupStep ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content - Larger Cards with Better Spacing */}
            <div className="mb-16">
              {/* Step 1: Question Types */}
              {setupStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-background to-muted/40 border border-muted shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 flex-shrink-0">
                          <MessageSquare className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Select Question Types</CardTitle>
                          <p className="text-muted-foreground text-base">
                            Choose the mix of technical and behavioral questions that best suits your interview preparation needs.
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-semibold mb-3 block">Technical Questions</Label>
                            <p className="text-sm text-muted-foreground mb-4">Focus on coding, algorithms, and technical concepts</p>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max="40"
                            value={technicalQuestions}
                            onChange={(e) => setTechnicalQuestions(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 40))}
                            className="text-center text-3xl font-bold border-2 border-muted hover:border-primary/60 focus:border-primary transition h-16"
                          />
                          <p className="text-xs text-muted-foreground text-center">0-40 questions</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-semibold mb-3 block">Behavioral Questions</Label>
                            <p className="text-sm text-muted-foreground mb-4">Cover your experience, soft skills, and past projects</p>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max="40"
                            value={behavioralQuestions}
                            onChange={(e) => setBehavioralQuestions(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 40))}
                            className="text-center text-3xl font-bold border-2 border-muted hover:border-primary/60 focus:border-primary transition h-16"
                          />
                          <p className="text-xs text-muted-foreground text-center">0-40 questions</p>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-primary/5 rounded-xl border border-muted ring-1 ring-primary/20">
                        <p className="text-center">
                          <span className="text-3xl font-bold text-primary">{technicalQuestions + behavioralQuestions}</span>
                          <span className="text-muted-foreground ml-2">total questions</span>
                        </p>
                        {(technicalQuestions + behavioralQuestions < 5 || technicalQuestions + behavioralQuestions > 50) && (
                          <p className="text-xs text-amber-600 dark:text-amber-500 text-center mt-3">
                            ⚠️ Must be between 5-50 questions
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Job Description */}
              {setupStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-background to-muted/40 border border-muted shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 flex-shrink-0">
                          <FileText className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Job Details</CardTitle>
                          <p className="text-muted-foreground text-base">
                            Add the job posting details so we can tailor questions to match the role requirements.
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">LinkedIn Job URL</Label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type="url"
                              placeholder="https://linkedin.com/jobs/123456..."
                              value={linkedinUrl}
                              onChange={(e) => setLinkedinUrl(e.target.value)}
                              className="pl-12 border-2 border-muted hover:border-primary/60 focus:border-primary transition h-12 text-base"
                            />
                          </div>
                          <Button 
                            onClick={handleLinkedinScrape}
                            disabled={!linkedinUrl || isScrapingLinkedin}
                            className="bg-primary hover:bg-primary/90 px-8 font-semibold"
                            size="lg"
                          >
                            {isScrapingLinkedin ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Fetching...
                              </>
                            ) : (
                              <>
                                <LinkIcon className="w-5 h-5 mr-2" />
                                Fetch
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {jobDescriptionText && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-primary/5 rounded-xl border border-muted ring-1 ring-primary/20"
                        >
                          <p className="font-semibold text-base mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Job Description Loaded
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            {jobDescriptionText.substring(0, 400)}...
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Profile & Skills */}
              {setupStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-background to-muted/40 border border-muted shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 flex-shrink-0">
                          <Brain className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Your Profile</CardTitle>
                          <p className="text-muted-foreground text-base">
                            Upload your resume to help us personalize the interview experience.
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Upload CV/Resume</Label>
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".pdf,.txt,.doc,.docx"
                            onChange={handleCvFileChange}
                            className="cursor-pointer border-2 border-dashed border-muted hover:border-primary/60 transition-all h-20 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20"
                            disabled={isProcessingFiles}
                          />
                          {(isProcessingFiles || cvFile) && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/10 text-primary ring-1 ring-primary/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              {isProcessingFiles ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  {cvFile?.name}
                                </>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {skillsText && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-primary/5 rounded-xl border border-muted ring-1 ring-primary/20"
                        >
                          <p className="font-semibold text-base mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Skills & Experience Loaded
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            {skillsText.substring(0, 400)}...
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons - More Prominent */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setSetupStep(Math.max(1, setupStep - 1))}
                className="flex-1 h-14 text-base font-semibold border-2"
                disabled={setupStep === 1}
              >
                ← Previous
              </Button>
              {setupStep < 3 && (
                <Button
                  onClick={() => setSetupStep(setupStep + 1)}
                  className="flex-1 h-14 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  Next →
                </Button>
              )}
              {setupStep === 3 && (
                <Button
                  onClick={handleSetupComplete}
                  disabled={
                    isGeneratingQuestions ||
                    isProcessingFiles ||
                    !jobDescriptionText || 
                    !skillsText ||
                    technicalQuestions + behavioralQuestions < 5 ||
                    technicalQuestions + behavioralQuestions > 50
                  }
                  className="flex-1 h-14 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Interview...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Interview
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing page before interview starts
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="max-w-2xl w-full">
        <AnimatedContainer>
          <Card className="border shadow-lg bg-gradient-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
            <CardContent className="p-12 text-center space-y-8">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-primary/10 dark:bg-primary/20 p-4 ring-1 ring-primary/20">
                <Image 
                  src="/icons/one_logo.png" 
                  alt="JobPrep Logo" 
                  width={80} 
                  height={80}
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-5xl font-bold bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                  Mock Interview Simulator
                </h1>
                <p className="text-lg text-muted-foreground">
                  Practice with AI-powered interviewers and get instant feedback
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20">
                  <Brain className="w-6 h-6 text-primary" />
                  <span className="font-medium">AI Interviewer</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/10 dark:bg-secondary/20 ring-1 ring-secondary/20">
                  <MessageSquare className="w-6 h-6 text-secondary-foreground" />
                  <span className="font-medium">Real-time Feedback</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-accent/10 dark:bg-accent/20 ring-1 ring-accent/20">
                  <BarChart3 className="w-6 h-6 text-accent-foreground" />
                  <span className="font-medium">Performance Analytics</span>
                </div>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                onClick={() => {
                  setShowSetup(true);
                  setSetupStep(1);
                }}
                className="w-full h-14 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Interview
              </Button>

              {/* Additional Info */}
              <p className="text-xs text-muted-foreground">
                Click the button above to begin your mock interview session
              </p>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
