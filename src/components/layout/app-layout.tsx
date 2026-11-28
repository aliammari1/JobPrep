"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useWorkspaceNavigation } from "./use-workspace-navigation";

const Sidebar = dynamic(() => import("./sidebar").then((m) => m.Sidebar), {
  ssr: false,
});

const Navbar = dynamic(() => import("./navbar").then((m) => m.Navbar), {
  ssr: false,
});

const MobileWorkspaceNavigation = dynamic(
  () => import("./mobile-navigation").then((m) => m.MobileWorkspaceNavigation),
  { ssr: false },
);

const LandingNavbar = dynamic(
  () =>
    import("@/components/landing/landing-navbar").then((m) => m.LandingNavbar),
  { ssr: false },
);

const LandingFooter = dynamic(
  () =>
    import("@/components/landing/landing-footer").then((m) => m.LandingFooter),
  { ssr: false },
);

const CommandPalette = dynamic(
  () =>
    import("@/components/custom/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname === "/more" ||
    pathname === "/interview" ||
    pathname.startsWith("/saved-interviews/") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/interview-scheduler") ||
    pathname.startsWith("/interview-room") ||
    pathname.startsWith("/mock-interview") ||
    pathname.startsWith("/code-challenge") ||
    pathname.startsWith("/recordings") ||
    pathname.startsWith("/cv-builder") ||
    pathname.startsWith("/cover-letter") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/system-design") ||
    pathname.startsWith("/readiness");

  const isToolRoute =
    pathname.startsWith("/cv-builder") || pathname.startsWith("/cover-letter");

  const isAuthRoute =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/email-otp") ||
    pathname.startsWith("/magic-link") ||
    pathname.startsWith("/phone-signin") ||
    pathname.startsWith("/verify-2fa");

  const isFocusRoute =
    pathname.startsWith("/interview-room") ||
    pathname.startsWith("/code-challenge") ||
    pathname.startsWith("/system-design");

  const showDashboardLayout =
    !isPending && Boolean(session) && isDashboardRoute;
  const { mainRef, onBack } = useWorkspaceNavigation(
    pathname,
    showDashboardLayout,
  );
  const showLandingNavbar = !isDashboardRoute && !isAuthRoute;
  const showLandingFooter = showLandingNavbar && !isToolRoute;

  if (showDashboardLayout) {
    return (
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar onBack={onBack} />
          <main
            ref={mainRef}
            tabIndex={-1}
            className="jobprep-workspace-main min-h-0 min-w-0 flex-1 overflow-y-auto focus:outline-none"
          >
            {children}
          </main>
          {!isFocusRoute && (
            <div className="shrink-0 lg:hidden">
              <MobileWorkspaceNavigation />
            </div>
          )}
        </div>

        <CommandPalette />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showLandingNavbar && <LandingNavbar />}
      <div className="flex-1">{children}</div>
      {showLandingFooter && <LandingFooter />}
      <CommandPalette />
    </div>
  );
}
