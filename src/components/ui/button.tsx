import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-[var(--glass-primary)] text-foreground border border-[var(--glass-border)] hover:bg-[var(--glass-primary-hover)] shadow-lg",
        destructive: "bg-destructive/20 text-destructive-foreground border border-destructive/30 hover:bg-destructive/30 backdrop-blur-md shadow-lg",
        outline: "border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-hover)] text-foreground shadow-lg",
        secondary: "bg-[var(--glass-bg)] text-foreground border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] shadow-lg",
        ghost: "hover:bg-[var(--glass-hover)] hover:text-foreground backdrop-blur-md",
        link: "text-primary underline-offset-4 hover:underline backdrop-blur-none",
        cta: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg border-0",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-5",
        lg: "h-12 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
