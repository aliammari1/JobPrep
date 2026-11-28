"use client";

import {
  Bell,
  Briefcase,
  CalendarCheck,
  Code2,
  FileEdit,
  HelpCircle,
  Home,
  Key,
  Link2,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Phone,
  Shield,
  Sun,
  Target,
  Users,
  Users2,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut, useSession } from "@/lib/auth-client";

interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const previousFocus = React.useRef<HTMLElement | null>(null);
  const { setTheme } = useTheme();
  const { data: session } = useSession();

  const commands: PaletteCommand[] = [
    // Navigation
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Go to dashboard",
      icon: <Home className="w-4 h-4" />,
      href: "/dashboard",
      category: "Navigation",
      keywords: ["home", "dashboard", "main"],
    },
    {
      id: "mock-interview",
      label: "Mock Interview",
      description: "Start a mock interview",
      icon: <Target className="w-4 h-4" />,
      href: "/mock-interview",
      category: "Interviews",
      keywords: ["interview", "practice", "mock"],
    },
    {
      id: "interview-room",
      label: "Interview Room",
      description: "Join an interview room",
      icon: <Video className="w-4 h-4" />,
      href: "/interview-room",
      category: "Interviews",
      keywords: ["video", "call", "room", "meeting"],
    },
    {
      id: "interview-scheduler",
      label: "Interview Scheduler",
      description: "Schedule an interview",
      icon: <CalendarCheck className="w-4 h-4" />,
      href: "/interview-scheduler",
      category: "Interviews",
      keywords: ["schedule", "calendar", "book"],
    },
    {
      id: "code-challenge",
      label: "Code Challenge",
      description: "Start a coding challenge",
      icon: <Code2 className="w-4 h-4" />,
      href: "/code-challenge",
      category: "Interviews",
      keywords: ["code", "programming", "challenge"],
    },
    {
      id: "cv-builder",
      label: "CV Builder",
      description: "Build your CV",
      icon: <FileEdit className="w-4 h-4" />,
      href: "/cv-builder",
      category: "Career Tools",
      keywords: ["resume", "cv", "create", "build"],
    },
    {
      id: "cover-letter",
      label: "Cover Letter Generator",
      description: "Generate a cover letter",
      icon: <Mail className="w-4 h-4" />,
      href: "/cover-letter",
      category: "Career Tools",
      keywords: ["letter", "cover", "generate"],
    },
    {
      id: "system-design",
      label: "System Design",
      description: "Practice designing systems",
      icon: <Monitor className="size-4" />,
      href: "/system-design",
      category: "Interviews",
      keywords: ["architecture", "whiteboard", "diagram"],
    },
    {
      id: "applications",
      label: "Applications & ATS",
      icon: <Briefcase className="size-4" />,
      href: "/applications",
      category: "Career Tools",
      keywords: ["jobs", "tracker"],
    },
    // Settings
    {
      id: "profile-settings",
      label: "Profile Settings",
      description: "Manage your profile",
      icon: <Users className="w-4 h-4" />,
      href: "/settings/profile",
      category: "Settings",
      keywords: ["profile", "account", "personal"],
    },
    {
      id: "security",
      label: "Security settings",
      description: "Security and privacy",
      icon: <Shield className="w-4 h-4" />,
      href: "/settings/security",
      category: "Settings",
      keywords: ["security", "password", "protection"],
    },
    {
      id: "two-factor",
      label: "Two-Factor Authentication",
      description: "Enable 2FA",
      icon: <Shield className="w-4 h-4" />,
      href: "/settings/two-factor",
      category: "Settings",
      keywords: ["2fa", "authentication", "security"],
    },
    {
      id: "passkeys",
      label: "Passkeys",
      description: "Manage passkeys",
      icon: <Key className="w-4 h-4" />,
      href: "/settings/passkeys",
      category: "Settings",
      keywords: ["passkey", "security", "login"],
    },
    {
      id: "phone",
      label: "Phone Settings",
      description: "Phone verification",
      icon: <Phone className="w-4 h-4" />,
      href: "/settings/phone",
      category: "Settings",
      keywords: ["phone", "mobile", "number"],
    },
    {
      id: "connected-accounts",
      label: "Connected Accounts",
      description: "Manage connected accounts",
      icon: <Link2 className="w-4 h-4" />,
      href: "/settings/connected-accounts",
      category: "Settings",
      keywords: ["account", "social", "connect"],
    },
    {
      id: "sessions",
      label: "Active Sessions",
      description: "Manage active sessions",
      icon: <Monitor className="w-4 h-4" />,
      href: "/settings/sessions",
      category: "Settings",
      keywords: ["session", "device", "login"],
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Notification preferences",
      icon: <Bell className="w-4 h-4" />,
      href: "/settings/notifications",
      category: "Settings",
      keywords: ["notification", "alert", "email"],
    },
    {
      id: "team",
      label: "Team Settings",
      description: "Team management",
      icon: <Users2 className="w-4 h-4" />,
      href: "/settings/team",
      category: "Settings",
      keywords: ["team", "members", "organization"],
    },
    // Theme
    {
      id: "light-theme",
      label: "Light Theme",
      description: "Switch to light theme",
      icon: <Sun className="w-4 h-4" />,
      action: () => setTheme("light"),
      category: "Theme",
      keywords: ["theme", "light", "appearance"],
    },
    {
      id: "dark-theme",
      label: "Dark Theme",
      description: "Switch to dark theme",
      icon: <Moon className="w-4 h-4" />,
      action: () => setTheme("dark"),
      category: "Theme",
      keywords: ["theme", "dark", "appearance"],
    },
    // Account
    {
      id: "help",
      label: "Help & Support",
      description: "Get help and support",
      icon: <HelpCircle className="w-4 h-4" />,
      href: "/contact",
      category: "Help",
      keywords: ["help", "support", "faq"],
    },
  ];

  // Add logout command if user is logged in
  if (session?.user) {
    commands.push({
      id: "logout",
      label: "Logout",
      description: "Sign out of your account",
      icon: <LogOut className="w-4 h-4" />,
      action: async () => {
        await signOut();
        router.push("/");
        setOpen(false);
      },
      category: "Account",
      keywords: ["logout", "sign out", "exit"],
    });
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "k" &&
        !e.altKey &&
        !e.shiftKey &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        if (e.repeat) return;
        const active = document.activeElement;
        if (
          active instanceof HTMLElement &&
          !active.closest('[data-slot="dialog-content"]')
        ) {
          previousFocus.current = active;
        }
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (command: PaletteCommand) => {
    if (command.href) {
      router.push(command.href);
    } else if (command.action) {
      command.action();
    }
    setOpen(false);
  };

  const groupedCommands = commands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, PaletteCommand[]>,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0 shadow-lg"
        onCloseAutoFocus={(event) => {
          if (previousFocus.current?.isConnected) {
            event.preventDefault();
            previousFocus.current.focus();
          }
          previousFocus.current = null;
        }}
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search for a workspace page or command.
        </DialogDescription>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:overflow-hidden [&_[cmdk-group-heading]]:line-clamp-1 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12">
          <CommandInput
            aria-label="Search commands"
            placeholder="Search commands..."
          />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([category, items]) => (
              <React.Fragment key={category}>
                <CommandGroup heading={category}>
                  {items.map((command) => (
                    <CommandItem
                      key={command.id}
                      value={command.id}
                      keywords={[command.label, ...(command.keywords ?? [])]}
                      onSelect={() => handleSelect(command)}
                      className="cursor-pointer"
                    >
                      {command.icon && (
                        <div className="mr-2 flex h-4 w-4 items-center justify-center">
                          {command.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{command.label}</p>
                        {command.description && (
                          <p className="text-xs text-muted-foreground">
                            {command.description}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
