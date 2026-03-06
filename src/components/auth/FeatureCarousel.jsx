"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Clock, CheckCircle2,
    AlertCircle, Banknote,
    Scissors, Shirt, Truck, TrendingUp, IndianRupee,
} from "lucide-react";

const slides = [
    {
        id: 0,
        tag: "TEAM WORKFLOW",
        title: "Every Role,\nOne Seamless Pipeline",
        color: "from-indigo-500/20 to-indigo-600/5",
        accent: "bg-[#3B82F6]", // Blue for teamwork
        tagColor: "bg-[#7C3AED] text-white", // Violet pill
        content: (
            <div className="space-y-2.5 w-full">
                {[
                    {
                        role: "Admin / Manager", icon: AlertCircle, color: "bg-[#3B82F6]", // Blue
                        actions: ["Approve orders", "Assign tailors", "Review delivery"],
                    },
                    {
                        role: "Cutter", icon: Scissors, color: "bg-[#F97316]", // Orange
                        actions: ["Receive tasks", "Mark cutting done"],
                    },
                    {
                        role: "Tailor", icon: Shirt, color: "bg-[#10B981]", // Emerald
                        actions: ["Stitch garments", "Complete stitching"],
                    },
                    {
                        role: "Cashier", icon: Banknote, color: "bg-[#7C3AED]", // Violet
                        actions: ["Collect advance", "Final delivery"],
                    },
                ].map((r, i) => (
                    <motion.div
                        key={r.role}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] rounded-[12px] px-3 py-2.5"
                    >
                        <div className={`w-[26px] h-[26px] rounded-full ${r.color} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.2)]`}>
                            <r.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <p className="text-white text-[12px] font-bold mb-1.5" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{r.role}</p>
                            <div className="flex flex-wrap gap-1">
                                {r.actions.map(a => (
                                    <span key={a} className="text-[9.5px] font-medium text-[#8B95B0] bg-[rgba(255,255,255,0.08)] rounded-full px-2.5 py-0.5">{a}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        ),
    },
    {
        id: 1,
        tag: "Order Management",
        title: "Every Garment,\nTracked End-to-End",
        color: "from-emerald-500/20 to-emerald-600/5",
        accent: "bg-[#10B981]", // Emerald
        tagColor: "bg-[#10B981] text-white", // Emerald pill
        content: (
            <div className="space-y-2 w-full">
                {[
                    { label: "Rahul K. — Suit", stage: "Stitching", color: "bg-[#10B981]", icon: Shirt },
                    { label: "Priya M. — Blouse", stage: "Ready", color: "bg-[#3B82F6]", icon: CheckCircle2 },
                    { label: "Arjun S. — Sherwani", stage: "Cutting", color: "bg-[#F97316]", icon: Scissors },
                    { label: "Meera T. — Saree", stage: "Delivered", color: "bg-[#7C3AED]", icon: Truck },
                ].map((o, i) => (
                    <motion.div
                        key={o.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] rounded-[12px] px-3 py-2"
                    >
                        <div className={`w-1.5 h-7 rounded-sm ${o.color} flex-shrink-0`} />
                        <o.icon className="w-3.5 h-3.5 text-[#4A5568] flex-shrink-0" />
                        <span className="text-[#F0EBE3] text-[12px] flex-1 font-medium">{o.label}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold text-white ${o.color}`}>
                            {o.stage}
                        </span>
                    </motion.div>
                ))}
                <div className="grid grid-cols-3 gap-2 mt-[14px]">
                    {[
                        { label: "Total", value: "128", icon: Package, color: "text-[#3B82F6]" },
                        { label: "Active", value: "42", icon: Clock, color: "text-[#FBBF24]" },
                        { label: "Done", value: "86", icon: CheckCircle2, color: "text-[#10B981]" },
                    ].map((s) => (
                        <div key={s.label} className="bg-[rgba(255,255,255,0.02)] rounded-[12px] p-2 text-center border border-[rgba(255,255,255,0.03)]">
                            <s.icon className={`w-3.5 h-3.5 ${s.color} mx-auto mb-1`} />
                            <p className="text-white font-bold text-[14px] leading-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{s.value}</p>
                            <p className="text-[#4A5568] font-bold uppercase tracking-widest text-[8px] mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 2,
        tag: "Smart Notifications",
        title: "Right Person,\nRight Alert, Right Time",
        color: "from-amber-500/10 to-amber-600/5",
        accent: "bg-[#F97316]", // Orange
        tagColor: "bg-[#FBBF24] text-amber-950", // Amber pill
        content: (
            <div className="space-y-3 w-full">
                {[
                    {
                        role: "Admin", icon: AlertCircle,
                        iconColor: "text-[#FBBF24]", bg: "bg-[rgba(251,191,36,0.15)]", border: "border-[rgba(251,191,36,0.3)]",
                        msg: "Order needs approval", sub: "Rahul K. · just now", dot: "bg-[#FBBF24]",
                    },
                    {
                        role: "Tailor", icon: Shirt,
                        iconColor: "text-[#10B981]", bg: "bg-[rgba(16,185,129,0.15)]", border: "border-[rgba(16,185,129,0.3)]",
                        msg: "Garment assigned to you", sub: "Blouse for Priya M. · 2m ago", dot: "bg-[#10B981]",
                    },
                    {
                        role: "Cashier", icon: Banknote,
                        iconColor: "text-[#3B82F6]", bg: "bg-[rgba(59,130,246,0.15)]", border: "border-[rgba(59,130,246,0.3)]",
                        msg: "Collect ₹500 advance", sub: "Order #128 · 5m ago", dot: "bg-[#3B82F6]",
                    },
                ].map((n, i) => (
                    <motion.div
                        key={n.role}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-3 bg-[rgba(255,255,255,0.02)] rounded-[12px] p-3 border border-[rgba(255,255,255,0.03)]`}
                    >
                        <div className="relative flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full ${n.bg} border ${n.border} flex items-center justify-center`}>
                                <n.icon className={`w-4 h-4 ${n.iconColor}`} />
                            </div>
                            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1A1F35] ${n.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-[#8B95B0] uppercase tracking-widest mb-0.5">{n.role}</p>
                            <p className="text-[#F0EBE3] text-[12px] font-medium leading-tight truncate">{n.msg}</p>
                            <p className="text-[#4A5568] font-medium text-[10px] mt-0.5">{n.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        ),
    },
];

export default function FeatureCarousel() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    const goTo = (idx) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    };

    const slide = slides[current];

    return (
        <div className="w-full flex justify-center pb-8 pt-4">
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                className={`relative w-full max-w-[420px] rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.14)] bg-[#1A1F35] min-h-[360px] flex flex-col`}
                style={{
                    boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                }}
            >
                {/* Subtle Inner Glow */}
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-40 bg-gradient-to-b from-[rgba(124,58,237,0.15)] to-transparent" />

                <div className="relative z-10 p-6 flex-1 flex flex-col">
                    {/* Header: Tag + title */}
                    <div className="mb-5 border-b border-[rgba(255,255,255,0.06)] pb-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`tag-${current}`}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <span className={`text-[9.5px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${slide.tagColor}`}>
                                    {slide.tag}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Slide content block */}
                    <div className="flex-1 relative">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={`content-${current}`}
                                custom={direction}
                                className="absolute inset-0"
                                initial={{ opacity: 0, x: direction * 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction * -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                {slide.content}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Dots placed exactly at the bottom inner edge of the card */}
                <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 z-20">
                    {slides.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="group flex items-center p-1"
                        >
                            <motion.div
                                animate={{
                                    width: i === current ? 24 : 6,
                                    opacity: i === current ? 1 : 0.35,
                                    backgroundColor: i === current ? '#7C3AED' : '#FFFFFF'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`h-1.5 rounded-full`}
                            />
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
