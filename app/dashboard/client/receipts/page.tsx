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
                setReceipts(data as BookingReceipt[]);
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
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 pt-8">
            <div className="flex items-center gap-4 border-b border-foreground/10 pb-6">
                <Link href="/dashboard/client">
                    <Button variant="glass" className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Payment Receipts</h1>
                    <p className="text-muted-foreground text-sm">Review your finalized booking ledgers</p>
                </div>
            </div>

            <Card className="overflow-hidden border-foreground/5 bg-background shadow-2xl p-0" hover={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-foreground/[0.02] border-b border-foreground/10 text-xs uppercase tracking-widest text-muted-foreground">
                                <th className="p-6 font-bold">Transaction ID</th>
                                <th className="p-6 font-bold">Planner</th>
                                <th className="p-6 font-bold">Event Type</th>
                                <th className="p-6 font-bold">Amount</th>
                                <th className="p-6 font-bold">Date Issued</th>
                                <th className="p-6 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <Receipt size={32} className="opacity-20" />
                                            <p className="text-sm font-medium">No completed transaction records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-foreground/[0.01] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                                    <FileText size={14} />
                                                </div>
                                                <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                                                    {receipt.id.split('-')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-sm">{receipt.planner.full_name}</td>
                                        <td className="p-6">
                                            <span className="text-sm font-medium text-foreground/80">{receipt.event_type}</span>
                                        </td>
                                        <td className="p-6 font-black text-blue-500 tracking-tight">
                                            ₦{Number(receipt.budget).toLocaleString()}
                                        </td>
                                        <td className="p-6 text-xs font-medium text-muted-foreground">
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(receipt.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity border-foreground/10 text-xs"
                                            >
                                                <Download size={14} className="mr-2" /> Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
