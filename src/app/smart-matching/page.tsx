"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Target, TrendingUp, Users, Zap } from "lucide-react";

const matches = [
  { name: "Sarah Johnson", position: "Senior Frontend Dev", matchScore: 95, skills: ["React", "TypeScript", "Next.js"], experience: "7 years" },
  { name: "Michael Chen", position: "Full Stack Engineer", matchScore: 88, skills: ["Node.js", "Python", "React"], experience: "5 years" },
  { name: "Emily Rodriguez", position: "UX/UI Designer", matchScore: 82, skills: ["Figma", "User Research", "Prototyping"], experience: "4 years" },
];

export default function SmartMatchingPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Candidate Matching</h1>
        <p className="text-muted-foreground mt-1">AI-powered candidate matching for optimal hiring decisions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Matches", value: "234", icon: Target },
          { label: "High Match Rate", value: "45%", icon: TrendingUp },
          { label: "Active Positions", value: "12", icon: Users },
          { label: "Avg Match Score", value: "78%", icon: Zap },
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

      <Card>
        <CardHeader>
          <CardTitle>Top Matches for Senior Developer Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <motion.div key={match.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{match.name}</h4>
                    <p className="text-sm text-muted-foreground">{match.position} • {match.experience}</p>
                  </div>
                  <Badge variant={match.matchScore >= 90 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {match.matchScore}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Match Score</span>
                    <span className="font-medium">{match.matchScore}%</span>
                  </div>
                  <Progress value={match.matchScore} className="h-2" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">View Profile</Button>
                  <Button size="sm" variant="outline" className="flex-1">Schedule Interview</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
