"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { PasswordConfirmDialog } from "@/components/custom/confirm-dialog";
import { Icons } from "@/components/custom/icons";
import { UserNav } from "@/components/custom/user-nav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { authClient, useSession } from "@/lib/auth-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      // Get 2FA status from session data
      setTwoFactorEnabled(session.user.twoFactorEnabled || false);
      setIsCheckingStatus(false);
    }
  }, [session]);

  const [passwordAction, setPasswordAction] = useState<
    "enable" | "disable" | null
  >(null);

  const handleEnable2FA = () => {
    setError(null);
    setPasswordAction("enable");
  };

  const handleDisable2FA = () => {
    setError(null);
    setPasswordAction("disable");
  };

  const handlePasswordConfirm = async (password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      if (passwordAction === "enable") {
        const result = await authClient.twoFactor.enable({ password });
        if (result.error) {
          setError(result.error.message || "Failed to enable 2FA");
          return;
        }
        const totpURI = result.data?.totpURI;
        const nextBackupCodes = result.data?.backupCodes;
        if (totpURI) {
          const qr = await QRCode.toDataURL(totpURI);
          setQrCode(qr);
          const secretMatch = totpURI.match(/secret=([A-Z2-7]+)/);
          if (secretMatch) setSecret(secretMatch[1]);
        }
        if (nextBackupCodes) setBackupCodes(nextBackupCodes);
        setPasswordAction(null);
      } else if (passwordAction === "disable") {
        const result = await authClient.twoFactor.disable({ password });
        if (result.error) {
          setError(result.error.message || "Failed to disable 2FA");
          return;
        }
        setSuccess("2FA disabled successfully");
        setTwoFactorEnabled(false);
        setBackupCodes([]);
        setPasswordAction(null);
      }
    } catch {
      setError(
        passwordAction === "enable"
          ? "Failed to enable 2FA"
          : "Failed to disable 2FA",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (result.error) {
        setError(result.error.message || "Invalid code");
        return;
      }

      setSuccess("2FA enabled successfully!");
      setTwoFactorEnabled(true);
      setQrCode("");
      setVerificationCode("");
    } catch {
      setError("Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isCheckingStatus) {
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
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-muted-foreground lg:mt-1">
            Add an extra layer of security to your account
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Authenticator App</CardTitle>
                <CardDescription>
                  Use an authenticator app to generate verification codes
                </CardDescription>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleEnable2FA();
                  } else {
                    handleDisable2FA();
                  }
                }}
                disabled={isLoading}
              />
            </div>
          </CardHeader>

          {qrCode && (
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with your authenticator app (Google
                    Authenticator, Authy, etc.)
                  </p>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Or enter this key manually:
                  </h3>
                  <code className="block p-3 bg-muted rounded text-sm font-mono break-all">
                    {secret}
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 2: Verify Code</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="code">
                        Enter the 6-digit code from your app
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>
                    <Button
                      onClick={handleVerify2FA}
                      disabled={verificationCode.length !== 6 || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify and Enable"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          {backupCodes.length > 0 && (
            <CardContent>
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 mb-4">
                <Icons.alertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                  <strong>Save your backup codes!</strong> Store these codes in
                  a safe place. You can use them to access your account if you
                  lose your authenticator device.
                </AlertDescription>
              </Alert>
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const text = backupCodes.join("\n");
                    navigator.clipboard.writeText(text);
                    setSuccess("Backup codes copied to clipboard!");
                    setTimeout(() => setSuccess(null), 2000);
                  }}
                >
                  <Icons.copy className="mr-2 h-4 w-4" />
                  Copy Codes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const text = backupCodes.join("\n");
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "2fa-backup-codes.txt";
                    a.click();
                  }}
                >
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          )}

          {twoFactorEnabled && !qrCode && backupCodes.length === 0 && (
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-900/20">
                <Icons.check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    2FA is enabled
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      <PasswordConfirmDialog
        open={passwordAction !== null}
        onOpenChange={(open) => {
          if (!open) setPasswordAction(null);
        }}
        title={
          passwordAction === "disable"
            ? "Disable two-factor authentication"
            : "Enable two-factor authentication"
        }
        description={
          passwordAction === "disable"
            ? "Disabling 2FA reduces account security. Enter your current password to confirm."
            : "Enter your current password to generate a 2FA authenticator setup code."
        }
        confirmLabel={passwordAction === "disable" ? "Disable 2FA" : "Continue"}
        destructive={passwordAction === "disable"}
        isLoading={isLoading}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  );
}
