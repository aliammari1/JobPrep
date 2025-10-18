"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Zap } from "lucide-react";

const hireData = [
  { month: "Jan", hires: 12, applications: 145 },
  { month: "Feb", hires: 15, applications: 167 },
  { month: "Mar", hires: 18, applications: 189 },
  { month: "Apr", hires: 22, applications: 201 },
  { month: "May", hires: 25, applications: 223 },
  { month: "Jun", hires: 28, applications: 245 },
];

export default function PredictiveAnalyticsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <p className="text-muted-foreground mt-1">Forecast hiring trends and optimize recruitment strategies</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Predicted Hires", value: "+32%", icon: TrendingUp },
          { label: "Success Rate", value: "87%", icon: Target },
          { label: "Time to Fill", value: "18d", icon: Zap },
          { label: "Quality Score", value: "4.8", icon: Users },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hiring Trend Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hireData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hires" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="applications" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application to Hire Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hireData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hires" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
