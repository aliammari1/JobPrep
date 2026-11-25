import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  subtitle?: string;
  className?: string;
}

export function BrandMark({
  href = "/",
  size = "md",
  inverted = false,
  subtitle,
  className,
}: BrandMarkProps) {
  const iconSizes = {
    sm: "size-7 rounded-md",
    md: "size-8 rounded-lg",
    lg: "size-9 rounded-lg",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const content = (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span
        className={cn(
          "grid place-items-center shrink-0 transition-transform duration-200 group-hover:scale-[1.03]",
          iconSizes[size],
          inverted
            ? "bg-white/15 text-white ring-1 ring-white/20"
            : "bg-primary text-primary-foreground shadow-xs",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-4"
        >
          <path
            d="M5 17.5L10.5 12L14 15.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 7.5H19V12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-tight",
            textSizes[size],
            inverted ? "text-white" : "text-foreground",
          )}
        >
          JobPrep
        </span>
        {subtitle && (
          <span
            className={cn(
              "mt-0.5 text-[11px] font-medium tracking-wide",
              inverted ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group inline-flex items-center">
      {content}
    </Link>
  );
}
