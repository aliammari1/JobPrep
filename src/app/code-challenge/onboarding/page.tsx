"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  Link2,
  Brain,
  Zap,
  AlertCircle,
  Copy,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
}

/**
 * Multi-step onboarding UI that guides users to upload or paste a CV, provide a job description
 * (via LinkedIn URL or paste), choose a difficulty level, and generate personalized coding challenges.
 *
 * Persists temporary inputs to sessionStorage, interacts with backend endpoints for CV parsing and
 * LinkedIn scraping, shows progress and validation, and navigates to the challenges page on completion.
 *
 * @returns The JSX element for the onboarding flow UI.
 */
export default function CodeChallengeOnboardingImproved() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: CV Upload
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");
  const [cvParseError, setCvParseError] = useState<string | null>(null);

  // Step 2: Job Description
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [inputMethod, setInputMethod] = useState<"url" | "paste">("paste");
  const [isScrapingJob, setIsScrapingJob] = useState(false);

  // Step 3: Difficulty
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Auto-save state to sessionStorage
  useEffect(() => {
    if (cvText) sessionStorage.setItem("onboarding_cv_temp", cvText);
    if (jobDescriptionText) sessionStorage.setItem("onboarding_job_temp", jobDescriptionText);
  }, [cvText, jobDescriptionText]);

  // Clean up old onboarding data on mount
  useEffect(() => {
    sessionStorage.removeItem("onboarding_cv");
    sessionStorage.removeItem("onboarding_job");
    sessionStorage.removeItem("onboarding_difficulty");
    sessionStorage.removeItem("onboarding_completed");
  }, []);

  const validateCVLength = (text: string) => {
    return text.trim().length >= 100;
  };

  const validateJobLength = (text: string) => {
    return text.trim().length >= 100;
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "in-progress";
    return "pending";
  };

  const canProceedToStep2 = validateCVLength(cvText);
  const canProceedToStep3 = canProceedToStep2 && validateJobLength(jobDescriptionText);
  const canGenerate = canProceedToStep3 && difficulty;

  // Steps array for progress tracking
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Your CV/Resume",
      description: "Share your experience and skills",
      status: getStepStatus(1),
    },
    {
      id: 2,
      title: "Job Description",
      description: "Paste the target job posting",
      status: getStepStatus(2),
    },
    {
      id: 3,
      title: "Difficulty Level",
      description: "Choose your challenge level",
      status: getStepStatus(3),
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setCvParseError("File too large. Maximum 5MB allowed.");
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB",
      });
      return;
    }

    setCvFile(file);
    setCvParseError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse CV file");
      }

      const data = await response.json();
      if (!data.text || data.text.trim().length < 100) {
        throw new Error("CV content too short or empty");
      }

      setCvText(data.text);
      setCvParseError(null);
      toast.success("✓ CV uploaded successfully!", {
        description: "Your resume has been analyzed",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to parse CV";
      setCvParseError(errorMsg);
      setCvFile(null);
      setCvText("");
      toast.error("Failed to parse CV", {
        description: "Try pasting your CV text instead",
        action: {
          label: "Switch to paste",
          onClick: () => setUploadMethod("paste"),
        },
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScrapeLinkedIn = async () => {
    if (!linkedinUrl.trim()) {
      toast.error("Please enter a LinkedIn job URL");
      return;
    }

    setIsScrapingJob(true);

    try {
      const response = await fetch("/api/scrape-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkedinUrl }),
      });

      if (!response.ok) throw new Error("Failed to scrape job");

      const data = await response.json();

      if (data.jobDescription) {
        setJobDescriptionText(data.jobDescription);
        toast.success("✓ Job description scraped!", {
          description: `Found: ${data.title || "Job posting"}`,
        });
      } else {
        throw new Error("No job description found");
      }
    } catch (error) {
      toast.error("Failed to scrape LinkedIn", {
        description: "Please paste the job description instead",
      });
      setInputMethod("paste");
    } finally {
      setIsScrapingJob(false);
    }
  };

  const handleGenerateChallenges = async () => {
    if (!cvText.trim() || !jobDescriptionText.trim()) {
      toast.error("Please complete all steps");
      return;
    }

    setIsLoading(true);
    toast.loading("🤖 Generating your personalized challenges...", {
      id: "generating",
    });

    try {
      // Store data in sessionStorage
      sessionStorage.setItem("onboarding_cv", cvText);
      sessionStorage.setItem("onboarding_job", jobDescriptionText);
      sessionStorage.setItem("onboarding_difficulty", difficulty);
      sessionStorage.setItem("onboarding_completed", "true");

      // Simulate generation time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("✨ Challenges ready!", { id: "generating" });

      // Navigate to main challenge page
      router.push("/code-challenge");
    } catch (error) {
      toast.error("Failed to generate challenges", { id: "generating" });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI Code Challenge Setup
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get personalized coding challenges tailored to your skills and target job
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="space-y-3">
            {/* Progress percentage */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-semibold text-primary">
                {Math.round((currentStep / steps.length) * 100)}%
              </span>
            </div>

            {/* Progress bar */}
            <Progress
              value={(currentStep / steps.length) * 100}
              className="h-2"
            />

            {/* Step indicators */}
            <div className="flex items-center justify-between gap-2 mt-4">
              {steps.map((step, index) => (
                <motion.button
                  key={step.id}
                  onClick={() => {
                    if (
                      step.id < currentStep ||
                      (step.id === 2 && canProceedToStep2) ||
                      (step.id === 3 && canProceedToStep3)
                    ) {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={
                    step.id > currentStep &&
                    !(step.id === 2 && canProceedToStep2) &&
                    !(step.id === 3 && canProceedToStep3)
                  }
                  className={cn(
                    "flex-1 h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium",
                    step.status === "completed"
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300"
                      : step.status === "in-progress"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/30 text-muted-foreground opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full border border-current text-xs">
                      {step.id}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>Upload Your CV/Resume</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        We'll analyze your experience and skills
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Upload/Paste Toggle */}
                  <div className="flex gap-3 border-b pb-6">
                    <Button
                      variant={uploadMethod === "file" ? "default" : "outline"}
                      onClick={() => setUploadMethod("file")}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      variant={uploadMethod === "paste" ? "default" : "outline"}
                      onClick={() => setUploadMethod("paste")}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Paste Text
                    </Button>
                  </div>

                  {/* File Upload */}
                  {uploadMethod === "file" && (
                    <div className="space-y-4">
                      <div
                        onClick={() => !isLoading && fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                          isLoading
                            ? "border-muted bg-muted/20 cursor-not-allowed opacity-60"
                            : cvParseError
                            ? "border-red-300 bg-red-50 dark:bg-red-950/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30"
                            : "border-primary/30 cursor-pointer hover:bg-primary/5"
                        )}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          disabled={isLoading}
                          className="hidden"
                        />
                        {isLoading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-primary/50 mx-auto mb-2 animate-spin" />
                            <p className="text-sm font-medium">Analyzing CV...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              Drag and drop your CV or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, DOC, DOCX, or TXT files (max 5MB)
                            </p>
                          </>
                        )}
                      </div>

                      {cvParseError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                                Could not parse CV file
                              </p>
                              <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                                {cvParseError}. Try pasting your CV text instead.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {cvFile && cvText && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                                  ✓ {cvFile.name}
                                </p>
                                <p className="text-xs text-green-800 dark:text-green-200">
                                  {cvText.length} characters analyzed
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCvFile(null);
                                setCvText("");
                                setCvParseError(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Paste Text */}
                  {uploadMethod === "paste" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="mb-2 block">Paste your CV content</Label>
                        <textarea
                          value={cvText}
                          onChange={(e) => {
                            setCvText(e.target.value);
                            setCvParseError(null);
                          }}
                          placeholder="Paste your CV here... Include your experience, skills, education, and projects. (Minimum 100 characters)"
                          className={cn(
                            "w-full h-48 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors",
                            validateCVLength(cvText)
                              ? "border-green-300 focus:ring-green-500"
                              : cvText.length > 0
                              ? "border-yellow-300 focus:ring-yellow-500"
                              : "border-input focus:ring-primary"
                          )}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {cvText.length} / 100 characters minimum
                          </p>
                          {validateCVLength(cvText) && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                              ✓ Ready
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Helpful Tips */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      💡 Tips for best results:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Include technical skills and programming languages</li>
                      <li>• Add relevant work experience and projects</li>
                      <li>• Mention frameworks and tools you're familiar with</li>
                      <li>• Include years of experience with each skill</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                      <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle>Add Job Description</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Share the job you're preparing for
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* URL/Paste Toggle */}
                  <div className="flex gap-3 border-b pb-6">
                    <Button
                      variant={inputMethod === "url" ? "default" : "outline"}
                      onClick={() => setInputMethod("url")}
                      className="flex-1"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      LinkedIn URL
                    </Button>
                    <Button
                      variant={inputMethod === "paste" ? "default" : "outline"}
                      onClick={() => setInputMethod("paste")}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Paste Text
                    </Button>
                  </div>

                  {/* URL Input */}
                  {inputMethod === "url" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>LinkedIn Job URL</Label>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/jobs/view/..."
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <Button
                        onClick={handleScrapeLinkedIn}
                        disabled={isScrapingJob || !linkedinUrl}
                        className="w-full h-11"
                      >
                        {isScrapingJob ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Scraping...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Scrape Job Details
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Paste Text */}
                  {inputMethod === "paste" && (
                    <div className="space-y-2">
                      <Label>Paste job description</Label>
                      <textarea
                        value={jobDescriptionText}
                        onChange={(e) => setJobDescriptionText(e.target.value)}
                        placeholder="Paste the job description here... Include the role title, requirements, responsibilities, and preferred qualifications."
                        className="w-full h-48 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        {jobDescriptionText.length} characters
                      </p>
                    </div>
                  )}

                  {jobDescriptionText && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                          ✓ Job description added
                        </p>
                        <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                          We'll create challenges that match this role
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Helpful Tips */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      💡 Tips:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Include required skills and experience</li>
                      <li>• Add the job title and company</li>
                      <li>• Share key responsibilities</li>
                      <li>• Include "nice to have" qualifications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>Select Difficulty Level</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose the challenge difficulty you want to start with
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Difficulty Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(
                      [
                        {
                          level: "Easy" as const,
                          icon: "🟢",
                          description: "Basic algorithms and data structures",
                          focus: "Fundamentals",
                        },
                        {
                          level: "Medium" as const,
                          icon: "🟡",
                          description: "Real-world problem solving",
                          focus: "Problem Solving",
                        },
                        {
                          level: "Hard" as const,
                          icon: "🔴",
                          description: "Advanced algorithms and optimization",
                          focus: "Advanced Concepts",
                        },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.level}
                        onClick={() => setDifficulty(option.level)}
                        className={cn(
                          "p-6 rounded-lg border-2 transition-all text-left",
                          difficulty === option.level
                            ? "border-primary bg-primary/10"
                            : "border-muted bg-muted/30 hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <h4 className="font-semibold mb-1">{option.level}</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {option.description}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {option.focus}
                        </Badge>
                      </button>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-muted/30 border rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm">Your Setup Summary:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">CV Data:</span>
                        <Badge variant="secondary" className="text-xs">
                          {cvText.split(" ").length} words
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Job Description:
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {jobDescriptionText.split(" ").length} words
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <Badge
                          className={cn(
                            difficulty === "Easy"
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          )}
                        >
                          {difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateChallenges}
                    disabled={!canGenerate || isLoading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Challenges...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Personalized Challenges
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mt-8"
        >
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              }
            }}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 3 && (
            <Button
              onClick={() => {
                if (currentStep === 1 && canProceedToStep2) {
                  setCurrentStep(2);
                } else if (currentStep === 2 && canProceedToStep3) {
                  setCurrentStep(3);
                }
              }}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3)
              }
              className="flex-1"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.setItem("onboarding_completed", "true");
              router.push("/code-challenge");
            }}
            className="px-4"
            title="Skip onboarding"
          >
            Skip
          </Button>
        </motion.div>
      </div>
    </div>
  );
}