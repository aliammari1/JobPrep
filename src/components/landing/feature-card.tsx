import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  badge?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  href,
  icon,
  badge,
  className,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group" prefetch>
      <Card
        className={cn(
          "h-full p-5 transition border-muted hover:border-primary/60 hover:shadow-lg bg-gradient-to-br from-background to-muted/40",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 text-primary p-2 ring-1 ring-primary/20 group-hover:scale-110 transition">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg tracking-tight line-clamp-1">
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className="capitalize">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {description}
            </p>
            <div className="mt-3 text-xs font-medium text-primary/80 group-hover:text-primary flex items-center gap-1">
              <span>Explore</span>
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
