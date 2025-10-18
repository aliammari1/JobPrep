"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Zap, Clock } from "lucide-react";

export default function CalendarSyncPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Sync</h1>
        <p className="text-muted-foreground mt-1">Connect calendar providers for automatic scheduling</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Synced Events", value: "145", icon: Calendar },
          { label: "Connected Accounts", value: "3", icon: Zap },
          { label: "Last Sync", value: "2m ago", icon: Clock },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { name: "Google Calendar", email: "alice@company.com", connected: true, events: 89 },
          { name: "Microsoft Outlook", email: "alice@company.com", connected: true, events: 56 },
          { name: "Apple Calendar", email: "", connected: false, events: 0 },
          { name: "Office 365", email: "", connected: false, events: 0 },
        ].map((calendar) => (
          <Card key={calendar.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{calendar.name}</CardTitle>
                  {calendar.email && (
                    <p className="text-sm text-muted-foreground mt-1">{calendar.email}</p>
                  )}
                </div>
                <Badge variant={calendar.connected ? "default" : "secondary"}>
                  {calendar.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendar.connected ? (
                <>
                  <div className="text-sm text-muted-foreground">{calendar.events} events synced</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`auto-sync-${calendar.name}`}>Auto Sync</Label>
                      <Switch id={`auto-sync-${calendar.name}`} defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`notifications-${calendar.name}`}>Send Reminders</Label>
                      <Switch id={`notifications-${calendar.name}`} defaultChecked />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Settings
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="w-full">Connect {calendar.name}</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
