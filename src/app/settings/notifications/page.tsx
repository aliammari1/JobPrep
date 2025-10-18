"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your email and push notification preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New candidate applications", description: "Get notified when new candidates apply" },
            { label: "Interview reminders", description: "Receive reminders 1 hour before interviews" },
            { label: "Evaluation submissions", description: "Get notified when evaluations are submitted" },
            { label: "Team mentions", description: "Receive alerts when someone mentions you" },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor={setting.label}>{setting.label}</Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch id={setting.label} defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Desktop notifications", description: "Show browser notifications for important events" },
            { label: "Mobile push", description: "Receive push notifications on mobile devices" },
            { label: "Sound alerts", description: "Play sound for urgent notifications" },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor={setting.label}>{setting.label}</Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch id={setting.label} defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}
