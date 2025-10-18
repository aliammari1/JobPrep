"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, AlertCircle } from "lucide-react";

export default function IntegrationDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integration Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage connected services and APIs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Connected Apps", value: "8", icon: Zap },
          { label: "Active", value: "6", icon: Check },
          { label: "Pending", value: "2", icon: AlertCircle },
          { label: "API Calls Today", value: "12.4k", icon: Zap },
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
          { name: "Greenhouse ATS", status: "Connected", calls: "4.2k", health: 98 },
          { name: "Google Calendar", status: "Connected", calls: "2.1k", health: 100 },
          { name: "Slack", status: "Connected", calls: "3.5k", health: 95 },
          { name: "Zoom", status: "Pending", calls: "0", health: 0 },
          { name: "Microsoft Teams", status: "Connected", calls: "1.8k", health: 99 },
          { name: "LinkedIn", status: "Pending", calls: "0", health: 0 },
        ].map((integration) => (
          <Card key={integration.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{integration.calls} API calls today</p>
                </div>
                <Badge variant={integration.status === "Connected" ? "default" : "secondary"}>
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {integration.health > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${integration.health}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{integration.health}%</span>
                  </div>
                )}
                <Button size="sm" variant={integration.status === "Connected" ? "outline" : "default"}>
                  {integration.status === "Connected" ? "Configure" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
