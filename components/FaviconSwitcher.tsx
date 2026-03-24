"use client";

import { useEffect } from "react";

export function FaviconSwitcher() {
    useEffect(() => {
        const setFavicon = (href: string) => {
            const links = document.querySelectorAll("link[rel*='icon']");
            links.forEach((link: any) => {
                link.href = href;
            });
        };

        // Switch to loading favicon on mount
        setFavicon("/favicon-loading.svg");

        // When loading is done (unmount), show success "pop" then return to default
        return () => {
            setFavicon("/favicon-success.svg");

            // Return to default after the "pop" animation finishes
            setTimeout(() => {
                setFavicon("/favicon.svg");
            }, 1500);
        };
    }, []);

    return null;
}
