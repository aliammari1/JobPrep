"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/custom/icons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { UserNav } from "@/components/custom/user-nav";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Clock, TrendingUp, Eye, Trash2 } from "lucide-react";
import { generateInterviewPDF, downloadPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SavedInterview {
  id: string;
  sessionType: string;
  topics: string;
  duration: number;
  conversationLog: any;
  feedback: any;
  specificScores: any;
  createdAt: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedInterviews, setSavedInterviews] = useState<SavedInterview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    username: (session?.user as { username?: string })?.username || "",
  });

  // Fetch saved interviews
  useEffect(() => {
    const fetchSavedInterviews = async () => {
      if (!session?.user) return;
      
      setIsLoadingInterviews(true);
      try {
        const response = await fetch("/api/save-interview");
        if (response.ok) {
          const data = await response.json();
          setSavedInterviews(data.interviews || []);
        }
      } catch (error) {
        console.error("Error fetching saved interviews:", error);
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    fetchSavedInterviews();
  }, [session]);

  const handleDeleteInterview = async (interviewId: string) => {
    setDeletingId(interviewId);
    try {
      const response = await fetch(`/api/save-interview/${interviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Interview deleted successfully");
        // Remove the deleted interview from the list
        setSavedInterviews(prev => prev.filter(interview => interview.id !== interviewId));
      } else {
        toast.error("Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewInterview = (interviewId: string) => {
    router.push(`/saved-interviews/${interviewId}`);
  };

  const handleDownloadInterview = async (interview: SavedInterview) => {
    try {
      toast.loading("Generating PDF...");
      
      // Parse the interview data
      const conversationLog = typeof interview.conversationLog === 'string' 
        ? JSON.parse(interview.conversationLog) 
        : interview.conversationLog;
      
      const feedback = typeof interview.feedback === 'string'
        ? JSON.parse(interview.feedback)
        : interview.feedback;
      
      const scores = typeof interview.specificScores === 'string'
        ? JSON.parse(interview.specificScores)
        : interview.specificScores;

      // Get job title from topics array
      const jobTitle = Array.isArray(interview.topics) 
        ? interview.topics[0] || "Interview"
        : interview.topics || "Interview";

      // Format data for PDF
      const pdfData = {
        candidateName: session?.user?.name || "Candidate",
        jobTitle: jobTitle,
        companyName: "", // We'll add this field later
        date: new Date(interview.createdAt).toLocaleDateString(),
        questions: conversationLog.map((item: any, index: number) => ({
          number: index + 1,
          question: item.question?.question || item.question || "",
          userAnswer: item.userAnswer || "",
          idealAnswer: item.question?.idealAnswer || "",
          score: item.evaluation?.score || 0,
          feedback: item.evaluation?.feedback || ""
        })),
        finalAssessment: feedback,
        statistics: {
          totalQuestions: conversationLog.length,
          averageScore: scores.totalScore || 0,
          percentage: scores.percentage || 0
        }
      };

      // Generate PDF with personalized filename
      const blob = await generateInterviewPDF(pdfData);
      
      // Create filename: CandidateName_JobTitle_Date.pdf
      const sanitize = (str: string) => str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 30);
      const fileName = `${sanitize(session?.user?.name || 'Candidate')}_${sanitize(jobTitle)}_${new Date(interview.createdAt).toISOString().split('T')[0]}.pdf`;
      
      downloadPDF(blob, fileName);
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading interview PDF:", error);
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: { name: string; image?: string; username?: string } = {
        name: formData.name,
        image: formData.image || undefined,
      };

      if (formData.username) {
        updateData.username = formData.username;
      }

      const result = await authClient.updateUser(updateData);

      if (result.error) {
        setError(result.error.message || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const initials =
    formData.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    session.user.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <UserNav />
          </div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <Link href="/settings/profile">
            <Button variant="default">Profile</Button>
          </Link>
          <Link href="/settings/security">
            <Button variant="outline">Security</Button>
          </Link>
          <Link href="/settings/sessions">
            <Button variant="outline">Sessions</Button>
          </Link>
          <Link href="/settings/two-factor">
            <Button variant="outline">Two-Factor</Button>
          </Link>
          <Link href="/settings/passkeys">
            <Button variant="outline">Passkeys</Button>
          </Link>
          <Link href="/settings/connected-accounts">
            <Button variant="outline">Connected Accounts</Button>
          </Link>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <Icons.check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Picture */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage
                  src={formData.image || undefined}
                  alt={formData.name || "User"}
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter a URL to your profile picture
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Your unique username. Must be 3-20 characters, letters,
                  numbers, and underscores only.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-11 bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update
                  it.
                </p>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Email Verification Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              Verify your email address for better security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    session.user.emailVerified
                      ? "bg-green-100 dark:bg-green-900/20"
                      : "bg-yellow-100 dark:bg-yellow-900/20"
                  }`}
                >
                  {session.user.emailVerified ? (
                    <Icons.check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icons.alertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {session.user.emailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.emailVerified
                      ? "Your email address is verified"
                      : "Please verify your email address"}
                  </p>
                </div>
              </div>
              {!session.user.emailVerified && (
                <Link href="/verify-email">
                  <Button variant="outline">Verify Email</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saved Interviews Section */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Saved Interview Reports
                </CardTitle>
                <CardDescription>
                  View and download your completed interview assessments
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {savedInterviews.length} {savedInterviews.length === 1 ? 'Interview' : 'Interviews'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingInterviews ? (
              <div className="flex items-center justify-center py-8">
                <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedInterviews.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved interviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete a mock interview and save your report to see it here
                </p>
                <Link href="/mock-interview">
                  <Button>
                    Start Mock Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedInterviews.map((interview) => {
                  const scores = typeof interview.specificScores === 'string'
                    ? JSON.parse(interview.specificScores)
                    : interview.specificScores;
                  
                  const feedback = typeof interview.feedback === 'string'
                    ? JSON.parse(interview.feedback)
                    : interview.feedback;

                  return (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">
                            {Array.isArray(interview.topics) 
                              ? interview.topics.join(", ") || "Mock Interview"
                              : interview.topics || "Mock Interview"}
                          </h4>
                          <Badge 
                            variant={
                              scores?.percentage >= 80 ? "default" :
                              scores?.percentage >= 60 ? "secondary" :
                              "outline"
                            }
                          >
                            {scores?.percentage || 0}% Score
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(interview.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {interview.duration} min
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {feedback?.overallRating || 'Assessed'}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                          {feedback?.summary || 'Interview assessment completed'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handleViewInterview(interview.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>

                        <Button
                          onClick={() => handleDownloadInterview(interview)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              disabled={deletingId === interview.id}
                            >
                              {deletingId === interview.id ? (
                                <Icons.spinner className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Interview?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this interview report? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInterview(interview.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
