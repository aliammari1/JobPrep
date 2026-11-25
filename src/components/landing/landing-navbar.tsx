"use client";

import { Github, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/aliammari1/JobPrep";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <BrandMark href="/" size="md" />

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-1"
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Star JobPrep on GitHub"
              >
                <Github className="size-3.5" />
                Star on GitHub
              </a>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="text-muted-foreground hover:text-foreground"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>

            {session ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Start free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-1 md:hidden">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
            >
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Star JobPrep on GitHub"
              >
                <Github className="size-4" />
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="text-muted-foreground"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="size-4" />
                    Star on GitHub
                  </a>
                </Button>
                {session ? (
                  <Button asChild onClick={() => setIsOpen(false)}>
                    <Link href="/dashboard">Open Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/sign-up">Start free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
