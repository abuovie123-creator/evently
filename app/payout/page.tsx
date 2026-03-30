"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import {
    CreditCard,
    Building2,
    Upload,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react";
import Link from "next/link";

function PayoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const tierId = searchParams.get("tier");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<"gateway" | "manual">("gateway");
    const [selectedTier, setSelectedTier] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [user, setUser] = useState<any>(null);

    const [gatewayKeys, setGatewayKeys] = useState<any>(null);

    useEffect(() => {
        const initCheckout = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                showToast("Please login to continue", "error");
                router.push("/auth/login");
                return;
            }
            setUser(session.user);

            // Fetch platform settings (plans and gateway keys)
            const { data: settings } = await supabase
                .from('platform_settings')
                .select('subscription_plans, gateway_keys')
                .eq('id', 'default')
                .single();

            if (settings) {
                // 1. Handle Plans
                const plans = settings.subscription_plans || [];
                const plan = plans.find((p: any) => p.id === tierId);
                if (plan) {
                    setSelectedTier(plan);
                    setAmount(plan.price);
                } else {
                    router.push("/pricing");
                }

                // 2. Handle Gateway Keys (for manual bank details)
                if (settings.gateway_keys) {
                    setGatewayKeys(settings.gateway_keys);
                }
            }
            setIsLoading(false);
        };
        initCheckout();
    }, [tierId, router, showToast]);

    const manualDetails = gatewayKeys?.manual || {
        bankName: "Standard Chartered Bank",
        accountNumber: "1234567890",
        accountName: "Evently Platform Ltd"
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const handleSubmitManual = async () => {
        if (!screenshot) {
            showToast("Please upload a payment screenshot", "error");
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            // 1. Upload screenshot to storage
            const fileExt = screenshot.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(fileName, screenshot);

            if (uploadError) throw uploadError;

            // 2. Record request in bank_transfers
            const { error: dbError } = await supabase
                .from('bank_transfers')
                .insert({
                    profile_id: user.id,
                    amount: parseFloat(amount),
                    screenshot_url: fileName,
                    target_tier: tierId,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            showToast("Payment request submitted! Admin will verify soon.", "success");
            router.push("/dashboard/planner");
        } catch (error: any) {
            showToast(error.message || "Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="min-h-screen bg-black text-white p-6 pt-32 pb-20">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="flex items-center gap-4">
                    <Link href="/pricing" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Checkout</h1>
                        <p className="text-gray-400">Upgrade to {selectedTier?.name} Plan</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Payment Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <CreditCard className="text-blue-400" size={20} />
                                Select Payment Method
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedMethod("gateway")}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${selectedMethod === "gateway"
                                        ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                                        : "border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                        <Zap size={20} />
                                    </div>
                                    <span className="font-bold block">Pay Instant (ATM/Transfer)</span>
                                    <p className="text-xs text-gray-500">Pay via Paystack or Flutterwave</p>
                                </button>

                                <button
                                    onClick={() => setSelectedMethod("manual")}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${selectedMethod === "manual"
                                        ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10"
                                        : "border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                                        <Building2 size={20} />
                                    </div>
                                    <span className="font-bold block">Manual Bank Transfer</span>
                                    <p className="text-xs text-gray-500">Upload receipt for admin approval</p>
                                </button>
                            </div>
                        </section>

                        {selectedMethod === "manual" && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-6 glass-panel border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-4">
                                    <div className="flex gap-4">
                                        <Info className="text-amber-400 shrink-0" size={20} />
                                        <div className="space-y-2">
                                            <p className="font-bold text-amber-400">Our Bank Details</p>
                                            <div className="space-y-1 text-sm text-gray-300">
                                                <p>Bank: <span className="text-white font-bold">{manualDetails.bankName}</span></p>
                                                <p>Account: <span className="text-white font-bold">{manualDetails.accountNumber}</span></p>
                                                <p>Name: <span className="text-white font-bold">{manualDetails.accountName}</span></p>
                                                {manualDetails.additionalInfo && (
                                                    <div className="mt-4 pt-4 border-t border-white/5">
                                                        <p className="text-[10px] uppercase tracking-widest text-amber-400/60 font-bold mb-1">Note</p>
                                                        <p className="text-xs text-gray-400 italic leading-relaxed">{manualDetails.additionalInfo}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-500">Amount Paid (₦)</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-500">Upload Screenshot</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${screenshot ? "border-green-500/50 bg-green-500/5" : "border-white/10 group-hover:border-white/20"
                                            }`}>
                                            <Upload className={screenshot ? "text-green-400" : "text-gray-500"} size={32} />
                                            <p className="mt-4 font-bold">{screenshot ? screenshot.name : "Click to upload payment receipt"}</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full py-6 bg-amber-500 hover:bg-amber-600"
                                    size="lg"
                                    onClick={handleSubmitManual}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Processing..." : "Submit Payment Proof"}
                                </Button>
                            </section>
                        )}

                        {selectedMethod === "gateway" && (
                            <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-10 glass-panel rounded-[2rem] text-center space-y-6 border-white/5">
                                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                                        <Zap size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold">Instant Activation</h4>
                                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                                            Pay securely using your card or bank app and get upgraded instantly.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full py-6 bg-blue-500 hover:bg-blue-600"
                                        size="lg"
                                        onClick={() => showToast("Online payment integration coming soon! Use manual transfer for now.", "info")}
                                    >
                                        Pay ₦{Number(selectedTier?.price || 0).toLocaleString()} Now
                                    </Button>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-32 space-y-6" hover={false}>
                            <h3 className="text-lg font-bold">Order Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{selectedTier?.name} Plan</span>
                                    <span className="font-bold">₦{Number(selectedTier?.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-bold">1 {selectedTier?.period}</span>
                                </div>
                                <hr className="border-white/5" />
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-400">Total Charged</span>
                                    <span className="text-2xl font-bold">₦{Number(selectedTier?.price || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                    By completing your purchase, you agree to our Terms of Service and Privacy Policy. Subscriptions renew automatically until cancelled.
                                </p>
                                <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                                    <CheckCircle2 size={12} />
                                    Secure SSL Encryption
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function PayoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <PayoutContent />
        </Suspense>
    );
}

function Zap({ size, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}
