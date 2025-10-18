"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setHasShownOfflineToast(false);
      toast.success("You're back online!", {
        icon: <Wifi className="h-4 w-4" />,
        description: "Internet connection restored",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!hasShownOfflineToast) {
        toast.error("You're offline", {
          icon: <WifiOff className="h-4 w-4" />,
          description: "Working in offline mode. Some features may be limited.",
          duration: 5000,
        });
        setHasShownOfflineToast(true);
      }
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check connection periodically for network detection
    const checkConnection = setInterval(() => {
      const currentOnlineStatus = navigator.onLine;
      if (currentOnlineStatus !== isOnline) {
        if (currentOnlineStatus) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(checkConnection);
    };
  }, [isOnline, hasShownOfflineToast]);

  // This component doesn't render anything visible
  return null;
}
