import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16]">
            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 bg-[#1A2E1A] overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
                    <span className="section-label text-[#C4A55A]">Our Purpose</span>
                    <h1 className="text-5xl md:text-8xl font-serif italic text-[#FAF8F3] leading-tight animate-fade-up">
                        The Heritage of <br /> Excellence.
                    </h1>
                    <div className="w-24 h-px bg-[#C4A55A] mx-auto mt-8" />
                    <p className="text-xl md:text-2xl text-[#FAF8F3]/70 max-w-3xl mx-auto leading-relaxed font-light italic mt-8 animate-fade-up">
                        At Evently, we believe every celebration deserves to be legendary. We are building the world's premier platform to connect visionary planners with clients who demand perfection.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-32 space-y-32">
                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        {
                            title: "Curation",
                            desc: "We hand-select the most talented event professionals to ensure your vision is executed with absolute precision.",
                            label: "The Selection"
                        },
                        {
                            title: "Transparency",
                            desc: "Browse real portfolios, verified reviews, and clear service categories without the guesswork of traditional planning.",
                            label: "The Standard"
                        },
                        {
                            title: "Innovation",
                            desc: "Our platform uses architectural design principles to simplify the discovery process for the world's finest events.",
                            label: "The Digital Estate"
                        }
                    ].map((value, i) => (
                        <Card key={i} className="p-12 space-y-6 border-[#D4C5A9]/30 bg-white group hover:border-[#C4A55A] transition-all duration-700 h-full flex flex-col justify-between" hover={false}>
                            <div className="space-y-6">
                                <span className="section-label opacity-40">{value.label}</span>
                                <h3 className="text-3xl font-serif text-[#1C1A16] group-hover:text-[#8B7355] transition-colors">{value.title}</h3>
                                <p className="text-[#6B5E4E] leading-relaxed text-sm font-light italic">
                                    "{value.desc}"
                                </p>
                            </div>
                            <div className="w-12 h-px bg-[#D4C5A9]/30 mt-8" />
                        </Card>
                    ))}
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <span className="section-label">Our Anthology</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-[#1C1A16]">The Evently Story</h2>
                        </div>
                        <div className="space-y-6 text-[#6B5E4E] text-lg font-light leading-relaxed">
                            <p>
                                Evently started with a simple observation: there are thousands of incredible event planners whose work remains hidden in private portfolios and social media feeds.
                            </p>
                            <p className="italic font-normal text-[#1C1A16]/80 border-l-2 border-[#C4A55A] pl-8 py-2">
                                "We decided to build a 'home' for these professionals—a place where their artistry is celebrated, and where clients can find exactly the style they need for their most important life moments."
                            </p>
                            <p>
                                Today, we are proud to support a global network of elite planners, from boutique wedding designers to large-scale international producers, all unified by a commitment to the heritage of celebration.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-square md:aspect-video lg:aspect-square overflow-hidden border border-[#D4C5A9]/30 group">
                        <img
                            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                            alt="Event planning artistry"
                        />
                        <div className="absolute inset-0 bg-[#1A2E1A]/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
                    </div>
                </div>

                {/* CTA Section */}
                <section className="relative py-24 px-8 text-center border border-[#D4C5A9]/30 bg-[#F5F0E8] overflow-hidden">
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 border-r border-b border-[#C4A55A]/30" />
                    <div className="absolute -top-12 -left-12 w-48 h-48 border-l border-t border-[#C4A55A]/30" />

                    <div className="max-w-2xl mx-auto space-y-10 relative z-10">
                        <h2 className="text-4xl md:text-5xl font-serif text-[#1C1A16]">Ready to make history?</h2>
                        <p className="text-[#6B5E4E] font-light leading-relaxed italic">
                            Whether you're a planner looking for exposure or a client looking for talent, Evently is your place to build a lasting legacy.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/planners">
                                <Button variant="primary" size="lg" className="h-16 px-12">Search Planners</Button>
                            </Link>
                            <Link href="/auth/register-planner">
                                <Button variant="outline" size="lg" className="h-16 px-12 border-[#C4A55A] text-[#1C1A16] hover:bg-[#C4A55A] hover:text-white">Join Platform</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
