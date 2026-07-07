import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "w-full bg-surface border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all [&:-webkit-autofill]:text-foreground [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_var(--surface)_inset] rounded-sm",
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";
