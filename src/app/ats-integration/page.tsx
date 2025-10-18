"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, ArrowRightLeft, Check } from "lucide-react";

export default function ATSIntegrationPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ATS Integration</h1>
        <p className="text-muted-foreground mt-1">Connect with Applicant Tracking Systems</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Synced Candidates", value: "1,234", icon: Briefcase },
          { label: "Active Sync", value: "3", icon: ArrowRightLeft },
          { label: "Last Sync", value: "5m ago", icon: Check },
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
          { name: "Greenhouse", connected: true, candidates: 456, jobs: 23 },
          { name: "Lever", connected: true, candidates: 389, jobs: 18 },
          { name: "Workday", connected: true, candidates: 389, jobs: 15 },
          { name: "iCIMS", connected: false, candidates: 0, jobs: 0 },
        ].map((ats) => (
          <Card key={ats.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{ats.name}</CardTitle>
                  {ats.connected && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ats.candidates} candidates • {ats.jobs} active jobs
                    </p>
                  )}
                </div>
                <Badge variant={ats.connected ? "default" : "secondary"}>
                  {ats.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ats.connected ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`sync-${ats.name}`}>Auto Sync</Label>
                    <Switch id={`sync-${ats.name}`} defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`bidirectional-${ats.name}`}>Bidirectional Sync</Label>
                    <Switch id={`bidirectional-${ats.name}`} defaultChecked />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Sync Now
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="w-full">Connect {ats.name}</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
