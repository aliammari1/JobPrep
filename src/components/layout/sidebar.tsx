"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Users,
  Calendar,
  Video,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  Clock,
  Target,
  Brain,
  Zap,
  FileText,
  Handshake,
  Scale,
  BookOpen,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Star,
  Shield,
  Database,
  Workflow,
  PieChart,
  LineChart,
  Users2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Globe,
  CalendarCheck,
  Mic,
  Code2,
  RotateCcw,
  Bot,
  Award,
  BarChart,
  Monitor,
  User,
  Building,
  Wrench,
  Share,
  VideoIcon,
  Key,
  Phone,
  Link2,
  FileEdit,
  Mail,
  Briefcase,
  Linkedin,
  CalendarDays,
  CloudUpload,
  FileVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
  isNew?: boolean;
  isPro?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: Users,
    children: [
      {
        id: "mock-interview",
        label: "Mock Interview",
        icon: Target,
        href: "/mock-interview",
      },
      {
        id: "interview-room",
        label: "Interview Room",
        icon: Video,
        href: "/interview-room",
      },
      {
        id: "recordings",
        label: "Recordings",
        icon: FileVideo,
        href: "/recordings",
        isNew: true,
      },
      {
        id: "interview-scheduler",
        label: "Interview Scheduler",
        icon: CalendarCheck,
        href: "/interview-scheduler",
      },
      {
        id: "code-challenge",
        label: "Code Challenge",
        icon: Code2,
        href: "/code-challenge",
      },
    ],
  },
  {
    id: "career-tools",
    label: "Career Tools",
    icon: Briefcase,
    badge: "New",
    children: [
      {
        id: "cv-builder",
        label: "CV Builder",
        icon: FileEdit,
        href: "/cv-builder",
        isNew: true,
      },
      {
        id: "cover-letter",
        label: "Cover Letter Generator",
        icon: Mail,
        href: "/cover-letter",
        isNew: true,
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Database,
    badge: "New",
    children: [
      {
        id: "integrations-hub",
        label: "Integrations Hub",
        icon: Database,
        href: "/integrations",
        isNew: true,
      },
      {
        id: "linkedin-integration",
        label: "LinkedIn Integration",
        icon: Linkedin,
        href: "/integrations/linkedin",
        isNew: true,
      },
      {
        id: "google-calendar",
        label: "Google Calendar",
        icon: CalendarDays,
        href: "/integrations/calendar",
        isNew: true,
      },
      {
        id: "integration-dashboard",
        label: "Integration Dashboard",
        icon: Database,
        href: "/integration-dashboard",
      },
      {
        id: "ats-integration",
        label: "ATS Integration",
        icon: Workflow,
        href: "/ats-integration",
      },
      {
        id: "calendar-sync",
        label: "Calendar Sync",
        icon: Calendar,
        href: "/calendar-sync",
      },
      {
        id: "api-management",
        label: "API Management",
        icon: Settings,
        href: "/api-management",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    children: [
      {
        id: "profile-settings",
        label: "Profile Settings",
        icon: Users,
        href: "/settings/profile",
      },
      {
        id: "security-settings",
        label: "Security",
        icon: Shield,
        href: "/settings/security",
      },
      {
        id: "two-factor",
        label: "Two-Factor Auth",
        icon: Shield,
        href: "/settings/two-factor",
      },
      {
        id: "passkeys",
        label: "Passkeys",
        icon: Key,
        href: "/settings/passkeys",
      },
      {
        id: "phone-settings",
        label: "Phone Settings",
        icon: Phone,
        href: "/settings/phone",
      },
      {
        id: "connected-accounts",
        label: "Connected Accounts",
        icon: Link2,
        href: "/settings/connected-accounts",
      },
      {
        id: "sessions",
        label: "Active Sessions",
        icon: Monitor,
        href: "/settings/sessions",
      },
      {
        id: "notification-settings",
        label: "Notifications",
        icon: Bell,
        href: "/settings/notifications",
      },
      {
        id: "team-settings",
        label: "Team Settings",
        icon: Users2,
        href: "/settings/team",
      },
    ],
  },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "interviews",
    "evaluation",
  ]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isChildActive = (children?: SidebarItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.href));
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href) || isChildActive(item.children);

    return (
      <div key={item.id} className="space-y-1">
        {hasChildren ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-10 px-3 font-medium transition-all duration-200",
              level > 0 && "ml-4",
              active
                ? "bg-primary/15 text-primary dark:bg-primary/20"
                : "hover:bg-accent/50 text-foreground/90",
            )}
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5"
                >
                  {item.badge}
                </Badge>
              )}
              {item.isNew && (
                <Badge className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  New
                </Badge>
              )}
              {item.isPro && (
                <Badge className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                  Pro
                </Badge>
              )}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 shrink-0" />
            </motion.div>
          </Button>
        ) : (
          <Link 
            href={item.href || "#"} 
            onClick={() => {
              // Only close on mobile (when window is small)
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
            }} 
            className="block"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 px-3 font-medium transition-all duration-200",
                level > 0 && "ml-4",
                active
                  ? "bg-primary/15 text-primary dark:bg-primary/20"
                  : "hover:bg-accent/50 text-foreground/90",
              )}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{item.label}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      New
                    </Badge>
                  )}
                  {item.isPro && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                      Pro
                    </Badge>
                  )}
                </div>
              </div>
            </Button>
          </Link>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                {item.children?.map((child) =>
                  renderSidebarItem(child, level + 1),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? { x: 0 } : { x: "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 bg-background border-r border-border flex flex-col",
          "lg:relative lg:translate-x-0 lg:z-auto",
          "lg:animate-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/icons/one_logo.png"
                alt="JobPrep Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold text-sm">JobPrep AI</h2>
              <p className="text-xs text-muted-foreground">Interview Platform</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2 shrink-0 border-b border-border">
          <Link href="/schedule-interview" 
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
            }} 
            className="block"
          >
            <Button className="w-full justify-center gap-2 h-9" size="sm">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Mock Interview</span>
            </Button>
          </Link>
          <div 
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground/70 shadow-sm transition-colors hover:text-foreground cursor-pointer flex items-center justify-center gap-2 hover:bg-accent/50"
            onClick={() => {
              // Only close on mobile (when window is small)
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
              // Trigger command palette with keyboard shortcut
              const isMac = navigator.platform.toUpperCase().includes('MAC');
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                code: 'KeyK',
                ctrlKey: !isMac,
                metaKey: isMac,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium flex-1">Quick Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </nav>

        {/* Footer Divider */}
        <div className="border-t border-border shrink-0" />

        {/* User Profile Section */}
        <div className="p-4 space-y-3">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
            </div>
          ) : session?.user ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback>
                    {session.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
                <Link href="/settings" 
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-2 space-y-3">
              <p className="text-sm text-muted-foreground">Not signed in</p>
              <Link href="/sign-in" 
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className="block"
              >
                <Button size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
