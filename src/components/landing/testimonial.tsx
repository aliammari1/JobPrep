import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialProps {
  quote: string;
  name: string;
  position: string; // job title or role label
  initials?: string;
  avatar?: ReactNode;
}

export function Testimonial({
  quote,
  name,
  position,
  initials = "U",
  avatar,
}: TestimonialProps) {
  return (
    <Card className="p-6 h-full flex flex-col justify-between bg-linear-to-br from-background via-muted/40 to-muted/70">
      <p className="text-sm leading-relaxed mb-4 italic">“{quote}”</p>
      <div className="flex items-center gap-3 mt-auto">
        {avatar || (
          <Avatar className="size-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        )}
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{position}</div>
        </div>
      </div>
    </Card>
  );
}
