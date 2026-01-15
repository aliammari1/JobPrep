"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Volume2, Video, Mic, Bell, Eye } from "lucide-react";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [videoQuality, setVideoQuality] = useState("high");
  const [audioQuality, setAudioQuality] = useState("high");
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoRecord, setEnableAutoRecord] = useState(false);
  const [enableTranscription, setEnableTranscription] = useState(true);

  const handleSave = () => {
    const settings = {
      videoQuality,
      audioQuality,
      enableNotifications,
      enableAutoRecord,
      enableTranscription,
    };
    localStorage.setItem("interviewSettings", JSON.stringify(settings));
    onClose();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Interview Settings</CardTitle>
        <CardDescription>Customize your interview experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Quality */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Quality
          </Label>
          <Select value={videoQuality} onValueChange={setVideoQuality}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (360p) - Less bandwidth</SelectItem>
              <SelectItem value="medium">Medium (720p) - Balanced</SelectItem>
              <SelectItem value="high">High (1080p) - Best quality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audio Quality */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Audio Quality
          </Label>
          <Select value={audioQuality} onValueChange={setAudioQuality}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Mono, less bandwidth</SelectItem>
              <SelectItem value="medium">Medium - Stereo, balanced</SelectItem>
              <SelectItem value="high">High - Stereo, best quality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Enable Notifications
          </Label>
          <Switch
            checked={enableNotifications}
            onCheckedChange={setEnableNotifications}
          />
        </div>

        {/* Auto-record */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Auto-start Recording
          </Label>
          <Switch
            checked={enableAutoRecord}
            onCheckedChange={setEnableAutoRecord}
          />
        </div>

        {/* Transcription */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Enable Live Transcription
          </Label>
          <Switch
            checked={enableTranscription}
            onCheckedChange={setEnableTranscription}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
