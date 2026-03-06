"use client";

import { motion } from "framer-motion";
import { NotificationIcon, LockUnlockIcon, SuccessIcon } from "@/components/ui/animated-state-icons";
import { Scissors, ShieldCheck, BarChart3, Zap } from "lucide-react";
import FeatureCarousel from "./FeatureCarousel";

const features = [
    { icon: Scissors, label: "Order Tracking" },
    { icon: NotificationIcon, label: "Smart Alerts", isAnimated: true },
    { icon: BarChart3, label: "Live Analytics" },
    { icon: Zap, label: "Fast Workflow" },
];

export default function HeroSection() {
    return (
        <div className="relative flex flex-col justify-center items-center lg:items-start overflow-hidden h-full w-full">
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

            {/* Decorative floating animated icons */}
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

            <div className="relative z-10 flex flex-col gap-6 px-8 lg:px-14 py-12 w-full">
                {/* Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Scissors className="w-[18px] h-[18px] text-white" />
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

                {/* Feature Carousel — replaces the old MockDashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="w-full max-w-sm mx-auto lg:mx-0"
                >
                    <FeatureCarousel />
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
