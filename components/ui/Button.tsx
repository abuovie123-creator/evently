import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "glass" | "outline";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-charcoal text-cream hover:bg-forest transition-colors",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            glass: "glass-panel text-foreground hover:bg-foreground/5",
            outline: "border border-gold text-charcoal hover:bg-gold hover:text-charcoal transition-all",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs tracking-widest uppercase font-bold",
            md: "px-6 py-3 text-sm tracking-widest uppercase font-bold",
            lg: "px-8 py-4 text-sm tracking-widest uppercase font-bold",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant as keyof typeof variants],
                    sizes[size as keyof typeof sizes],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
