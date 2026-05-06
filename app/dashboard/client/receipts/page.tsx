"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Receipt, Download, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface BookingReceipt {
    id: string;
    event_type: string;
    event_date: string;
    status: string;
    budget: string;
    created_at: string;
    planner: {
        full_name: string;
    };
}

export default function ClientReceiptsPage() {
    const [receipts, setReceipts] = useState<BookingReceipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchReceipts = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) return;

            // Fetch approved or confirmed bookings to display as valid receipts
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    event_type,
                    event_date,
                    status,
                    budget,
                    created_at,
                    planner:profiles!bookings_planner_id_fkey(full_name)
                `)
                .eq('client_id', session.user.id)
                .in('status', ['approved', 'confirmed'])
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching receipts:", error);
                showToast("Failed to load receipts", "error");
            } else {
                const mappedReceipts = (data as any[]).map(item => ({
                    ...item,
                    planner: Array.isArray(item.planner) ? item.planner[0] : item.planner
                }));
                setReceipts(mappedReceipts as BookingReceipt[]);
            }
            setIsLoading(false);
        };

        fetchReceipts();
    }, [showToast]);

    const handleDownload = (id: string) => {
        // In a real app, this would use a PDF generation library like jspdf.
        // For now, we mock the download sequence.
        showToast("Generating secure PDF receipt...", "success");
        setTimeout(() => {
            window.print();
        }, 1000);
    };

    if (isLoading) return <LoadingScreen message="Loading Financials" />;

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto p-4 md:p-8 lg:p-12 pt-20 md:pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-om-border/30 pb-8">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/client">
                        <button className="h-14 w-14 rounded-full p-0 flex items-center justify-center border border-om-border/50 text-charcoal hover:bg-forest hover:text-cream transition-all duration-500">
                            <ArrowLeft size={22} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-charcoal tracking-tight">Financial Ledger</h1>
                        <p className="text-[#6B5E4E] text-sm mt-1 font-sans italic opacity-80">Review and archive your finalized estate consultation records.</p>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border border-om-border/30 bg-cream shadow-none rounded-none p-0" hover={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-om-border/40 text-[10px] uppercase tracking-[0.25em] text-[#6B5E4E]">
                                <th className="p-8 font-bold">Ref. Identifier</th>
                                <th className="p-8 font-bold">Counsel / Planner</th>
                                <th className="p-8 font-bold">Service Type</th>
                                <th className="p-8 font-bold">Budgetary Value</th>
                                <th className="p-8 font-bold">Issuance Date</th>
                                <th className="p-8 font-bold text-right">Records</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-om-border/20">
                            {receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-muted-foreground animate-in fade-in duration-1000">
                                        <div className="flex flex-col items-center gap-6">
                                            <Receipt size={40} className="text-charcoal/10" />
                                            <p className="text-sm font-serif italic text-[#6B5E4E]">The ledger currently remains clear of finalized records.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-charcoal/[0.01] transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-none bg-cream border border-om-border/50 flex items-center justify-center text-accent shrink-0 group-hover:bg-charcoal group-hover:text-gold transition-all duration-700">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="font-sans text-[11px] font-bold text-charcoal/60 uppercase tracking-widest">
                                                    #{receipt.id.split('-')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8 font-serif text-[17px] text-charcoal">{receipt.planner.full_name}</td>
                                        <td className="p-8">
                                            <span className="text-xs font-bold uppercase tracking-widest text-[#6B5E4E] opacity-80">{receipt.event_type}</span>
                                        </td>
                                        <td className="p-8 font-serif text-[19px] text-charcoal font-bold tracking-tight">
                                            ₦{Number(receipt.budget).toLocaleString()}
                                        </td>
                                        <td className="p-8 text-[11px] font-bold text-[#6B5E4E] uppercase tracking-widest">
                                            {new Date(receipt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="p-8 text-right">
                                            <button
                                                onClick={() => handleDownload(receipt.id)}
                                                className="opacity-40 group-hover:opacity-100 transition-all text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal hover:text-forest flex items-center justify-end gap-2 ml-auto"
                                            >
                                                Archive <Download size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="flex justify-center pt-8">
                <p className="text-[9px] font-bold text-[#6B5E4E] uppercase tracking-[0.3em] opacity-40">End of Financial Statement</p>
            </div>
        </div>
    );
}
