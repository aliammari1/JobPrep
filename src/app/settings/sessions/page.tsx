"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { Icons } from "@/components/custom/icons";
import { UserNav } from "@/components/custom/user-nav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";

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
        setError(null);
        setSessions(result.data || []);
      }
    } catch {
      setError("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signedIn = Boolean(session);
  useEffect(() => {
    if (signedIn) void loadSessions();
  }, [signedIn, loadSessions]);

  const handleRevokeSession = async (sessionToken: string) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await authClient.revokeSession({
        token: sessionToken,
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

  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);

  const handleRevokeAllOtherSessions = () => {
    setShowRevokeAllConfirm(true);
  };

  const confirmRevokeAllOtherSessions = async () => {
    setShowRevokeAllConfirm(false);
    setError(null);
    setSuccess(null);

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
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const parseUserAgent = (ua?: string | null) => {
    if (!ua) return { browser: "Unknown", os: "Unknown" };

    const browser = /Edg(?:A|iOS)?\//.test(ua)
      ? "Edge"
      : /(?:Chrome|CriOS)\//.test(ua)
        ? "Chrome"
        : /(?:Firefox|FxiOS)\//.test(ua)
          ? "Firefox"
          : ua.includes("Safari")
            ? "Safari"
            : "Unknown";

    const os = ua.includes("Android")
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : ua.includes("Windows")
          ? "Windows"
          : ua.includes("Mac")
            ? "macOS"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown";

    return { browser, os };
  };

  return (
    <div className="min-w-0">
      <div className="space-y-6">
        <div>
          <h1 className="sr-only font-display lg:not-sr-only lg:text-3xl lg:font-semibold lg:tracking-tight">
            Active Sessions
          </h1>
          <p className="text-sm text-muted-foreground lg:mt-1">
            Manage devices where you&apos;re currently signed in
          </p>
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
              const isCurrentSession = session.session?.id === sess.id;

              return (
                <Card key={sess.id} className="min-w-0 shadow-none">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Icons.key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                            {browser} on {os}
                            {isCurrentSession && (
                              <Badge variant="default">Current Session</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="[overflow-wrap:anywhere]">
                            {sess.ipAddress || "Unknown IP"}
                          </CardDescription>
                        </div>
                      </div>
                      {!isCurrentSession && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeSession(sess.token)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(sess.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="font-medium">
                          {new Date(sess.expiresAt).toLocaleString()}
                        </span>
                      </div>
                      {sess.userAgent && (
                        <details className="border-t">
                          <summary className="min-h-11 cursor-pointer py-3 text-muted-foreground">
                            Browser details
                          </summary>
                          <p className="break-all text-xs font-mono">
                            {sess.userAgent}
                          </p>
                        </details>
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
      <ConfirmDialog
        open={showRevokeAllConfirm}
        onOpenChange={setShowRevokeAllConfirm}
        title="Revoke all other sessions"
        description="You will be signed out on all other devices immediately."
        confirmLabel="Revoke all"
        destructive
        onConfirm={confirmRevokeAllOtherSessions}
      />
    </div>
  );
}
