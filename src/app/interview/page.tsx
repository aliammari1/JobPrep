"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Bot,
  Code2,
  Brain,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  Zap,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewMode = "in-person" | "ai" | null;
type InterviewType = "technical" | "behavioral" | "hybrid" | null;
type TechnicalSubtype = "code-challenge" | "questions" | null;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const stepVariants = {
  enter: { opacity: 0, x: 100 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export default function InterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mode, setMode] = useState<InterviewMode>(null);
  const [type, setType] = useState<InterviewType>(null);
  const [technicalSubtype, setTechnicalSubtype] =
    useState<TechnicalSubtype>(null);

  const handleModeSelect = (selectedMode: InterviewMode) => {
    setMode(selectedMode);
    setStep(2);
  };

  const handleTypeSelect = (selectedType: InterviewType) => {
    setType(selectedType);
    if (selectedType === "technical") {
      setStep(3);
    } else {
      setStep(4);
    }
  };

  const handleTechnicalSubtypeSelect = (subtype: TechnicalSubtype) => {
    setTechnicalSubtype(subtype);
    setStep(4);
  };

  const handleNavigate = () => {
    let destination = "";

    if (mode === "ai") {
      if (type === "technical") {
        destination =
          technicalSubtype === "code-challenge"
            ? "/code-challenge"
            : "/mock-interview";
      } else if (type === "behavioral") {
        destination = "/mock-interview";
      } else if (type === "hybrid") {
        destination = "/mock-interview";
      }
    } else if (mode === "in-person") {
      if (type === "technical") {
        destination =
          technicalSubtype === "code-challenge"
            ? "/code-challenge"
            : "/interview-room";
      } else if (type === "behavioral") {
        destination = "/interview-scheduler";
      } else if (type === "hybrid") {
        destination = "/interview-scheduler";
      }
    }

    if (destination) {
      router.push(destination);
    }
  };

  const goBack = () => {
    if (step === 1) return;
    if (step === 2) {
      setMode(null);
      setStep(1);
    } else if (step === 3) {
      setType(null);
      setStep(2);
    } else if (step === 4) {
      if (type === "technical") {
        setTechnicalSubtype(null);
        setStep(3);
      } else {
        setType(null);
        setStep(2);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Interview Mode
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            {step === 1 && "Select Your Interview Mode"}
            {step === 2 && "Choose Interview Type"}
            {step === 3 && "Select Technical Interview Format"}
            {step === 4 && "Ready to Begin?"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {step === 1 &&
              "Choose between in-person or AI-powered interviews to practice your skills"}
            {step === 2 &&
              "Select the type of interview that matches your preparation goals"}
            {step === 3 &&
              "Choose how you'd like to practice your technical skills"}
            {step === 4 &&
              "You're all set! Click below to start your interview session"}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      "w-8 h-1 transition-all",
                      s < step ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 gap-6"
              >
                {/* In-Person Option */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => handleModeSelect("in-person")}
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle>In-Person Interview</CardTitle>
                        </div>
                        <CardDescription>
                          Live interview with a real person or video call
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span className="text-sm">
                              Schedule with real interviewers
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span className="text-sm">
                              Real-time feedback and discussion
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span className="text-sm">
                              Practice communication skills
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>

                {/* AI Option */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => handleModeSelect("ai")}
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Bot className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle>AI Interview</CardTitle>
                        </div>
                        <CardDescription>
                          Practice with intelligent AI interviewers
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span className="text-sm">
                              Practice anytime, anywhere
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span className="text-sm">
                              Personalized AI feedback
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span className="text-sm">
                              Unlimited practice sessions
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-3 gap-6"
              >
                {/* Technical */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => handleTypeSelect("technical")}
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Code2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <CardTitle>Technical</CardTitle>
                        </div>
                        <CardDescription>
                          Coding and system design questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          <span className="text-sm">Coding challenges</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          <span className="text-sm">System design</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          <span className="text-sm">Data structures</span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>

                {/* Behavioral */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => handleTypeSelect("behavioral")}
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-amber-500/10">
                            <Brain className="w-6 h-6 text-amber-600" />
                          </div>
                          <CardTitle>Behavioral</CardTitle>
                        </div>
                        <CardDescription>
                          Soft skills and situational questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">✓</span>
                          <span className="text-sm">Story telling</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">✓</span>
                          <span className="text-sm">
                            Problem solving approach
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">✓</span>
                          <span className="text-sm">Team collaboration</span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>

                {/* Hybrid */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => handleTypeSelect("hybrid")}
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Zap className="w-6 h-6 text-purple-600" />
                          </div>
                          <CardTitle>Hybrid</CardTitle>
                        </div>
                        <CardDescription>
                          Mix of technical and behavioral
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">✓</span>
                          <span className="text-sm">Balanced approach</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">✓</span>
                          <span className="text-sm">Real-world scenarios</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">✓</span>
                          <span className="text-sm">Full preparation</span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Code Challenge */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() =>
                      handleTechnicalSubtypeSelect("code-challenge")
                    }
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Code2 className="w-6 h-6 text-green-600" />
                          </div>
                          <CardTitle>Code Challenge</CardTitle>
                        </div>
                        <CardDescription>
                          Solve coding problems with real-time execution
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-sm">
                            Multiple programming languages
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-sm">
                            Test cases and validation
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-sm">
                            Performance metrics and feedback
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>

                {/* Questions */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => handleTechnicalSubtypeSelect("questions")}
                    className="w-full h-full focus:outline-none"
                  >
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-cyan-500/10">
                            <MessageSquare className="w-6 h-6 text-cyan-600" />
                          </div>
                          <CardTitle>Questions</CardTitle>
                        </div>
                        <CardDescription>
                          AI-generated technical questions with feedback
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-600 mt-1">✓</span>
                          <span className="text-sm">
                            AI-powered question generation
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-600 mt-1">✓</span>
                          <span className="text-sm">
                            Voice and video recording
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-600 mt-1">✓</span>
                          <span className="text-sm">
                            Detailed AI analysis and tips
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl mx-auto"
              >
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Interview Configuration
                    </CardTitle>
                    <CardDescription>
                      Review your selection and start your interview
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary */}
                    <div className="space-y-4">
                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {mode === "in-person" ? (
                              <Users className="w-5 h-5 text-primary" />
                            ) : (
                              <Bot className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Mode</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {mode === "in-person"
                                ? "In-Person Interview"
                                : "AI Interview"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMode(null);
                            setType(null);
                            setTechnicalSubtype(null);
                            setStep(1);
                          }}
                        >
                          Change
                        </Button>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {type === "technical" ? (
                              <Code2 className="w-5 h-5 text-primary" />
                            ) : type === "behavioral" ? (
                              <Brain className="w-5 h-5 text-primary" />
                            ) : (
                              <Zap className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Type</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {type} Interview
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setType(null);
                            setTechnicalSubtype(null);
                            setStep(2);
                          }}
                        >
                          Change
                        </Button>
                      </motion.div>

                      {type === "technical" && (
                        <motion.div
                          variants={itemVariants}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {technicalSubtype === "code-challenge" ? (
                                <Code2 className="w-5 h-5 text-primary" />
                              ) : (
                                <MessageSquare className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Format</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {technicalSubtype === "code-challenge"
                                  ? "Code Challenge"
                                  : "AI-Generated Questions"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTechnicalSubtype(null);
                              setStep(3);
                            }}
                          >
                            Change
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Benefits */}
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        <p className="font-semibold text-sm">
                          What you'll get:
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Real-time feedback on your performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Detailed analysis of your answers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Recording of your session for review</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Tips to improve your interview skills</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={goBack}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button size="lg" onClick={handleNavigate} className="flex-1">
                    Start Interview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button for Steps 2-4 */}
        {step > 1 && step < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-center"
          >
            <Button variant="outline" onClick={goBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
