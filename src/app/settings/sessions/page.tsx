"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/custom/icons";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserNav } from "@/components/custom/user-nav";

interface Session {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  expiresAt: Date;
  token: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const result = await authClient.listSessions();

      if (result.error) {
        setError("Failed to load sessions");
      } else {
        setSessions(result.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadSessions();
    }
  }, [session, loadSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await authClient.revokeSession({
        token: sessionId,
      });

      if (result.error) {
        setError("Failed to revoke session");
      } else {
        setSuccess("Session revoked successfully");
        loadSessions();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Failed to revoke session");
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setError(null);
    setSuccess(null);

    if (
      !confirm(
        "Are you sure you want to revoke all other sessions? You will be logged out from all other devices."
      )
    ) {
      return;
    }

    try {
      const result = await authClient.revokeOtherSessions();

      if (result.error) {
        setError("Failed to revoke other sessions");
      } else {
        setSuccess("All other sessions revoked successfully");
        loadSessions();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Failed to revoke other sessions");
    }
  };

  if (isPending || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const parseUserAgent = (ua?: string | null) => {
    if (!ua) return { browser: "Unknown", os: "Unknown" };

    const browser = ua.includes("Chrome")
      ? "Chrome"
      : ua.includes("Firefox")
      ? "Firefox"
      : ua.includes("Safari")
      ? "Safari"
      : ua.includes("Edge")
      ? "Edge"
      : "Unknown";

    const os = ua.includes("Windows")
      ? "Windows"
      : ua.includes("Mac")
      ? "macOS"
      : ua.includes("Linux")
      ? "Linux"
      : ua.includes("Android")
      ? "Android"
      : ua.includes("iOS")
      ? "iOS"
      : "Unknown";

    return { browser, os };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <UserNav />
          </div>
          <h1 className="text-4xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage devices where you're currently signed in
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <Link href="/settings/profile">
            <Button variant="outline">Profile</Button>
          </Link>
          <Link href="/settings/security">
            <Button variant="outline">Security</Button>
          </Link>
          <Link href="/settings/sessions">
            <Button variant="default">Sessions</Button>
          </Link>
          <Link href="/settings/two-factor">
            <Button variant="outline">Two-Factor</Button>
          </Link>
          <Link href="/settings/passkeys">
            <Button variant="outline">Passkeys</Button>
          </Link>
          <Link href="/settings/connected-accounts">
            <Button variant="outline">Connected Accounts</Button>
          </Link>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <Icons.check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Revoke All Sessions */}
        {sessions.length > 1 && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleRevokeAllOtherSessions}
              className="w-full md:w-auto"
            >
              <Icons.logout className="mr-2 h-4 w-4" />
              Revoke All Other Sessions
            </Button>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No active sessions found
                </p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((sess) => {
              const { browser, os } = parseUserAgent(sess.userAgent);
              const isCurrentSession = session.session?.token === sess.token;

              return (
                <Card key={sess.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Icons.key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {browser} on {os}
                            {isCurrentSession && (
                              <Badge variant="default">Current Session</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {sess.ipAddress || "Unknown IP"}
                          </CardDescription>
                        </div>
                      </div>
                      {!isCurrentSession && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeSession(sess.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(sess.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="font-medium">
                          {new Date(sess.expiresAt).toLocaleString()}
                        </span>
                      </div>
                      {sess.userAgent && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground text-xs">
                            User Agent
                          </span>
                          <p className="text-xs font-mono mt-1 break-all">
                            {sess.userAgent}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Security Notice */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.info className="h-5 w-5" />
              Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you see any sessions you don't recognize, revoke them
              immediately and change your password. This could indicate
              unauthorized access to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
