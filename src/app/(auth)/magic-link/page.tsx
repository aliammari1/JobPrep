"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
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
import { Icons } from "@/components/custom/icons";
import Link from "next/link";

export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Failed to send magic link");
      } else {
        setSent(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icons.mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Magic Link Sign In</CardTitle>
          <CardDescription>
            {sent
              ? "Check your email for the magic link"
              : "Enter your email to receive a magic link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <Alert className="border-green-600">
                <Icons.check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  <strong>Check your email!</strong> We've sent a magic link to{" "}
                  <strong>{email}</strong>. Click the link to sign in.
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• The link will expire in 10 minutes</p>
                <p>• Check your spam folder if you don't see it</p>
                <p>• You can close this window</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
              >
                Send another link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <Icons.alertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icons.send className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-3 text-center text-sm">
            <Link
              href="/sign-in"
              className="block text-primary hover:underline"
            >
              ← Back to sign in
            </Link>
            <div className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
