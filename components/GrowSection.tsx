"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";
import { Card } from "./ui/Card";

interface Feature {
    id: string;
    title: string;
    description: string;
    icon: string;
    image_url: string;
}

const defaultFeatures = [
    {
        id: "1",
        title: "All-in-One Dashboard",
        description: "Manage your bookings, messages, and portfolio from a single, intuitive command center.",
        icon: "Layout",
        image_url: "/mockups/analytics.png"
    },
    {
        id: "2",
        title: "Premium Portfolios",
        description: "Showcase your best work with high-fidelity media galleries and verified badges.",
        icon: "Image",
        image_url: "/mockups/portfolio.png"
    },
    {
        id: "3",
        title: "Direct Client Chat",
        description: "Engage with clients in real-time through our branded messaging portal.",
        icon: "MessageSquare",
        image_url: "/mockups/messaging.png"
    }
];

export function GrowSection() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchFeatures = async () => {
            const { data } = await supabase
                .from('home_features')
                .select('*')
                .order('order_index', { ascending: true });

            if (data && data.length > 0) {
                // Map the remote items but use local mockups for visual excellence if image_url is placeholder
                const mapped = data.map((f, i) => ({
                    ...f,
                    image_url: f.image_url.includes('unsplash') ? defaultFeatures[i % 3].image_url : f.image_url
                }));
                setFeatures(mapped);
            } else {
                setFeatures(defaultFeatures);
            }
            setIsLoading(false);
        };
        fetchFeatures();
    }, [supabase]);

    if (isLoading) return null;

    return (
        <section className="py-24 px-6 bg-foreground/[0.02] border-y border-foreground/5 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-24">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Everything You Need to <span className="text-blue-500">Grow</span>
                    </h2>
                    <p className="text-xl text-muted-foreground font-light">
                        The definitive toolkit built specifically for the modern event professional.
                    </p>
                </div>

                <div className="space-y-32">
                    {features.map((feature, i) => {
                        const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.Zap;
                        const isEven = i % 2 === 0;

                        return (
                            <div
                                key={feature.id}
                                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}
                            >
                                <div className="flex-1 space-y-8 text-center lg:text-left">
                                    <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 mx-auto lg:mx-0 shadow-inner">
                                        <Icon size={32} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-black tracking-tight">{feature.title}</h3>
                                        <p className="text-lg text-muted-foreground font-light leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-foreground/5 border border-foreground/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                            <LucideIcons.CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                            Advanced UI
                                        </div>
                                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-foreground/5 border border-foreground/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                            <LucideIcons.CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                            Cloud Hosted
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-blue-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                                    <Card className="p-2 bg-foreground/5 border-foreground/10 rounded-[3rem] overflow-hidden transform hover:-translate-y-2 transition-all duration-700 shadow-2xl">
                                        <img
                                            src={feature.image_url}
                                            alt={feature.title}
                                            className="w-full h-auto rounded-[2.5rem] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl"
                                        />
                                    </Card>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
