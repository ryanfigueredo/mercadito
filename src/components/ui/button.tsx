import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Botão primário - Laranja principal
        default:
          "bg-sol-orange text-white shadow-sol-button hover:bg-primary-600 focus-visible:ring-sol-orange",
        // Botão secundário - Outline laranja
        secondary:
          "border border-sol-orange bg-transparent text-sol-orange hover:bg-sol-orange hover:text-white focus-visible:ring-sol-orange",
        // Botão de acento - Amarelo vibrante
        accent:
          "bg-sol-yellow text-sol-gray-dark shadow-sol-button hover:bg-accent-500 focus-visible:ring-sol-yellow",
        // Botão outline - Cinza neutro
        outline:
          "border border-neutral-300 bg-white text-sol-gray-dark hover:bg-neutral-50 focus-visible:ring-neutral-300",
        // Botão ghost - Transparente
        ghost:
          "bg-transparent text-sol-gray-dark hover:bg-neutral-100 focus-visible:ring-neutral-300",
        // Botão link - Apenas texto
        link: "text-sol-orange underline-offset-4 hover:underline focus-visible:ring-sol-orange",
        // Botão de destaque - Amarelo com texto escuro
        highlight:
          "bg-sol-yellow text-sol-gray-dark font-semibold shadow-sol-button hover:bg-accent-500 focus-visible:ring-sol-yellow",
        // Botão de sucesso - Verde
        success:
          "bg-success text-white shadow-sol-button hover:bg-green-600 focus-visible:ring-success",
        // Botão de erro - Vermelho
        destructive:
          "bg-error text-white shadow-sol-button hover:bg-red-600 focus-visible:ring-error",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-11 w-11 rounded-lg",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
