import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  left?: React.ReactNode;
  right?: React.ReactNode;
  error?: string | boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, left, right, error, id, ...props }, ref) => {
    const isInvalid = Boolean(error);
    return (
      <div
        className={cn(
          "relative flex items-center rounded-lg border bg-white transition-all duration-200",
          isInvalid
            ? "border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error focus-within:ring-opacity-20"
            : "border-neutral-200 focus-within:border-sol-orange focus-within:ring-2 focus-within:ring-sol-orange focus-within:ring-opacity-20",
          className
        )}
      >
        {left && (
          <span className="pl-3 text-sol-gray-medium" aria-hidden>
            {left}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={isInvalid || undefined}
          className={cn(
            "h-11 w-full bg-transparent outline-none text-sol-gray-dark placeholder:text-neutral-400 rounded-lg",
            left ? "pl-2" : "pl-3",
            right ? "pr-9" : "pr-3"
          )}
          {...props}
        />
        {right && (
          <span className="absolute right-3 text-sol-gray-medium" aria-hidden>
            {right}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
