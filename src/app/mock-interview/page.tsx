"use client";

import { useState, useEffect } from "react";
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
  
  // Setup Dialog states
  const [showSetupDialog, setShowSetupDialog] = useState(false);
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
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentAnswer((prev) => prev + finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
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
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
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
      // Call Gemini API to generate questions
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

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions generated");
      }

      // Store generated questions
      setGeneratedQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setInterviewResults([]);
      setAnswerStartTime(Date.now());
      
      // Close setup dialog and start the interview
      setShowSetupDialog(false);
      
      // Start the interview session
      const aiInterviewSession: MockSession = {
        id: "ai-interview-" + Date.now(),
        title: "AI-Generated Interview",
        type: "technical",
        difficulty: "intermediate",
        duration: 60,
        currentQuestion: 1,
        totalQuestions: data.questions.length,
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-12 text-center space-y-8">
              {/* Animated Icon */}
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-spin" 
                     style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center">
                  <Brain className="w-16 h-16 text-white animate-pulse" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-white">
                  Analyzing Your Performance
                </h1>
                <p className="text-xl text-purple-200">
                  Our AI is evaluating your answers with Ollama
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Questions Answered</p>
                    <p className="text-purple-200 text-sm">{generatedQuestions.length} responses recorded</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Evaluating Responses</p>
                    <p className="text-purple-200 text-sm">Comparing against ideal answers</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 opacity-50">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Generating Final Report</p>
                    <p className="text-purple-200 text-sm">Creating comprehensive assessment</p>
                  </div>
                </div>
              </div>

              {/* Fun Fact */}
              <div className="pt-6 border-t border-white/10">
                <p className="text-purple-200 text-sm">
                  💡 <strong className="text-white">Did you know?</strong> Our local Ollama AI analyzes your answers 10-20x faster than cloud-based solutions!
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto p-6 md:p-8 lg:p-12 space-y-8">
            {/* Premium Header with Celebration */}
            <AnimatedContainer>
              <div className="text-center space-y-6 relative">
                {/* Celebration Badge */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-3xl opacity-50 animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-full flex items-center justify-center mx-auto border-4 border-white dark:border-gray-800 shadow-2xl">
                    <Award className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                
                {/* Title */}
                <div className="space-y-3">
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                    Interview Complete! 🎉
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    {finalAssessment.summary}
                  </p>
                </div>

                {/* Quick Stats Banner */}
                <div className="flex items-center justify-center gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{interviewResults.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.percentage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{finalAssessment.confidenceLevel}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>

            {/* Premium Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedContainer delay={0.1}>
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 border-0 shadow-2xl text-white overflow-hidden">
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
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 border-0 shadow-2xl text-white overflow-hidden">
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
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-2xl text-white overflow-hidden">
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
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {finalAssessment.keyStrengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
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
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Areas for Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {finalAssessment.developmentAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6 space-y-8">
          <AnimatedContainer>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
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
                        className="text-green-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">
                        {aiFeedback.overall}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <AnimatedContainer>
          {/* Premium Header with Stats Bar */}
          <div className="mb-8">
            {/* Top Bar - Title and End Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Interview Session
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
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
                className="border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
              >
                End Interview
              </Button>
            </div>

            {/* Premium Stats Bar */}
            <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-2xl">
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
                          stroke="rgba(255,255,255,0.2)"
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

          {/* Main Content - Enhanced Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Large Avatar (1/3 width) */}
            <div className="xl:col-span-1">
              <Card className="sticky top-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-indigo-100 dark:border-indigo-900 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    AI Interviewer
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your virtual interviewer
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Larger Avatar Container */}
                  <div className="aspect-square w-full max-w-md mx-auto">
                    <HeyGenAvatar 
                      onError={handleAvatarError}
                      questionToSpeak={currentQuestion?.question}
                    />
                  </div>
                  {avatarErrors.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {avatarErrors.map((error, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-red-600 p-3 bg-red-100 dark:bg-red-950/20 rounded-lg"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Question and Answer (2/3 width) */}
            <div className="xl:col-span-2 space-y-6">
              {/* Large Question Card - Most Prominent */}
              <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 border-2 border-emerald-200 dark:border-emerald-900 shadow-2xl">
                <CardHeader className="pb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      Question #{currentQuestionIndex + 1}
                    </CardTitle>
                    <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-1">
                      {currentQuestion?.type || "Technical"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-xl md:text-2xl leading-relaxed text-gray-900 dark:text-white font-medium">
                    {currentQuestion?.question}
                  </p>
                  
                  {/* Ideal Answer Hint */}
                  {currentQuestion?.evaluationCriteria && (
                    <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Evaluation Criteria:
                      </p>
                      <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1 ml-6">
                        {currentQuestion.evaluationCriteria.map((criteria: string, idx: number) => (
                          <li key={idx} className="list-disc">{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Answer Input Card - Enhanced */}
              <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 border-2 border-amber-200 dark:border-amber-900 shadow-xl">
                <CardHeader className="pb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Edit className="w-7 h-7" />
                    </div>
                    Your Answer
                  </CardTitle>
                  <p className="text-amber-100 text-sm mt-1">
                    Take your time and provide a detailed response
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Browser Compatibility Warning */}
                  {typeof window !== 'undefined' && !(window as any).webkitSpeechRecognition && (
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> Voice recording is only available in Chrome browser.
                      </p>
                    </div>
                  )}

                  {/* Answer Textarea - Larger */}
                  <div className="relative">
                    <Textarea
                      placeholder="Type your answer here... Be specific and provide examples when possible."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="min-h-[280px] text-base resize-none border-2 focus:border-amber-400 dark:focus:border-amber-600 rounded-xl p-5 font-medium"
                      disabled={isEvaluatingAnswer}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {currentAnswer.length} characters
                    </div>
                  </div>

                  {/* Action Buttons - Enhanced */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={isEvaluatingAnswer || !currentAnswer.trim()}
                      className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg"
                    >
                      {isEvaluatingAnswer ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          {currentQuestionIndex === generatedQuestions.length - 1 
                            ? 'Generating Final Report...'
                            : 'Evaluating...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-3" />
                          {currentQuestionIndex === generatedQuestions.length - 1 
                            ? 'Submit Final Answer'
                            : 'Submit & Continue'}
                        </>
                      )}
                    </Button>

                    {/* Voice Recording Button - Enhanced */}
                    {typeof window !== 'undefined' && (window as any).webkitSpeechRecognition && (
                      <Button
                        onClick={toggleVoiceRecording}
                        variant={isRecording ? "destructive" : "outline"}
                        size="lg"
                        className={cn(
                          "h-14 px-6",
                          isRecording && "animate-pulse shadow-lg shadow-red-500/50"
                        )}
                        disabled={isEvaluatingAnswer}
                        title={isRecording ? "Stop recording" : "Start voice recording"}
                      >
                        <Mic className="w-6 h-6" />
                        <span className="ml-2 font-semibold hidden sm:inline">
                          {isRecording ? "Stop" : "Voice"}
                        </span>
                      </Button>
                    )}
                  </div>

                  {/* Recording Indicator - Enhanced */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-3 p-4 bg-red-100 dark:bg-red-950/20 rounded-xl border-2 border-red-300 dark:border-red-800">
                      <div className="relative flex items-center justify-center">
                        <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse" />
                        <div className="absolute w-8 h-8 bg-red-600 rounded-full animate-ping opacity-75" />
                      </div>
                      <span className="text-base font-bold text-red-700 dark:text-red-300">
                        Recording in progress... Speak now
                      </span>
                    </div>
                  )}

                  {/* Tips Section */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Pro Tips:
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-6">
                      <li className="list-disc">Use the STAR method (Situation, Task, Action, Result)</li>
                      <li className="list-disc">Provide specific examples and quantifiable results</li>
                      <li className="list-disc">Keep your answer focused and relevant</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
  }

  // Landing page before interview starts
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <AnimatedContainer>
          <Card className="border-2 shadow-2xl">
            <CardContent className="p-12 text-center space-y-8">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4">
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
                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Mock Interview Simulator
                </h1>
                <p className="text-lg text-muted-foreground">
                  Practice with AI-powered interviewers and get instant feedback
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                  <Brain className="w-6 h-6 text-indigo-600" />
                  <span className="font-medium">AI Interviewer</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <span className="font-medium">Real-time Feedback</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20">
                  <BarChart3 className="w-6 h-6 text-pink-600" />
                  <span className="font-medium">Performance Analytics</span>
                </div>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                onClick={() => {
                  setShowSetupDialog(true);
                }}
                className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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

        {/* Setup Dialog */}
        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogContent className="max-w-[95vw] w-full lg:max-w-7xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20">
            <DialogHeader className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                Interview Preparation
              </DialogTitle>
              <p className="text-indigo-100 text-xs sm:text-sm mt-2">
                Upload or paste your details to create a personalized interview experience
              </p>
            </DialogHeader>

            <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-y-auto max-h-[calc(95vh-240px)] sm:max-h-[calc(95vh-220px)]">
              {/* Question Types Selector Card - FIRST */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 lg:mb-8"
              >
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-green-100 dark:border-green-900/50">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 mb-4 lg:mb-5 text-green-600 dark:text-green-400">
                    <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    Question Types
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                    {/* Technical Questions */}
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="technical-questions" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Technical Questions
                      </Label>
                      <Input
                        id="technical-questions"
                        type="number"
                        min="0"
                        max="40"
                        value={technicalQuestions}
                        onChange={(e) => setTechnicalQuestions(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 40))}
                        className="text-center text-lg font-semibold border-2 border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
                        placeholder="12"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Range: 0-40 questions
                      </p>
                    </div>

                    {/* Behavioral Questions */}
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="behavioral-questions" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Behavioral Questions
                      </Label>
                      <Input
                        id="behavioral-questions"
                        type="number"
                        min="0"
                        max="40"
                        value={behavioralQuestions}
                        onChange={(e) => setBehavioralQuestions(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 40))}
                        className="text-center text-lg font-semibold border-2 border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
                        placeholder="8"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Range: 0-40 questions
                      </p>
                    </div>
                  </div>

                  {/* Total Display */}
                  <div className="mt-4 lg:mt-5 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-300 text-center">
                      Total: {technicalQuestions + behavioralQuestions} questions
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-2">
                        (must be between 5-50)
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Job Description Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="space-y-3 lg:space-y-4"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-indigo-100 dark:border-indigo-900/50">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 mb-4 lg:mb-5 text-indigo-600 dark:text-indigo-400">
                      <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      Job Description
                    </h3>


                    {/* LinkedIn URL - PRIMARY */}
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="linkedin-url" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        LinkedIn Job URL
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                          <Input
                            id="linkedin-url"
                            type="url"
                            placeholder="https://linkedin.com/jobs/..."
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="pl-8 sm:pl-10 text-xs sm:text-sm border-2 border-indigo-100 dark:border-indigo-900/50 focus:border-indigo-400 dark:focus:border-indigo-600"
                          />
                        </div>
                        <Button 
                          onClick={handleLinkedinScrape}
                          disabled={!linkedinUrl || isScrapingLinkedin}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-6 text-xs sm:text-sm"
                        >
                          {isScrapingLinkedin ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          ) : (
                            <span className="hidden sm:inline">Fetch</span>
                          )}
                          {!isScrapingLinkedin && <LinkIcon className="w-3 h-3 sm:hidden" />}
                        </Button>
                      </div>
                    </div>

                    {/* Job Description Preview (auto-filled) */}
                    {jobDescriptionText && (
                      <div className="mt-4 lg:mt-5 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                          ✓ Job Description Loaded
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                          {jobDescriptionText.substring(0, 200)}...
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Employee Skills Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="space-y-3 lg:space-y-4"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-purple-100 dark:border-purple-900/50">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 mb-4 lg:mb-5 text-purple-600 dark:text-purple-400">
                      <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      Your Profile
                    </h3>

                    {/* CV Upload - PRIMARY */}
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="cv-file" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Upload CV/Resume (PDF)
                      </Label>
                      <div className="relative">
                        <Input
                          id="cv-file"
                          type="file"
                          accept=".pdf,.txt"
                          onChange={handleCvFileChange}
                          className="cursor-pointer text-xs sm:text-sm border-2 border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 dark:file:bg-purple-900/50 file:text-purple-700 dark:file:text-purple-300 file:text-xs sm:file:text-sm file:font-semibold hover:file:bg-purple-100 dark:hover:file:bg-purple-900"
                          disabled={isProcessingFiles}
                        />
                        {isProcessingFiles && cvFile ? (
                          <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 flex items-center gap-1 sm:gap-2 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="hidden sm:inline">Processing...</span>
                          </Badge>
                        ) : cvFile ? (
                          <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs max-w-[120px] sm:max-w-none truncate">
                            ✓ {cvFile.name}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {/* Skills Preview (auto-filled) */}
                    {skillsText && (
                      <div className="mt-4 lg:mt-5 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                          ✓ Skills & Experience Loaded
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                          {skillsText.substring(0, 200)}...
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            <DialogFooter className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSetupDialog(false)}
                className="w-full sm:flex-1 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetupComplete}
                disabled={
                  isGeneratingQuestions ||
                  isProcessingFiles ||
                  !jobDescriptionText || 
                  !skillsText
                }
                className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] text-sm"
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Interview
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
