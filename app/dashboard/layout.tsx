"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | undefined>();
    const router = useRouter();
    const pathname = usePathname();
    const { showToast } = useToast();
    const supabase = createClient();

    // Track online status
    useOnlineStatus(userId);

    useEffect(() => {
        const checkAuth = async () => {
            // Let the admin login page render without redirecting unauthenticated users to the standard login.
            if (pathname === '/dashboard/admin/login') {
                setIsLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Please login to access your dashboard", "error");
                router.push("/auth/login");
                return;
            }
            setUserId(session.user.id);
            setIsLoading(false);
        };
        checkAuth();
    }, [router, supabase.auth, showToast, pathname]);

    if (isLoading) {
        return <LoadingScreen message="Welcome back" subMessage="Preparing your desk..." />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500">
            <DashboardSidebar />
            <main className="md:pl-72 transition-all duration-300 overflow-x-hidden">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
