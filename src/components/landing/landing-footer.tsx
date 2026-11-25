import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

const footerLinks = {
  practice: [
    { label: "Mock Interview", href: "/mock-interview" },
    { label: "Question Bank", href: "/mock-interview/questions" },
    { label: "Code Challenge", href: "/code-challenge" },
    { label: "Interview Room", href: "/interview-room" },
  ],
  career: [
    { label: "CV Builder", href: "/cv-builder" },
    { label: "Cover Letters", href: "/cover-letter" },
    { label: "Interview Scheduler", href: "/interview-scheduler" },
    { label: "Recordings", href: "/recordings" },
  ],
  company: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/35">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-4">
            <BrandMark href="/" size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              An interview preparation and career studio built for calm,
              repeatable practice. Bring your own AI provider key or run fully
              offline with local models.
            </p>
            <p className="text-xs font-medium text-muted-foreground/80">
              Self-hostable · BYOK · Local Ollama ready
            </p>
          </div>

          {/* Practice */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3.5">
              Practice
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.practice.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Tools */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3.5">
              Career Studio
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.career.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3.5">
              Product
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} JobPrep. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
