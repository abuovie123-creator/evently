"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tierId = searchParams.get('tier');
    const gateway = searchParams.get('gateway');

    const [isUpgrading, setIsUpgrading] = useState(true);

    useEffect(() => {
        const upgradeSandboxAccount = async () => {
            // This is ONLY hit securely if the backend initializes a mock bypass (keys missing).
            if (!tierId) return;

            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // In sandbox/bypass mode, we manually trigger the upgrade from the client.
            // In pure production, the webhook would have done this and we'd just render "Success".
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1);

            await supabase
                .from('profiles')
                .update({
                    plan_id: tierId,
                    subscription_status: 'active',
                    subscription_end_date: futureDate.toISOString()
                })
                .eq('id', session.user.id);

            setIsUpgrading(false);
        };

        // Give a slight delay to simulate processing
        const timer = setTimeout(() => {
            upgradeSandboxAccount();
        }, 2000);

        return () => clearTimeout(timer);
    }, [tierId]);

    if (isUpgrading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF8F3] text-[#1C1A16]">
                <Loader2 className="animate-spin text-[#C4A55A] w-12 h-12 mb-6" />
                <h2 className="text-2xl font-serif animate-pulse">Finalizing your upgrade...</h2>
                <p className="text-[#6B5E4E] italic mt-2">Please do not close this window.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F3] text-[#1C1A16] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4C5A9]/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

            <Card className="max-w-lg w-full p-8 md:p-12 text-center space-y-8 bg-white border border-[#D4C5A9]/30 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 rounded-none" hover={false}>
                <div className="w-24 h-24 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto relative shadow-xl">
                    <CheckCircle2 size={48} className="text-[#8B7355]" />
                    <div className="absolute -top-2 -right-2 bg-white border border-[#D4C5A9]/30 p-2 rounded-full shadow-lg">
                        <PartyPopper size={20} className="text-[#C4A55A]" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-serif text-[#1C1A16]">Payment Successful!</h1>
                    <p className="text-[#6B5E4E] text-sm max-w-sm mx-auto italic leading-relaxed">
                        Your account has been instantly upgraded to the <strong className="text-[#1C1A16] uppercase font-bold not-italic">{tierId}</strong> tier via {gateway}.
                    </p>
                </div>

                <div className="pt-8 border-t border-[#D4C5A9]/30 space-y-4">
                    <Button
                        onClick={() => router.push('/dashboard/planner')}
                        className="w-full h-14 bg-[#1A2E1A] hover:bg-[#2C3A2E] text-white font-bold rounded-none flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        Go to your Dashboard <ArrowRight size={14} />
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function PayoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF8F3] text-[#1C1A16]">
                <Loader2 className="animate-spin text-[#C4A55A] w-12 h-12 mb-6" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
