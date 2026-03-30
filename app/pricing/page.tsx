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
        <main className="min-h-screen p-6 md:p-8 pt-24 md:pt-32 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <Sparkles size={14} />
                    Pricing Plans
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Grow Your Event
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Planning Business
                    </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Choose the plan that fits your ambitions. Upgrade, downgrade, or cancel anytime.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                        className={`w-12 h-6 rounded-full transition-all relative ${billingCycle === "yearly" ? "bg-blue-500" : "bg-white/10"}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billingCycle === "yearly" ? "right-1" : "left-1"}`} />
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === "yearly" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        Yearly
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full">Save 20%</span>
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
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                    <div className="px-6 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/30 animate-pulse">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <Card
                                className={`h-full flex flex-col p-8 ${tier.popular
                                    ? "border-blue-500/30 bg-blue-500/[0.03] shadow-2xl shadow-blue-500/10"
                                    : ""
                                    }`}
                                hover={true}
                            >
                                {/* Tier Header */}
                                <div className="space-y-4 mb-8">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                                        <Icon size={22} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">{tier.name}</h3>
                                    <p className="text-sm text-gray-400">{tier.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold">{displayPrice}</span>
                                        {displayPeriod && (
                                            <span className="text-sm text-gray-500 font-medium">{displayPeriod}</span>
                                        )}
                                    </div>
                                    {billingCycle === "yearly" && tier.price !== "Free" && (
                                        <p className="text-xs text-green-400 mt-1 font-medium">
                                            Save ₦{(parseInt(tier.price.replace(/[₦,]/g, "")) * 2).toLocaleString()} per year
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-8 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Check size={12} className="text-white" />
                                            </div>
                                            <span className="text-sm text-gray-300">{feature}</span>
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
                                        className={`w-full group ${tier.popular
                                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none hover:shadow-lg hover:shadow-blue-500/25"
                                            : ""
                                            }`}
                                        variant={tier.popular ? "primary" : "outline"}
                                        size="lg"
                                    >
                                        {tier.cta}
                                        <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto space-y-8 mb-16">
                <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        {
                            q: "Can I switch plans anytime?",
                            a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing."
                        },
                        {
                            q: "What payment methods do you accept?",
                            a: "We accept payments via Paystack, Flutterwave, and direct bank transfers. All transactions are secure and encrypted."
                        },
                        {
                            q: "Is there a contract or commitment?",
                            a: "No contracts, no commitments. You can cancel your subscription at any time and continue using the features until your billing period ends."
                        },
                        {
                            q: "What happens when my subscription expires?",
                            a: "Your account will automatically downgrade to the Starter plan. Your data and profile remain intact, but premium features will be disabled."
                        },
                    ].map((faq, i) => (
                        <Card key={i} className="p-6" hover={false}>
                            <h4 className="font-bold mb-2">{faq.q}</h4>
                            <p className="text-sm text-gray-400">{faq.a}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    );
}
