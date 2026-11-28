"use client";

import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function PostHogAnalytics() {
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname || pathname === lastPathname.current) return;
    if (!initialized) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: "never",
        persistence: "memory",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        save_campaign_params: false,
        save_referrer: false,
        before_send: (event) => {
          if (event?.event !== "$pageview") return null;
          return {
            ...event,
            properties: {
              token: event.properties?.token,
              distinct_id: event.properties?.distinct_id,
              $current_url: event.properties?.$current_url,
              $pathname: event.properties?.$pathname,
              $process_person_profile: false,
            },
          };
        },
      });
      initialized = true;
    }

    const route = pathname.replace(
      /^\/saved-interviews\/[^/]+$/,
      "/saved-interviews/[id]",
    );
    lastPathname.current = pathname;
    posthog.capture("$pageview", {
      $current_url: `${window.location.origin}${route}`,
      $pathname: route,
    });
  }, [pathname]);

  return null;
}
