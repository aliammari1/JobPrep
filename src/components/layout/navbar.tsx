"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Calendar,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Star,
  Zap,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Video,
  Users,
  BarChart3,
  Brain,
  Globe,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSidebarToggle: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export function Navbar({ onSidebarToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Interview Scheduled",
      message: "New interview with Sarah Chen at 2:00 PM",
      type: "info",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: { label: "View Details", href: "/schedule-interview" },
    },
    {
      id: "2",
      title: "Evaluation Complete",
      message: "Team consensus reached for John Smith",
      type: "success",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      action: { label: "View Results", href: "/collaborative-evaluation" },
    },
    {
      id: "3",
      title: "AI Analysis Ready",
      message: "Interview insights available for review",
      type: "info",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      action: { label: "View Analysis", href: "/ai-analysis" },
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getPageTitle = (path: string) => {
    const routes: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/schedule-interview": "Schedule Interview",
      "/interview-room": "Interview Room",
      "/mock-interview": "Mock Interview",
      "/practice-interview": "Practice Session",
      "/collaborative-evaluation": "Collaborative Evaluation",
      "/replay-center": "Replay Center",
      "/ai-analysis": "AI Analysis",
      "/feedback-system": "Feedback System",
      "/performance-analytics": "Performance Analytics",
      "/interview-insights": "Interview Insights AI",
      "/reports": "Advanced Reports",
      "/real-time-metrics": "Real-time Metrics",
      "/candidate-profiles": "Candidate Profiles",
      "/talent-pipeline": "Talent Pipeline",
      "/screening-tools": "Screening Tools",
      "/candidate-tracking": "Candidate Tracking",
      "/adaptive-questions": "Adaptive Question Flow",
      "/interview-coach": "Interview Prep Coach",
      "/smart-matching": "Smart Candidate Matching",
      "/predictive-analytics": "Predictive Analytics",
      "/team-workspace": "Team Workspace",
      "/real-time-collaboration": "Real-time Collaboration",
      "/shared-notes": "Shared Notes",
      "/team-calendar": "Team Calendar",
      "/integration-dashboard": "Integration Dashboard",
      "/ats-integration": "ATS Integration",
      "/calendar-sync": "Calendar Sync",
      "/api-management": "API Management",
    };
    return routes[path] || "JobPrep AI";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 dark:bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page Title & Breadcrumb */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your interview process efficiently
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search interviews, candidates, reports... (⌘K for commands)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border focus:bg-background dark:focus:bg-background text-sm"
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background dark:bg-background rounded-lg shadow-lg border border-border py-2 z-50">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Quick Results
                </div>
                <Link
                  href="/candidate-profiles"
                  className="block px-3 py-2 hover:bg-muted dark:hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Find candidates matching "{searchQuery}"</span>
                  </div>
                </Link>
                <Link
                  href="/reports"
                  className="block px-3 py-2 hover:bg-muted dark:hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Reports containing "{searchQuery}"</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/schedule-interview">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule
              </Button>
            </Link>
            <Link href="/interview-room">
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="w-4 h-4" />
                Join Room
              </Button>
            </Link>
          </div>

          {/* User Menu */}
          {isPending ? (
            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback>
                      {session.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session.user.name || "User"}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/pricing")}>
                  <Star className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/contact")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
