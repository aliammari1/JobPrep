"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Share2,
  MessageSquare,
  Clock,
  Eye,
  Brain,
  BarChart3,
  Camera,
  Mic,
  Star,
  BookmarkPlus,
  Filter,
  Search,
  Calendar,
  User,
  Target,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  FileText,
  Edit,
  Trash2,
  RefreshCw,
  Settings,
  Users,
  Timer,
  Hash,
} from "lucide-react";
import {
  AnimatedContainer,
  StaggeredContainer,
} from "@/components/ui/animated";

interface Recording {
  id: string;
  title: string;
  candidateName: string;
  interviewerName: string;
  position: string;
  duration: number;
  recordedAt: Date;
  type: "video" | "audio" | "screen";
  quality: "HD" | "4K" | "Audio-Only";
  size: string;
  status: "processing" | "ready" | "archived";
  tags: string[];
  ratings: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultural: number;
    overall: number;
  };
  analytics: {
    speakingTime: { candidate: number; interviewer: number };
    silencePeriods: number;
    emotionAnalysis: { positive: number; neutral: number; negative: number };
    keyMoments: number;
    transcriptionAccuracy: number;
  };
  annotations: Annotation[];
  bookmarks: Bookmark[];
}

interface Annotation {
  id: string;
  timestamp: number;
  type: "comment" | "highlight" | "question" | "concern" | "strength";
  content: string;
  author: string;
  authorRole: "interviewer" | "reviewer" | "manager";
  createdAt: Date;
  replies?: AnnotationReply[];
}

interface AnnotationReply {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

interface Bookmark {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  category: "technical" | "behavioral" | "red-flag" | "highlight";
  color: string;
}

export default function ReplayCenterPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([100]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState("recordings");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [newAnnotation, setNewAnnotation] = useState("");
  const [annotationType, setAnnotationType] = useState<
    "comment" | "highlight" | "question" | "concern" | "strength"
  >("comment");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock data
  const mockRecordings: Recording[] = [
    {
      id: "1",
      title: "Senior Frontend Developer Interview",
      candidateName: "Alice Johnson",
      interviewerName: "Sarah Chen",
      position: "Senior Frontend Developer",
      duration: 3240, // 54 minutes
      recordedAt: new Date("2024-01-20T10:00:00"),
      type: "video",
      quality: "4K",
      size: "2.4 GB",
      status: "ready",
      tags: ["Technical", "React", "System Design", "High Priority"],
      ratings: {
        technical: 85,
        communication: 92,
        problemSolving: 78,
        cultural: 88,
        overall: 86,
      },
      analytics: {
        speakingTime: { candidate: 65, interviewer: 35 },
        silencePeriods: 12,
        emotionAnalysis: { positive: 72, neutral: 23, negative: 5 },
        keyMoments: 8,
        transcriptionAccuracy: 94,
      },
      annotations: [
        {
          id: "ann1",
          timestamp: 480,
          type: "strength",
          content: "Excellent explanation of React rendering optimization",
          author: "Sarah Chen",
          authorRole: "interviewer",
          createdAt: new Date("2024-01-20T10:30:00"),
        },
        {
          id: "ann2",
          timestamp: 1200,
          type: "question",
          content:
            "Need to follow up on microservices architecture understanding",
          author: "Mike Rodriguez",
          authorRole: "reviewer",
          createdAt: new Date("2024-01-20T11:00:00"),
        },
      ],
      bookmarks: [
        {
          id: "bm1",
          timestamp: 300,
          title: "Technical Discussion Starts",
          description: "Beginning of React optimization conversation",
          category: "technical",
          color: "#3B82F6",
        },
        {
          id: "bm2",
          timestamp: 2100,
          title: "Problem Solving Challenge",
          description: "Algorithmic thinking demonstration",
          category: "technical",
          color: "#10B981",
        },
      ],
    },
    {
      id: "2",
      title: "Product Manager Behavioral Interview",
      candidateName: "Bob Chen",
      interviewerName: "Emily Zhang",
      position: "Senior Product Manager",
      duration: 2760, // 46 minutes
      recordedAt: new Date("2024-01-19T14:00:00"),
      type: "video",
      quality: "HD",
      size: "1.8 GB",
      status: "ready",
      tags: ["Behavioral", "Leadership", "Strategy"],
      ratings: {
        technical: 75,
        communication: 95,
        problemSolving: 82,
        cultural: 90,
        overall: 86,
      },
      analytics: {
        speakingTime: { candidate: 70, interviewer: 30 },
        silencePeriods: 8,
        emotionAnalysis: { positive: 80, neutral: 18, negative: 2 },
        keyMoments: 6,
        transcriptionAccuracy: 96,
      },
      annotations: [],
      bookmarks: [],
    },
  ];

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          const transformedRecordings = (data.interviews || [])
            .filter((interview: any) => interview.status === "completed")
            .map((interview: any) => ({
              id: interview.id,
              title: `${interview.title || "Interview"} Recording`,
              candidateName: interview.candidateName || "Anonymous",
              interviewerName: "Interviewer",
              position: interview.title || "Position",
              duration: interview.duration || 3600,
              recordedAt: new Date(interview.createdAt),
              type: "video" as const,
              quality: "HD" as const,
              size: "1.2 GB",
              status: "ready" as const,
              tags: [],
              ratings: {
                technical: (interview.technicalScore || 0) / 20,
                communication: (interview.communicationScore || 0) / 20,
                problemSolving: (interview.problemSolvingScore || 0) / 20,
                cultural: (interview.culturalFitScore || 0) / 20,
                overall: (interview.score || 0) / 20,
              },
              analytics: {
                speakingTime: { candidate: 55, interviewer: 45 },
                silencePeriods: 8,
                emotionAnalysis: { positive: 70, neutral: 25, negative: 5 },
                keyMoments: 5,
                transcriptionAccuracy: 92,
              },
              annotations: [],
              bookmarks: [],
            }));
          setRecordings(transformedRecordings);
        } else {
          setRecordings(mockRecordings);
        }
      } catch (error) {
        setRecordings(mockRecordings);
      }
    };

    fetchRecordings();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const addAnnotation = () => {
    if (!selectedRecording || !newAnnotation.trim()) return;

    const annotation: Annotation = {
      id: Date.now().toString(),
      timestamp: currentTime,
      type: annotationType,
      content: newAnnotation,
      author: "Current User",
      authorRole: "reviewer",
      createdAt: new Date(),
    };

    setSelectedRecording((prev) =>
      prev
        ? {
            ...prev,
            annotations: [...prev.annotations, annotation],
          }
        : null
    );

    setNewAnnotation("");
  };

  const addBookmark = () => {
    if (!selectedRecording) return;

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      timestamp: currentTime,
      title: `Bookmark at ${formatTime(currentTime)}`,
      description: "Important moment",
      category: "highlight",
      color: "#8B5CF6",
    };

    setSelectedRecording((prev) =>
      prev
        ? {
            ...prev,
            bookmarks: [...prev.bookmarks, bookmark],
          }
        : null
    );
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="w-4 h-4" />;
      case "highlight":
        return <Star className="w-4 h-4" />;
      case "question":
        return <AlertCircle className="w-4 h-4" />;
      case "concern":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "strength":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "processing":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "archived":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredRecordings = recordings.filter((recording) => {
    if (filterStatus !== "all" && recording.status !== filterStatus)
      return false;
    if (
      searchQuery &&
      !recording.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !recording.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950 dark:via-gray-950 dark:to-zinc-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                Interview Replay Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Advanced video analysis with AI-powered insights and
                collaborative review
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Camera className="w-4 h-4 mr-2" />
                {recordings.length} Recordings
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        {!selectedRecording ? (
          // Recording Library View
          <StaggeredContainer>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-6">
                    <TabsList>
                      <TabsTrigger value="recordings">
                        All Recordings
                      </TabsTrigger>
                      <TabsTrigger value="analytics">
                        Analytics Overview
                      </TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search recordings..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <TabsContent value="recordings">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredRecordings.map((recording, index) => (
                        <motion.div
                          key={recording.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer group"
                            onClick={() => setSelectedRecording(recording)}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <Badge
                                  className={getStatusColor(recording.status)}
                                >
                                  {recording.status}
                                </Badge>
                                <Badge variant="outline">
                                  {recording.type}
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-slate-600 transition-colors">
                                {recording.title}
                              </CardTitle>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>
                                  <User className="w-3 h-3 inline mr-1" />
                                  {recording.candidateName}
                                </p>
                                <p>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {formatTime(recording.duration)}
                                </p>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Overall Rating</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    <span className="font-semibold">
                                      {recording.ratings.overall}%
                                    </span>
                                  </div>
                                </div>

                                <Progress
                                  value={recording.ratings.overall}
                                  className="h-2"
                                />

                                <div className="flex flex-wrap gap-1">
                                  {recording.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {recording.tags.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{recording.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="text-center">
                                    <MessageSquare className="w-3 h-3 mx-auto mb-1" />
                                    <span>
                                      {recording.annotations.length} notes
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <BookmarkPlus className="w-3 h-3 mx-auto mb-1" />
                                    <span>
                                      {recording.bookmarks.length} bookmarks
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <Calendar className="w-3 h-3 mx-auto mb-1" />
                                    <span>
                                      {recording.recordedAt.toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1">
                                    <Play className="w-3 h-3 mr-1" />
                                    Watch
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <Camera className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Recordings
                              </p>
                              <p className="text-lg font-semibold">
                                {recordings.length}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Hours
                              </p>
                              <p className="text-lg font-semibold">
                                {Math.round(
                                  recordings.reduce(
                                    (sum, r) => sum + r.duration,
                                    0
                                  ) / 3600
                                )}
                                h
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <Star className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Avg. Rating
                              </p>
                              <p className="text-lg font-semibold">
                                {Math.round(
                                  recordings.reduce(
                                    (sum, r) => sum + r.ratings.overall,
                                    0
                                  ) / recordings.length
                                )}
                                %
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                              <MessageSquare className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Annotations
                              </p>
                              <p className="text-lg font-semibold">
                                {recordings.reduce(
                                  (sum, r) => sum + r.annotations.length,
                                  0
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings">
                    <div className="space-y-6">
                      <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle>Recording Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span
                                className="text-sm font-medium"
                                id="default-quality-label"
                              >
                                Default Quality
                              </span>
                              <Select
                                defaultValue="HD"
                                aria-labelledby="default-quality-label"
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="HD">HD (1080p)</SelectItem>
                                  <SelectItem value="4K">4K (2160p)</SelectItem>
                                  <SelectItem value="Audio-Only">
                                    Audio Only
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <span
                                className="text-sm font-medium"
                                id="auto-archive-label"
                              >
                                Auto-Archive After
                              </span>
                              <Select
                                defaultValue="90"
                                aria-labelledby="auto-archive-label"
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 days</SelectItem>
                                  <SelectItem value="90">90 days</SelectItem>
                                  <SelectItem value="180">180 days</SelectItem>
                                  <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </StaggeredContainer>
        ) : (
          // Video Player View
          <StaggeredContainer>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Video Player */}
              <div className="xl:col-span-3 space-y-6">
                <Card className="border-0 shadow-xl bg-black">
                  <CardContent className="p-0 relative">
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        onTimeUpdate={(e) =>
                          setCurrentTime(e.currentTarget.currentTime)
                        }
                        onLoadedMetadata={(e) =>
                          setDuration(e.currentTarget.duration)
                        }
                      >
                        <source
                          src="/mock-interview-video.mp4"
                          type="video/mp4"
                        />
                        <track
                          kind="captions"
                          srcLang="en"
                          label="English captions"
                          default
                        />
                      </video>

                      {/* Video Overlay Elements */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

                      {/* Annotations Overlay */}
                      {showAnnotations &&
                        selectedRecording.annotations.map((annotation) => (
                          <motion.div
                            key={annotation.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 max-w-xs"
                            style={{
                              display:
                                Math.abs(currentTime - annotation.timestamp) < 5
                                  ? "block"
                                  : "none",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {getAnnotationIcon(annotation.type)}
                              <span className="text-xs font-medium">
                                {annotation.author}
                              </span>
                            </div>
                            <p className="text-xs">{annotation.content}</p>
                          </motion.div>
                        ))}

                      {/* Bookmarks Timeline */}
                      <div className="absolute bottom-16 left-0 right-0 px-4">
                        <div className="relative h-2">
                          {selectedRecording.bookmarks.map((bookmark) => (
                            <button
                              type="button"
                              key={bookmark.id}
                              className="absolute w-2 h-2 rounded-full cursor-pointer"
                              style={{
                                backgroundColor: bookmark.color,
                                left: `${
                                  (bookmark.timestamp / duration) * 100
                                }%`,
                              }}
                              title={bookmark.title}
                              onClick={() => handleSeek([bookmark.timestamp])}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleSeek([bookmark.timestamp]);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="space-y-3">
                          {/* Progress Bar */}
                          <Slider
                            value={[currentTime]}
                            onValueChange={handleSeek}
                            max={duration}
                            step={1}
                            className="w-full"
                          />

                          {/* Control Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSeek([currentTime - 10])}
                              >
                                <SkipBack className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={togglePlayback}
                              >
                                {isPlaying ? (
                                  <Pause className="w-5 h-5" />
                                ) : (
                                  <Play className="w-5 h-5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSeek([currentTime + 10])}
                              >
                                <SkipForward className="w-4 h-4" />
                              </Button>
                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="ghost" size="sm">
                                  {volume[0] > 0 ? (
                                    <Volume2 className="w-4 h-4" />
                                  ) : (
                                    <VolumeX className="w-4 h-4" />
                                  )}
                                </Button>
                                <Slider
                                  value={volume}
                                  onValueChange={setVolume}
                                  max={100}
                                  step={1}
                                  className="w-20"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-white">
                              <span className="text-sm">
                                {formatTime(currentTime)} /{" "}
                                {formatTime(duration)}
                              </span>
                              <Select
                                value={playbackSpeed.toString()}
                                onValueChange={(value) =>
                                  setPlaybackSpeed(parseFloat(value))
                                }
                              >
                                <SelectTrigger className="w-20 bg-transparent border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0.5">0.5x</SelectItem>
                                  <SelectItem value="1">1x</SelectItem>
                                  <SelectItem value="1.5">1.5x</SelectItem>
                                  <SelectItem value="2">2x</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                              >
                                {isFullscreen ? (
                                  <Minimize className="w-4 h-4" />
                                ) : (
                                  <Maximize className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Information */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedRecording.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedRecording.candidateName} •{" "}
                          {selectedRecording.position}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecording(null)}
                        >
                          ← Back to Library
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedRecording.ratings.technical}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Technical
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedRecording.ratings.communication}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Communication
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedRecording.ratings.problemSolving}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Problem Solving
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedRecording.ratings.cultural}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Cultural Fit
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedRecording.ratings.overall}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Overall
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Analytics Panel */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Speaking Time</span>
                        <span>
                          Candidate{" "}
                          {selectedRecording.analytics.speakingTime.candidate}%
                        </span>
                      </div>
                      <Progress
                        value={
                          selectedRecording.analytics.speakingTime.candidate
                        }
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Emotion Analysis</span>
                        <span>
                          {selectedRecording.analytics.emotionAnalysis.positive}
                          % Positive
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={
                            selectedRecording.analytics.emotionAnalysis.positive
                          }
                          className="h-1"
                        />
                        <Progress
                          value={
                            selectedRecording.analytics.emotionAnalysis.neutral
                          }
                          className="h-1"
                        />
                        <Progress
                          value={
                            selectedRecording.analytics.emotionAnalysis.negative
                          }
                          className="h-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-semibold">
                          {selectedRecording.analytics.silencePeriods}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Silence Periods
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-semibold">
                          {selectedRecording.analytics.transcriptionAccuracy}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Transcription
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Annotations */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Annotations ({selectedRecording.annotations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add New Annotation */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Select
                          value={annotationType}
                          onValueChange={(
                            value:
                              | "comment"
                              | "highlight"
                              | "question"
                              | "concern"
                              | "strength"
                          ) => setAnnotationType(value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comment">Comment</SelectItem>
                            <SelectItem value="highlight">Highlight</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                            <SelectItem value="concern">Concern</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={addBookmark}>
                          <BookmarkPlus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Add annotation at current time..."
                        value={newAnnotation}
                        onChange={(e) => setNewAnnotation(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button
                        onClick={addAnnotation}
                        size="sm"
                        className="w-full"
                      >
                        Add Annotation
                      </Button>
                    </div>

                    {/* Existing Annotations */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedRecording.annotations.map((annotation) => (
                        <motion.div
                          key={annotation.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => handleSeek([annotation.timestamp])}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getAnnotationIcon(annotation.type)}
                            <span className="text-xs font-medium">
                              {annotation.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(annotation.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{annotation.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bookmarks */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookmarkPlus className="w-5 h-5" />
                      Bookmarks ({selectedRecording.bookmarks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedRecording.bookmarks.map((bookmark) => (
                        <button
                          type="button"
                          key={bookmark.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-left w-full"
                          onClick={() => handleSeek([bookmark.timestamp])}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSeek([bookmark.timestamp]);
                            }
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: bookmark.color }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {bookmark.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(bookmark.timestamp)}
                            </div>
                          </div>
                        </button>
                      ))}
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
