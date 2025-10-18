"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/custom/icons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { UserNav } from "@/components/custom/user-nav";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    username: (session?.user as { username?: string })?.username || "",
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: { name: string; image?: string; username?: string } = {
        name: formData.name,
        image: formData.image || undefined,
      };

      if (formData.username) {
        updateData.username = formData.username;
      }

      const result = await authClient.updateUser(updateData);

      if (result.error) {
        setError(result.error.message || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const initials =
    formData.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    session.user.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Header */}
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
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <Link href="/settings/profile">
            <Button variant="default">Profile</Button>
          </Link>
          <Link href="/settings/security">
            <Button variant="outline">Security</Button>
          </Link>
          <Link href="/settings/sessions">
            <Button variant="outline">Sessions</Button>
          </Link>
          <Link href="/settings/two-factor">
            <Button variant="outline">Two-Factor</Button>
          </Link>
          <Link href="/settings/passkeys">
            <Button variant="outline">Passkeys</Button>
          </Link>
          <Link href="/settings/connected-accounts">
            <Button variant="outline">Connected Accounts</Button>
          </Link>
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

        {/* Profile Picture */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage
                  src={formData.image || undefined}
                  alt={formData.name || "User"}
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter a URL to your profile picture
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Your unique username. Must be 3-20 characters, letters,
                  numbers, and underscores only.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-11 bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update
                  it.
                </p>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Email Verification Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              Verify your email address for better security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    session.user.emailVerified
                      ? "bg-green-100 dark:bg-green-900/20"
                      : "bg-yellow-100 dark:bg-yellow-900/20"
                  }`}
                >
                  {session.user.emailVerified ? (
                    <Icons.check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icons.alertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {session.user.emailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.emailVerified
                      ? "Your email address is verified"
                      : "Please verify your email address"}
                  </p>
                </div>
              </div>
              {!session.user.emailVerified && (
                <Link href="/verify-email">
                  <Button variant="outline">Verify Email</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
