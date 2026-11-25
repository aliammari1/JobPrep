import { FileText, MessagesSquare, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand/brand-mark";

const HIGHLIGHTS = [
  {
    icon: Target,
    title: "Know where you stand",
    body: "Map your experience against real job requirements before you apply.",
  },
  {
    icon: FileText,
    title: "Resumes grounded in truth",
    body: "Variants built from your verified experience — never invented claims.",
  },
  {
    icon: MessagesSquare,
    title: "Practice like it's real",
    body: "Mock interviews with structured, actionable feedback every time.",
  },
];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-[oklch(0.11_0.012_258)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 size-[28rem] rounded-full bg-primary/25 blur-3xl"
      />
      <div className="relative">
        <BrandMark href="/" size="lg" inverted />
      </div>

      <div className="relative space-y-8 max-w-md">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#60a5fa]">
            Interview Studio
          </p>
          <h2 className="font-display text-3xl font-semibold leading-[1.12] tracking-tight xl:text-4xl">
            Turn applications into offers.
          </h2>
          <p className="text-base leading-relaxed text-white/75">
            One calm workspace per target role — evidence, resume, mock
            practice, and follow-through in a single place.
          </p>
        </div>
        <ul className="space-y-5 border-t border-white/15 pt-7">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="flex gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
                <item.icon className="size-4 text-[oklch(0.78_0.14_256)]" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-white/70">
                  {item.body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/55">
        Your data stays yours — bring your own key, run offline, or export
        anytime.
      </p>
    </div>
  );
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      <BrandPanel />
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to home
          </Link>
          <div className="lg:hidden">
            <BrandMark href="/" size="sm" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
            {children}
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-background px-2.5 text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Client-side switch for the Google button (no secrets — display only). */
export function isGoogleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
}

/**
 * Validate a `?callbackUrl=` value: only same-origin absolute paths.
 * Falls back to `/dashboard` for missing/absolute/external values so a
 * crafted link can never bounce users off-site after sign-in.
 */
export function safeCallbackUrl(
  raw: string | null,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("://")) return fallback;
  return raw;
}
