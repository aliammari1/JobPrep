"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AuthShell, safeCallbackUrl } from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackURL"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState("");

  const verifyWithToken = useCallback(
    async (verificationToken: string) => {
      const result = await authClient.verifyEmail({
        query: { token: verificationToken },
      });
      if (result.error) {
        setError(
          result.error.message ||
            "This link is invalid or expired. Request a new one below.",
        );
      } else {
        setVerified(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 2500);
      }
    },
    [router, callbackUrl],
  );

  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    }
  }, [token, verifyWithToken]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: callbackUrl,
    });
    setIsLoading(false);
    if (result.error) {
      setError(result.error.message || "Couldn't send the verification email.");
    } else {
      setResent(true);
    }
  };

  if (token && !verified && !error) {
    return (
      <AuthShell
        title="Verifying your email"
        description="One moment while we confirm your address."
      >
        <div className="flex justify-center py-4">
          <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AuthShell>
    );
  }

  if (verified) {
    return (
      <AuthShell
        title="Email verified"
        description="Your account is active. Taking you to your dashboard…"
      >
        <div className="flex justify-center">
          <span className="grid size-16 place-items-center rounded-full bg-green-500/15">
            <Icons.check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </span>
        </div>
        <Button asChild className="h-11 w-full">
          <Link href={callbackUrl}>Go to dashboard</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      description="Enter your address and we'll send you a fresh verification link."
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {resent ? (
        <Alert>
          <Icons.mail className="h-4 w-4" />
          <AlertDescription>
            Link sent to {email}. Check your inbox and spam folder.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleResend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send verification link
          </Button>
        </form>
      )}
      <Button asChild variant="ghost" className="w-full">
        <Link href="/sign-in">
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </Button>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Loading" description="Preparing verification…">
          <div className="flex justify-center py-4">
            <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
          </div>
        </AuthShell>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
