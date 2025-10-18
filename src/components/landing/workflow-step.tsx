import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
}

export function WorkflowStep({
  number,
  title,
  description,
  icon,
}: WorkflowStepProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 p-6 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold ring-1 ring-primary/20">
          {number}
        </div>
        <div className="text-primary/80">{icon}</div>
        <h4 className="font-semibold tracking-tight text-base">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pl-1">
        {description}
      </p>
    </div>
  );
}
