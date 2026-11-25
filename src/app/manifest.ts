import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "JobPrep — Interview Practice & Career Studio",
    short_name: "JobPrep",
    description:
      "Open-source AI interview studio with structured rubrics, timed code challenges, live rooms, and ATS-ready resumes.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#fcfdff",
    theme_color: "#2563eb",
    orientation: "any",
    dir: "ltr",
    lang: "en",
    categories: ["education", "productivity", "business"],
    icons: [
      ...[72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      })),
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-screenshot.png",
        sizes: "540x960",
        type: "image/png",
        form_factor: "narrow",
        label: "JobPrep Mobile Workspace",
      },
      {
        src: "/screenshots/desktop-screenshot.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "JobPrep Interview Studio",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open your readiness dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Mock Interview",
        short_name: "Practice",
        description: "Start a mock interview session",
        url: "/mock-interview",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "CV Builder",
        short_name: "CV Builder",
        description: "Edit and export your resume",
        url: "/cv-builder",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
