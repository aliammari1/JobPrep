"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Brain, TrendingUp } from "lucide-react";

interface PerformanceMetrics {
  speakingTime: number;
  pauseCount: number;
  averageConfidence: number;
  wordsPerMinute: number;
  totalWordsSpoken: number;
  sentimentScores: Array<{ timestamp: string; score: number }>;
}

interface PerformanceAnalyticsPanelProps {
  transcripts: any[];
  recordingTime: number;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export function PerformanceAnalyticsPanel({
  transcripts,
  recordingTime,
}: PerformanceAnalyticsPanelProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    speakingTime: 0,
    pauseCount: 0,
    averageConfidence: 0,
    wordsPerMinute: 0,
    totalWordsSpoken: 0,
    sentimentScores: [],
  });

  useEffect(() => {
    // Calculate metrics from transcripts
    const totalWords = transcripts.reduce(
      (acc, t) => acc + t.text.split(/\s+/).length,
      0,
    );
    const avgConfidence =
      transcripts.length > 0
        ? transcripts.reduce((acc, t) => acc + t.confidence, 0) /
          transcripts.length
        : 0;

    const speakingTimeSeconds = recordingTime || 0;
    const speakingTimeMinutes = speakingTimeSeconds / 60 || 0.1;
    const wordsPerMinute = Math.round(totalWords / speakingTimeMinutes);

    setMetrics({
      speakingTime: speakingTimeSeconds,
      pauseCount: transcripts.length, // Number of speaking segments
      averageConfidence: avgConfidence,
      wordsPerMinute,
      totalWordsSpoken: totalWords,
      sentimentScores: transcripts.map((t, i) => ({
        timestamp: `${i + 1}`,
        score: Math.round(t.confidence * 100),
      })),
    });
  }, [transcripts, recordingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getPerformanceLevel = (confidence: number) => {
    if (confidence >= 0.85)
      return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (confidence >= 0.7)
      return { label: "Good", color: "bg-blue-100 text-blue-800" };
    if (confidence >= 0.55)
      return { label: "Fair", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const performanceLevel = getPerformanceLevel(metrics.averageConfidence);

  // Data for pie chart
  const pieData = [
    { name: "Speaking", value: metrics.speakingTime },
    { name: "Pause", value: Math.max(0, recordingTime - metrics.speakingTime) },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          Performance Analytics
        </CardTitle>
        <CardDescription>
          Real-time interview performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Speaking Time</p>
            <p className="text-lg font-bold">
              {formatTime(metrics.speakingTime)}
            </p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Words Spoken</p>
            <p className="text-lg font-bold">{metrics.totalWordsSpoken}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">WPM</p>
            <p className="text-lg font-bold">{metrics.wordsPerMinute}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
            <p className="text-lg font-bold">
              {Math.round(metrics.averageConfidence * 100)}%
            </p>
          </div>
        </div>

        {/* Performance Level */}
        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <span className="text-sm font-medium">Overall Performance</span>
          <Badge className={performanceLevel.color}>
            {performanceLevel.label}
          </Badge>
        </div>

        {/* Confidence Trend */}
        {metrics.sentimentScores.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Confidence Trend
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.sentimentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="timestamp" style={{ fontSize: "12px" }} />
                <YAxis style={{ fontSize: "12px" }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Speaking vs Pause */}
        {recordingTime > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Speaking Distribution</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatTime(value as number)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center text-xs">
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[0] }}
                />
                Speaking: {formatTime(metrics.speakingTime)}
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[1] }}
                />
                Pause:{" "}
                {formatTime(Math.max(0, recordingTime - metrics.speakingTime))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for Improvement
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            {metrics.wordsPerMinute > 160 && (
              <li>
                • Consider slowing down your pace slightly for better clarity
              </li>
            )}
            {metrics.wordsPerMinute < 100 && (
              <li>• Try to speak a bit faster to maintain engagement</li>
            )}
            {metrics.averageConfidence < 0.7 && (
              <li>• Practice speaking with more confidence and conviction</li>
            )}
            {metrics.averageConfidence >= 0.8 && (
              <li>• Excellent confidence level! Keep it up!</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
