"use client";

import { SupportTicketForm } from "@/components/SupportTicketForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ClientSupportPage() {
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pt-4">
            <div className="flex items-center gap-4 border-b border-om-border/50 pb-6 w-full">
                <Link href="/dashboard/client" className="p-2 border border-om-border/50 rounded-full hover:bg-forest hover:text-cream transition-colors text-charcoal">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-4xl font-serif text-charcoal">Help & Support</h1>
                    <p className="text-sm font-sans text-muted-foreground mt-1 tracking-wide">
                        Reach out to our dedicated concierge team for any assistance or inquiries.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
                <SupportTicketForm />
            </div>
        </div>
    );
}
