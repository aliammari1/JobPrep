"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Video,
  Download,
  Play,
  Trash2,
  Search,
  Calendar,
  Clock,
  User,
  Loader2,
  FileVideo,
  Filter,
  SortAsc,
  SortDesc,
  Info,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { data: session } = useSession();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "duration">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in-progress" | "no-recording">("all");
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recordings");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched recordings:", {
          count: data.recordings?.length || 0,
          recordings: data.recordings?.map((r: Recording) => ({
            id: r.id.slice(0, 8),
            roomName: r.roomName,
            status: r.status,
            hasUrl: !!r.fileUrl,
          })),
        });
        setRecordings(data.recordings || []);
      } else {
        toast.error("Failed to fetch recordings");
      }
    } catch (error) {
      console.error("Error fetching recordings:", error);
      toast.error("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (recording: Recording) => {
    try {
      toast.info("Starting download...");
      window.open(recording.fileUrl, "_blank");
    } catch (error) {
      console.error("Error downloading recording:", error);
      toast.error("Failed to download recording");
    }
  };

  const handlePlayVideo = (recording: Recording) => {
    setSelectedRecording(recording);
    setIsVideoDialogOpen(true);
  };

  const handleDelete = async (recordingId: string) => {
    if (!confirm("Are you sure you want to delete this recording? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Recording deleted successfully");
        fetchRecordings();
      } else {
        toast.error("Failed to delete recording");
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
      const matchesSearch = recording.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.interviewerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || recording.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "name") {
        comparison = a.roomName.localeCompare(b.roomName);
      } else if (sortBy === "duration") {
        comparison = a.duration - b.duration;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  console.log("Filtered recordings:", {
    total: recordings.length,
    filtered: filteredRecordings.length,
    filterStatus,
    searchQuery,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interview Recordings</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your interview recordings
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <FileVideo className="w-5 h-5 mr-2" />
            {recordings.length} Recordings
          </Badge>
        </div>

        {/* Info Alert about Recording Storage */}
        {recordings.some(r => r.status === "no-recording") && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Some interviews don't have cloud recordings available. To enable permanent cloud recording storage, 
              configure S3 or Google Cloud Storage in your LiveKit settings. Currently using client-side recording only.
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

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Has Recording</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="no-recording">No Recording</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
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
                  <h3 className="text-lg font-semibold text-foreground">No recordings found</h3>
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
              <Card key={recording.id} className="hover:border-primary/50 transition-all">
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
                    <Badge variant={
                      recording.status === "completed" ? "default" : 
                      recording.status === "in-progress" ? "secondary" :
                      "outline"
                    }>
                      {recording.status === "no-recording" ? "No Recording" : recording.status}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(recording)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
                        {recording.status === "in-progress" 
                          ? "Interview in progress..." 
                          : "No recording available"}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(recording.id)}
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
          <DialogContent className="max-w-5xl w-full">
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
                onClick={() => selectedRecording && handleDownload(selectedRecording)}
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
      </div>
    </div>
  );
}
