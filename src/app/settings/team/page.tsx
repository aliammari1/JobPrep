"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Shield } from "lucide-react";

export default function TeamSettingsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and permissions
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="email@company.com" className="flex-1" />
            <Select defaultValue="member">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members (12)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Alice Johnson",
                email: "alice@company.com",
                role: "Admin",
                status: "Active",
              },
              {
                name: "Bob Smith",
                email: "bob@company.com",
                role: "Recruiter",
                status: "Active",
              },
              {
                name: "Carol White",
                email: "carol@company.com",
                role: "Recruiter",
                status: "Active",
              },
              {
                name: "David Lee",
                email: "david@company.com",
                role: "Member",
                status: "Pending",
              },
            ].map((member) => (
              <Card key={member.email}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          member.role === "Admin" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                      <Badge
                        variant={
                          member.status === "Active" ? "default" : "outline"
                        }
                      >
                        {member.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                role: "Admin",
                permissions: "Full access to all features",
                members: 2,
              },
              {
                role: "Recruiter",
                permissions: "Can manage interviews and candidates",
                members: 6,
              },
              {
                role: "Member",
                permissions: "View-only access to dashboards",
                members: 4,
              },
            ].map((role) => (
              <div
                key={role.role}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{role.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {role.permissions}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{role.members} members</Badge>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
