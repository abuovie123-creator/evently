import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-dm-sans",
    display: "swap",
});

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
        <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
            <body className="antialiased bg-background text-foreground" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                <ToastProvider>
                    <Navbar />
                    {children}
                    <AnnouncementPopup />
                </ToastProvider>
            </body>
        </html>
    );
}
