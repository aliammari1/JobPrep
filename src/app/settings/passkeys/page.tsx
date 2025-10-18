"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/custom/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserNav } from "@/components/custom/user-nav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Passkey {
  id: string;
  name: string;
  createdAt: Date;
}

export default function PasskeysPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      loadPasskeys();
    }
  }, [session]);

  const loadPasskeys = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (result.data) {
        setPasskeys(result.data as Passkey[]);
      }
    } catch (err) {
      console.error("Failed to load passkeys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    setError(null);
    setSuccess(null);

    if (!passkeyName.trim()) {
      setError("Please enter a name for your passkey");
      return;
    }

    try {
      const result = await authClient.passkey.addPasskey({
        name: passkeyName,
      });

      if (result?.error) {
        setError(result.error.message || "Failed to add passkey");
        return;
      }

      setSuccess("Passkey added successfully!");
      setShowAddDialog(false);
      setPasskeyName("");
      loadPasskeys();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to add passkey. Your device may not support passkeys.");
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!confirm("Are you sure you want to delete this passkey?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await authClient.passkey.deletePasskey({
        id: passkeyId,
      });

      setSuccess("Passkey deleted successfully");
      loadPasskeys();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete passkey");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
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
          <h1 className="text-4xl font-bold">Passkeys</h1>
          <p className="text-muted-foreground mt-2">
            Manage your biometric and security key authentication
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <Link href="/settings/profile">
            <Button variant="outline">Profile</Button>
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
            <Button variant="default">Passkeys</Button>
          </Link>
          <Link href="/settings/connected-accounts">
            <Button variant="outline">Connected</Button>
          </Link>
          <Link href="/settings/phone">
            <Button variant="outline">Phone</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icons.alertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-600">
            <Icons.check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Passkeys</CardTitle>
                <CardDescription>
                  Sign in with Face ID, Touch ID, or security keys
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Passkey
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {passkeys.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Icons.fingerprint className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No passkeys yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a passkey for faster and more secure sign-in
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Your First Passkey
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {passkeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icons.fingerprint className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{passkey.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Added{" "}
                          {new Date(passkey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePasskey(passkey.id)}
                    >
                      <Icons.trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Alert>
          <Icons.info className="h-4 w-4" />
          <AlertDescription>
            <strong>What are passkeys?</strong> Passkeys are a safer and easier
            alternative to passwords. They use your device's biometric
            authentication (like Face ID or Touch ID) or security keys to sign
            you in instantly.
          </AlertDescription>
        </Alert>
      </div>

      {/* Add Passkey Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Passkey</DialogTitle>
            <DialogDescription>
              Give your passkey a name to help you identify it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passkey-name">Passkey Name</Label>
              <Input
                id="passkey-name"
                placeholder="e.g., My iPhone, Work Laptop"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setPasskeyName("");
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPasskey}>
              <Icons.fingerprint className="mr-2 h-4 w-4" />
              Add Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
