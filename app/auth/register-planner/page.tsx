"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function PlannerRegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        businessName: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to complete setup.");
            setLoading(false);
            return;
        }

        // 2. Insert into planners table
        const { error: insertError } = await supabase
            .from('planners')
            .upsert({
                id: user.id,
                business_name: formData.businessName || `${formData.firstName} ${formData.lastName} Events`,
                phone: formData.phone,
                kyc_data: {} // Empty KYC to be filled during verification
            });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        // 3. Update profile to requires_verification
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: `${formData.firstName} ${formData.lastName}`,
                verification_status: 'requires_verification'
            })
            .eq('id', user.id);

        if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
        }

        setIsRedirecting(true);
        router.refresh();
        router.push("/dashboard/planner");
    };

    if (isRedirecting) {
        return <LoadingScreen message="Creating your dashboard..." subMessage="Get ready!!" />;
    }

    return (
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6 pt-32">
            <Card className="max-w-2xl w-full space-y-8 p-10 sm:p-16" hover={false}>
                <div className="space-y-4 text-center">
                    <span className="section-label text-[12px]">Guild Application</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-charcoal">Planner Profile Setup</h2>
                    <p className="text-muted-foreground font-light italic">Provide your professional credentials to begin your legacy.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Given Name</label>
                            <Input
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Surname</label>
                            <Input
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent">House / Business Name</label>
                        <Input
                            placeholder="Events by John"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent">Contact Cipher (Phone)</label>
                        <Input
                            type="tel"
                            placeholder="+234 ..."
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] uppercase tracking-widest font-bold p-5 rounded-sm shadow-sm animate-fade-up">
                            Protocol Issue: {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-14" size="lg" disabled={loading}>
                        {loading ? "Establishing Presence..." : "Enter the Dashboard"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
