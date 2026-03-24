import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    className?: string;
    key?: string | number;
}

export function Card({ className, hover = true, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl p-6",
                hover ? "glass-card" : "glass-panel",
                className
            )}
            {...props}
        />
    );
}
