"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Bell, IndianRupee, Users,
    CheckCircle2, Clock, ArrowRight,
    Scissors, Shirt, Banknote, Smartphone,
    TrendingUp, AlertCircle, PackageCheck, Truck,
} from "lucide-react";

const slides = [
    {
        id: 0,
        tag: "Order Management",
        title: "Every Garment,\nTracked End-to-End",
        color: "from-indigo-500/20 to-indigo-600/5",
        accent: "bg-indigo-500",
        tagColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        content: (
            <div className="space-y-2.5 w-full">
                {[
                    { label: "Rahul K. — Suit", stage: "Stitching", color: "bg-violet-500", icon: Shirt },
                    { label: "Priya M. — Blouse", stage: "Ready", color: "bg-emerald-500", icon: CheckCircle2 },
                    { label: "Arjun S. — Sherwani", stage: "Cutting", color: "bg-orange-500", icon: Scissors },
                    { label: "Meera T. — Saree", stage: "Delivered", color: "bg-blue-500", icon: Truck },
                ].map((o, i) => (
                    <motion.div
                        key={o.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2"
                    >
                        <div className={`w-1.5 h-8 rounded-full ${o.color} flex-shrink-0`} />
                        <o.icon className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                        <span className="text-white/80 text-xs flex-1">{o.label}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold text-white ${o.color}`}>
                            {o.stage}
                        </span>
                    </motion.div>
                ))}
                <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                        { label: "Total", value: "128", icon: Package, color: "text-indigo-400" },
                        { label: "Active", value: "42", icon: Clock, color: "text-orange-400" },
                        { label: "Done", value: "86", icon: CheckCircle2, color: "text-emerald-400" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white/5 rounded-xl p-2 text-center">
                            <s.icon className={`w-3.5 h-3.5 ${s.color} mx-auto mb-1`} />
                            <p className="text-white font-bold text-sm">{s.value}</p>
                            <p className="text-white/30 text-[9px]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 1,
        tag: "Smart Notifications",
        title: "Right Person,\nRight Alert, Right Time",
        color: "from-violet-500/20 to-violet-600/5",
        accent: "bg-violet-500",
        tagColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        content: (
            <div className="space-y-2.5 w-full">
                {[
                    {
                        role: "Admin", icon: AlertCircle, ringColor: "ring-amber-500/40",
                        iconColor: "text-amber-400", bg: "bg-amber-500/10",
                        msg: "New order needs approval", sub: "Rahul K. · just now", dot: "bg-amber-400",
                    },
                    {
                        role: "Tailor", icon: Shirt, ringColor: "ring-emerald-500/40",
                        iconColor: "text-emerald-400", bg: "bg-emerald-500/10",
                        msg: "New garment assigned to you", sub: "Blouse for Priya M. · 2m ago", dot: "bg-emerald-400",
                    },
                    {
                        role: "Cashier", icon: Banknote, ringColor: "ring-blue-500/40",
                        iconColor: "text-blue-400", bg: "bg-blue-500/10",
                        msg: "Collect ₹500 advance payment", sub: "Order #128 · 5m ago", dot: "bg-blue-400",
                    },
                ].map((n, i) => (
                    <motion.div
                        key={n.role}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-3 ${n.bg} rounded-xl p-3 ring-1 ${n.ringColor}`}
                    >
                        <div className="relative flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full ` + n.bg + ` flex items-center justify-center`}>
                                <n.icon className={`w-4 h-4` + ` ` + n.iconColor} />
                            </div>
                            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${n.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">{n.role}</p>
                            <p className="text-white text-xs font-medium leading-tight truncate">{n.msg}</p>
                            <p className="text-white/30 text-[9px] mt-0.5">{n.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        ),
    },
    {
        id: 2,
        tag: "Payment Flow",
        title: "Advance to Delivery,\nEvery Rupee Tracked",
        color: "from-emerald-500/20 to-emerald-600/5",
        accent: "bg-emerald-500",
        tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        content: (
            <div className="space-y-3 w-full">
                {/* Payment stages */}
                <div className="flex items-center gap-1.5 justify-between">
                    {[
                        { label: "Approved", icon: CheckCircle2, color: "text-emerald-400", done: true },
                        { done: true, arrow: true },
                        { label: "Advance", icon: Banknote, color: "text-blue-400", done: true },
                        { done: true, arrow: true },
                        { label: "Delivery", icon: Smartphone, color: "text-violet-400", done: false },
                    ].map((s, i) =>
                        s.arrow ? (
                            <ArrowRight key={i} className="w-3 h-3 text-white/20 flex-shrink-0" />
                        ) : (
                            <div key={i} className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-xl ${s.done ? "bg-white/10" : "bg-white/5"}`}>
                                <s.icon className={`w-4 h-4 ${s.done ? s.color : "text-white/20"}`} />
                                <span className={`text-[9px] font-bold ${s.done ? "text-white/70" : "text-white/20"}`}>{s.label}</span>
                            </div>
                        )
                    )}
                </div>

                {/* Active receipt */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Order Summary</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Paid</span>
                    </div>
                    {[
                        ["Total Bill", "₹1,200"],
                        ["Advance Paid", "₹600"],
                        ["Balance Due", "₹600"],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                            <span className="text-white/40">{k}</span>
                            <span className="text-white font-semibold">{v}</span>
                        </div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: "This Month", value: "₹84K", icon: TrendingUp, color: "text-emerald-400" },
                        { label: "Pending", value: "₹12K", icon: IndianRupee, color: "text-orange-400" },
                    ].map(s => (
                        <div key={s.label} className="bg-white/5 rounded-xl p-2.5">
                            <s.icon className={`w-3.5 h-3.5 ${s.color} mb-1`} />
                            <p className="text-white text-sm font-bold">{s.value}</p>
                            <p className="text-white/30 text-[9px]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 3,
        tag: "Team Workflow",
        title: "Every Role,\nOne Seamless Pipeline",
        color: "from-orange-500/20 to-orange-600/5",
        accent: "bg-orange-500",
        tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        content: (
            <div className="space-y-2.5 w-full">
                {[
                    {
                        role: "Admin / Manager", icon: AlertCircle, color: "bg-indigo-500",
                        actions: ["Approve orders", "Assign tailors", "Review for delivery"],
                    },
                    {
                        role: "Cutter", icon: Scissors, color: "bg-orange-500",
                        actions: ["Receive cutting tasks", "Mark cutting done"],
                    },
                    {
                        role: "Tailor", icon: Shirt, color: "bg-violet-500",
                        actions: ["Stitch assigned garments", "Mark stitching complete"],
                    },
                    {
                        role: "Cashier", icon: Banknote, color: "bg-emerald-500",
                        actions: ["Collect advance", "Deliver & collect balance"],
                    },
                ].map((r, i) => (
                    <motion.div
                        key={r.role}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-2.5 bg-white/5 rounded-xl px-3 py-2.5"
                    >
                        <div className={`w-7 h-7 rounded-lg ${r.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <r.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <p className="text-white text-[11px] font-bold mb-1">{r.role}</p>
                            <div className="flex flex-wrap gap-1">
                                {r.actions.map(a => (
                                    <span key={a} className="text-[9px] text-white/40 bg-white/5 rounded-full px-2 py-0.5">{a}</span>
                                ))}
                            </div>
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
        }, 3800);
        return () => clearInterval(timer);
    }, []);

    const goTo = (idx) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    };

    const slide = slides[current];

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Card */}
            <div
                className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900 min-h-[340px]`}
                style={{
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 24px 48px rgba(0,0,0,0.4)",
                }}
            >
                {/* Gradient tint per slide */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} pointer-events-none`} />

                <div className="relative z-10 p-5">
                    {/* Tag + title */}
                    <div className="mb-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`tag-${current}`}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${slide.tagColor}`}>
                                    {slide.tag}
                                </span>
                                <p className="text-white font-bold text-sm mt-2 leading-snug whitespace-pre-line">
                                    {slide.title}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Slide content — fixed height so transitions don't cause layout shift */}
                    <div className="min-h-[200px]">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={`content-${current}`}
                                custom={direction}
                                initial={{ opacity: 0, x: direction * 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction * -30 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                {slide.content}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2">
                {slides.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className="group flex items-center"
                    >
                        <motion.div
                            animate={{
                                width: i === current ? 20 : 6,
                                opacity: i === current ? 1 : 0.35,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`h-1.5 rounded-full ${i === current ? s.accent : "bg-white/30"}`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
