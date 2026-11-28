import {
  Bell,
  BookOpen,
  CalendarCheck,
  Code2,
  CreditCard,
  FileEdit,
  FileVideo,
  Home,
  Key,
  Link2,
  Mail,
  Monitor,
  Phone,
  Shield,
  Target,
  User,
  Users2,
  Video,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export const primarySections: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    ],
  },
  {
    label: "Interview Prep",
    items: [
      {
        id: "mock-interview",
        label: "Mock Interview",
        icon: Target,
        href: "/mock-interview",
      },
      {
        id: "questions",
        label: "Question Bank",
        icon: BookOpen,
        href: "/mock-interview/questions",
      },
      {
        id: "code-challenge",
        label: "Code Challenge",
        icon: Code2,
        href: "/code-challenge",
      },
      {
        id: "system-design",
        label: "System Design",
        icon: Monitor,
        href: "/system-design",
      },
      {
        id: "interview-room",
        label: "Interview Room",
        icon: Video,
        href: "/interview-room",
      },
      {
        id: "interview-scheduler",
        label: "Scheduler",
        icon: CalendarCheck,
        href: "/interview-scheduler",
      },
      {
        id: "recordings",
        label: "Recordings",
        icon: FileVideo,
        href: "/recordings",
      },
    ],
  },
  {
    label: "Career Studio",
    items: [
      {
        id: "applications",
        label: "Applications & ATS",
        icon: Target,
        href: "/applications",
      },
      {
        id: "cv-builder",
        label: "CV Builder",
        icon: FileEdit,
        href: "/cv-builder",
      },
      {
        id: "cover-letter",
        label: "Cover Letters",
        icon: Mail,
        href: "/cover-letter",
      },
      {
        id: "readiness",
        label: "Readiness Card",
        icon: Shield,
        href: "/readiness",
      },
    ],
  },
];

export const settingsItems: SidebarItem[] = [
  { id: "profile", label: "Profile", icon: User, href: "/settings/profile" },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    href: "/settings/security",
  },
  { id: "passkeys", label: "Passkeys", icon: Key, href: "/settings/passkeys" },
  {
    id: "two-factor",
    label: "Two-Factor",
    icon: Shield,
    href: "/settings/two-factor",
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
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/settings/notifications",
  },
  { id: "phone", label: "Phone", icon: Phone, href: "/settings/phone" },
  { id: "team", label: "Team", icon: Users2, href: "/settings/team" },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    href: "/settings/billing",
  },
];
