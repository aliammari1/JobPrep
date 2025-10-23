"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { UserNav } from "@/components/custom/user-nav";

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

  const handleUnlinkAccount = async (providerId: string, accountId: string) => {
    if (!confirm("Are you sure you want to unlink this account?")) {
      return;
    }

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
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
          <h1 className="text-4xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Link your social accounts for easier sign-in
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="connected-accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile" asChild>
              <Link href="/settings/profile">Profile</Link>
            </TabsTrigger>
            <TabsTrigger value="security" asChild>
              <Link href="/settings/security">Security</Link>
            </TabsTrigger>
            <TabsTrigger value="sessions" asChild>
              <Link href="/settings/sessions">Sessions</Link>
            </TabsTrigger>
            <TabsTrigger value="two-factor" asChild>
              <Link href="/settings/two-factor">Two-Factor</Link>
            </TabsTrigger>
            <TabsTrigger value="passkeys" asChild>
              <Link href="/settings/passkeys">Passkeys</Link>
            </TabsTrigger>
            <TabsTrigger value="connected-accounts">Connected</TabsTrigger>
            <TabsTrigger value="phone" asChild>
              <Link href="/settings/phone">Phone</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icons.alertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-600">
            <Icons.check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
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
                    className="bg-green-100 text-green-700"
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
                    Linked on{" "}
                    {new Date(
                      accounts.find(
                        (a) => a.providerId.toLowerCase() === "google",
                      )?.createdAt || "",
                    ).toLocaleDateString()}
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
    </div>
  );
}
