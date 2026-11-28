"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const errorFromUrl = searchParams.get("error");

    if (errorFromUrl === "INVALID_TOKEN") {
      setError(
        "This reset link is invalid or has expired. Please request a new one.",
      );
    } else if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("No reset token found. Please request a new password reset.");
    }
  }, [searchParams]);

  const validatePasswords = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "Failed to reset password");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Password updated"
        description="Your password has been reset. Redirecting to sign in..."
        footer={
          <Button asChild className="h-11 w-full">
            <Link href="/sign-in">Go to sign in</Link>
          </Button>
        }
      >
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Icons.check className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            You can now sign in with your new password.
          </p>
        </div>
      </AuthShell>
    );
  }

  if (error && !token) {
    return (
      <AuthShell
        title="Invalid reset link"
        description="This link is missing, expired, or has already been used."
        footer={
          <div className="flex flex-col gap-2">
            <Button asChild className="h-11 w-full">
              <Link href="/forgot-password">Request new reset link</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        }
      >
        <Alert variant="destructive">
          <Icons.alertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      description="Choose a new password for your JobPrep account."
      footer={
        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Icons.arrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isLoading || !token}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Reset password
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Reset password"
          description="Validating your reset link..."
        >
          <div className="flex justify-center py-8">
            <Icons.spinner className="size-6 animate-spin text-muted-foreground" />
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
