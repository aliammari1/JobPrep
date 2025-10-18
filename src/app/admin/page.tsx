"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { UserNav } from "@/components/custom/user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  role?: string;
}

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  activeUsers: number;
}

const AdminPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    bannedUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    if (!isPending && session?.user) {
      // Check if user is admin
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "admin") {
        router.push("/dashboard");
      } else {
        loadUsers();
        loadStats();
      }
    }
  }, [isPending, session, router]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });
      if (result.data) {
        setUsers(result.data.users as User[]);
      }
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch real stats from API
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const statsData = await response.json();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load statistics");
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    setError(null);

    try {
      await authClient.admin.banUser({
        userId: selectedUser.id,
        banReason: banReason || "Violation of terms",
        banExpiresIn: banDuration ? parseInt(banDuration) : undefined,
      });

      setSuccess(`User ${selectedUser.name} has been banned`);
      setShowBanDialog(false);
      setBanReason("");
      setBanDuration("");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ban user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.admin.unbanUser({
        userId,
      });

      setSuccess("User has been unbanned");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unban user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetRole = async (userId: string, role: "admin" | "user") => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.admin.setRole({
        userId,
        role,
      });

      setSuccess("User role updated successfully");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    setShowBanDialog(true);
  };

  const openUserDialog = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Icons.crown className="h-8 w-8 text-yellow-500" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage users and monitor system activity
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verified Users
              </CardTitle>
              <Icons.check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Icons.activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Banned Users
              </CardTitle>
              <Icons.ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">
                            <Icons.ban className="mr-1 h-3 w-3" />
                            Banned
                          </Badge>
                        ) : user.emailVerified ? (
                          <Badge variant="default" className="bg-green-500">
                            <Icons.check className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role || "user"}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUserDialog(user)}
                          >
                            <Icons.eye className="h-4 w-4" />
                          </Button>
                          {user.banned ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnbanUser(user.id)}
                            >
                              <Icons.check className="h-4 w-4 text-green-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openBanDialog(user)}
                            >
                              <Icons.ban className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.name} from the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input
                placeholder="Violation of terms of service"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Duration (days, leave empty for permanent)
              </label>
              <Input
                type="number"
                placeholder="30"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBanDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm">
                    {selectedUser.banned
                      ? "Banned"
                      : selectedUser.emailVerified
                      ? "Active"
                      : "Unverified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Role
                  </p>
                  <p className="text-sm">{selectedUser.role || "user"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Joined
                  </p>
                  <p className="text-sm">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedUser.banned && selectedUser.banReason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Ban Reason
                    </p>
                    <p className="text-sm">{selectedUser.banReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
