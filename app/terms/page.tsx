import { Footer } from "@/components/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16]">
            {/* Hero Section */}
            <section className="relative pt-48 pb-20 px-6 bg-[#1A2E1A] overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <span className="section-label text-[#C4A55A]">Legal Protocol</span>
                    <h1 className="text-4xl md:text-6xl font-serif italic text-[#FAF8F3] leading-tight">
                        Terms of Engagement.
                    </h1>
                    <p className="text-[#FAF8F3]/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">
                        Effective Date: May 2026
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-24 space-y-16">
                <div className="prose prose-stone max-w-none">
                    <section className="space-y-12">
                        <div className="space-y-6">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">Art. 01</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Acceptance of Protocol</h2>
                            <p className="text-[#6B5E4E] leading-relaxed font-light italic border-l border-[#D4C5A9] pl-6">
                                "Entrance into the Evently estate signifies formal adherence to these terms of engagement. We curate a community of mutual respect and excellence; these protocols ensure the integrity of our heritage."
                            </p>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed">
                                By utilizing this platform, you acknowledge and agree to be bound by the architectural standards and communal protocols defined herein.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">Art. 02</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Account Stewardship</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed">
                                Members are responsible for the stewardship of their credentials. Any activity conducted under your heritage profile is your sole responsibility.
                            </p>
                        </div>

                        <div className="space-y-6 py-10 border-y border-[#D4C5A9]/20">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">Art. 03</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Intellectual Heritage</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed font-light">
                                All design patterns, terminology, and architectural software on this platform are the intellectual property of Evently. Portions of content uploaded by members remain their respective property, but are licensed to Evently for display within the digital estate.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">Art. 04</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Platform Integrity</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed font-light">
                                Any attempt to disrupt the architectural integrity of the platform, including unauthorized data harvesting or bypass of search protocols, will result in immediate permanent expulsion from the estate.
                            </p>
                        </div>

                        <div className="pt-8 flex justify-between items-center text-[10px] font-black text-[#8B7355] uppercase tracking-widest">
                            <span>© 2026 Evently Heritage</span>
                            <span>Legal Protocol v2.4</span>
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
