/**
 * Push Notification Settings Component
 * UI component for enabling/disabling and managing push notifications
 */

"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PushNotificationSettingsProps {
  onStatusChange?: (isSubscribed: boolean) => void;
}

export function PushNotificationSettings({
  onStatusChange,
}: PushNotificationSettingsProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification,
  } = usePushNotifications();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isSubscribed);
    }
  }, [isSubscribed, onStatusChange]);

  if (!mounted) {
    return null;
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Push Notifications
          </CardTitle>
          <CardDescription>Not available in your browser</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications. Please use a modern
            browser like Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get real-time updates about interviews, messages, and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="font-medium">Notification Status</p>
            <p
              className={cn(
                "flex items-center gap-2 text-sm",
                isSubscribed ? "text-green-600" : "text-gray-500",
              )}
            >
              {isSubscribed ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Enabled
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  Disabled
                </>
              )}
            </p>
          </div>
          <Button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
            variant={isSubscribed ? "destructive" : "default"}
            size="sm"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                {isSubscribed ? "Disabling..." : "Enabling..."}
              </>
            ) : isSubscribed ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enable
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Features List */}
        {isSubscribed && (
          <div className="space-y-3 rounded-lg bg-green-50 p-4">
            <p className="text-sm font-medium text-green-900">
              You'll be notified about:
            </p>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                Interview reminders and schedule changes
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                New messages and feedback from interviewers
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                AI insights and improvement recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                Team collaboration updates
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                Performance analytics summaries
              </li>
            </ul>
          </div>
        )}

        {/* Test Notification Button */}
        {isSubscribed && (
          <Button
            onClick={() => {
              showLocalNotification({
                title: "JobPrep Notification Test",
                body: "This is a test notification to verify push notifications are working correctly.",
                icon: "/icons/icon-192x192.png",
                tag: "test-notification",
                actions: [
                  {
                    action: "view",
                    title: "View",
                  },
                  {
                    action: "dismiss",
                    title: "Dismiss",
                  },
                ],
              });
              toast.success("Test notification sent!");
            }}
            variant="outline"
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Send Test Notification
          </Button>
        )}

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium">💡 Tip:</p>
          <p className="mt-1">
            Push notifications work even when the app is closed or running in
            the background. Make sure your browser allows notifications from
            JobPrep.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
