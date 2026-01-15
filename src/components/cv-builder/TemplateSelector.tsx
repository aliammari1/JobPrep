"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, ChevronDown } from "lucide-react";

export function TemplateSelector() {
  const { settings, updateSettings } = useCVStore();

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Two-column with colored headers",
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional centered layout",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean with lots of whitespace",
    },
  ];

  const currentTemplate = templates.find((t) => t.id === settings.template);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-xs font-medium">
            {currentTemplate?.name || "Template"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Template</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => updateSettings({ template: template.id as any })}
            className={settings.template === template.id ? "bg-accent" : ""}
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                {template.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}

        {settings.template === "modern" && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <Label
                htmlFor="colorScheme"
                className="text-xs font-medium flex items-center gap-2 mb-2"
              >
                <Palette className="h-3 w-3" />
                Accent Color
              </Label>
              <Input
                id="colorScheme"
                type="color"
                value={settings.colorScheme}
                onChange={(e) =>
                  updateSettings({ colorScheme: e.target.value })
                }
                className="h-8 w-full cursor-pointer rounded border p-1"
              />
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
