"use client";

import PhoneInputBase from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PhoneInput({
  id,
  value,
  onChange,
  placeholder = "+1 234 567 8900",
  disabled,
  required,
  className,
}: PhoneInputProps) {
  return (
    <PhoneInputBase
      id={id}
      international
      defaultCountry="US"
      value={value || undefined}
      onChange={(next) => onChange(next ?? "")}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-base shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 disabled:opacity-50 [&_.PhoneInputCountry]:mr-1 [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-base [&_.PhoneInputInput]:text-foreground [&_.PhoneInputInput]:outline-none",
        className,
      )}
    />
  );
}
