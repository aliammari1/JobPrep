"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { authClient, useSession } from "@/lib/auth-client";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (isPending) {
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setError(result.error.message || "Failed to update password");
      } else {
        setSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);

  const handleToggle2FA = async () => {
    setError(null);
    setSuccess(null);

    if (!twoFactorEnabled) {
      router.push("/settings/two-factor");
    } else {
      setShowDisable2FADialog(true);
    }
  };

  const handleConfirmDisable2FA = async (password: string) => {
    setIsLoading(true);
    try {
      const result = await authClient.twoFactor.disable({ password });

      if (result.error) {
        setError(result.error.message || "Failed to disable 2FA");
      } else {
        setTwoFactorEnabled(false);
        setSuccess("Two-factor authentication disabled");
        setShowDisable2FADialog(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      <div className="space-y-6">
        <div>
          <h1 className="sr-only font-display lg:not-sr-only lg:text-3xl lg:font-semibold lg:tracking-tight">
            Security Settings
          </h1>
          <p className="text-sm text-muted-foreground lg:mt-1">
            Manage your password and security preferences
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

        {/* Change Password */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Icons.shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorEnabled
                      ? "Your account is protected with 2FA"
                      : "Protect your account with an extra layer of security"}
                  </p>
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
              />
            </div>
            {twoFactorEnabled && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is currently enabled. You'll need to
                  enter a code from your authenticator app when signing in.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
            <CardDescription>Tips to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Use a strong, unique password</p>
                  <p className="text-sm text-muted-foreground">
                    Include a mix of letters, numbers, and special characters
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Enable two-factor authentication
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Review active sessions regularly
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check for any unauthorized access to your account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Keep your email verified</p>
                  <p className="text-sm text-muted-foreground">
                    Ensures you can recover your account if needed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <PasswordConfirmDialog
        open={showDisable2FADialog}
        onOpenChange={setShowDisable2FADialog}
        title="Disable two-factor authentication"
        description="Enter your current password to disable 2FA on your account."
        confirmLabel="Disable 2FA"
        destructive
        isLoading={isLoading}
        onConfirm={handleConfirmDisable2FA}
      />
    </div>
  );
}
