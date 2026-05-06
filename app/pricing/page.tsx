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
        borderColor: "border-white/10",
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
        color: "from-blue-500 to-cyan-500",
        borderColor: "border-blue-500/30",
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
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen p-6 md:p-8 pt-32 md:pt-48 max-w-7xl mx-auto animate-in fade-in duration-1000 bg-cream">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-24 space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-none bg-charcoal/5 border border-om-border/30 text-charcoal text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                    The Heritage Collections
                </div>
                <h1 className="text-5xl md:text-8xl font-serif italic text-charcoal tracking-tight leading-[0.9]">
                    Curated Tier Selection
                </h1>
                <p className="text-[#6B5E4E] text-[11px] md:text-xs font-sans uppercase tracking-[0.25em] max-w-2xl mx-auto opacity-70 italic leading-relaxed">
                    Select the architectural foundation for your estate management. Each tier is meticulously curated to elevate your heritage planning operations.
                </p>

                {/* Heritage Billing Toggle */}
                <div className="flex items-center justify-center gap-8 mt-12">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${billingCycle === "monthly" ? "text-charcoal border-b border-gold pb-1" : "text-[#6B5E4E]/40 hover:text-charcoal"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                        className={`w-14 h-7 rounded-none transition-all relative border border-om-border/40 ${billingCycle === "yearly" ? "bg-charcoal" : "bg-cream"}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-none transition-all ${billingCycle === "yearly" ? "right-1.5 bg-gold" : "left-1.5 bg-charcoal/20"}`} />
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${billingCycle === "yearly" ? "text-charcoal border-b border-gold pb-1" : "text-[#6B5E4E]/40 hover:text-charcoal"}`}
                    >
                        Yearly
                        <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-bold tracking-widest">− 20%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-24">
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
                            className={`relative ${tier.popular ? "md:-mt-4 md:mb-0" : ""}`}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                                    <div className="px-8 py-2 bg-gold text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal shadow-xl">
                                        Signature Choice
                                    </div>
                                </div>
                            )}

                            <Card
                                className={`h-full flex flex-col p-10 md:p-14 border border-om-border/30 rounded-none bg-surface shadow-none ${tier.popular
                                    ? "border-gold/40 scale-105 z-10"
                                    : "opacity-90"
                                    }`}
                                hover={false}
                            >
                                {/* Tier Header */}
                                <div className="space-y-6 mb-12">
                                    <div className="w-16 h-16 bg-cream border border-om-border/30 flex items-center justify-center">
                                        <Icon size={28} className="text-charcoal" />
                                    </div>
                                    <h3 className="text-3xl font-serif italic text-charcoal leading-tight">{tier.name} Suite</h3>
                                    <p className="text-[11px] text-[#6B5E4E] uppercase tracking-widest leading-relaxed opacity-60 italic">{tier.description}</p>
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
                                        <p className="text-[9px] text-accent mt-3 font-bold uppercase tracking-[0.2em] italic">
                                            Heritage Discount Applied
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
                                        className={`w-full h-16 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-700 ${tier.popular
                                            ? "bg-charcoal text-cream hover:bg-black border-charcoal"
                                            : "bg-transparent border-charcoal text-charcoal hover:bg-charcoal hover:text-cream"
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
