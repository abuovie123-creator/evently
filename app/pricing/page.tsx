"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Sparkles, Crown, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const tiers = [
    {
        id: "starter",
        name: "Starter",
        price: "Free",
        period: "",
        description: "Get discovered and start building your client base.",
        icon: Zap,
        color: "from-gray-500 to-gray-600",
        borderColor: "border-border",
        features: [
            "Basic public profile",
            "5 portfolio images",
            "Standard directory listing",
            "Booking request notifications",
            "Community support",
        ],
        cta: "Get Started Free",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "₦5,000",
        period: "/month",
        description: "Stand out with premium tools and priority placement.",
        icon: Sparkles,
        color: "from-amber-600 to-amber-400",
        borderColor: "border-charcoal/20",
        features: [
            "Verified badge ✓",
            "25 portfolio images",
            "Featured directory listing",
            "Advanced analytics dashboard",
            "Priority in search results",
            "Client review showcase",
            "Direct messaging",
        ],
        cta: "Upgrade to Pro",
        popular: true,
    },
    {
        id: "elite",
        name: "Elite",
        price: "₦15,000",
        period: "/month",
        description: "Dominate your market with the ultimate toolkit.",
        icon: Crown,
        color: "from-amber-500 to-orange-500",
        borderColor: "border-amber-500/30",
        features: [
            "Everything in Pro",
            "Unlimited portfolio images",
            "Top placement guaranteed",
            "Custom profile branding",
            "Priority support (24/7)",
            "Event album sharing",
            "Social media integration",
            "Dedicated account manager",
        ],
        cta: "Go Elite",
        popular: false,
    },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dynamicTiers, setDynamicTiers] = useState(tiers);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();

            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);

            // 2. Fetch Pricing from Platform Settings
            const { data: settings } = await supabase
                .from('platform_settings')
                .select('subscription_plans')
                .eq('id', 'default')
                .single();

            if (settings?.subscription_plans) {
                const dbPlans = settings.subscription_plans;

                // Merge DB data with local UI metadata
                const merged = tiers.map(tier => {
                    const dbPlan = dbPlans.find((p: any) => p.id === tier.id);
                    if (dbPlan) {
                        return {
                            ...tier,
                            name: dbPlan.name || tier.name,
                            price: dbPlan.price === "0" ? "Free" : `₦${parseInt(dbPlan.price).toLocaleString()}`,
                            features: dbPlan.features || tier.features,
                            period: dbPlan.period ? `/${dbPlan.period}` : tier.period
                        };
                    }
                    return tier;
                });
                setDynamicTiers(merged);
            }
            setIsLoading(false);
        };
        init();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-4 border-charcoal/30 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen p-6 md:p-8 pt-32 md:pt-48 max-w-7xl mx-auto animate-in fade-in duration-1000 bg-cream">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-24 space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-charcoal/5 border border-charcoal/10 text-charcoal text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                    Simple, Transparent Pricing
                </div>
                <h1 className="text-6xl md:text-8xl font-serif italic text-charcoal tracking-tighter leading-none mb-8">
                    Pricing
                </h1>
                <p className="text-[#6B5E4E] text-xs md:text-sm font-sans max-w-xl mx-auto opacity-75 leading-relaxed">
                    Choose a plan that fits your business. Start free and upgrade as you grow.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-6 mt-12">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`text-xs font-bold uppercase tracking-widest transition-all ${billingCycle === "monthly" ? "text-charcoal" : "text-[#6B5E4E]/60 hover:text-charcoal"}`}
                    >
                        Monthly
                    </button>

                    {/* Toggle track — always visible */}
                    <button
                        onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                        className="w-14 h-7 rounded-full relative transition-all duration-300 flex-shrink-0"
                        style={{
                            background: billingCycle === "yearly" ? "var(--charcoal)" : "var(--muted)",
                            border: "1.5px solid var(--border)",
                        }}
                    >
                        {/* Knob */}
                        <div
                            className="absolute top-[3px] w-[18px] h-[18px] rounded-full shadow-sm transition-all duration-300"
                            style={{
                                background: billingCycle === "yearly" ? "var(--gold)" : "var(--accent)",
                                left: billingCycle === "yearly" ? "calc(100% - 21px)" : "3px",
                            }}
                        />
                    </button>

                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${billingCycle === "yearly" ? "text-charcoal" : "text-[#6B5E4E]/60 hover:text-charcoal"}`}
                    >
                        Yearly
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-bold tracking-widest rounded-full">− 20%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto mb-24">
                {dynamicTiers.map((tier, index) => {
                    const Icon = tier.icon;
                    const rawPrice = parseInt(tier.price.replace(/[₦,]/g, "")) || 0;
                    const displayPrice = tier.price === "Free"
                        ? "Free"
                        : billingCycle === "yearly"
                            ? `₦${(rawPrice * 10).toLocaleString()}`
                            : tier.price;
                    const displayPeriod = tier.price === "Free"
                        ? ""
                        : billingCycle === "yearly" ? "/year" : "/month";

                    return (
                        <div
                            key={tier.name}
                            className="relative"
                        >
                            <Card
                                className={`h-full flex flex-col p-8 md:p-12 border border-charcoal/10 rounded-3xl bg-surface transition-all duration-300 ${tier.popular
                                    ? "border-amber-400/50 scale-105 z-10 shadow-xl shadow-amber-400/10"
                                    : "shadow-sm hover:shadow-md hover:border-charcoal/20"
                                    }`}
                                hover={false}
                            >
                                {/* Tier Header */}
                                <div className="space-y-8 mb-16">
                                    <div className="w-20 h-20 bg-cream border border-om-border/30 flex items-center justify-center">
                                        <Icon size={32} className="text-charcoal" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-4xl font-serif italic text-charcoal leading-none">{tier.name}</h3>
                                        <p className="text-[10px] text-[#6B5E4E] uppercase tracking-[0.3em] leading-relaxed opacity-50 italic">Collection Tier</p>
                                    </div>
                                    <p className="text-[12px] text-[#6B5E4E] leading-relaxed opacity-70 font-sans tracking-wide">{tier.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-12 border-y border-om-border/20 py-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-serif text-charcoal">{displayPrice}</span>
                                        {displayPeriod && (
                                            <span className="text-[10px] text-[#6B5E4E] uppercase tracking-widest opacity-60">{displayPeriod}</span>
                                        )}
                                    </div>
                                    {billingCycle === "yearly" && tier.price !== "Free" && (
                                        <p className="text-[9px] text-amber-600 mt-3 font-bold uppercase tracking-[0.2em]">
                                            Annual discount applied
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-4 mb-12 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <Check size={14} className="text-gold mt-1 flex-shrink-0" />
                                            <span className="text-[11px] text-[#6B5E4E] uppercase tracking-widest leading-relaxed opacity-80">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href={isLoggedIn
                                        ? (tier.id === 'starter' ? '/dashboard/planner' : `/payout?tier=${tier.id}`)
                                        : "/auth/register"
                                    }
                                    className="block"
                                >
                                    <Button
                                        className={`w-full h-13 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 ${tier.popular
                                            ? "bg-charcoal text-cream hover:bg-black shadow-lg shadow-charcoal/20"
                                            : "bg-transparent border border-charcoal/30 text-charcoal hover:bg-charcoal hover:text-cream hover:border-charcoal"
                                            }`}
                                        variant={tier.popular ? "primary" : "outline"}
                                        size="lg"
                                    >
                                        {tier.cta}
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    );
                })}
            </div>


        </main>
    );
}
