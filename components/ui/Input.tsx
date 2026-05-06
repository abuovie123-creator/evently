import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "w-full bg-white/50 border border-border rounded-[1px] px-4 py-3 text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all",
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";
