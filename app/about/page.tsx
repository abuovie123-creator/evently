"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-6 space-y-24">
                {/* Hero Section */}
                <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
                        Our Mission
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                        At Evently, we believe every celebration deserves to be legendary. We are building the world's premier platform to connect visionary planners with clients who demand excellence.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Curation",
                            desc: "We hand-select the most talented event professionals to ensure your vision is executed flawlessly.",
                            icon: "✨"
                        },
                        {
                            title: "Transparency",
                            desc: "Browse real portfolios, verified reviews, and clear service categories without the guesswork.",
                            icon: "🤝"
                        },
                        {
                            title: "Innovation",
                            desc: "Our platform uses state-of-the-art design and technology to simplify the discovery process.",
                            icon: "🚀"
                        }
                    ].map((value, i) => (
                        <Card key={i} className="p-8 space-y-4 hover:border-white/20 transition-all animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out delay-150">
                            <span className="text-4xl">{value.icon}</span>
                            <h3 className="text-xl font-bold">{value.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {value.desc}
                            </p>
                        </Card>
                    ))}
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20 border-t border-white/5">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">The Evently Story</h2>
                        <div className="space-y-4 text-gray-400 italic">
                            <p>
                                Evently started with a simple observation: there are thousands of incredible event planners whose work remains hidden in private portfolios and social media feeds.
                            </p>
                            <p>
                                We decided to build a "home" for these professionals—a place where their artistry is celebrated, and where clients can find exactly the style they need for their most important life moments.
                            </p>
                            <p>
                                Today, we are proud to support hundreds of planners across the country, from boutique wedding designers to large-scale corporate event producers.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-video rounded-3xl overflow-hidden glass-panel border-white/10 group">
                        <img
                            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            alt="Event planning"
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center space-y-8 glass-panel p-16 rounded-[3rem] border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to make history?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Whether you're a planner looking for exposure or a client looking for talent, Evently is your place.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg">Explore Planners</Button>
                        <Button variant="outline" size="lg">Join the Waitlist</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
