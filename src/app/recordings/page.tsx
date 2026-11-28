"use client";

import {
  ArrowUpRight,
  Calendar,
  Clock,
  Download,
  FileText,
  FileVideo,
  Filter,
  Info,
  Loader2,
  Play,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  User,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";

interface Recording {
  id: string;
  interviewId: string;
  roomName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  duration: number;
  createdAt: string;
  candidateName?: string;
  interviewerName?: string;
  status: string;
}

export default function RecordingsPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [savedTranscripts, setSavedTranscripts] = useState<
    {
      id: string;
      sessionType: string;
      duration: number;
      overallScore: number | null;
      createdAt: string;
      application?: { company: string; role: string } | null;
      mockQuestions?: { id: string }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "duration">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "migration-required"
  >("all");
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null,
  );
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  useEffect(() => {
    if (isSessionLoading) return;
    if (!session?.user) {
      setRecordings([]);
      setLoading(false);
      return;
    }
    fetchRecordings();
  }, [isSessionLoading, session?.user]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const [recRes, txRes] = await Promise.all([
        fetch("/api/recordings", { cache: "no-store" }),
        fetch("/api/save-interview", { cache: "no-store" }),
      ]);
      if (recRes.ok) {
        const data = await recRes.json();
        setRecordings(data.recordings || []);
      } else if (recRes.status !== 401) {
        toast.error("Failed to fetch recordings");
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setSavedTranscripts(
          Array.isArray(txData.interviews) ? txData.interviews : [],
        );
      }
    } catch (error) {
      console.error("Error fetching recordings:", error);
      toast.error("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = (recording: Recording) => {
    setSelectedRecording(recording);
    setIsVideoDialogOpen(true);
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDownload = (recording: Recording) => {
    if (!recording.fileUrl) {
      toast.error("Recording file is not available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = recording.fileUrl;
    link.download = `${recording.roomName || "recording"}.webm`;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDelete = (recordingId: string) => {
    setPendingDeleteId(recordingId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const recordingId = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Recording deleted successfully");
        fetchRecordings();
      } else {
        const result = await response.json().catch(() => null);
        toast.error(result?.error ?? "Failed to delete recording");
        fetchRecordings();
      }
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast.error("Failed to delete recording");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredRecordings = recordings
    .filter((recording) => {
      const matchesSearch =
        recording.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.candidateName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        recording.interviewerName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || recording.status === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "name") {
        comparison = a.roomName.localeCompare(b.roomName);
      } else if (sortBy === "duration") {
        comparison = a.duration - b.duration;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="sr-only lg:not-sr-only lg:text-4xl lg:font-bold lg:tracking-tight">
              Interview Recordings
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your interview recordings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1.5 w-fit">
              <FileText className="w-4 h-4 mr-1.5" />
              {savedTranscripts.length} Transcripts
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1.5 w-fit">
              <FileVideo className="w-4 h-4 mr-1.5" />
              {recordings.length} Videos
            </Badge>
          </div>
        </div>

        {/* Saved Mock Interview Transcripts (from PostgreSQL AIMockSession) */}
        {savedTranscripts.length > 0 && (
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">
                Saved Mock Interview Transcripts
              </CardTitle>
              <CardDescription>
                Full Q&amp;A rubrics and AI scores persisted in PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedTranscripts.slice(0, 9).map((item) => (
                <Link
                  key={item.id}
                  href={`/saved-interviews/${item.id}`}
                  className="group flex min-w-0 flex-col justify-between gap-2 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {item.application
                          ? `${item.application.role}`
                          : `${item.sessionType || "Mock"} Interview`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.application
                          ? item.application.company
                          : `${item.mockQuestions?.length ?? 0} questions`}
                      </p>
                    </div>
                    {item.overallScore !== null && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-primary/30 bg-primary/10 text-xs text-primary tabular-nums"
                      >
                        {Math.round(item.overallScore)}/100
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                      {item.duration}m
                    </span>
                    <ArrowUpRight className="size-3.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {recordings.some(
          (recording) => recording.status === "migration-required",
        ) && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Older recordings will be available after their storage transfer
              has finished.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by room name, candidate, or interviewer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "date" | "name" | "duration")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="duration">Sort by Duration</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select
                  value={filterStatus}
                  onValueChange={(value) =>
                    setFilterStatus(
                      value as "all" | "completed" | "migration-required",
                    )
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Has Recording</SelectItem>
                    <SelectItem value="migration-required">
                      Storage transfer pending
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recordings Grid */}
        {filteredRecordings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FileVideo className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No recordings found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Start an interview to create your first recording"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className="hover:border-primary/50 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Video className="w-5 h-5 text-primary" />
                        {recording.roomName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        recording.status === "completed" ? "default" : "outline"
                      }
                    >
                      {recording.status === "completed"
                        ? "Available"
                        : "Transfer pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {recording.candidateName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Candidate: {recording.candidateName}</span>
                      </div>
                    )}
                    {recording.interviewerName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Interviewer: {recording.interviewerName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(recording.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileVideo className="w-4 h-4" />
                      <span>{formatFileSize(recording.fileSize)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {recording.fileUrl ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePlayVideo(recording)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`${recording.fileUrl}?download=1`}
                            aria-label="Download recording"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
                        Playback resumes after storage transfer.
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(recording.id)}
                      disabled={recording.status === "migration-required"}
                      aria-label="Delete recording"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Video Player Dialog */}
        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent mobileSheet className="sm:max-w-5xl w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                {selectedRecording?.roomName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {selectedRecording?.candidateName && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Candidate: {selectedRecording.candidateName}
                </span>
              )}
              {selectedRecording?.interviewerName && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Interviewer: {selectedRecording.interviewerName}
                </span>
              )}
              {selectedRecording && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedRecording.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(selectedRecording.duration)}
                  </span>
                </>
              )}
            </div>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              {selectedRecording?.fileUrl && (
                <video
                  controls
                  className="w-full h-full"
                  src={selectedRecording.fileUrl}
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  selectedRecording && handleDownload(selectedRecording)
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsVideoDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={pendingDeleteId !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDeleteId(null);
          }}
          title="Delete recording"
          description="Are you sure you want to delete this recording? This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
