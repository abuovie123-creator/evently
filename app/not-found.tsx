import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="relative">
                    <h1 className="text-[12rem] font-black text-white/5 leading-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center mt-8">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Lost in the <span className="text-blue-500">Moment?</span></h2>
                    </div>
                </div>

                <p className="text-gray-400 text-lg font-light leading-relaxed">
                    The event you're looking for seems to have been rescheduled or moved to a different venue.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Link href="/" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-2xl shadow-xl shadow-blue-600/20 gap-2">
                            <Home size={18} /> Back to Home
                        </Button>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />
            <div className="fixed -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -z-10" />
            <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        </div>
    );
}
