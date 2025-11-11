"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileUp,
  Link2,
  Brain,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Upload Your CV",
    description: "Share your resume so we can personalize challenges to your skills",
    icon: <FileText className="w-8 h-8" />,
  },
  {
    id: 2,
    title: "Add Job Description",
    description: "Paste the LinkedIn job URL or description",
    icon: <Briefcase className="w-8 h-8" />,
  },
  {
    id: 3,
    title: "Generate Challenges",
    description: "AI will create personalized coding challenges",
    icon: <Sparkles className="w-8 h-8" />,
  },
];

export default function CodeChallengeOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: CV Upload
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");
  
  // Step 2: Job Description
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [inputMethod, setInputMethod] = useState<"url" | "paste">("url");
  const [isScrapingJob, setIsScrapingJob] = useState(false);
  
  // Step 3: Generation
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB",
      });
      return;
    }

    setCvFile(file);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse CV");

      const data = await response.json();
      setCvText(data.text || "");
      
      toast.success("CV uploaded successfully!", {
        description: "We've extracted your information",
      });
    } catch (error) {
      toast.error("Failed to parse CV", {
        description: "Please try pasting your CV text instead",
      });
      setUploadMethod("paste");
    } finally {
      setIsLoading(false);
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
        toast.success("Job description scraped!", {
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

  const canProceedStep1 = uploadMethod === "file" ? cvFile && cvText : cvText.trim().length > 50;
  const canProceedStep2 = inputMethod === "url" ? jobDescriptionText.trim().length > 50 : jobDescriptionText.trim().length > 50;

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) {
      toast.error("Please upload or paste your CV");
      return;
    }
    if (currentStep === 2 && !canProceedStep2) {
      toast.error("Please provide a job description");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateChallenges = () => {
    // Store data in sessionStorage to pass to main page
    sessionStorage.setItem("onboarding_cv", cvText);
    sessionStorage.setItem("onboarding_job", jobDescriptionText);
    sessionStorage.setItem("onboarding_difficulty", difficulty);
    sessionStorage.setItem("onboarding_completed", "true");
    
    // Navigate to code challenge page
    router.push("/code-challenge");
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 dark:via-purple-950/10 to-blue-50/30 dark:to-blue-950/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.setItem("onboarding_completed", "true");
              router.push("/code-challenge");
            }}
            className="absolute right-0 top-0"
          >
            Skip Onboarding
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Brain className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Code Challenge Setup
            </h1>
          </motion.div>
          <p className="text-muted-foreground text-lg">
            Get personalized coding challenges tailored to your profile
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                    currentStep === step.id
                      ? "border-purple-600 bg-purple-600 text-white"
                      : currentStep > step.id
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white dark:bg-gray-900 text-gray-400"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 w-20 mx-2 transition-all",
                      currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: CV Upload */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Upload Your CV/Resume</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Help us understand your skills and experience
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Method Selection */}
                    <div className="flex gap-4">
                      <Button
                        variant={uploadMethod === "file" ? "default" : "outline"}
                        onClick={() => setUploadMethod("file")}
                        className="flex-1"
                      >
                        <FileUp className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        variant={uploadMethod === "paste" ? "default" : "outline"}
                        onClick={() => setUploadMethod("paste")}
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Paste Text
                      </Button>
                    </div>

                    {/* File Upload */}
                    {uploadMethod === "file" && (
                      <div className="space-y-4">
                        <Label htmlFor="cv-upload" className="text-base font-medium">
                          Select your CV file (PDF, DOCX, or TXT)
                        </Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                          <input
                            id="cv-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isLoading}
                          />
                          <label htmlFor="cv-upload" className="cursor-pointer">
                            {isLoading ? (
                              <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
                            ) : cvFile ? (
                              <>
                                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                                <p className="text-sm font-medium">{cvFile.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Click to change file
                                </p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF, DOCX, or TXT (max 5MB)
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                        {cvText && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              ✓ CV parsed successfully ({cvText.length} characters extracted)
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paste Text */}
                    {uploadMethod === "paste" && (
                      <div className="space-y-4">
                        <Label htmlFor="cv-text" className="text-base font-medium">
                          Paste your CV content
                        </Label>
                        <textarea
                          id="cv-text"
                          value={cvText}
                          onChange={(e) => setCvText(e.target.value)}
                          placeholder="Paste your CV/resume here... Include your experience, skills, education, and projects."
                          className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Tip: Include all relevant skills, technologies, and achievements
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Job Description */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Briefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Job Description</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tell us about the position you're applying for
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Method Selection */}
                    <div className="flex gap-4">
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
                        <FileText className="w-4 h-4 mr-2" />
                        Paste Description
                      </Button>
                    </div>

                    {/* LinkedIn URL */}
                    {inputMethod === "url" && (
                      <div className="space-y-4">
                        <Label htmlFor="linkedin-url" className="text-base font-medium">
                          LinkedIn Job URL
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="linkedin-url"
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://www.linkedin.com/jobs/view/..."
                            className="flex-1"
                            disabled={isScrapingJob}
                          />
                          <Button
                            onClick={handleScrapeLinkedIn}
                            disabled={!linkedinUrl.trim() || isScrapingJob}
                          >
                            {isScrapingJob ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {jobDescriptionText && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                              ✓ Job description scraped successfully!
                            </p>
                            <div className="max-h-32 overflow-y-auto text-xs text-gray-600 dark:text-gray-400">
                              {jobDescriptionText.substring(0, 300)}...
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paste Text */}
                    {inputMethod === "paste" && (
                      <div className="space-y-4">
                        <Label htmlFor="job-text" className="text-base font-medium">
                          Paste job description
                        </Label>
                        <textarea
                          id="job-text"
                          value={jobDescriptionText}
                          onChange={(e) => setJobDescriptionText(e.target.value)}
                          placeholder="Paste the job description here... Include required skills, responsibilities, and qualifications."
                          className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Tip: Include all technical requirements and responsibilities
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Generate */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Ready to Generate!</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose your challenge difficulty
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Difficulty Selection */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Challenge Difficulty</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {(["Easy", "Medium", "Hard"] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={cn(
                              "p-4 border-2 rounded-lg transition-all text-center",
                              difficulty === level
                                ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 hover:border-purple-300"
                            )}
                          >
                            <div className="font-semibold text-lg">{level}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {level === "Easy" && "Fundamental concepts"}
                              {level === "Medium" && "Practical problems"}
                              {level === "Hard" && "Advanced algorithms"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        What You'll Get
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          3 personalized coding challenges
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Tailored to your skills: {cvText.substring(0, 50)}...
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Relevant to the job position
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Complete test cases and hints
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Support for 6 programming languages
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="max-w-3xl mx-auto mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2)
              }
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerateChallenges}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Challenges
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
