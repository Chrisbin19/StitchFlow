"use client";

import { motion } from "framer-motion";
import { SuccessIcon, NotificationIcon, LockUnlockIcon } from "@/components/ui/animated-state-icons";
import { Scissors, ShieldCheck, BarChart3, Zap } from "lucide-react";

const features = [
    {
        icon: Scissors,
        title: "Order Tracking",
        desc: "Track every garment from intake to delivery",
    },
    {
        icon: NotificationIcon,
        title: "Smart Alerts",
        desc: "Real-time notifications for every role",
        isAnimated: true,
    },
    {
        icon: BarChart3,
        title: "Live Dashboard",
        desc: "Payments, stats & analytics at a glance",
    },
    {
        icon: Zap,
        title: "Fast Workflow",
        desc: "Streamlined approval & handoff pipeline",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HeroSection() {
    return (
        <div className="relative flex flex-col justify-center items-center lg:items-start px-8 lg:px-16 py-12 lg:py-0 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Floating animated icons (decorative) */}
            <motion.div
                className="absolute top-16 right-12 opacity-20 hidden lg:block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <SuccessIcon size={48} color="#a5b4fc" />
            </motion.div>
            <motion.div
                className="absolute bottom-24 right-20 opacity-15 hidden lg:block"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <LockUnlockIcon size={40} color="#c4b5fd" />
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 max-w-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-indigo-300" />
                        </div>
                        <span className="text-white/60 text-sm font-medium tracking-widest uppercase">
                            StitchFlow
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                        Precision Tailoring,{" "}
                        <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                            Streamlined
                        </span>
                    </h1>
                    <p className="text-indigo-200/70 text-lg leading-relaxed">
                        The complete workshop management system. From order intake to final delivery — every stitch tracked.
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div variants={itemVariants} className="space-y-4 mb-10">
                    {features.map((feat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="flex items-start gap-4 group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                                {feat.isAnimated ? (
                                    <NotificationIcon size={20} color="#a5b4fc" hasNotification={true} />
                                ) : (
                                    <feat.icon className="w-5 h-5 text-indigo-300" />
                                )}
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">{feat.title}</p>
                                <p className="text-indigo-300/60 text-sm">{feat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust Badge */}
                <motion.div variants={itemVariants} className="flex items-center gap-2 text-indigo-300/40 text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure access • Role-based permissions • Real-time sync</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
