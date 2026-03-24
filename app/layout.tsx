import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { AnimatedBackground } from "@/components/AnimatedBackground";

import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Evently | Professional Event Planner Discovery",
    description: "Discover and book professional event planners with stunning portfolios.",
    icons: {
        icon: "/favicon.svg",
        shortcut: "/favicon.svg",
        apple: "/favicon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased transition-colors duration-300`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ToastProvider>
                        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black -z-10 dark:block hidden" />
                        <div className="fixed inset-0 bg-white dark:hidden block -z-20" />
                        <AnimatedBackground />
                        <Navbar />
                        {children}
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
