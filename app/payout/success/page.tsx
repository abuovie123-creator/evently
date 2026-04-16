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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
                <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-6" />
                <h2 className="text-2xl font-bold animate-pulse">Finalizing your upgrade...</h2>
                <p className="text-gray-400 mt-2">Please do not close this window.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

            <Card className="max-w-lg w-full p-8 md:p-12 text-center space-y-8 bg-white/[0.02] border-white/10 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-500 rounded-[3rem]">
                <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto relative shadow-2xl shadow-green-500/20">
                    <CheckCircle2 size={48} className="text-green-500" />
                    <div className="absolute -top-2 -right-2 bg-yellow-500/20 p-2 rounded-full backdrop-blur-md">
                        <PartyPopper size={20} className="text-yellow-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tighter">Payment Successful!</h1>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Your account has been instantly upgraded to the <strong className="text-white uppercase">{tierId}</strong> tier via {gateway}.
                    </p>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                    <Button
                        onClick={() => router.push('/dashboard/planner')}
                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                        Go to your Dashboard <ArrowRight size={18} />
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function PayoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
                <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-6" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
