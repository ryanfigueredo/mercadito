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
          "relative flex items-center rounded-2xl border bg-white",
          isInvalid ? "border-red-500" : "border-gray-300",
          className
        )}
      >
        {left && (
          <span className="pl-3 text-muted" aria-hidden>
            {left}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={isInvalid || undefined}
          className={cn(
            "h-11 w-full bg-transparent outline-none placeholder:text-muted rounded-2xl",
            left ? "pl-2" : "pl-3",
            right ? "pr-9" : "pr-3"
          )}
          {...props}
        />
        {right && (
          <span className="absolute right-3 text-muted" aria-hidden>
            {right}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
