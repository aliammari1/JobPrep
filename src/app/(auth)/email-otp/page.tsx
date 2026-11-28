"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function EmailOTPPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message || "Failed to send OTP");
      } else {
        setStep("verify");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (result.error) {
        setError(result.error.message || "Invalid OTP code");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message || "Failed to resend OTP");
      } else {
        setError(null);
        setResent(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === "email" ? "Email code sign in" : "Enter your code"}
      description={
        step === "email"
          ? "Enter your email to receive a 6-digit one-time code."
          : `Enter the 6-digit code we sent to ${email}.`
      }
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
            <Icons.alertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Icons.send className="mr-2 size-4" />
                  Send one-time code
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            {resent && (
              <Alert>
                <Icons.check className="size-4 text-primary" />
                <AlertDescription>
                  A new code has been sent to <strong>{email}</strong>.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">6-digit code</Label>
              <div className="flex justify-center">
                <InputOTP
                  id="otp"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={setOtp}
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
              <p className="text-center text-xs text-muted-foreground">
                Code expires in 5 minutes
              </p>
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & sign in"
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => setStep("email")}
              >
                ← Change email
              </Button>
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend code
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
