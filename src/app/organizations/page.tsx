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
import { UserNav } from "@/components/custom/user-nav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: any;
  members?: OrganizationMember[];
}

interface OrganizationMember {
  id: string;
  userId: string;
  role: string;
  email: string;
  name: string;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "owner">("member");

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const result = await authClient.organization.list();
      if (result.data) {
        setOrganizations(result.data);
      }
    } catch (err) {
      console.error("Failed to load organizations:", err);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgSlug) {
      setError("Please provide both name and slug");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.organization.create({
        name: newOrgName,
        slug: newOrgSlug,
      });

      setSuccess("Organization created successfully!");
      setShowCreateDialog(false);
      setNewOrgName("");
      setNewOrgSlug("");
      loadOrganizations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !selectedOrgId) {
      setError("Please provide email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.organization.inviteMember({
        organizationId: selectedOrgId,
        email: inviteEmail,
        role: inviteRole,
      });

      setSuccess("Invitation sent successfully!");
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("member");
      loadOrganizations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (organizationId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.organization.removeMember({
        organizationId,
        memberIdOrEmail: userId,
      });

      setSuccess("Member removed successfully!");
      loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveOrganization = async (organizationId: string) => {
    if (
      !confirm(
        "Are you sure you want to leave this organization? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.organization.leave({
        organizationId,
      });

      setSuccess("Left organization successfully!");
      loadOrganizations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to leave organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = async (organizationId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone and will remove all members."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.organization.delete({
        organizationId,
      });

      setSuccess("Organization deleted successfully!");
      loadOrganizations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openInviteDialog = (orgId: string) => {
    setSelectedOrgId(orgId);
    setShowInviteDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground mt-2">
              Manage your teams and collaborate with others
            </p>
          </div>
          <UserNav />
        </div>

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

        {/* Create Organization Button */}
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Icons.users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  You're not part of any organizations yet
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create your first organization
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{org.name}</CardTitle>
                        <CardDescription className="text-base">
                          @{org.slug}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInviteDialog(org.id)}
                      >
                        <Icons.userPlus className="mr-2 h-4 w-4" />
                        Invite
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeaveOrganization(org.id)}
                      >
                        Leave
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrganization(org.id)}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        Members ({org.members?.length || 0})
                      </h4>
                    </div>
                    {org.members && org.members.length > 0 ? (
                      <div className="space-y-2">
                        {org.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{member.role}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveMember(org.id, member.userId)
                                }
                              >
                                <Icons.userMinus className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No members yet. Invite people to join!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Acme Inc."
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value);
                  // Auto-generate slug
                  setNewOrgSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                  );
                }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgSlug">Slug (URL)</Label>
              <Input
                id="orgSlug"
                placeholder="acme-inc"
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will be used in URLs and must be unique
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join this organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "member" | "admin" | "owner")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
