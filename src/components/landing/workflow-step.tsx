import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  inverted?: boolean;
  className?: string;
}

export function WorkflowStep({
  number,
  title,
  description,
  inverted = false,
  className,
}: WorkflowStepProps) {
  const formatted = String(number).padStart(2, "0");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t pt-5",
        inverted ? "border-white/15" : "border-border",
        className,
      )}
    >
      <span
        className={cn(
          "font-display text-sm font-bold tabular-nums",
          inverted ? "text-[#60a5fa]" : "text-primary",
        )}
      >
        {formatted}
      </span>
      <h3
        className={cn(
          "font-display text-xl font-semibold tracking-tight",
          inverted ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "text-sm leading-relaxed",
          inverted ? "text-white/65" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
    </div>
  );
}
