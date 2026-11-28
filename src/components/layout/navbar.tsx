"use client";

import {
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  Video,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "@/lib/auth-client";

const MobileWorkspaceHeader = dynamic(
  () => import("./mobile-navigation").then((m) => m.MobileWorkspaceHeader),
  { ssr: false },
);

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/more": "More",
  "/interview": "Interview Studio",
  "/code-challenge/onboarding": "Code Challenge Setup",
  "/mock-interview": "Mock Interview",
  "/mock-interview/questions": "Question Bank",
  "/interview-room": "Interview Room",
  "/interview-scheduler": "Scheduler",
  "/code-challenge": "Code Challenge",
  "/recordings": "Recordings",
  "/cv-builder": "CV Builder",
  "/cover-letter": "Cover Letters",
  "/applications": "Applications & ATS",
  "/system-design": "System Design",
  "/readiness": "Readiness Scorecard",
  "/settings/profile": "Profile Settings",
  "/settings/security": "Security",
  "/settings/two-factor": "Two-Factor Auth",
  "/settings/passkeys": "Passkeys",
  "/settings/phone": "Phone",
  "/settings/connected-accounts": "Connected Accounts",
  "/settings/sessions": "Active Sessions",
  "/settings/notifications": "Notifications",
  "/settings/team": "Team",
  "/settings/billing": "Billing",
};

export function Navbar({ onBack }: { onBack?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const triggerCommandPalette = () => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        code: "KeyK",
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
      }),
    );
  };

  const pageLabel =
    ROUTE_LABELS[pathname] ??
    (pathname.startsWith("/saved-interviews/")
      ? "Interview Transcript"
      : "Workspace");

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="lg:hidden">
        <MobileWorkspaceHeader
          title={pageLabel}
          onBack={onBack}
          isDark={mounted && resolvedTheme === "dark"}
          onToggleTheme={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          onSearch={triggerCommandPalette}
        />
      </div>
      <div className="hidden h-14 items-center justify-between gap-4 px-6 lg:flex">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm font-medium text-muted-foreground">
            {pageLabel}
          </span>
        </div>

        {/* Right: Quick search, real actions, theme toggle, account */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerCommandPalette}
            className="hidden md:inline-flex h-8 w-56 items-center justify-between rounded-md border border-border bg-muted/50 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5" />
              Search workspaces…
            </span>
            <kbd className="font-mono text-[10px]">⌘K</kbd>
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
              <Link href="/interview-room">
                <Video className="size-3.5" />
                Join room
              </Link>
            </Button>
            <Button asChild size="sm" className="h-8 gap-1.5">
              <Link href="/interview-scheduler">
                <Plus className="size-3.5" />
                Schedule
              </Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle color theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="relative size-8 rounded-full p-0"
                  aria-label="Open account menu"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
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
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {session.user.name || "User"}
                  </p>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={session.user.email}
                  >
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/settings/profile")}
                >
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings/security")}
                >
                  <Settings className="mr-2 size-4" />
                  Security &amp; Preferences
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings/billing")}
                >
                  <CreditCard className="mr-2 size-4" />
                  Billing &amp; Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/contact")}>
                  <HelpCircle className="mr-2 size-4" />
                  Help &amp; Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="h-8">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
