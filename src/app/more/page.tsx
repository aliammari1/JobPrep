"use client";

import { ChevronRight, LogOut, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  primarySections,
  settingsItems,
} from "@/components/layout/workspace-links";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

const SECURITY_IDS = new Set([
  "security",
  "two-factor",
  "passkeys",
  "sessions",
  "connected-accounts",
  "phone",
]);

const sections = [
  ...primarySections.slice(1).map((section) =>
    section.label === "Interview Prep"
      ? {
          ...section,
          items: [
            {
              id: "interview",
              label: "Interview Studio",
              icon: Target,
              href: "/interview",
            },
            ...section.items.filter(({ id }) => id !== "mock-interview"),
          ],
        }
      : {
          ...section,
          items: section.items.filter(
            ({ id }) => id !== "applications" && id !== "cv-builder",
          ),
        },
  ),
  {
    label: "Account & Billing",
    items: settingsItems.filter(({ id }) => !SECURITY_IDS.has(id)),
  },
  {
    label: "Security & Sign-in",
    items: settingsItems.filter(({ id }) => SECURITY_IDS.has(id)),
  },
];

export default function MorePage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-xl px-4 py-5 sm:px-6">
      <h1 className="sr-only font-display lg:not-sr-only lg:mb-5 lg:text-3xl lg:font-semibold">
        More
      </h1>
      <nav aria-label="More workspace screens" className="jobprep-more-groups">
        {sections.map(({ label, items }) => (
          <section key={label}>
            <h2>{label}</h2>
            <ul>
              {items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} scroll={false}>
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    <ChevronRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
      <Button
        variant="ghost"
        type="button"
        className="mt-4 min-h-11 w-full justify-start text-destructive"
        onClick={() =>
          void signOut({
            fetchOptions: { onSuccess: () => router.replace("/") },
          })
        }
      >
        <LogOut aria-hidden="true" /> Sign out
      </Button>
    </div>
  );
}
