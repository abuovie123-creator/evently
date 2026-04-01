"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

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
            <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-[100] flex flex-col gap-3 pointer-events-none items-center sm:items-end">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-right-8 fade-in duration-300 w-full sm:w-auto"
                    >
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${toast.type === "success" ? "border-green-500/20 bg-emerald-950/95" :
                            toast.type === "error" ? "border-red-500/20 bg-rose-950/95" :
                                toast.type === "warning" ? "border-yellow-500/20 bg-amber-950/95" :
                                    "border-blue-500/20 bg-blue-950/95"
                            } shadow-2xl w-full sm:min-w-[300px] sm:max-w-md backdrop-blur-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-right-8 duration-300`}>
                            {toast.type === "success" && <CheckCircle className="text-green-500 shrink-0" size={20} />}
                            {toast.type === "error" && <AlertCircle className="text-red-500 shrink-0" size={20} />}
                            {toast.type === "warning" && <AlertTriangle className="text-yellow-500 shrink-0" size={20} />}
                            {toast.type === "info" && <AlertCircle className="text-blue-500 shrink-0" size={20} />}
                            <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
                            <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white transition-colors p-1">
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
