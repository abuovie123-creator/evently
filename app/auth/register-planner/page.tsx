"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function PlannerRegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        nin: "",
        location: "",
        eventTypes: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const eventCategories = [
        "Wedding Planner",
        "Birthday Planner",
        "Corporate Events",
        "Party Planner",
        "Event Decorator",
        "MC",
    ];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleEventType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            eventTypes: prev.eventTypes.includes(type)
                ? prev.eventTypes.filter(t => t !== type)
                : [...prev.eventTypes, type]
        }));
    };

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
            .insert({
                id: user.id,
                business_name: `${formData.firstName} ${formData.lastName} Events`, // Default name
                phone: formData.phone,
                address: formData.address,
                location: formData.location,
                event_types: formData.eventTypes,
                nin: formData.nin,
            });

        if (insertError) {
            setError(insertError.message);
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
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="max-w-2xl w-full space-y-8 p-10" hover={false}>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                        <span>Planner Setup</span>
                        <span>Step {step} of 3</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div
                            className="bg-white h-full transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-left space-y-2">
                                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                                <p className="text-gray-400 text-sm">Tell us about yourself so we can verify your identity.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">First Name</label>
                                    <Input
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Last Name</label>
                                    <Input
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Phone Number</label>
                                <Input
                                    type="tel"
                                    placeholder="+234 ..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">National ID (NIN)</label>
                                <Input
                                    placeholder="Verification purposes only"
                                    value={formData.nin}
                                    onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="button" onClick={handleNext} className="w-full">Continue</Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-left space-y-2">
                                <h2 className="text-2xl font-bold text-white">Business Details</h2>
                                <p className="text-gray-400 text-sm">Tell us about your event planning business.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Business Address</label>
                                <Input
                                    placeholder="Store 42, Victoria Island, Lagos"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Service Location (State)</label>
                                <Input
                                    placeholder="Lagos, Abuja, Port Harcourt..."
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-300">Event Categories</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {eventCategories.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleEventType(type)}
                                            className={`px-4 py-2 rounded-xl text-sm transition-all border ${formData.eventTypes.includes(type)
                                                ? "bg-white text-black border-white"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">Back</Button>
                                <Button type="button" onClick={handleNext} className="flex-1">Continue</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-left space-y-2">
                                <h2 className="text-2xl font-bold text-white">Verification & Photos</h2>
                                <p className="text-gray-400 text-sm">Upload your ID and a professional photo.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="aspect-square glass-panel rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-xl">+</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Passport Photo</span>
                                </div>
                                <div className="aspect-square glass-panel rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-xl">+</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">ID Document</span>
                                </div>
                            </div>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg animate-in fade-in duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">Back</Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? "Submitting..." : "Submit Application"}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}
