"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/reset-password",
      });

      if (result.error) {
        setError(result.error.message || "Failed to send reset email");
      } else {
        setSuccess(true);
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
        title="Check your email"
        description="We sent password reset instructions to your inbox."
        footer={
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSuccess(false)}
            >
              Try another email
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icons.mail className="size-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              Reset instructions sent to{" "}
              <strong className="text-foreground">{email}</strong>.
            </p>
          </div>
          <Alert>
            <Icons.info className="size-4" />
            <AlertDescription>
              Didn&apos;t receive the email? Check your spam folder or try again
              in a few minutes.
            </AlertDescription>
          </Alert>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      description="Enter your email and we'll send you reset instructions."
      footer={
        <div className="space-y-3 text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
          >
            <Icons.arrowLeft className="size-4" />
            Back to sign in
          </Link>
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
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

          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Send reset instructions
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
