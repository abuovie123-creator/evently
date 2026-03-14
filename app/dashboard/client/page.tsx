"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function ClientDashboard() {
    console.log("Rendering Client Dashboard with Toast support");
    const { showToast } = useToast();
    return (
        <main className="min-h-screen p-8 pt-32 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Dashboard</h1>
                    <p className="text-gray-400 text-sm">Track your events and manage your bookings.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Link href="/planners">
                        <Button variant="outline">Browse Planners</Button>
                    </Link>
                    <Button onClick={() => showToast("Event creation coming soon!", "info")}>
                        Create Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 space-y-6" hover={false}>
                    <h3 className="text-2xl font-bold">Upcoming Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "Summer Wedding", date: "Aug 15, 2026", status: "Planning" },
                            { title: "Business Launch", date: "April 02, 2026", status: "Approaching" }
                        ].map((event, i) => (
                            <div key={i} className="p-6 glass-panel rounded-[2rem] border-white/5 space-y-4 border hover:border-white/10 transition-colors cursor-pointer group">
                                <h4 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{event.title}</h4>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Date</p>
                                    <p className="text-sm">{event.date}</p>
                                </div>
                                <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full">{event.status}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="space-y-6" hover={false}>
                    <h3 className="text-2xl font-bold">Quick Links</h3>
                    <div className="space-y-3">
                        {['My Bookings', 'Saved Planners', 'Message History', 'Receipts', 'Settings'].map((link) => (
                            <button
                                key={link}
                                onClick={() => showToast(`${link} module coming soon!`, "info")}
                                className="w-full text-left p-4 glass-panel rounded-2xl border-white/5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </main>
    );
}
