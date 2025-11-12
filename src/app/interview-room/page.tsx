"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRecordingUpload } from "@/hooks/use-recording-upload";
import { useLiveKitChat } from "@/hooks/use-livekit-chat";
import { SettingsPanel } from "@/components/interview/settings-panel";
import { TemplateManager, type Template } from "@/components/interview/template-manager";
import { PerformanceAnalyticsPanel } from "@/components/interview/performance-analytics-panel";
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
  Video,
  Users,
  Copy,
  Check,
  Plus,
  LogIn,
  Sparkles,
  Mic,
  MicOff,
  Videotape,
  Share2,
  Mail,
  ArrowRight,
  Shield,
  Wifi,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInterviewStore } from "@/hooks/use-interview-store";
import { useAITranscription } from "@/hooks/use-ai-transcription";
import { useSession } from "@/lib/auth-client";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function InterviewRoom() {
  // Get user session
  const { data: session, isPending: isLoadingSession } = useSession();
  
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [token, setToken] = useState("");
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [formRoomName, setFormRoomName] = useState("");
  const [joinMode, setJoinMode] = useState<"create" | "join">("create");
  const [copied, setCopied] = useState(false);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [testingSetup, setTestingSetup] = useState(false);
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: number; url: string }>>([] as Array<{ id: string; name: string; size: number; url: string }>);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [mediaPermissionsChecked, setMediaPermissionsChecked] = useState(false);
  
  // Browser recording state
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]); // Use ref to track chunks
  const { uploadRecording, isUploading, uploadProgress } = useRecordingUpload();
  
  // Call duration timer - Increment while in active call
  useEffect(() => {
    if (hasJoined && token) {
      if (callStartTime === null) {
        setCallStartTime(Date.now());
      }
      
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hasJoined, token, callStartTime]);
  
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

  // LiveKit Chat - Handle incoming messages and files
  const { broadcastMessage, broadcastFile } = useLiveKitChat(
    (message) => {
      // Receive message from other participants
      addChatMessage(message);
    },
    (file) => {
      // Receive file from other participants
      setUploadedFiles((prev) => [...prev, file]);
      addChatMessage({
        id: file.id,
        senderId: file.senderId,
        senderName: file.senderName,
        message: `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        timestamp: file.timestamp,
        type: "message" as const,
      });
    }
  );

  // Generate initial room code
  useEffect(() => {
    if (!generatedRoomCode) {
      setGeneratedRoomCode(generateRoomName());
    }
  }, []);

  // Load recent rooms from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentInterviewRooms');
    if (stored) {
      try {
        setRecentRooms(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent rooms:', e);
      }
    }
  }, []);

  // Set participant name from session
  useEffect(() => {
    if (session?.user) {
      setParticipantName(session.user.name || session.user.email || "User");
    }
  }, [session]);

  // Get room name from URL and fetch token
  useEffect(() => {
    const initializeRoom = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const room = urlParams.get("room");
      const name = urlParams.get("name");
      
      // If room is provided in URL
      if (room) {
        const userName = name || session?.user?.name || session?.user?.email || "User";
        setRoomName(room);
        setParticipantName(userName);
        setHasJoined(true);

        try {
          const response = await fetch("/api/livekit/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomName: room,
              participantName: userName,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            
            // Save to recent rooms
            const updatedRecent = [room, ...recentRooms.filter(r => r !== room)].slice(0, 5);
            setRecentRooms(updatedRecent);
            localStorage.setItem('recentInterviewRooms', JSON.stringify(updatedRecent));
          }
        } catch (error) {
          console.error("Failed to get token:", error);
          toast.error("Failed to connect to room");
        }
      }
      
      setIsLoadingToken(false);
    };

    if (!isLoadingSession) {
      initializeRoom();
    }
  }, [isLoadingSession, session]);

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

  // Track interview start time
  useEffect(() => {
    if (hasJoined && roomName && session?.user?.id) {
      const interviewId = localStorage.getItem(`interview_${roomName}`);
      if (interviewId) {
        // Update interview status to "in-progress" when joined
        fetch("/api/interviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId,
            status: "in-progress",
            startedAt: new Date().toISOString(),
          }),
        }).catch(error => {
          console.error("Failed to update interview start time:", error);
        });
      }
    }
  }, [hasJoined, roomName, session]);

  // Handle joining room from form
  const handleJoinRoom = async () => {
    // Check media permissions first
    if (!hasMediaPermissions && !mediaPermissionsChecked) {
      toast.error("Please test your media setup first", {
        description: "Click 'Test Setup' to verify camera and microphone access",
      });
      return;
    }

    const userName = session?.user?.name || session?.user?.email || "Guest User";
    
    // Generate room name if creating
    const finalRoomName = joinMode === "create" 
      ? generatedRoomCode || generateRoomName()
      : formRoomName;

    if (joinMode === "join" && !finalRoomName.trim()) {
      toast.error("Please enter the room code");
      return;
    }

    setRoomName(finalRoomName);
    setParticipantName(userName);
    setIsLoadingToken(true);

    try {
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: finalRoomName,
          participantName: userName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setHasJoined(true);
        
        // Save to recent rooms
        const updatedRecent = [finalRoomName, ...recentRooms.filter(r => r !== finalRoomName)].slice(0, 5);
        setRecentRooms(updatedRecent);
        localStorage.setItem('recentInterviewRooms', JSON.stringify(updatedRecent));
        
        // Persist interview to database if user is logged in and creating a room
        if (session?.user?.id && joinMode === "create") {
          try {
            const interviewResponse = await fetch("/api/interviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                candidateId: session.user.id,
                interviewerId: session.user.id,
                isAIInterviewer: false,
                allowRecording: true,
                settings: { roomCode: finalRoomName },
              }),
            });

            if (interviewResponse.ok) {
              const interviewData = await interviewResponse.json();
              // Store interview ID in localStorage for later updates
              localStorage.setItem(`interview_${finalRoomName}`, interviewData.id);
              toast.success("Room created and saved to database!");
            }
          } catch (error) {
            console.error("Failed to save interview to database:", error);
            // Don't fail the join if database save fails
          }
        }
        
        toast.success(`${joinMode === "create" ? "Room created" : "Joined room"} successfully!`);
      } else {
        const error = await response.text();
        console.error("Failed to get token:", error);
        toast.error("Failed to join room. Please try again.");
      }
    } catch (error) {
      console.error("Failed to get token:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoadingToken(false);
    }
  };

  const handleCopyRoomLink = () => {
    const roomCode = generatedRoomCode || generateRoomName();
    const roomLink = `${window.location.origin}/interview-room?room=${roomCode}&name=`;
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    toast.success("Room link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareViaEmail = () => {
    console.log("handleShareViaEmail called");
    console.log("showEmailDialog before:", showEmailDialog);
    console.log("generatedRoomCode:", generatedRoomCode);
    console.log("roomName:", roomName);
    
    const roomCode = generatedRoomCode || roomName || generateRoomName();
    const roomLink = `${window.location.origin}/interview-room?room=${roomCode}&name=`;
    
    console.log("roomCode:", roomCode);
    console.log("roomLink:", roomLink);
    
    // Pre-fill the message
    const message = `Hi,\n\nYou're invited to join an interview room.\n\nRoom Code: ${roomCode}\nRoom Link: ${roomLink}\n\nClick the link above or enter the room code to join the interview room.\n\nLooking forward to speaking with you!`;
    setEmailMessage(message);
    setShowEmailDialog(true);
    
    console.log("showEmailDialog after:", true);
    console.log("emailMessage:", message);
  };

  const handleSendEmail = async () => {
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRecipient || !emailRegex.test(emailRecipient)) {
      toast.error("Please enter a valid email address", {
        description: "Format: example@domain.com",
      });
      return;
    }

    if (!emailMessage.trim()) {
      toast.error("Please add a message");
      return;
    }

    setIsSendingEmail(true);
    const roomCode = generatedRoomCode || roomName || generateRoomName();
    const roomLink = `${window.location.origin}/interview-room?room=${roomCode}&name=`;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailRecipient,
          subject: "Join my interview room",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">You're invited to an interview room</h2>
              <p style="color: #666; line-height: 1.6;">
                ${session?.user?.name || "Someone"} has invited you to join an interview room.
              </p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #333;"><strong>Room Code:</strong> ${roomCode}</p>
                <p style="margin: 10px 0 0 0;"><strong>Room Link:</strong></p>
                <a href="${roomLink}" style="color: #007bff; word-break: break-all;">${roomLink}</a>
              </div>
              <div style="background: #fff; padding: 15px; border-left: 3px solid #007bff; margin: 20px 0;">
                <p style="color: #666; line-height: 1.6; white-space: pre-wrap; margin: 0;">${emailMessage}</p>
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Sent from JobPrep Interview Platform
              </p>
            </div>
          `,
          text: emailMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send email");
      }
      
      toast.success("Invitation email sent successfully!", {
        description: `Email sent to ${emailRecipient}`,
      });
      setShowEmailDialog(false);
      setEmailRecipient("");
      setEmailMessage("");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Start browser recording with Appwrite upload
  const startLiveKitRecording = async () => {
    if (!roomName) {
      toast.error("No active room to record");
      return;
    }

    setIsProcessingRecording(true);
    try {
      // Get display media for screen + audio, or user media for camera + audio
      let stream: MediaStream;
      
      try {
        // Try to get screen + audio + camera
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } catch (screenError) {
        console.log("Screen sharing not available, using camera", screenError);
        // Fallback to camera + audio
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      recordingStreamRef.current = stream;

      // Create MediaRecorder
      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      // Clear previous chunks
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log(`Recorded chunk: ${event.data.size} bytes. Total chunks: ${recordedChunksRef.current.length}`);
        }
      };

      mediaRecorder.onstop = () => {
        console.log(`Recording stopped. Total chunks collected: ${recordedChunksRef.current.length}`);
        setRecordedChunks([...recordedChunksRef.current]);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      
      storeStartRecording();
      startTranscription();
      
      toast.success("Recording started! Will be uploaded to cloud storage when stopped.");
    } catch (error) {
      console.error("Failed to start browser recording:", error);
      toast.error("Failed to start recording. Please check camera/microphone permissions.");
    } finally {
      setIsProcessingRecording(false);
    }
  };

  // Stop browser recording and upload to Appwrite
  const stopLiveKitRecording = async () => {
    setIsProcessingRecording(true);
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        
        // Stop all tracks
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((track) => track.stop());
          recordingStreamRef.current = null;
        }

        // Wait a bit for chunks to be collected
        await new Promise(resolve => setTimeout(resolve, 500));
        
        storeStopRecording();
        stopTranscription();
        
        toast.info("Processing recording...");
        
        // Upload to Appwrite after stopping
        setTimeout(async () => {
          await uploadRecordingToAppwrite();
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to stop browser recording:", error);
      toast.error("Error stopping recording");
      storeStopRecording();
      stopTranscription();
    } finally {
      setIsProcessingRecording(false);
    }
  };

  // Upload recorded video to Appwrite
  const uploadRecordingToAppwrite = async () => {
    const chunks = recordedChunksRef.current;
    
    console.log(`Attempting to upload ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      toast.warning("No recording data to upload");
      return;
    }

    const interviewId = localStorage.getItem(`interview_${roomName}`);
    if (!interviewId) {
      toast.error("Interview ID not found");
      return;
    }

    try {
      const blob = new Blob(chunks, { type: "video/webm" });
      console.log(`Created blob of size: ${blob.size} bytes`);
      
      toast.info("Uploading recording to cloud storage...");
      
      const result = await uploadRecording({
        file: blob,
        interviewId,
        roomName,
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
      });
      
      if (result.success && result.recording) {
        setRecordingUrl(result.recording.fileUrl);
        toast.success("Recording uploaded successfully!");
        
        // Clear chunks after successful upload
        recordedChunksRef.current = [];
        setRecordedChunks([]);
      }
    } catch (error) {
      console.error("Failed to upload recording:", error);
      toast.error("Failed to upload recording to cloud storage");
    }
  };

  const generateRoomName = () => {
    const adjectives = ["swift", "bright", "calm", "bold", "wise", "quick", "tech", "pro"];
    const nouns = ["tiger", "falcon", "summit", "nexus", "wave", "spark", "hub", "node"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomAdj}-${randomNoun}-${randomNum}`;
  };

  const testMediaSetup = async () => {
    setTestingSetup(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop all tracks after testing
      stream.getTracks().forEach(track => track.stop());
      
      setHasMediaPermissions(true);
      setMediaPermissionsChecked(true);
      toast.success("Camera and microphone are working!", {
        description: "You're all set to join the interview room"
      });
    } catch (error) {
      console.error("Media setup test failed:", error);
      setHasMediaPermissions(false);
      setMediaPermissionsChecked(true);
      toast.error("Unable to access camera or microphone", {
        description: "Please check your browser permissions and try again"
      });
    } finally {
      setTestingSetup(false);
    }
  };

  // Generate room code on mount for create mode
  useEffect(() => {
    if (joinMode === "create" && !generatedRoomCode) {
      setGeneratedRoomCode(generateRoomName());
    }
  }, [joinMode, generatedRoomCode]);

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
      // Broadcast to other participants in the room
      broadcastMessage(newMessage);
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
      // Broadcast note to other participants
      broadcastMessage(newMessage);
      setCurrentNote("");
    }
  };

  const handleRecording = () => {
    if (isRecording) {
      stopLiveKitRecording();
    } else {
      startLiveKitRecording();
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
    input.accept = '.txt,.pdf,.doc,.docx,.jpg,.png';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // Check file size (limit to 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          toast.error("File too large", {
            description: "Maximum file size is 10MB",
          });
          return;
        }

        // Create file reference
        const fileId = Date.now().toString();
        const fileUrl = URL.createObjectURL(file);
        const fileRef = {
          id: fileId,
          name: file.name,
          size: file.size,
          url: fileUrl,
        };

        // Add to uploaded files
        setUploadedFiles((prev: typeof uploadedFiles) => [...prev, fileRef]);

        // Add message to chat
        const message = {
          id: fileId,
          senderId: 'local',
          senderName: participantName,
          message: `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          timestamp: new Date(),
          type: 'message' as const,
        };
        addChatMessage(message);
        
        // Broadcast file to other participants
        broadcastFile({
          id: fileId,
          name: file.name,
          size: file.size,
          url: fileUrl,
          senderId: 'local',
          senderName: participantName,
          timestamp: new Date(),
        });
        
        toast.success("File shared successfully!", {
          description: `${file.name} has been added to the chat`,
        });
      }
    };
    input.click();
  };

  const handleTemplate = (template: Template) => {
    setChatMessage(template.content);
  };

  const handleSuggestQuestions = () => {
    const questions = [
      "Can you describe your experience with this technology?",
      "How do you handle challenging situations in your work?",
      "What are your long-term career goals?",
      "Can you walk me through a recent project you completed?",
      "Tell me about a time you had to learn something new quickly",
      "How do you prioritize tasks when you have multiple deadlines?",
      "What's your approach to collaborating with team members?",
      "Can you describe a time you failed and what you learned?",
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
    toast.success("Question suggestion added!");
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

  // Render dialogs at top level so they're always available
  const renderDialogs = () => (
    <>
      {/* End Call Confirmation Dialog */}
      <AlertDialog open={showEndCallConfirm} onOpenChange={setShowEndCallConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this interview room? 
              {isRecording && " Your recording will be stopped."}
              {" "}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in Room</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (isRecording) {
                  await stopLiveKitRecording();
                }

                // Persist interview data to database before leaving
                const interviewId = localStorage.getItem(`interview_${roomName}`);
                if (interviewId && session?.user?.id) {
                  try {
                    await fetch("/api/interviews", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        interviewId,
                        status: "completed",
                        completedAt: new Date().toISOString(),
                        duration: Math.floor(callDuration / 60), // Convert seconds to minutes
                        ...(recordingUrl && { videoRecordingUrl: recordingUrl }),
                      }),
                    });
                    toast.success("Interview data saved successfully");
                  } catch (error) {
                    console.error("Failed to save interview data:", error);
                    toast.error("Failed to save interview data");
                  }
                }

                toast.info("Left interview room");
                // Navigate back or close
                window.location.href = "/dashboard";
              }}
            >
              End Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Invitation Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[500px] z-[9999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Interview Invitation
            </DialogTitle>
            <DialogDescription>
              Share this interview room with others via email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-recipient">Recipient Email</Label>
              <Input
                id="email-recipient"
                type="email"
                placeholder="colleague@example.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                disabled={isSendingEmail}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-message">Personal Message</Label>
              <Textarea
                id="email-message"
                placeholder="Add a personal message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                disabled={isSendingEmail}
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="font-mono">
                  {generatedRoomCode || roomName || "Room Code"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Recipients will receive the room code and a direct link to join
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailRecipient}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (isLoadingToken) {
    return (
      <>
        {renderDialogs()}
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 border-4 border-primary/20 rounded-full" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Connecting to interview room...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we set up your secure connection
                  </p>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full w-3/4 animate-pulse rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // Show join form if not yet joined
  if (!hasJoined) {
    return (
      <>
        {renderDialogs()}
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Interview Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Interview Room
              </h1>
              <p className="text-lg text-muted-foreground">
              Join or create a professional video interview session
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card className="bg-card border-2 border-border shadow-xl hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Create New Room</CardTitle>
                    <CardDescription>Start a new interview session</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedRoomCode && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your Room Code</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-11 px-4 bg-primary/5 border-2 border-primary/20 rounded-lg flex items-center font-mono text-base font-semibold text-primary">
                        {generatedRoomCode}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedRoomCode);
                          toast.success("Room code copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setGeneratedRoomCode(generateRoomName())}
                        title="Generate new code"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setJoinMode("create");
                      handleJoinRoom();
                    }}
                    disabled={isLoadingToken}
                    className="w-full h-11"
                    size="lg"
                  >
                    {isLoadingToken && joinMode === "create" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Create & Join Room
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyRoomLink}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("Email button clicked!");
                        handleShareViaEmail();
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Share the room code with participants to invite them to your interview</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className="bg-card border-2 border-border shadow-xl hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <LogIn className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Join Existing Room</CardTitle>
                    <CardDescription>Enter a room code to join</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code" className="text-sm font-medium">
                    Room Code
                  </Label>
                  <Input
                    id="room-code"
                    value={formRoomName}
                    onChange={(e) => setFormRoomName(e.target.value)}
                    placeholder="e.g., swift-tiger-123"
                    className="h-11 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setJoinMode("join");
                        handleJoinRoom();
                      }
                    }}
                  />
                </div>

                <Button
                  onClick={() => {
                    setJoinMode("join");
                    handleJoinRoom();
                  }}
                  disabled={!formRoomName.trim() || isLoadingToken}
                  className="w-full h-11"
                  size="lg"
                >
                  {isLoadingToken && joinMode === "join" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Join Interview Room
                    </>
                  )}
                </Button>

                {/* Recent Rooms */}
                {recentRooms.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Recent Rooms
                    </Label>
                    <div className="space-y-1">
                      {recentRooms.map((room) => (
                        <button
                          key={room}
                          onClick={() => {
                            setFormRoomName(room);
                            setJoinMode("join");
                            // Auto-join the room
                            setTimeout(() => {
                              handleJoinRoom();
                            }, 0);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-mono bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                        >
                          {room}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Setup Test & Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={testMediaSetup}
                  disabled={testingSetup}
                  className="w-full"
                >
                  {testingSetup ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : hasMediaPermissions ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      Setup Verified
                    </>
                  ) : (
                    <>
                      <Videotape className="w-4 h-4 mr-2" />
                      Test Setup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6 flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secure & Encrypted</p>
                  <p className="text-xs text-muted-foreground">End-to-end security</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Wifi className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">HD Quality</p>
                  <p className="text-xs text-muted-foreground">Crystal clear video</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          {session?.user && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Joining as</p>
                    <p className="text-base font-semibold">{session.user.name || session.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </>
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "wss://jobprep-xundsxxf.livekit.cloud";

  return (
    <>
      {renderDialogs()}
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div>
              <h1 className="text-xl font-bold text-foreground">Interview Room</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-secondary px-2 py-1 rounded">{roomName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      const roomLink = `${window.location.origin}/interview-room?room=${roomName}&name=`;
                      navigator.clipboard.writeText(roomLink);
                      setCopied(true);
                      toast.success("Room link copied!", {
                        description: `Share this link: ...${roomName}`
                      });
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="Copy room link"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(callDuration)}
                </div>
                {isRecording && (
                  <div className="flex items-center gap-1 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
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
            <Badge variant="secondary" className="hidden sm:flex">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
              className="hidden md:flex"
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
          {/* Settings Panel Overlay */}
          {showSettings && (
            <div className="lg:col-span-1 h-fit">
              <SettingsPanel onClose={() => setShowSettings(false)} />
            </div>
          )}

          {/* Main Video Area */}
          <div className={`${showSettings ? 'lg:col-span-3' : 'lg:col-span-3'} space-y-4`}>
            <div className="bg-card rounded-lg p-4 h-full border border-border">
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
                <div className="flex items-center justify-center gap-4 mt-4 p-4 bg-background rounded-lg border border-border">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleRecording}
                    disabled={isProcessingRecording}
                    title={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isProcessingRecording ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isRecording ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <CircleDot className="w-4 h-4" />
                    )}
                  </Button>

                  {recordingUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(recordingUrl, '_blank')}
                      title="Download recording"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Recording
                    </Button>
                  )}

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

                  <Button 
                    variant="destructive" 
                    onClick={() => setShowEndCallConfirm(true)}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </LiveKitRoom>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Template Manager Panel */}
            {showTemplateManager && (
              <TemplateManager
                onSelectTemplate={handleTemplate}
                onClose={() => setShowTemplateManager(false)}
              />
            )}

            {/* AI Insights Panel */}
            {!showTemplateManager && (
              <>
                {/* Performance Analytics */}
                <PerformanceAnalyticsPanel
                  transcripts={transcripts}
                  recordingTime={recordingTime}
                />

                {/* Chat Tabs */}
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 bg-secondary">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="ai">AI Insights</TabsTrigger>
                  </TabsList>

              {/* Chat */}
              <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
                <Card className="flex-1 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm text-foreground">
                      Chat & Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
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
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp ? message.timestamp.toLocaleTimeString() : "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-foreground pl-2 border-l-2 border-border">
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
                          className="flex-1 bg-background border-border text-foreground"
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
                          onClick={() => setShowTemplateManager(true)}
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
                <Card className="flex-1 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm text-foreground">
                      Interview Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Add interview notes..."
                      className="min-h-[200px] bg-background border-border text-foreground"
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
                      <div className="text-sm font-medium text-foreground">
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
                <Card className="flex-1 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Transcripts Section */}
                    {transcripts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Transcription
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-background rounded-lg border border-border">
                          {transcripts.map((transcript) => (
                            <div
                              key={transcript.id}
                              className="p-2 rounded bg-card space-y-1 border border-border"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-primary">
                                  {transcript.participantName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(transcript.confidence * 100)}%
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {transcript.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-foreground">
                                {transcript.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Insights Section */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Insights {isAIAnalyzing && <Loader2 className="w-3 h-3 animate-spin" />}
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {aiInsights.length === 0 && !isAIAnalyzing && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Start recording to receive AI insights
                          </p>
                        )}
                        {aiInsights.map((insight) => {
                          const Icon = getInsightIcon(insight.type);
                          return (
                            <div
                              key={`${insight.timestamp.getTime()}-${insight.message}`}
                              className="p-3 rounded-lg bg-secondary space-y-2"
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
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(insight.confidence * 100)}%
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground">
                                    {insight.message}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
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
                      <div className="text-sm font-medium text-foreground">
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
              </>
            )}
          </div>
        </div>

        {/* End Call Confirmation Dialog */}
        <AlertDialog open={showEndCallConfirm} onOpenChange={setShowEndCallConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Interview Session?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave this interview room? 
                {isRecording && " Your recording will be stopped."}
                {" "}This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay in Room</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (isRecording) {
                    await stopLiveKitRecording();
                  }

                  // Persist interview data to database before leaving
                  const interviewId = localStorage.getItem(`interview_${roomName}`);
                  if (interviewId && session?.user?.id) {
                    try {
                      await fetch("/api/interviews", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          interviewId,
                          status: "completed",
                          completedAt: new Date().toISOString(),
                          duration: Math.floor(callDuration / 60), // Convert seconds to minutes
                          ...(recordingUrl && { videoRecordingUrl: recordingUrl }),
                        }),
                      });
                      toast.success("Interview data saved successfully");
                    } catch (error) {
                      console.error("Failed to save interview data:", error);
                      toast.error("Failed to save interview data");
                    }
                  }

                  toast.info("Left interview room");
                  // Navigate back or close
                  window.location.href = "/dashboard";
                }}
              >
                End Call
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Email Invitation Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="sm:max-w-[500px] z-[9999]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Interview Invitation
              </DialogTitle>
              <DialogDescription>
                Share this interview room with others via email
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-recipient">Recipient Email</Label>
                <Input
                  id="email-recipient"
                  type="email"
                  placeholder="colleague@example.com"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  disabled={isSendingEmail}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Personal Message</Label>
                <Textarea
                  id="email-message"
                  placeholder="Add a personal message..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  disabled={isSendingEmail}
                />
              </div>

              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="font-mono">
                    {generatedRoomCode || roomName || "Room Code"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recipients will receive the room code and a direct link to join
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                disabled={isSendingEmail}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail || !emailRecipient}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
}
