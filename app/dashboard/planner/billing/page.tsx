"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Check, Sparkles, Zap, Shield, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface PlanFeature {
    id: string;
    name: string;
    price: number | string;
    period: string;
    features: string[];
    imageLimit: number;
}

export default function PlannerBillingPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [plans, setPlans] = useState<PlanFeature[]>([]);
    const [currentPlanId, setCurrentPlanId] = useState<string>("starter");
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchBillingData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch global pricing plans
            const { data: settings } = await supabase
                .from('platform_settings')
                .select('subscription_plans')
                .eq('id', 'default')
                .single();

            if (settings?.subscription_plans) {
                setPlans(settings.subscription_plans);
            }

            // Fetch user profile plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('plan_id, subscription_end_date')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                setCurrentPlanId(profile.plan_id || 'starter');
                setSubscriptionEndDate(profile.subscription_end_date);
            }

            setIsLoading(false);
        };

        fetchBillingData();
    }, []);

    if (isLoading) return <LoadingScreen message="Loading Financial Tools" />;

    const renderPlanIcon = (name: string) => {
        if (name.toLowerCase().includes("elite")) return <Sparkles size={24} className="text-purple-400" />;
        if (name.toLowerCase().includes("pro")) return <Zap size={24} className="text-yellow-400" />;
        return <Shield size={24} className="text-blue-400" />;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto p-4 md:p-6 lg:p-8 pt-8">
            <div className="flex items-center justify-between pb-6 border-b border-foreground/10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/planner">
                        <Button variant="glass" className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center border-foreground/10">
                            <ArrowLeft size={20} className="text-muted-foreground" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Billing & Plans</h1>
                        <p className="text-muted-foreground text-sm">Manage your platform subscription and limits</p>
                    </div>
                </div>
            </div>

            {/* Current Plan Overview */}
            <div className="flex flex-col md:flex-row gap-8">
                <Card className="flex-1 p-8 space-y-6 bg-gradient-to-br from-blue-600/[0.05] to-purple-600/[0.05] border-foreground/10 shadow-2xl rounded-[2.5rem]" hover={false}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Current Subscription</h2>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Active Plan</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-4xl font-black tracking-tighter uppercase">
                            {plans.find(p => p.id === currentPlanId)?.name || 'Starter'} Plan
                        </h3>
                        {subscriptionEndDate ? (
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Renews on <strong className="text-foreground">{new Date(subscriptionEndDate).toLocaleDateString()}</strong>
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-muted-foreground">Free Forever Tier</p>
                        )}
                    </div>

                    <div className="pt-6 border-t border-foreground/10">
                        <Link href="/payout">
                            <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground hover:bg-foreground/90 text-background shadow-xl shadow-foreground/10 transition-all w-full md:w-auto">
                                Upgrade Plan / Payout <ExternalLink size={14} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Pricing Tiers Table */}
            <div className="pt-8">
                <h3 className="text-xl font-bold mb-6">Available Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;

                        return (
                            <Card
                                key={plan.id}
                                hover={false}
                                className={`p-8 relative overflow-hidden transition-all duration-300 rounded-[2.5rem] border ${isCurrent ? 'border-blue-500 shadow-2xl shadow-blue-500/20 bg-blue-500/[0.02]' : 'border-foreground/5 bg-background shadow-lg'}`}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                                            Current
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        {renderPlanIcon(plan.name)}
                                        <h4 className="text-xl font-black uppercase tracking-tight">{plan.name}</h4>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tighter">₦{Number(plan.price).toLocaleString()}</span>
                                        <span className="text-sm text-muted-foreground">/{plan.period}</span>
                                    </div>

                                    <ul className="space-y-4 pt-6 border-t border-foreground/10">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
                                                <div className="p-1 rounded-full bg-green-500/10 shrink-0 mt-0.5">
                                                    <Check size={12} className="text-green-500" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
