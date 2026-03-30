import { FaviconSwitcher } from "@/components/FaviconSwitcher";
import { Sparkles } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
            {/* Advanced Loading UI */}
            <div className="relative group">
                {/* Outer Glow */}
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-1000 animate-pulse" />

                {/* Main Spinner */}
                <div className="relative w-20 h-20 rounded-full border-2 border-white/5 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-r-2 border-cyan-400 animate-spin-slow opacity-50" />

                    {/* Festive Icon instead of "E" */}
                    <Sparkles className="text-blue-400 animate-pulse" size={32} />
                </div>
            </div>

            {/* Festive decoration */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
    );
}
