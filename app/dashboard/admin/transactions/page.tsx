"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Search, ArrowLeft, History, Wallet, CheckCircle2, XCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export default function TransactionsPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [bankTransfers, setBankTransfers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"automated" | "manual">("automated");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        const supabase = createClient();

        // Check auth & role
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/dashboard/admin/login");
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin') {
            router.push("/dashboard/admin/login");
            return;
        }

        // Fetch Automatic Transactions
        const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('*, profiles(full_name, email)')
            .order('created_at', { ascending: false });

        if (txError) {
            console.error("Error fetching transactions", txError);
            showToast("Failed to load automated transactions", "error");
        } else {
            setTransactions(txData || []);
        }

        // Fetch Bank Transfers (Manual)
        const { data: btData, error: btError } = await supabase
            .from('bank_transfers')
            .select('*, profiles(full_name, email)')
            .order('created_at', { ascending: false });

        if (btError) {
            console.error("Error fetching bank transfers", btError);
            showToast("Failed to load manual transfers", "error");
        } else {
            setBankTransfers(btData || []);
        }

        setIsLoading(false);
    }, [router, showToast]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const approveTransfer = async (transferId: string, profileId: string, tier: string) => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            const { error: btError } = await supabase
                .from('bank_transfers')
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq('id', transferId);
            if (btError) throw btError;

            const { error: pError } = await supabase
                .from('profiles')
                .update({
                    plan_id: tier,
                    subscription_status: 'active',
                    subscription_end_date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('id', profileId);
            if (pError) throw pError;

            setBankTransfers(prev => prev.map(bt => bt.id === transferId ? { ...bt, status: 'approved' } : bt));
            showToast("Payment approved and user upgraded!", "success");
        } catch (error: any) {
            console.error("Approval failed", error);
            showToast(error.message || "Approval failed", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const declineTransfer = async (transferId: string) => {
        const reason = prompt("Reason for declining:");
        if (reason === null) return;

        setIsSaving(true);
        const supabase = createClient();
        const { error } = await supabase
            .from('bank_transfers')
            .update({ status: 'declined', notes: reason, updated_at: new Date().toISOString() })
            .eq('id', transferId);

        if (error) {
            showToast("Failed to decline transfer", "error");
        } else {
            setBankTransfers(prev => prev.map(bt => bt.id === transferId ? { ...bt, status: 'declined' } : bt));
            showToast("Transfer declined", "error");
        }
        setIsSaving(false);
    };

    const filteredTransactions = transactions.filter(tx => 
        (tx.profiles?.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (tx.reference?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const filteredManual = bankTransfers.filter(bt => 
        (bt.profiles?.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white text-charcoal -m-4 md:-m-8 p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 border-b border-om-border/30">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin" className="p-2 border border-om-border/20 rounded-full hover:bg-om-border/10 transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-charcoal">Transactions Hub</h1>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 group-focus-within:text-gold transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search users or references..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border border-om-border/30 py-2.5 pl-10 pr-4 text-xs font-sans uppercase tracking-widest text-charcoal placeholder:text-charcoal/40 focus:border-gold outline-none transition-all"
                    />
                </div>
            </header>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Tabs */}
                <div className="flex border-b border-om-border/30 gap-8">
                    <button
                        onClick={() => setActiveTab("automated")}
                        className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${
                            activeTab === "automated" ? 'text-charcoal' : 'text-[#6B5E4E] opacity-60 hover:opacity-100'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <History size={16} />
                            Automated Payments
                        </div>
                        {activeTab === "automated" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${
                            activeTab === "manual" ? 'text-charcoal' : 'text-[#6B5E4E] opacity-60 hover:opacity-100'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Wallet size={16} />
                            Manual Transfers
                        </div>
                        {activeTab === "manual" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold" />}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === "automated" && (
                            <div className="space-y-4">
                                {filteredTransactions.length === 0 ? (
                                    <div className="p-8 text-center text-charcoal/60 italic font-serif">No transactions found.</div>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <Card key={tx.id} className="p-4 flex items-center justify-between border border-om-border/30 hover:border-gold transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {tx.status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-charcoal uppercase tracking-widest">{tx.profiles?.full_name || "Unknown User"}</p>
                                                    <p className="text-[10px] text-charcoal/60 font-mono mt-1">
                                                        Ref: {tx.reference || 'N/A'} • {new Date(tx.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-charcoal">₦{Number(tx.amount).toLocaleString()}</p>
                                                <p className="text-[10px] uppercase font-bold text-charcoal/60 tracking-wider">
                                                    {tx.plan_name} via {tx.method}
                                                </p>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "manual" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredManual.length === 0 ? (
                                    <div className="col-span-full p-8 text-center text-charcoal/60 italic font-serif">No manual transfers found.</div>
                                ) : (
                                    filteredManual.map((bt) => (
                                        <Card key={bt.id} className="p-6 space-y-4 border border-om-border/30 hover:border-gold transition-all bg-surface/50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold uppercase tracking-widest text-charcoal">{bt.profiles?.full_name || "Unknown"}</p>
                                                    <p className="text-[10px] text-charcoal/60 font-mono mt-1">
                                                        {(bt.target_tier || 'N/A').toUpperCase()} PLAN - ₦{Number(bt.amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-none border text-[9px] font-black uppercase tracking-[0.2em] 
                                                    ${bt.status === 'approved' ? 'bg-green-500/10 text-green-700 border-green-500/30' :
                                                        bt.status === 'declined' ? 'bg-red-500/10 text-red-700 border-red-500/30' :
                                                            'bg-amber-500/10 text-amber-700 border-amber-500/30'}`}>
                                                    {bt.status}
                                                </span>
                                            </div>

                                            {bt.screenshot_url && (
                                                <div className="relative aspect-video rounded-xl overflow-hidden group border border-om-border/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${bt.screenshot_url}`}
                                                        alt="Payment Proof"
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button variant="outline" size="sm" onClick={() => window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${bt.screenshot_url}`, '_blank')} className="border-cream text-cream hover:bg-cream hover:text-charcoal">
                                                            View Full Proof
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {bt.status === 'pending' && (
                                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-om-border/10">
                                                    <Button
                                                        variant="outline"
                                                        className="border-red-500 text-red-700 hover:bg-red-50"
                                                        disabled={isSaving}
                                                        onClick={() => declineTransfer(bt.id)}
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        className="bg-charcoal text-cream hover:bg-gold hover:text-charcoal"
                                                        disabled={isSaving}
                                                        onClick={() => approveTransfer(bt.id, bt.profile_id, bt.target_tier)}
                                                    >
                                                        Approve Upgrade
                                                    </Button>
                                                </div>
                                            )}
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
