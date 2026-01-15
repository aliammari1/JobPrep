"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { useSubscription } from "@/hooks/use-subscription";
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
  ArrowRight,
  CreditCard,
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
  description?: string;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const sidebarSections: SidebarSection[] = [
  {
    label: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: Home,
        href: "/dashboard",
        description: "View your overview",
      },
    ],
  },
  {
    label: "Interview Prep",
    items: [
      {
        id: "interviews",
        label: "Interviews",
        icon: Users,
        href: "/interview",
        children: [
          {
            id: "mock-interview",
            label: "Mock Interview",
            icon: Target,
            href: "/mock-interview",
          },
          {
            id: "questions",
            label: "Questions",
            icon: BookOpen,
            href: "/mock-interview/questions",
            isNew: true,
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
    ],
  },
  {
    label: "Career Development",
    items: [
      {
        id: "career-tools",
        label: "Career Tools",
        icon: Briefcase,
        badge: "New",
        description: "Build your profile",
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
    ],
  },
  {
    label: "Preferences",
    items: [
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        description: "Manage your account",
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
          {
            id: "billing",
            label: "Billing & Subscription",
            icon: CreditCard,
            href: "/settings/billing",
            isPro: true,
          },
        ],
      },
    ],
  },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: subscription, isLoading: subscriptionLoading } =
    useSubscription();
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
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "hover:bg-accent/50",
              level > 0 && "ml-2",
              active
                ? "bg-primary/10 text-primary dark:bg-primary/20"
                : "text-foreground/80 hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "shrink-0 rounded-md p-1.5 transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/50 text-foreground/60 group-hover:bg-muted",
                )}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="truncate block">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-foreground/50 truncate block">
                    {item.description}
                  </span>
                )}
              </div>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 ml-auto shrink-0"
                >
                  {item.badge}
                </Badge>
              )}
              {item.isNew && (
                <Badge className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ml-auto shrink-0">
                  New
                </Badge>
              )}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        ) : (
          <Link
            href={item.href || "#"}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
            }}
            className="block"
          >
            <button
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-accent/50",
                level > 0 && "ml-2",
                active
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-foreground/80 hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "shrink-0 rounded-md p-1.5 transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/50 text-foreground/60 group-hover:bg-muted",
                )}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="truncate block">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-foreground/50 truncate block">
                    {item.description}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.badge && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {item.badge}
                  </Badge>
                )}
                {item.isNew && (
                  <Badge className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    New
                  </Badge>
                )}
                {item.isPro && (
                  <Badge className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                    Pro
                  </Badge>
                )}
              </div>
            </button>
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
              <div className="space-y-1 mt-1">
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
          "fixed left-0 top-0 z-50 h-full w-80 bg-background/95 backdrop-blur-sm border-r border-border flex flex-col shadow-xl",
          "lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none lg:bg-background/99",
          "lg:animate-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-linear-to-r from-background to-muted/30">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10">
              <Image
                src="/icons/one_logo.png"
                alt="JobPrep Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-sm bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                JobPrep
              </h2>
              <p className="text-xs text-muted-foreground">
                Interview Platform
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-4 space-y-2 shrink-0 border-b border-border/50">
          <Link
            href="/schedule-interview"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
            }}
            className="block"
          >
            <Button
              className="w-full justify-center gap-2 h-10 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold">New Interview</span>
            </Button>
          </Link>
          <div
            className="w-full h-10 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground/60 shadow-sm transition-all hover:bg-accent/30 hover:text-foreground/80 cursor-pointer flex items-center justify-between gap-2 group"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
              const isMac = navigator.platform.toUpperCase().includes("MAC");
              const event = new KeyboardEvent("keydown", {
                key: "k",
                code: "KeyK",
                ctrlKey: !isMac,
                metaKey: isMac,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Quick search...</span>
            </div>
            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shrink-0">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.label} className="space-y-2">
              <h3 className="px-3 py-1.5 text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => renderSidebarItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Divider */}
        <div className="border-t border-border/50 shrink-0" />

        {/* Subscription Card */}
        {session?.user && !subscriptionLoading && subscription && (
          <div className="px-4 pt-3 pb-2">
            <Link href="/settings/billing">
              <div className="rounded-lg border border-primary/50 bg-primary/5 p-3 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {subscription.tier === "FREE" ? "Free Plan" : "Premium"}
                  </span>
                </div>
                <p className="text-xs text-foreground font-medium truncate">
                  {subscription.tier === "FREE"
                    ? "Upgrade to Pro"
                    : subscription.tier === "MONTHLY"
                      ? "Pro Monthly"
                      : "Pro Yearly"}
                </p>
                <Badge
                  variant="outline"
                  className={`mt-2 text-xs ${
                    subscription.status === "ACTIVE"
                      ? "border-green-500/50 text-green-600 dark:text-green-400"
                      : "border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {subscription.status}
                </Badge>
              </div>
            </Link>
          </div>
        )}

        {/* User Profile Section */}
        <div className="p-4 space-y-3">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-2.5 w-32 rounded" />
              </div>
            </div>
          ) : session?.user ? (
            <>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="font-semibold">
                    {session.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2 rounded-lg h-9"
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        window.innerWidth < 1024
                      ) {
                        onClose();
                      }
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">Settings</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-2 rounded-lg h-9"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-2 space-y-3">
              <p className="text-sm text-muted-foreground">Not signed in</p>
              <Link
                href="/sign-in"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth < 1024
                  ) {
                    onClose();
                  }
                }}
              >
                <Button className="w-full rounded-lg h-9 text-sm font-medium gap-2">
                  <ArrowRight className="w-4 h-4" />
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
