"use client";

import React, { useState, useEffect } from "react";
import {
    Layout,
    Plus,
    Save,
    Trash2,
    GripVertical,
    Link as LinkIcon,
    HelpCircle,
    Info,
    CheckCircle2,
    Settings,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface FAQItem {
    id?: string;
    question: string;
    answer: string;
    order_index: number;
    is_published: boolean;
}

interface HomeFeature {
    id?: string;
    title: string;
    description: string;
    icon: string;
    image_url: string;
    order_index: number;
}

interface HomeReason {
    id?: string;
    title: string;
    description: string;
    icon: string;
    order_index: number;
}

interface SiteSetting {
    key: string;
    value: string;
    description: string;
}

export default function ContentManager() {
    const [activeTab, setActiveTab] = useState("faqs");
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [features, setFeatures] = useState<HomeFeature[]>([]);
    const [reasons, setReasons] = useState<HomeReason[]>([]);
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    const supabase = createClient();

    const uploadImage = async (file: File, bucket: string = 'site-assets') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: faqData } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
            const { data: featureData } = await supabase.from('home_features').select('*').order('order_index', { ascending: true });
            const { data: reasonData } = await supabase.from('home_reasons').select('*').order('order_index', { ascending: true });
            const { data: settsData } = await supabase.from('site_settings').select('*');

            if (faqData) setFaqs(faqData);
            if (featureData) setFeatures(featureData);
            if (reasonData) setReasons(reasonData);
            if (settsData) setSettings(settsData);
            setIsLoading(false);
        };
        fetchData();
    }, [supabase]);

    const handleAddFAQ = () => {
        const nextOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order_index)) + 1 : 0;
        setFaqs([...faqs, { question: "", answer: "", order_index: nextOrder, is_published: true }]);
    };

    const handleRemoveFAQ = async (id?: string) => {
        if (id) {
            const { error } = await supabase.from('faqs').delete().eq('id', id);
            if (error) {
                showToast("Failed to delete FAQ", "error");
                return;
            }
        }
        setFaqs(faqs.filter(f => f.id !== id));
        showToast("FAQ removed", "success");
    };

    const handleSaveFAQs = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('faqs').upsert(faqs);
        if (error) {
            showToast("Failed to save FAQs", "error");
        } else {
            showToast("FAQs saved successfully", "success");
        }
        setIsSaving(false);
    };

    const handleSaveFeatures = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('home_features').upsert(features);
        if (error) {
            showToast("Failed to save features", "error");
        } else {
            showToast("Features saved successfully", "success");
        }
        setIsSaving(false);
    };

    const handleSaveReasons = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('home_reasons').upsert(reasons);
        if (error) {
            showToast("Failed to save reasons", "error");
        } else {
            showToast("Reasons saved successfully", "success");
        }
        setIsSaving(false);
    };

    const handleSettingChange = (key: string, value: string) => {
        setSettings(settings.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert(settings, { onConflict: 'key' });
        if (error) {
            showToast("Failed to save settings", "error");
        } else {
            showToast("Settings saved successfully", "success");
        }
        setIsSaving(false);
    };

    const moveFAQ = (index: number, direction: 'up' | 'down') => {
        const newFaqs = [...faqs];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

        const temp = newFaqs[index];
        newFaqs[index] = newFaqs[targetIndex];
        newFaqs[targetIndex] = temp;

        // Re-assign order indices
        newFaqs.forEach((f, i) => f.order_index = i);
        setFaqs(newFaqs);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <Layout className="text-blue-500" />
                        Site Content Manager
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage dynamic content for the home page and platform footers.</p>
                </div>
                <div className="flex flex-wrap gap-2 p-1 bg-foreground/5 rounded-2xl border border-foreground/10">
                    <button
                        onClick={() => setActiveTab("faqs")}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "faqs" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        FAQs
                    </button>
                    <button
                        onClick={() => setActiveTab("features")}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "features" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Growth
                    </button>
                    <button
                        onClick={() => setActiveTab("reasons")}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "reasons" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Why Us
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "settings" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : activeTab === "faqs" ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-blue-500">
                            <Info size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">DRAG AND DROP REORDERING (CLICK ARROWS FOR NOW)</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleAddFAQ} variant="outline" className="rounded-xl font-bold flex items-center gap-2">
                                <Plus size={16} /> Add FAQ
                            </Button>
                            <Button onClick={handleSaveFAQs} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2">
                                <Save size={16} /> {isSaving ? "Saving..." : "Save All"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <Card key={index} className="p-6 border-foreground/5 relative group" hover={false}>
                                <div className="flex items-start gap-6">
                                    <div className="flex flex-col gap-2 mt-2">
                                        <button onClick={() => moveFAQ(index, 'up')} className="p-1 hover:text-blue-500 text-muted-foreground transition-colors disabled:opacity-30" disabled={index === 0}>
                                            <ChevronUp size={18} />
                                        </button>
                                        <button onClick={() => moveFAQ(index, 'down')} className="p-1 hover:text-blue-500 text-muted-foreground transition-colors disabled:opacity-30" disabled={index === faqs.length - 1}>
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Question</label>
                                            <Input
                                                value={faq.question}
                                                onChange={(e) => {
                                                    const newFaqs = [...faqs];
                                                    newFaqs[index].question = e.target.value;
                                                    setFaqs(newFaqs);
                                                }}
                                                placeholder="Enter question..."
                                                className="h-12 rounded-2xl bg-foreground/[0.02] border-foreground/5 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Answer</label>
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => {
                                                    const newFaqs = [...faqs];
                                                    newFaqs[index].answer = e.target.value;
                                                    setFaqs(newFaqs);
                                                }}
                                                placeholder="Enter answer..."
                                                rows={3}
                                                className="w-full rounded-2xl bg-foreground/[0.02] border border-foreground/5 focus:border-blue-500/50 outline-none p-4 text-sm resize-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFAQ(faq.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : activeTab === "features" ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Everything You Need to Grow</h2>
                        <div className="flex gap-3">
                            <Button onClick={() => setFeatures([...features, { title: "", description: "", icon: "Layout", image_url: "", order_index: features.length }])} variant="outline" className="rounded-xl font-bold flex items-center gap-2">
                                <Plus size={16} /> Add Feature
                            </Button>
                            <Button onClick={handleSaveFeatures} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2">
                                <Save size={16} /> {isSaving ? "Saving..." : "Save Features"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <Card key={index} className="p-6 border-foreground/5" hover={false}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
                                            <Input
                                                value={feature.title}
                                                onChange={(e) => {
                                                    const next = [...features];
                                                    next[index].title = e.target.value;
                                                    setFeatures(next);
                                                }}
                                                className="h-12 rounded-2xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                                            <textarea
                                                value={feature.description}
                                                onChange={(e) => {
                                                    const next = [...features];
                                                    next[index].description = e.target.value;
                                                    setFeatures(next);
                                                }}
                                                className="w-full h-24 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5 outline-none text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Icon (Lucide Name)</label>
                                            <Input
                                                value={feature.icon}
                                                onChange={(e) => {
                                                    const next = [...features];
                                                    next[index].icon = e.target.value;
                                                    setFeatures(next);
                                                }}
                                                className="h-12 rounded-2xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Screenshot Image</label>
                                            <div
                                                className="w-full h-32 rounded-xl border border-dashed border-foreground/10 flex flex-col items-center justify-center cursor-pointer hover:bg-foreground/[0.02] transition-all relative overflow-hidden group"
                                                onClick={() => document.getElementById(`feature-upload-${index}`)?.click()}
                                            >
                                                {feature.image_url ? (
                                                    <img src={feature.image_url} className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <Layout className="text-muted-foreground/30" size={24} />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-[8px] font-bold uppercase tracking-widest">Change</p>
                                                </div>
                                            </div>
                                            <input
                                                id={`feature-upload-${index}`}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        setIsSaving(true);
                                                        const url = await uploadImage(file);
                                                        const next = [...features];
                                                        next[index].image_url = url;
                                                        setFeatures(next);
                                                        showToast("Feature image uploaded. Click save to persist.", "success");
                                                    } catch (err) {
                                                        console.error("Upload failed", err);
                                                        showToast("Upload failed", "error");
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }}
                                            />
                                            <p className="text-[8px] text-muted-foreground truncate italic">Current: {feature.image_url}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : activeTab === "reasons" ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Why Choose Us</h2>
                        <div className="flex gap-3">
                            <Button onClick={() => setReasons([...reasons, { title: "", description: "", icon: "Check", order_index: reasons.length }])} variant="outline" className="rounded-xl font-bold flex items-center gap-2">
                                <Plus size={16} /> Add Reason
                            </Button>
                            <Button onClick={handleSaveReasons} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2">
                                <Save size={16} /> {isSaving ? "Saving..." : "Save Reasons"}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reasons.map((reason, index) => (
                            <Card key={index} className="p-6 border-foreground/5" hover={false}>
                                <div className="space-y-4">
                                    <Input
                                        value={reason.title}
                                        onChange={(e) => {
                                            const next = [...reasons];
                                            next[index].title = e.target.value;
                                            setReasons(next);
                                        }}
                                        placeholder="Reason Title"
                                        className="h-12 rounded-2xl font-bold"
                                    />
                                    <textarea
                                        value={reason.description}
                                        onChange={(e) => {
                                            const next = [...reasons];
                                            next[index].description = e.target.value;
                                            setReasons(next);
                                        }}
                                        placeholder="Reason Description"
                                        className="w-full h-20 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5 outline-none text-sm resize-none"
                                    />
                                    <Input
                                        value={reason.icon}
                                        onChange={(e) => {
                                            const next = [...reasons];
                                            next[index].icon = e.target.value;
                                            setReasons(next);
                                        }}
                                        placeholder="Icon Name"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings size={20} className="text-blue-500" />
                            Footer Configuration
                        </h2>
                        <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2">
                            <Save size={16} /> {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>

                    <Card className="p-8 space-y-8" hover={false}>
                        {settings.map((setting) => (
                            <div key={setting.key} className="space-y-2">
                                <div className="flex justify-between items-center pl-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{setting.description}</label>
                                    <span className="text-[9px] font-bold text-blue-500/50 font-mono uppercase">{setting.key}</span>
                                </div>
                                <div className="relative">
                                    <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                    <Input
                                        value={setting.value}
                                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                        className="h-12 pl-10 rounded-2xl bg-foreground/[0.01] border-foreground/5 focus:border-blue-500/50"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 mt-4">
                            <Info size={16} className="text-amber-500 flex-shrink-0" />
                            <p className="text-[10px] text-amber-600/80 leading-relaxed font-bold uppercase tracking-wider">
                                Changes to footer links will reflect site-wide for all users across public and private dashboards.
                            </p>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
