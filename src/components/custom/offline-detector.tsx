"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function OfflineDetector() {
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setHasShownOfflineToast(false);
      toast.success("You're back online!", {
        icon: <Wifi className="h-4 w-4" />,
        description: "Internet connection restored",
        duration: 3000,
      });
    };

    const handleOffline = () => {
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

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasShownOfflineToast]);

  // This component doesn't render anything visible
  return null;
}
