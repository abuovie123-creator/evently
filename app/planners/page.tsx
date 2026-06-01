"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, Star, Filter, X, Check, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

interface PlannerProfile {
    id: string;
    full_name: string;
    role: string;
    category: string;
    location: string;
    rating: number;
    avatar_url: string;
    cover_image_url?: string;
    username: string;
    review_count: number;
    is_verified?: boolean;
    bio?: string;
}

export default function PlannersPage() {
    // Data State
    const [planners, setPlanners] = useState<PlannerProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    // UI States
    const [sortBy, setSortBy] = useState<string>("FEATURED");
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter Options
    const categories = ["Wedding Planner", "Corporate Events", "Party Planner", "Event Designer", "Elite Concierge", "Other"];
    const locations = ["All Global Destinations", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "London", "Dubai", "New York"];

    useEffect(() => {
        const fetchPlanners = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, role, username, category, location, rating, review_count, avatar_url, cover_image_url, bio,
                    planners (is_verified)
                `)
                .eq('role', 'planner');

            if (error) {
                console.error("Error fetching planners:", error);
            } else if (data) {
                setPlanners(data.map((p: any) => ({
                    ...p,
                    full_name: p.full_name || "Anonymous Artisan",
                    category: p.category || "Elite Concierge",
                    location: p.location || "Destinations Worldwide",
                    rating: p.rating || 5.0,
                    review_count: p.review_count || 0,
                    avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username || p.id}`,
                    is_verified: p.planners?.is_verified || false
                })));
            }
            setLoading(false);
        };

        fetchPlanners();
    }, []);

    // Filter and Sort Logic
    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
        setCurrentPage(1);
    };

    const filteredPlanners = planners.filter(planner => {
        const matchesSearch =
            planner.full_name.toLowerCase().includes(search.toLowerCase()) ||
            planner.category.toLowerCase().includes(search.toLowerCase()) ||
            planner.location.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(planner.category);
        const matchesLocation = !selectedLocation || selectedLocation === "All Global Destinations" || planner.location.includes(selectedLocation);
        const matchesRating = !selectedRating || planner.rating >= selectedRating;
        const matchesVerified = !verifiedOnly || planner.is_verified;

        return matchesSearch && matchesCategory && matchesLocation && matchesRating && matchesVerified;
    });

    const sortedPlanners = [...filteredPlanners].sort((a, b) => {
        if (sortBy === "TOP RATED") return b.rating - a.rating;
        if (sortBy === "MOST ACTIVE") return b.review_count - a.review_count;
        if (a.is_verified === b.is_verified) return b.rating - a.rating;
        return a.is_verified ? -1 : 1;
    });

    const totalPages = Math.ceil(sortedPlanners.length / 6) || 1;
    const paginatedPlanners = sortedPlanners.slice((currentPage - 1) * 6, currentPage * 6);

    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16] font-sans pb-32">

            {/* Header section */}
            <div className="pt-32 md:pt-40 px-6 max-w-7xl mx-auto space-y-6 md:space-y-10">
                <div className="space-y-4 text-left">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#1C1A16] leading-tight max-w-4xl tracking-tight">Find Your Expert</h1>
                    <p className="text-[#6B5E4E] text-base md:text-lg max-w-2xl font-light leading-relaxed">
                        Connect with the most creative event professionals to bring your vision to life.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="w-full py-4 border border-[#D4C5A9] text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                        <Filter size={14} /> {showMobileFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>

                {/* Left Sidebar Filters */}
                <div className={`lg:col-span-3 space-y-12 ${showMobileFilters ? "block" : "hidden lg:block"}`}>

                    {/* Search */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B5E4E]">Keyword Search</label>
                        <div className="relative border-b border-[#D4C5A9]/50 pb-2">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[#6B5E4E]/50 text-[#1C1A16] pr-8"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                            <Search size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8B7355]" />
                        </div>
                    </div>

                    {/* Event Type */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B5E4E]">Event Type</label>
                        <div className="space-y-3">
                            {categories.map(cat => (
                                <div key={cat} className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleCategory(cat)}
                                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? "bg-[#8B7355] border-[#8B7355] text-white" : "border-[#D4C5A9] bg-transparent"}`}
                                    >
                                        {selectedCategories.includes(cat) && <Check size={10} strokeWidth={3} />}
                                    </button>
                                    <span className="text-xs text-[#1C1A16] font-light cursor-pointer" onClick={() => toggleCategory(cat)}>
                                        {cat}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B5E4E]">Location</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-transparent border border-[#D4C5A9]/50 rounded-none px-4 py-3 text-xs text-[#1C1A16] focus:outline-none focus:border-[#8B7355]"
                                value={selectedLocation}
                                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc} className="text-[#1C1A16]">{loc}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7355] pointer-events-none" />
                        </div>
                    </div>

                    {/* Heritage Rating */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B5E4E]">Heritage Rating</label>
                        <div className="flex gap-2">
                            {[
                                { label: '5+', value: 5.0 },
                                { label: '4.8+', value: 4.8 },
                                { label: '3.0+', value: 3.0 }
                            ].map(rating => (
                                <button
                                    key={rating.label}
                                    onClick={() => { setSelectedRating(selectedRating === rating.value ? null : rating.value); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 text-xs transition-colors border ${selectedRating === rating.value ? 'bg-[#EAE4D9] border-[#8B7355] text-[#1C1A16] font-bold' : 'bg-transparent border-[#D4C5A9]/50 text-[#6B5E4E] hover:border-[#8B7355]'}`}
                                >
                                    <span className="flex items-center gap-1"><Star size={10} className={selectedRating === rating.value ? "fill-[#8B7355]" : ""} /> {rating.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Verified Toggle */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => { setVerifiedOnly(!verifiedOnly); setCurrentPage(1); }}
                            className={`w-10 h-5 rounded-full transition-colors relative ${verifiedOnly ? 'bg-[#8B7355]' : 'bg-[#D4C5A9]'}`}
                        >
                            <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${verifiedOnly ? 'left-6' : 'left-1'}`} />
                        </button>
                        <span className="text-xs text-[#1C1A16] font-light">Verified Planners Only</span>
                    </div>

                    {(selectedCategories.length > 0 || search || selectedLocation !== "" || selectedRating || verifiedOnly) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setSelectedCategories([]);
                                setSelectedLocation("");
                                setSelectedRating(null);
                                setVerifiedOnly(false);
                                setCurrentPage(1);
                            }}
                            className="text-[9px] font-bold uppercase tracking-widest text-[#8B7355] hover:text-[#1C1A16] pt-4"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>

                {/* Right Results Area */}
                <div className="lg:col-span-9 space-y-12 md:space-y-20">

                    {/* Top Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#D4C5A9]/30 pb-6">
                        <div className="space-y-1 md:space-y-2">
                            <p className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-bold text-[#6B5E4E]">Directory Results</p>
                            <h2 className="text-xl md:text-2xl font-serif italic text-[#1C1A16]">Showing {sortedPlanners.length} Premier Planners</h2>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
                            <span className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-bold text-[#6B5E4E]">Sort By:</span>
                            <div className="flex gap-4 text-[9px] tracking-[0.15em] uppercase font-bold">
                                {["FEATURED", "TOP RATED", "MOST ACTIVE"].map(sort => (
                                    <button
                                        key={sort}
                                        onClick={() => { setSortBy(sort); setCurrentPage(1); }}
                                        className={sortBy === sort ? "text-[#8B7355]" : "text-[#1C1A16] hover:text-[#8B7355]"}
                                    >
                                        {sort}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Planner Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-16">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[4/5] bg-[#EAE4D9]/30 animate-pulse" />
                            ))}
                        </div>
                    ) : paginatedPlanners.length === 0 ? (
                        <div className="py-32 text-center space-y-4">
                            <div className="w-16 h-16 border border-[#D4C5A9] rounded-full flex items-center justify-center mx-auto text-[#8B7355]/50 mb-6">
                                <X size={24} />
                            </div>
                            <h3 className="text-2xl font-serif text-[#1C1A16]">
                                {verifiedOnly ? "No Verified Planners Found" : "No Planners Found"}
                            </h3>
                            <p className="text-[#6B5E4E] font-light max-w-md mx-auto text-sm">
                                Refine your directory filters or adjust your search to discover premier professionals.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-16 [&>*:nth-child(even)]:md:mt-24 pb-8">
                            {paginatedPlanners.map(planner => (
                                <Link key={planner.id} href={`/planner/${planner.username}`} className="group block">
                                    <div className="relative aspect-[4/5] bg-[#EAE4D9]/30 overflow-hidden mb-6">
                                        <img
                                            src={planner.cover_image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"}
                                            alt={`${planner.full_name} Cover`}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute right-4 bottom-4 w-12 h-12 md:w-16 md:h-16 border-[3px] border-[#FAF8F3] shadow-lg overflow-hidden bg-white">
                                            <img
                                                src={planner.avatar_url}
                                                alt={planner.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-[#8B7355] font-bold">
                                            <span className="truncate pr-2">{planner.category}</span>
                                            {planner.is_verified && (
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <Check size={10} strokeWidth={3} /> VERIFIED
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-serif text-2xl md:text-3xl text-[#1C1A16] group-hover:text-[#8B7355] transition-colors leading-tight truncate">
                                            {planner.full_name}
                                        </h3>
                                        <p className="text-xs text-[#6B5E4E] font-light leading-relaxed line-clamp-2">
                                            {planner.bio || `Specializing in distinguished celebrations and heritage events across ${planner.location}.`}
                                        </p>
                                        <div className="flex justify-between items-center border-t border-[#D4C5A9]/50 pt-4 mt-2">
                                            <span className="flex items-center gap-1 text-[10px] md:text-xs text-[#1C1A16] font-bold">
                                                <Star className="w-3 h-3 fill-[#C4A55A] text-[#C4A55A]" /> {planner.rating.toFixed(1)}
                                                <span className="text-[#6B5E4E] font-normal ml-0.5">({planner.review_count})</span>
                                            </span>
                                            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold text-[#1C1A16] group-hover:text-[#8B7355] transition-colors">
                                                View Portfolio
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 border-t border-[#D4C5A9]/30 pt-10 pb-6 mt-16 md:mt-24">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B7355] disabled:opacity-30 transition-opacity mr-4 md:mr-8"
                            >
                                <ArrowLeft size={14} /> PREVIOUS
                            </button>

                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-[#6B5E4E]">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`transition-colors ${currentPage === page ? "text-[#1C1A16]" : "hover:text-[#1C1A16]"}`}
                                    >
                                        {page.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1A16] disabled:opacity-30 transition-opacity ml-4 md:ml-8"
                            >
                                NEXT <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA section (Styling upgraded, content strictly kept exactly as original) */}
            <div className="pt-32 max-w-5xl mx-auto px-6 pb-20">
                <div className="p-12 md:p-20 bg-[#EAE4D9]/40 border border-[#D4C5A9]/50 text-center space-y-8 relative overflow-hidden group/cta">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#1C1A16] font-serif uppercase" style={{ letterSpacing: 'tight', fontWeight: 600 }}>Are you an event planner?</h2>
                    <p className="max-w-xl mx-auto text-base md:text-lg text-[#6B5E4E] font-light leading-relaxed">Join the most prestigious network of event professionals in the country and showcase your best work to high-value clients.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/auth/register-planner">
                            <button className="om-btn-primary px-12 py-4 h-14 w-full md:w-auto shadow-xl shadow-[#1C1A16]/5 border-none">Create Your Portfolio</button>
                        </Link>
                        <Link href="/about">
                            <button className="om-btn-outline px-12 py-4 h-14 w-full md:w-auto border-2 border-[#1C1A16] text-[#1C1A16] hover:bg-[#1C1A16] hover:text-[#FAF8F3] transition-colors">How it works</button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
