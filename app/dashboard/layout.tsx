"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | undefined>();
    const router = useRouter();
    const { showToast } = useToast();
    const supabase = createClient();

    // Track online status
    useOnlineStatus(userId);

    useEffect(() => {
        const checkAuth = async () => {
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
    }, [router, supabase.auth, showToast]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
            <DashboardSidebar />
            <main className="md:pl-72 transition-all duration-300 overflow-x-hidden">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
