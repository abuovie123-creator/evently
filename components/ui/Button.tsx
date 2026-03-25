import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "glass" | "outline";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-foreground text-background hover:opacity-90 shadow-lg shadow-foreground/5",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            glass: "glass-panel text-foreground hover:bg-foreground/5",
            outline: "border border-foreground/20 text-foreground hover:bg-foreground/5",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
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
