import { jsx } from 'react/jsx-runtime';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as LabelPrimitive from '@radix-ui/react-label';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
        cta: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg border-0"
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-5",
        lg: "h-12 px-10",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;

const heroImage = new Proxy({"src":"/_astro/hero-bg.DesaOZ3u.jpg","width":1920,"height":1080,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/hero-bg.jpg";
							}
							
							return target[name];
						}
					});

const logo = new Proxy({"src":"/_astro/logo.D6s7KLzb.jpg","width":1080,"height":1080,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/assets/logo.jpg";
							}
							
							return target[name];
						}
					});

export { Button as B, Input as I, Label as L, cn as c, heroImage as h, logo as l };
