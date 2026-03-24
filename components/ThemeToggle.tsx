"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-spring ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-spring ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100 text-blue-400' : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr ${theme === 'dark' ? 'from-blue-500/10 to-transparent' : 'from-amber-500/10 to-transparent'
                }`} />
        </button>
    );
}
