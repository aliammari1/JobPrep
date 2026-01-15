"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Brain,
  Code2,
  Video,
  BarChart3,
  Users,
  Calendar,
  Zap,
  Target,
  CheckCircle,
  Star,
  Mic,
  Monitor,
  BookOpen,
  Award,
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  MessageSquare,
  Shield,
  FileText,
  Headphones,
  Globe,
  Settings,
} from "lucide-react";

const featureCategories = [
  {
    id: "ai-powered",
    label: "AI-Powered",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "interview-formats",
    label: "Interview Formats",
    icon: Video,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "analytics",
    label: "Analytics & Insights",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
];

const features = {
  "ai-powered": [
    {
      title: "Adaptive Prep Coach",
      description:
        "Get personalized interview coaching that evolves with your progress. Our AI analyzes your performance and creates dynamic practice plans tailored to your skill gaps.",
      icon: Target,
      benefits: [
        "Personalized learning paths",
        "Real-time skill gap analysis",
        "Adaptive difficulty levels",
        "Custom practice schedules",
      ],
      stats: { label: "Improvement Rate", value: "85%" },
    },
    {
      title: "AI Interview Bot",
      description:
        "Practice with an intelligent AI interviewer that mimics real interview scenarios. Get instant feedback and improve your responses in a safe environment.",
      icon: Brain,
      benefits: [
        "Natural conversation flow",
        "Industry-specific questions",
        "Behavioral question analysis",
        "Technical deep-dives",
      ],
      stats: { label: "Practice Sessions", value: "50K+" },
    },
    {
      title: "Smart Feedback Engine",
      description:
        "Receive comprehensive, actionable feedback on every aspect of your interview performance, from technical accuracy to communication style.",
      icon: MessageSquare,
      benefits: [
        "Answer quality scoring",
        "Communication insights",
        "Body language analysis",
        "Tone and pace feedback",
      ],
      stats: { label: "Feedback Points", value: "100+" },
    },
    {
      title: "Performance Predictions",
      description:
        "AI-powered predictions help you understand your readiness level and identify areas that need more practice before the real interview.",
      icon: TrendingUp,
      benefits: [
        "Readiness scoring",
        "Confidence tracking",
        "Success probability",
        "Improvement trends",
      ],
      stats: { label: "Accuracy Rate", value: "92%" },
    },
  ],
  "interview-formats": [
    {
      title: "Video Interviews",
      description:
        "Full-featured video interview platform with HD recording, screen sharing, and real-time collaboration tools for the complete interview experience.",
      icon: Video,
      benefits: [
        "HD video & audio",
        "Screen sharing",
        "Live transcription",
        "Multi-participant support",
      ],
      stats: { label: "Video Quality", value: "1080p" },
    },
    {
      title: "Voice Interviews",
      description:
        "Perfect your phone interview skills with voice-only practice sessions. Focus on verbal communication without visual distractions.",
      icon: Mic,
      benefits: [
        "Phone interview simulation",
        "Voice clarity analysis",
        "Pace & rhythm feedback",
        "Filler word detection",
      ],
      stats: { label: "Voice Sessions", value: "25K+" },
    },
    {
      title: "Code Challenges",
      description:
        "Real-time coding environment supporting 15+ programming languages with instant execution, debugging tools, and performance metrics.",
      icon: Code2,
      benefits: [
        "15+ languages supported",
        "Real-time code execution",
        "Built-in debugger",
        "Performance profiling",
      ],
      stats: { label: "Code Runs", value: "100K+" },
    },
    {
      title: "Mock Simulator",
      description:
        "Experience realistic interview pressure with our advanced simulator that replicates actual interview conditions and time constraints.",
      icon: Monitor,
      benefits: [
        "Realistic time pressure",
        "Randomized questions",
        "Stress level monitoring",
        "Performance under pressure",
      ],
      stats: { label: "Completion Rate", value: "94%" },
    },
  ],
  analytics: [
    {
      title: "Performance Analytics",
      description:
        "Comprehensive performance tracking with detailed metrics, trends, and insights to help you understand and improve your interview skills.",
      icon: BarChart3,
      benefits: [
        "Progress tracking",
        "Skill heat maps",
        "Performance trends",
        "Comparative analytics",
      ],
      stats: { label: "Data Points", value: "500+" },
    },
    {
      title: "Interview Insights",
      description:
        "Deep dive into your interview data with AI-powered insights that reveal patterns, strengths, and opportunities for improvement.",
      icon: Sparkles,
      benefits: [
        "Pattern recognition",
        "Strength identification",
        "Weakness analysis",
        "Actionable recommendations",
      ],
      stats: { label: "Insights Generated", value: "10K+" },
    },
    {
      title: "Skill Assessment",
      description:
        "Comprehensive evaluation across technical and soft skills with industry benchmarking to see how you stack up against peers.",
      icon: Award,
      benefits: [
        "Technical skill scoring",
        "Soft skills evaluation",
        "Industry benchmarks",
        "Certification readiness",
      ],
      stats: { label: "Skills Assessed", value: "200+" },
    },
    {
      title: "Progress Reports",
      description:
        "Beautiful, shareable progress reports that showcase your improvement journey and highlight your strengths to potential employers.",
      icon: FileText,
      benefits: [
        "PDF export",
        "Share with employers",
        "Achievement badges",
        "Timeline visualization",
      ],
      stats: { label: "Reports Generated", value: "15K+" },
    },
  ],
  collaboration: [
    {
      title: "Team Evaluation",
      description:
        "Collaborative interview evaluation with multiple reviewers, consensus building, and shared decision-making for hiring teams.",
      icon: Users,
      benefits: [
        "Multi-reviewer support",
        "Consensus building",
        "Score aggregation",
        "Decision workflows",
      ],
      stats: { label: "Team Members", value: "5K+" },
    },
    {
      title: "Interview Scheduler",
      description:
        "Smart scheduling with calendar integration, automated reminders, and timezone handling for seamless interview coordination.",
      icon: Calendar,
      benefits: [
        "Calendar sync",
        "Automated reminders",
        "Timezone conversion",
        "Availability matching",
      ],
      stats: { label: "Interviews Scheduled", value: "30K+" },
    },
    {
      title: "Replay Center",
      description:
        "Review past interviews with advanced playback controls, annotations, and timestamp markers for detailed analysis.",
      icon: Play,
      benefits: [
        "Playback controls",
        "Annotation tools",
        "Timestamp markers",
        "Clip sharing",
      ],
      stats: { label: "Hours Recorded", value: "10K+" },
    },
    {
      title: "Question Builder",
      description:
        "Create and manage custom interview questions with templates, categories, and difficulty levels for consistent interviewing.",
      icon: BookOpen,
      benefits: [
        "Custom questions",
        "Question templates",
        "Category organization",
        "Difficulty ratings",
      ],
      stats: { label: "Questions Created", value: "50K+" },
    },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("ai-powered");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-grid-white/10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto text-center"
        >
          <Badge
            variant="outline"
            className="mb-6 backdrop-blur-sm border-primary/20"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Complete Feature Set
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Everything You Need to Excel
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform provides cutting-edge tools and
            AI-powered insights to transform your interview preparation
            experience.
          </p>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { label: "Active Features", value: "50+" },
              { label: "AI Models", value: "12" },
              { label: "Integrations", value: "25+" },
              { label: "Languages", value: "15+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Categories Tabs */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 h-auto gap-2">
              {featureCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="h-5 w-5" />
                  <span className="text-xs sm:text-sm font-medium">
                    {category.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(features).map(([categoryId, categoryFeatures]) => (
              <TabsContent key={categoryId} value={categoryId}>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 md:grid-cols-2"
                >
                  {categoryFeatures.map((feature, idx) => (
                    <motion.div
                      key={`${categoryId}-${idx}`}
                      variants={itemVariants}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                              <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              {feature.stats.label}
                              <span className="ml-2 font-bold text-primary">
                                {feature.stats.value}
                              </span>
                            </Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-base leading-relaxed mt-2">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {feature.benefits.map((benefit, benefitIdx) => (
                              <div
                                key={benefitIdx}
                                className="flex items-center gap-2 text-sm"
                              >
                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-muted-foreground">
                                  {benefit}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                          >
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Integration Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seamless Integrations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with your favorite tools and platforms for a unified
              workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Calendar Sync",
                description:
                  "Google Calendar, Outlook, and Apple Calendar integration",
              },
              {
                icon: Video,
                title: "Video Platforms",
                description: "Zoom, Teams, and Meet for virtual interviews",
              },
              {
                icon: Shield,
                title: "SSO & Security",
                description:
                  "Enterprise-grade authentication and data protection",
              },
              {
                icon: Globe,
                title: "ATS Integration",
                description: "Connect with major applicant tracking systems",
              },
              {
                icon: FileText,
                title: "Export & Reports",
                description: "PDF, CSV, and API access for custom workflows",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                description: "Dedicated support team and comprehensive docs",
              },
            ].map((integration) => (
              <Card
                key={integration.title}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                    <integration.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{integration.title}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-8 md:px-12 py-20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Join thousands of successful candidates who transformed their
              interview skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
