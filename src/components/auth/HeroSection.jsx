"use client";

import { motion } from "framer-motion";
import { NotificationIcon, LockUnlockIcon, SuccessIcon } from "@/components/ui/animated-state-icons";
import { Scissors, ShieldCheck, BarChart3, Zap, TrendingUp, Package, IndianRupee } from "lucide-react";

const features = [
    { icon: Scissors, label: "Order Tracking" },
    { icon: NotificationIcon, label: "Smart Alerts", isAnimated: true },
    { icon: BarChart3, label: "Live Analytics" },
    { icon: Zap, label: "Fast Workflow" },
];

// Mini mock dashboard preview card
const MockDashboard = () => (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                    <Scissors className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-xs font-bold">StitchFlow</span>
            </div>
            <div className="flex gap-1.5">
                <div className="w-8 h-1.5 bg-white/10 rounded-full" />
                <div className="w-5 h-1.5 bg-indigo-500/60 rounded-full" />
                <div className="w-6 h-1.5 bg-white/10 rounded-full" />
            </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
            {[
                { label: "Orders", value: "128", icon: Package, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                { label: "Revenue", value: "₹84K", icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Pending", value: "12", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
            ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-2.5 flex flex-col gap-1`}>
                    <s.icon className={`w-3 h-3 ${s.color}`} />
                    <p className="text-white text-sm font-bold leading-none">{s.value}</p>
                    <p className="text-white/40 text-[9px]">{s.label}</p>
                </div>
            ))}
        </div>

        {/* Order list */}
        <div className="flex-1 bg-white/5 rounded-xl p-2.5 space-y-2">
            <p className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Recent Orders</p>
            {[
                { name: "Rahul K.", item: "Suit", status: "Stitching", color: "bg-violet-500" },
                { name: "Priya M.", item: "Blouse", status: "Ready", color: "bg-emerald-500" },
                { name: "Arjun S.", item: "Sherwani", status: "Cutting", color: "bg-orange-500" },
                { name: "Meera T.", item: "Saree", status: "Delivered", color: "bg-blue-500" },
            ].map((o) => (
                <div key={o.name} className="flex items-center gap-2">
                    <div className={`w-1 h-5 rounded-full ${o.color}`} />
                    <span className="text-white/70 text-[10px] flex-1">{o.name} — {o.item}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold text-white ${o.color}`}>{o.status}</span>
                </div>
            ))}
        </div>

        {/* Bottom nav */}
        <div className="flex gap-2">
            {["Dashboard", "Orders", "Team", "Reports"].map((t) => (
                <div key={t} className={`flex-1 py-1 rounded-lg text-center text-[8px] font-bold ${t === "Dashboard" ? "bg-indigo-600 text-white" : "text-white/30"}`}>
                    {t}
                </div>
            ))}
        </div>
    </div>
);

export default function HeroSection() {
    return (
        <div className="relative flex flex-col justify-center items-center lg:items-start overflow-hidden h-full">
            {/* Deep gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />

            {/* Radial glow orbs */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Top-right decorative animated icons */}
            <motion.div
                className="absolute top-8 right-8 opacity-20"
                animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <SuccessIcon size={36} color="#a5b4fc" />
            </motion.div>
            <motion.div
                className="absolute bottom-16 left-8 opacity-15"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
                <LockUnlockIcon size={28} color="#c4b5fd" />
            </motion.div>

            <div className="relative z-10 flex flex-col gap-8 px-8 lg:px-14 py-12 w-full">
                {/* Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Scissors className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                        </div>
                        <span className="text-white font-bold text-sm tracking-wide">StitchFlow</span>
                    </div>

                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                        Tailoring{" "}
                        <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
                            Management
                        </span>
                        <br />Reimagined
                    </h1>
                    <p className="text-indigo-200/60 mt-3 text-sm leading-relaxed max-w-sm">
                        From first stitch to final delivery — track every order, staff, and payment in one place.
                    </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap gap-2"
                >
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                            {f.isAnimated ? (
                                <NotificationIcon size={14} color="#a5b4fc" hasNotification={true} />
                            ) : (
                                <f.icon className="w-3.5 h-3.5 text-indigo-300" />
                            )}
                            <span className="text-white/70 text-[11px] font-medium">{f.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* 3D Perspective Dashboard Preview — hero-section-9 style */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                    className="w-full max-w-sm mx-auto lg:mx-0"
                    style={{ perspective: "1000px" }}
                >
                    <motion.div
                        style={{ rotateX: 12, rotateY: -6, transformStyle: "preserve-3d" }}
                        whileHover={{ rotateX: 6, rotateY: -2, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-56 rounded-2xl border border-white/10 shadow-2xl shadow-indigo-900/50 overflow-hidden"
                    >
                        <MockDashboard />
                    </motion.div>

                    {/* Glow under card */}
                    <div className="w-3/4 h-6 mx-auto bg-indigo-600/20 blur-xl rounded-full -mt-3" />
                </motion.div>

                {/* Trust line */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex items-center gap-2 text-indigo-300/30 text-[10px]"
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure • Role-based access • Real-time Firestore sync</span>
                </motion.div>
            </div>
        </div>
    );
}
