"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Icons } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { authClient } from "@/lib/auth-client";

export default function PhoneSignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });

      setStep("code");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.verify({
        phoneNumber,
        code,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={
        step === "phone" ? "Sign in with phone" : "Enter verification code"
      }
      description={
        step === "phone"
          ? "Enter your phone number to receive an SMS verification code."
          : `Enter the 6-digit code sent to ${phoneNumber}.`
      }
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Want to use a different method?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline"
          >
            Other options
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <PhoneInput
                id="phoneNumber"
                value={phoneNumber}
                onChange={setPhoneNumber}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Select your country code and enter your mobile number
              </p>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Send code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
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

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Verify & sign in
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Button
                type="button"
                variant="link"
                onClick={() => setStep("phone")}
                disabled={isLoading}
                className="px-0"
              >
                ← Change number
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={isLoading}
                className="px-0"
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
