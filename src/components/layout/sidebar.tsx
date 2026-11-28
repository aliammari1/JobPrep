"use client";

import {
  ChevronDown,
  Key,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/use-subscription";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { primarySections, settingsItems } from "./workspace-links";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: subscription } = useSubscription();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings"),
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const triggerCommandPalette = () => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        code: "KeyK",
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
      }),
    );
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/mock-interview" && pathname.startsWith(`${href}/`));

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 shrink-0">
        <BrandMark href="/dashboard" size="sm" />
      </div>

      {/* Primary Action & Search */}
      <div className="space-y-2 border-b border-sidebar-border px-3 py-3 shrink-0">
        <Button asChild size="sm" className="w-full justify-center gap-1.5">
          <Link href="/mock-interview">
            <Plus className="size-4" />
            New practice session
          </Link>
        </Button>
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="flex h-8 w-full items-center justify-between rounded-md border border-sidebar-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Search className="size-3.5" />
            Quick jump…
          </span>
          <kbd className="font-mono text-[10px] text-muted-foreground/80">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Sidebar navigation"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
      >
        {primarySections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-2.5 pb-1 text-[11px] font-semibold text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Collapsible Settings */}
        <div className="space-y-1 border-t border-sidebar-border pt-3">
          <button
            type="button"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
            className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <span className="flex items-center gap-2.5">
              <Settings className="size-4 text-muted-foreground" />
              <span>Settings</span>
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-200",
                settingsOpen && "rotate-180",
              )}
            />
          </button>

          {settingsOpen && (
            <div className="ml-3 space-y-0.5 border-l border-sidebar-border pl-2.5">
              {settingsItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="size-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Compact Account Footer */}
      <div className="border-t border-sidebar-border p-3 shrink-0 space-y-2.5">
        {subscription && subscription.tier === "FREE" && (
          <Link
            href="/settings/billing"
            className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs transition-colors hover:border-primary/40"
          >
            <span className="font-medium text-foreground">Free plan</span>
            <span className="font-medium text-primary">Upgrade →</span>
          </Link>
        )}

        {isPending ? (
          <div className="flex items-center gap-2.5 px-1">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
        ) : session?.user ? (
          <div className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1">
            <Link
              href="/settings/profile"
              className="flex min-w-0 flex-1 items-center gap-2.5 hover:opacity-90"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {session.user.name || "User"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button asChild size="sm" className="w-full">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
