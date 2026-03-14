"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300"
                    >
                        <div className={`flex items-center gap-3 p-4 rounded-2xl glass-panel border ${toast.type === "success" ? "border-green-500/20 bg-green-500/10" :
                                toast.type === "error" ? "border-red-500/20 bg-red-500/10" :
                                    "border-blue-500/20 bg-blue-500/10"
                            } shadow-2xl min-w-[300px]`}>
                            {toast.type === "success" && <CheckCircle className="text-green-500" size={20} />}
                            {toast.type === "error" && <AlertCircle className="text-red-500" size={20} />}
                            <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
                            <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
