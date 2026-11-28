"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface Member {
  id: string;
  role: string;
  user: { name: string; email: string };
}

function MemberList({ organizationId }: { organizationId: string }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    void authClient.organization
      .getFullOrganization({ query: { organizationId } })
      .then(({ data, error }) => {
        if (!active) return;
        if (!data || error) setError("Could not load team members.");
        else setMembers(data.members);
      })
      .catch(() => {
        if (active) setError("Could not load team members.");
      });
    return () => {
      active = false;
    };
  }, [organizationId]);

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="py-4">
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {error ? (
          <p role="alert" className="px-5 pb-4 text-sm text-destructive">
            {error}
          </p>
        ) : !members ? (
          <p role="status" className="px-5 pb-4 text-sm text-muted-foreground">
            Loading members…
          </p>
        ) : members.length ? (
          <ul className="divide-y divide-border border-t border-border">
            {members.map(({ id, role, user }) => (
              <li
                key={id}
                className="flex min-w-0 flex-wrap items-center gap-3 px-4 py-3"
              >
                <Avatar>
                  <AvatarFallback>
                    {(user.name || user.email).trim().slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
                    {user.email}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {role}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 pb-4 text-sm text-muted-foreground">
            No members to display.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamSettingsPage() {
  const { data, error, isPending, refetch } = authClient.useListOrganizations();
  const [selectedId, setSelectedId] = useState("");
  const selected = data?.find(({ id }) => id === selectedId) ?? data?.[0];

  return (
    <div className="space-y-5">
      <h1 className="sr-only font-display lg:not-sr-only lg:text-3xl lg:font-semibold lg:tracking-tight">
        Team Settings
      </h1>
      {isPending ? (
        <p role="status" className="py-4 text-sm text-muted-foreground">
          Loading teams…
        </p>
      ) : error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">
            Could not load your teams.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : selected ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="team-selection">Team</Label>
            <select
              id="team-selection"
              value={selected.id}
              onChange={(event) => setSelectedId(event.target.value)}
              className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3"
            >
              {data?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <MemberList key={selected.id} organizationId={selected.id} />
        </>
      ) : (
        <div className="flex items-start gap-3 py-4">
          <Users
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-primary"
          />
          <div>
            <h2 className="font-semibold">No teams yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Teams you belong to will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
