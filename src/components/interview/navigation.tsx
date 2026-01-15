"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Brain,
  Mic,
  Code2,
  Video,
  Calendar,
  User,
  Target,
  BarChart3,
  MessageSquare,
  Building2,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Zap,
  Star,
  Trophy,
  Timer,
  Share2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/interview-dashboard",
        icon: LayoutDashboard,
        description: "Main dashboard with analytics",
      },
      {
        name: "Analytics",
        href: "/interview-analytics",
        icon: BarChart3,
        description: "Comprehensive interview insights",
      },
    ],
  },
  {
    title: "Interview Tools",
    items: [
      {
        name: "Question Builder",
        href: "/question-builder",
        icon: Brain,
        description: "AI-powered question generation",
      },
      {
        name: "Voice Interview",
        href: "/voice-interview",
        icon: Mic,
        description: "Real-time voice analysis",
      },
      {
        name: "Video Recorder",
        href: "/video-recorder",
        icon: Video,
        description: "Advanced video recording with emotion AI",
      },
      {
        name: "Code Challenge",
        href: "/code-challenge",
        icon: Code2,
        description: "Live coding environment",
      },
      {
        name: "Mock Simulator",
        href: "/mock-simulator",
        icon: Target,
        description: "AI-powered practice interviews",
      },
      {
        name: "Screen Sharing",
        href: "/screen-sharing",
        icon: Share2,
        description: "Collaborative screen sharing hub",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "Scheduler",
        href: "/interview-scheduler",
        icon: Calendar,
        description: "Smart interview scheduling",
      },
      {
        name: "Candidate Profiles",
        href: "/candidate-profile",
        icon: User,
        description: "Comprehensive candidate builder",
      },
      {
        name: "AI Feedback",
        href: "/ai-feedback",
        icon: Zap,
        description: "Advanced AI-powered feedback engine",
      },
      {
        name: "Templates Library",
        href: "/templates-library",
        icon: BookOpen,
        description: "Professional interview templates",
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        name: "Organizations",
        href: "/organizations",
        icon: Building2,
        description: "Manage organizations",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Platform settings",
      },
    ],
  },
];

export function InterviewNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-80 bg-white dark:bg-gray-900 border-r shadow-lg lg:shadow-none",
          "lg:translate-x-0 lg:static lg:z-auto",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Interview</h1>
                <p className="text-sm text-muted-foreground">
                  Advanced Platform
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {navigationItems.map((section, sectionIndex) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: sectionIndex * 0.1 + itemIndex * 0.05,
                          }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                              active
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4 transition-colors",
                                active
                                  ? "text-blue-600"
                                  : "text-muted-foreground group-hover:text-foreground",
                              )}
                            />
                            <div className="flex-1">
                              <div
                                className={cn(
                                  "font-medium",
                                  active && "text-blue-700 dark:text-blue-300",
                                )}
                              >
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="w-2 h-2 bg-blue-600 rounded-full"
                                transition={{
                                  type: "spring",
                                  damping: 25,
                                  stiffness: 400,
                                }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Cards */}
          <div className="p-4 border-t space-y-3">
            <div className="p-3 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  AI Engine
                </span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Active & Learning
              </div>
            </div>

            <div className="p-3 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Platform Score
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                98.7% Accuracy
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
