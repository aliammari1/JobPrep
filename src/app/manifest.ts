import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobPrep - Interview Preparation Platform",
    short_name: "JobPrep",
    description: "AI-powered interview preparation and mock interview platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "any",
    dir: "ltr",
    lang: "en",
    categories: ["education", "productivity", "business"],
    icons: [
      {
        src: "/icons/one_logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/one_logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      // Simplified icons list (Next.js handles the scaling well)
      ...[72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      })),
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
        label: "JobPrep Mobile Dashboard",
      },
      {
        src: "/screenshots/desktop-screenshot.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "JobPrep Interview Platform",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/one_logo.png", sizes: "512x512" }],
      },
      {
        name: "Mock Interview",
        short_name: "Mock Interview",
        description: "Start a mock interview",
        url: "/mock-interview",
        icons: [{ src: "/icons/one_logo.png", sizes: "512x512" }],
      },
    ],
  };
}
