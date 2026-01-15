"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/custom/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserNav } from "@/components/custom/user-nav";

interface UserStats {
  totalInterviews: number;
  completedInterviews: number;
  upcomingInterviews: number;
  completionRate: number;
  averageScore?: number;
  recentInterviews: Array<{
    id: string;
    title: string;
    createdAt: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl p-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your account and explore your dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/settings">
                <Button variant="outline" size="icon">
                  <Icons.settings className="h-5 w-5" />
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 shadow-lg bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-primary to-primary/60">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p className="text-lg font-semibold">
                      {user.name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-lg font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email Status
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.emailVerified ? (
                        <>
                          <Icons.check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <Icons.alertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-600">
                            Not Verified
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-lg font-semibold">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Link href="/settings/profile">
                    <Button variant="default">
                      <Icons.user className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/settings/security">
                    <Button variant="outline">
                      <Icons.shield className="mr-2 h-4 w-4" />
                      Security Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalInterviews}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completedInterviews}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.upcomingInterviews}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completionRate}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Interviews */}
        {stats && stats.recentInterviews.length > 0 && (
          <Card className="mb-8 bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60 transition">
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Your latest interview activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{interview.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : interview.status === "scheduled"
                              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                              : "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground"
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60">
            <Link href="/settings/profile">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-1 ring-primary/20">
                    <Icons.user className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profile</CardTitle>
                    <CardDescription>Update your details</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60">
            <Link href="/settings/security">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center ring-1 ring-green-200 dark:ring-green-900/50">
                    <Icons.shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security</CardTitle>
                    <CardDescription>Manage your security</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60">
            <Link href="/settings/sessions">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center ring-1 ring-secondary/20">
                    <Icons.key className="h-6 w-6 text-secondary-foreground dark:text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sessions</CardTitle>
                    <CardDescription>Active devices</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60">
            <Link href="/settings/two-factor">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center ring-1 ring-orange-200 dark:ring-orange-900/50">
                    <Icons.shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Two-Factor Auth</CardTitle>
                    <CardDescription>Extra security</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60">
            <Link href="/settings/passkeys">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center ring-1 ring-pink-200 dark:ring-pink-900/50">
                    <Icons.fingerprint className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Passkeys</CardTitle>
                    <CardDescription>Biometric login</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-linear-to-br from-background to-muted/40 border-muted hover:border-primary/60">
            <Link href="/settings/connected-accounts">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center ring-1 ring-cyan-200 dark:ring-cyan-900/50">
                    <Icons.link className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Social Accounts</CardTitle>
                    <CardDescription>Link accounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/organizations">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                    <Icons.users className="h-6 w-6 text-accent-foreground dark:text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Organizations</CardTitle>
                    <CardDescription>Manage teams</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/settings/phone">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Icons.smartphone className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Phone Numbers</CardTitle>
                    <CardDescription>SMS authentication</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete your profile setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    user.emailVerified
                      ? "bg-green-100 dark:bg-green-900/20"
                      : "bg-primary/10 dark:bg-primary/20"
                  }`}
                >
                  {user.emailVerified ? (
                    <Icons.check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icons.mail className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {user.emailVerified
                      ? "Email Verified"
                      : "Verify Your Email"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.emailVerified
                      ? "Your email has been verified successfully"
                      : "Check your inbox for verification email"}
                  </p>
                </div>
                {!user.emailVerified && (
                  <Link href="/verify-email">
                    <Button variant="outline" size="sm">
                      Verify Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
