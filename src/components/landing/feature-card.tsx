import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  eyebrow?: string;
  featured?: boolean;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  href,
  icon,
  eyebrow,
  featured = false,
  className,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/60 hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        featured && "p-7 lg:p-8",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-primary">
            <span className="grid size-9 place-items-center rounded-lg border border-primary/15 bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {icon}
            </span>
            {eyebrow && (
              <span className="text-xs font-semibold text-muted-foreground">
                {eyebrow}
              </span>
            )}
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>

        <h3
          className={cn(
            "mt-5 font-display font-semibold tracking-tight text-foreground",
            featured ? "text-2xl lg:text-[26px] leading-tight" : "text-lg",
          )}
        >
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary">
        <span>Open workspace</span>
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}
