"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthDivider, AuthShell } from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function TwoFactorChallengeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      router.push("/sign-in");
    }
  }, [searchParams, router]);

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authClient.twoFactor.verifyTotp({
        code,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Two-factor verification"
      description="Enter the 6-digit code from your authenticator app."
      footer={
        <div className="space-y-3 text-center text-sm text-muted-foreground">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
            disabled={isLoading}
          >
            Back to sign in
          </Button>
          <p>
            Need help?{" "}
            <Link
              href="/settings/two-factor"
              className="font-semibold text-primary hover:underline"
            >
              Manage 2FA settings
            </Link>
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <Icons.alertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <div className="flex justify-center">
              <InputOTP
                id="code"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={setCode}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-11 text-lg" />
                  <InputOTPSlot index={1} className="h-12 w-11 text-lg" />
                  <InputOTPSlot index={2} className="h-12 w-11 text-lg" />
                  <InputOTPSlot index={3} className="h-12 w-11 text-lg" />
                  <InputOTPSlot index={4} className="h-12 w-11 text-lg" />
                  <InputOTPSlot index={5} className="h-12 w-11 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Verify & continue
          </Button>
        </form>

        <AuthDivider label="Having trouble?" />

        <Alert>
          <Icons.info className="size-4" />
          <AlertDescription className="text-sm">
            If you&apos;ve lost access to your authenticator app, you can use
            one of your backup codes instead.
          </AlertDescription>
        </Alert>
      </div>
    </AuthShell>
  );
}

export default function TwoFactorChallengePage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Two-factor verification"
          description="Loading verification challenge..."
        >
          <div className="flex justify-center py-8">
            <Icons.spinner className="size-6 animate-spin text-muted-foreground" />
          </div>
        </AuthShell>
      }
    >
      <TwoFactorChallengeContent />
    </Suspense>
  );
}
