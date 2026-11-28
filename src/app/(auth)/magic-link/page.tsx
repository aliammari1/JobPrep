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
    <AuthShell
      title="Magic Link Sign In"
      description={
        sent
          ? "Check your email for the magic link"
          : "Enter your email to receive a magic link"
      }
    >
      {sent ? (
        <div className="space-y-4">
          <Alert className="border-green-600 dark:border-green-400">
            <Icons.check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              <strong>Check your email!</strong> We've sent a magic link to{" "}
              <strong>{email}</strong>. Open the link to sign in.
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

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
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

      <div className="space-y-3 text-center text-sm">
        <Link href="/sign-in" className="block text-primary hover:underline">
          ← Back to sign in
        </Link>
        <div className="text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
