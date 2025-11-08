"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { useSession } from "@/lib/auth-client";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // Determine if we should show the dashboard layout (sidebar + navbar)
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/schedule-interview") ||
    pathname.startsWith("/interview-scheduler") ||
    pathname.startsWith("/interview-room") ||
    pathname.startsWith("/mock-interview") ||
    pathname.startsWith("/mock-simulator") ||
    pathname.startsWith("/practice-interview") ||
    pathname.startsWith("/voice-interview") ||
    pathname.startsWith("/code-challenge") ||
    pathname.startsWith("/collaborative-evaluation") ||
    pathname.startsWith("/ai-analysis") ||
    pathname.startsWith("/ai-feedback") ||
    pathname.startsWith("/performance-analytics") ||
    pathname.startsWith("/interview-analytics") ||
    pathname.startsWith("/interview-insights") ||
    pathname.startsWith("/interview-dashboard") ||
    pathname.startsWith("/interview-coach") ||
    pathname.startsWith("/replay-center") ||
    pathname.startsWith("/video-recorder") ||
    pathname.startsWith("/screen-sharing") ||
    pathname.startsWith("/adaptive-questions") ||
    pathname.startsWith("/skill-assessment") ||
    pathname.startsWith("/question-builder") ||
    pathname.startsWith("/templates-library") ||
    pathname.startsWith("/candidate-profile") ||
    pathname.startsWith("/feedback") ||
    pathname.startsWith("/organizations") ||
    pathname.startsWith("/admin");

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

  // Show dashboard layout only if authenticated and on a dashboard route
  const showDashboardLayout = !isPending && session && isDashboardRoute;

  // Show landing navbar on public pages (not auth pages, not dashboard)
  const showLandingNavbar = !isDashboardRoute && !isAuthRoute;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Open sidebar on larger screens, close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Dashboard layout with sidebar and navbar
  if (showDashboardLayout) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onClose={closeSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar onSidebarToggle={toggleSidebar} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  // Landing/public layout with landing navbar
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showLandingNavbar && <LandingNavbar />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {children}
      </motion.div>
      {showLandingNavbar && <LandingFooter />}
    </div>
  );
}
