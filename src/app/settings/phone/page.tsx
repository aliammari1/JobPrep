"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "@/components/custom/user-nav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PhoneNumber {
  id: string;
  phoneNumber: string;
  verified: boolean;
  isPrimary: boolean;
  createdAt: string;
}

export default function PhoneNumberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneToVerify, setPhoneToVerify] = useState<string | null>(null);

  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  const loadPhoneNumbers = async () => {
    try {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        // Mock data - replace with actual API call
        setPhoneNumbers([
          // {
          //   id: "1",
          //   phoneNumber: "+1234567890",
          //   verified: true,
          //   isPrimary: true,
          //   createdAt: new Date().toISOString(),
          // },
        ]);
      }
    } catch (err) {
      console.error("Failed to load phone numbers:", err);
    }
  };

  const handleAddPhoneNumber = async () => {
    if (!newPhoneNumber) {
      setError("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send OTP to phone number
      await authClient.phoneNumber.sendOtp({
        phoneNumber: newPhoneNumber,
      });

      setSuccess("Verification code sent! Please check your phone.");
      setPhoneToVerify(newPhoneNumber);
      setShowAddDialog(false);
      setShowVerifyDialog(true);
      setNewPhoneNumber("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });

      setSuccess("Verification code sent!");
      setPhoneToVerify(phoneNumber);
      setShowVerifyDialog(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneNumber = async () => {
    if (!verificationCode || !phoneToVerify) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.verify({
        phoneNumber: phoneToVerify,
        code: verificationCode,
        updatePhoneNumber: true,
      });

      setSuccess("Phone number verified successfully!");
      setShowVerifyDialog(false);
      setVerificationCode("");
      setPhoneToVerify(null);
      loadPhoneNumbers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify phone number",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: setPrimaryPhoneNumber is not available in the current Better Auth phone number plugin
      // This would need to be implemented server-side or using a different approach
      setError("Setting primary phone number is not yet implemented");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set primary phone number",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoneNumber = async (phoneNumber: string) => {
    if (!confirm("Are you sure you want to remove this phone number?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Note: removePhoneNumber is not available in the current Better Auth phone number plugin
      // This would need to be implemented server-side or using a different approach
      setError("Removing phone numbers is not yet implemented");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove phone number",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Phone Numbers</h1>
            <p className="text-muted-foreground mt-2">
              Manage your phone numbers for authentication and recovery
            </p>
          </div>
          <UserNav />
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" asChild>
              <Link href="/settings/profile">Profile</Link>
            </TabsTrigger>
            <TabsTrigger value="security" asChild>
              <Link href="/settings/security">Security</Link>
            </TabsTrigger>
            <TabsTrigger value="sessions" asChild>
              <Link href="/settings/sessions">Sessions</Link>
            </TabsTrigger>
            <TabsTrigger value="two-factor" asChild>
              <Link href="/settings/two-factor">Two-Factor</Link>
            </TabsTrigger>
            <TabsTrigger value="passkeys" asChild>
              <Link href="/settings/passkeys">Passkeys</Link>
            </TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <Icons.check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Phone Numbers List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Phone Numbers</CardTitle>
                <CardDescription>
                  Add and verify phone numbers for SMS authentication
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Phone Number
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {phoneNumbers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Icons.smartphone className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No phone numbers added yet
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add your first phone number
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {phoneNumbers.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Icons.smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{phone.phoneNumber}</p>
                          {phone.verified ? (
                            <Badge variant="default" className="bg-green-500">
                              <Icons.check className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Icons.alertCircle className="mr-1 h-3 w-3" />
                              Unverified
                            </Badge>
                          )}
                          {phone.isPrimary && (
                            <Badge variant="outline">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(phone.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!phone.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSendVerificationCode(phone.phoneNumber)
                          }
                          disabled={isLoading}
                        >
                          Verify
                        </Button>
                      )}
                      {phone.verified && !phone.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(phone.phoneNumber)}
                          disabled={isLoading}
                        >
                          Set as Primary
                        </Button>
                      )}
                      {!phone.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemovePhoneNumber(phone.phoneNumber)
                          }
                          disabled={isLoading}
                        >
                          <Icons.trash className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.info className="h-5 w-5" />
              About Phone Number Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">SMS Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Phone numbers can be used for passwordless login and account
                recovery. You'll receive a verification code via SMS.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Security</h4>
              <p className="text-sm text-muted-foreground">
                Your phone number is encrypted and never shared. SMS codes
                expire after 10 minutes.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">International Numbers</h4>
              <p className="text-sm text-muted-foreground">
                Use international format with country code (e.g., +1 234 567
                8900)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Phone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Enter your phone number with country code (e.g., +1 234 567 8900)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPhoneNumber} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Phone Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Phone Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to {phoneToVerify}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                phoneToVerify && handleSendVerificationCode(phoneToVerify)
              }
              disabled={isLoading}
            >
              Resend Code
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyPhoneNumber} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
