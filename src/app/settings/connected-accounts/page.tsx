"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient, useSession } from "@/lib/auth-client";

interface Account {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  scopes: string[];
}

export default function ConnectedAccountsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      loadAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.listAccounts();
      if (result.data) {
        setAccounts(result.data);
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async (provider: "google") => {
    setError(null);
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: "/settings/connected-accounts",
      });
    } catch {
      setError(`Failed to link ${provider} account`);
    }
  };

  const [pendingUnlink, setPendingUnlink] = useState<{
    providerId: string;
    accountId: string;
  } | null>(null);

  const handleUnlinkAccount = (providerId: string, accountId: string) => {
    setPendingUnlink({ providerId, accountId });
  };

  const confirmUnlinkAccount = async () => {
    if (!pendingUnlink) return;
    const { providerId, accountId } = pendingUnlink;
    setPendingUnlink(null);

    setError(null);
    setSuccess(null);

    try {
      await authClient.unlinkAccount({
        providerId,
        accountId,
      });
      setSuccess("Account unlinked successfully");
      loadAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to unlink account");
    }
  };

  const isAccountLinked = (provider: string) => {
    return accounts.some(
      (acc) => acc.providerId.toLowerCase() === provider.toLowerCase(),
    );
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
    return null;
  }

  return (
    <div className="min-w-0">
      <div className="space-y-6">
        <div>
          <h1 className="sr-only font-display lg:not-sr-only lg:text-3xl lg:font-semibold lg:tracking-tight">
            Connected Accounts
          </h1>
          <p className="text-sm text-muted-foreground lg:mt-1">
            Link your social accounts for easier sign-in
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icons.alertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <Icons.check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Google */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Icons.google className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google</CardTitle>
                    <CardDescription>
                      {isAccountLinked("google")
                        ? "Connected to your Google account"
                        : "Connect your Google account"}
                    </CardDescription>
                  </div>
                </div>
                {isAccountLinked("google") ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Connected
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {isAccountLinked("google") ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const raw = accounts.find(
                        (a) => a.providerId.toLowerCase() === "google",
                      )?.createdAt;
                      const parsed = raw ? new Date(raw) : null;
                      return parsed && !Number.isNaN(parsed.getTime())
                        ? `Linked on ${parsed.toLocaleDateString()}`
                        : "Connected account";
                    })()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const account = accounts.find(
                        (a) => a.providerId.toLowerCase() === "google",
                      );
                      if (account)
                        handleUnlinkAccount(
                          account.providerId,
                          account.accountId,
                        );
                    }}
                  >
                    <Icons.unlink className="mr-2 h-4 w-4" />
                    Unlink
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleLinkAccount("google")}
                  variant="outline"
                  className="w-full"
                >
                  <Icons.link className="mr-2 h-4 w-4" />
                  Connect Google
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Alert>
            <Icons.info className="h-4 w-4" />
            <AlertDescription>
              <strong>Account Linking:</strong> You can link multiple
              authentication methods to your account. This allows you to sign in
              using any of your connected accounts.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <ConfirmDialog
        open={pendingUnlink !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUnlink(null);
        }}
        title="Unlink account"
        description="Are you sure you want to unlink this connected account?"
        confirmLabel="Unlink"
        destructive
        onConfirm={confirmUnlinkAccount}
      />
    </div>
  );
}
