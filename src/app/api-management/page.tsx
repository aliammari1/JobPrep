"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Code, Key, Webhook, TrendingUp } from "lucide-react";

export default function APIManagementPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground mt-1">Manage API keys, webhooks, and usage</p>
        </div>
        <Button>
          <Key className="mr-2 h-4 w-4" />
          Generate API Key
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "API Keys", value: "5", icon: Key },
          { label: "Webhooks", value: "8", icon: Webhook },
          { label: "Requests Today", value: "12.4k", icon: Code },
          { label: "Rate Limit", value: "85%", icon: TrendingUp },
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

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Production API Key", created: "2024-01-15", calls: "8.5k", status: "Active" },
              { name: "Development API Key", created: "2024-02-20", calls: "2.1k", status: "Active" },
              { name: "Testing API Key", created: "2024-03-01", calls: "1.8k", status: "Active" },
            ].map((key) => (
              <Card key={key.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created {key.created} • {key.calls} calls today
                      </p>
                      <Input
                        readOnly
                        value="sk_live_••••••••••••••••••••••••••••"
                        className="mt-2 font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="default">{key.status}</Badge>
                      <Button size="sm" variant="outline">
                        Revoke
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
          <div className="flex items-center justify-between">
            <CardTitle>Webhooks</CardTitle>
            <Button size="sm">
              <Webhook className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { url: "https://api.example.com/webhook", event: "interview.completed", status: "Active" },
              { url: "https://api.example.com/notifications", event: "candidate.added", status: "Active" },
              { url: "https://api.example.com/sync", event: "evaluation.submitted", status: "Inactive" },
            ].map((webhook, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium font-mono text-sm">{webhook.url}</p>
                      <p className="text-sm text-muted-foreground mt-1">Event: {webhook.event}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.status === "Active" ? "default" : "secondary"}>
                        {webhook.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
