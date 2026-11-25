"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

const Sidebar = dynamic(() => import("./sidebar").then((m) => m.Sidebar), {
  ssr: false,
});

const Navbar = dynamic(() => import("./navbar").then((m) => m.Navbar), {
  ssr: false,
});

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
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
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

  const showDashboardLayout = !isPending && session && isDashboardRoute;
  const showLandingNavbar = !isDashboardRoute && !isAuthRoute;
  const showLandingFooter = showLandingNavbar && !isToolRoute;

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  if (showDashboardLayout) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onClose={closeSidebar}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onSidebarToggle={toggleSidebar} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto">{children}</main>
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
