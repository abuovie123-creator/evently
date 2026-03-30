"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";

interface Reason {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export function WhyUsSection() {
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchReasons = async () => {
            const { data } = await supabase
                .from('home_reasons')
                .select('*')
                .order('order_index', { ascending: true });

            if (data) setReasons(data);
            setIsLoading(false);
        };
        fetchReasons();
    }, [supabase]);

    if (isLoading || reasons.length === 0) return null;

    return (
        <section className="py-32 px-6 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/[0.03] blur-[150px] -z-10 rounded-full" />

            <div className="max-w-7xl mx-auto space-y-20">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-xl mb-4">
                        Professional Standard
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                        Why the Best <span className="text-blue-500">Choice</span> is Evently
                    </h2>
                    <p className="text-xl text-muted-foreground font-light">
                        We’ve re-imagined how event planning business is conducted globally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reasons.map((reason) => {
                        const Icon = (LucideIcons as any)[reason.icon] || LucideIcons.Check;

                        return (
                            <div
                                key={reason.id}
                                className="group p-8 glass-panel border-foreground/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center text-blue-500 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-500 transition-colors">{reason.title}</h3>
                                <p className="text-muted-foreground font-light leading-relaxed text-sm">
                                    {reason.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
