"use client";

import { Footer } from "@/components/Footer";

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16]">
            {/* Hero Section */}
            <section className="relative pt-48 pb-20 px-6 bg-[#1A2E1A] overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <span className="section-label text-[#C4A55A]">Nuance & Preference</span>
                    <h1 className="text-4xl md:text-6xl font-serif italic text-[#FAF8F3] leading-tight">
                        Cookie Protocol.
                    </h1>
                    <p className="text-[#FAF8F3]/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">
                        Policy Version: 2026.1
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-24 space-y-16">
                <div className="prose prose-stone max-w-none">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Understanding Digital Impressions</h2>
                            <p className="text-[#6B5E4E] leading-relaxed font-light italic border-l border-[#D4C5A9] pl-6">
                                "Just as the finest venues leave a lasting impression, our platform uses 'cookies' to remember your preferences and ensure your return to the estate is seamless."
                            </p>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed">
                                We utilize small data identifiers, known as digital cookies, to enhance your journey through our curated network.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 border border-[#D4C5A9]/30 bg-white space-y-4">
                                <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">Essential</span>
                                <h3 className="text-xl font-serif text-[#1C1A16]">Structural Tokens</h3>
                                <p className="text-xs text-[#6B5E4E] font-light leading-relaxed">
                                    Required for the basic operation of the estate, including authentication and secure traversal of the dashboard.
                                </p>
                            </div>
                            <div className="p-8 border border-[#D4C5A9]/30 bg-white space-y-4">
                                <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">Preference</span>
                                <h3 className="text-xl font-serif text-[#1C1A16]">Bespoke Settings</h3>
                                <p className="text-xs text-[#6B5E4E] font-light leading-relaxed">
                                    Remembering your search history, display preferences, and language selections for an effortless experience.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 py-10 border-t border-[#D4C5A9]/20">
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Managing Your Experience</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed font-light">
                                You have formal control over your digital impressions. Most browsers allow you to manage or expel cookies through their internal settings. However, removing essential tokens may disrupt your access to the private areas of the estate.
                            </p>
                        </div>

                        <div className="p-10 bg-[#1A2E1A] text-[#FAF8F3] text-center space-y-6 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                            </div>
                            <h4 className="text-xl font-serif italic">Your journey is yours to curate.</h4>
                            <p className="text-xs font-light text-[#FAF8F3]/60 max-w-md mx-auto leading-relaxed">
                                By continuing to explore the Evently estate, you acknowledge the use of basic cookies as defined in our Protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
