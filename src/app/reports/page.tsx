"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

const performanceData = [
  { month: "Jan", interviews: 45, hires: 12, rejections: 28 },
  { month: "Feb", interviews: 52, hires: 15, rejections: 31 },
  { month: "Mar", interviews: 48, hires: 14, rejections: 29 },
  { month: "Apr", interviews: 61, hires: 18, rejections: 37 },
  { month: "May", interviews: 55, hires: 16, rejections: 33 },
  { month: "Jun", interviews: 58, hires: 17, rejections: 35 },
];

const timeToHireData = [
  { stage: "Applied", days: 2 },
  { stage: "Phone Screen", days: 5 },
  { stage: "Technical", days: 7 },
  { stage: "Final Round", days: 3 },
  { stage: "Offer", days: 1 },
];

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive hiring insights and metrics</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Reports", value: "24", icon: FileText },
          { label: "This Month", value: "156", icon: Calendar },
          { label: "Success Rate", value: "87%", icon: TrendingUp },
          { label: "Avg Time to Hire", value: "18d", icon: Calendar },
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

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timeline">Time to Hire</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interviews" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="hires" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejections" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Time to Hire by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={timeToHireData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="days" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardContent className="p-8">
              <div className="space-y-3">
                {[
                  { name: "Monthly Hiring Report", date: "2024-03-15", type: "Scheduled" },
                  { name: "Department Performance", date: "2024-03-10", type: "One-time" },
                  { name: "Candidate Source Analysis", date: "2024-03-05", type: "Scheduled" },
                ].map((report) => (
                  <Card key={report.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{report.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.type}</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
