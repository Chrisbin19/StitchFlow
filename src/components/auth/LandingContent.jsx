"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
    Scissors, Ruler, Users, FileText, CheckCircle2,
    ArrowRight, Truck, Sparkles, BarChart3,
    ShoppingBag, Clock, Zap, ChevronDown,
    TrendingUp, IndianRupee, Bell, Package,
    ShieldCheck, Layers, Activity,
} from "lucide-react";
import FeatureCarousel from "./FeatureCarousel";

/* ─── Reusable animation primitives ─── */
const FadeUp = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

const SlideIn = ({ children, from = "left", delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, x: from === "left" ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

const ScaleIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.88 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

/* ─── Hero Section — 2-column layout ─── */
function HeroSect() {
    return (
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
            <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.018]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
            }} />

            {/* StitchFlow Nav */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-8 lg:px-16 py-5 border-b border-white/5">
                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    <Scissors className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-black text-lg tracking-tight">StitchFlow</span>
                <span className="text-indigo-400/60 text-xs font-semibold border border-indigo-500/20 bg-indigo-500/10 rounded-full px-2.5 py-0.5">Boutique OS</span>
            </div>

            {/* 2-Column Layout */}
            <div className="relative z-10 w-full px-8 lg:px-16 pt-24 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-8 items-center lg:pr-[420px] xl:pr-[440px]">

                    {/* ── Left: Headline + CTAs ── */}
                    <div className="flex flex-col gap-6">
                        <FadeUp delay={0}>
                            <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full w-fit">
                                <Sparkles className="w-3.5 h-3.5" />
                                Premium Tailoring &amp; Boutique OS
                            </div>
                        </FadeUp>

                        <FadeUp delay={0.08}>
                            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                                Run your tailoring<br />
                                business like{" "}
                                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                                    clockwork
                                </span>
                            </h1>
                        </FadeUp>

                        <FadeUp delay={0.14}>
                            <p className="text-indigo-200/55 text-lg leading-relaxed max-w-lg">
                                From the first measurement to the final stitch — manage every order, staff member, and rupee from one beautifully simple dashboard.
                            </p>
                        </FadeUp>

                        {/* Trust badges */}
                        <FadeUp delay={0.20}>
                            <div className="flex flex-wrap items-center gap-3">
                                {[
                                    { icon: CheckCircle2, label: "No setup required" },
                                    { icon: ShieldCheck, label: "Role-based access" },
                                    { icon: Activity, label: "Real-time sync" },
                                ].map((b) => (
                                    <div key={b.label} className="flex items-center gap-1.5 text-indigo-200/50 text-sm">
                                        <b.icon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                        <span>{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                        {/* Stat pills */}
                        <FadeUp delay={0.28}>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: "Orders managed", value: "10K+", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                                    { label: "Boutiques", value: "200+", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                                    { label: "Avg. time saved", value: "4h/day", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                                ].map((s) => (
                                    <div key={s.label} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${s.color} text-sm`}>
                                        <span className="font-black">{s.value}</span>
                                        <span className="text-white/30 text-xs">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>
                    </div>

                    {/* ── Right: Feature Carousel ── */}
                    <ScaleIn delay={0.25}>
                        <div className="w-full">
                            <FeatureCarousel />
                        </div>
                    </ScaleIn>
                </div>
            </div>

            {/* Scroll hint */}
            <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 text-[11px]"
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
                <span>Scroll to explore</span>
                <ChevronDown className="w-4 h-4" />
            </motion.div>
        </section>
    );
}

/* ─── Feature Bento Grid ─── */
const bentoItems = [
    {
        icon: Ruler, title: "Smart Measurements",
        desc: "Store every customer's precise measurements. Access instantly, update anytime.",
        span: "col-span-2 row-span-1", bg: "from-indigo-500/15 to-indigo-600/5",
        iconColor: "text-indigo-400", border: "border-indigo-500/20",
    },
    {
        icon: Users, title: "Team Workloads",
        desc: "See exactly who's cutting, stitching, or idle — at a glance.",
        span: "col-span-1 row-span-2", bg: "from-violet-500/15 to-violet-600/5",
        iconColor: "text-violet-400", border: "border-violet-500/20",
    },
    {
        icon: BarChart3, title: "Revenue Analytics",
        desc: "Daily, weekly, monthly revenue breakdowns. Spot your best-selling items.",
        span: "col-span-1 row-span-1", bg: "from-emerald-500/15 to-emerald-600/5",
        iconColor: "text-emerald-400", border: "border-emerald-500/20",
    },
    {
        icon: FileText, title: "Auto-Invoicing",
        desc: "Generate professional receipts the moment a payment lands.",
        span: "col-span-1 row-span-1", bg: "from-orange-500/15 to-orange-600/5",
        iconColor: "text-orange-400", border: "border-orange-500/20",
    },
    {
        icon: Clock, title: "Deadline Tracking",
        desc: "Never miss a delivery. Built-in alerts when orders fall behind.",
        span: "col-span-1 row-span-1", bg: "from-pink-500/15 to-pink-600/5",
        iconColor: "text-pink-400", border: "border-pink-500/20",
    },
    {
        icon: Zap, title: "Instant Notifications",
        desc: "The right person gets the right alert at the right moment.",
        span: "col-span-1 row-span-1", bg: "from-sky-500/15 to-sky-600/5",
        iconColor: "text-sky-400", border: "border-sky-500/20",
    },
];

function FeatureBento() {
    return (
        <section className="py-28 px-8 lg:px-16 bg-slate-950">
            <FadeUp>
                <div className="mb-3 inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Features
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 max-w-lg leading-tight">
                    Everything your boutique needs. Nothing it doesn&apos;t.
                </h2>
                <p className="text-slate-400 text-base max-w-md mb-12">
                    A purpose-built OS for tailors — not a generic project tool retooled with a sewing needle icon.
                </p>
            </FadeUp>

            <div className="grid grid-cols-3 gap-4">
                {bentoItems.map((item, i) => (
                    <motion.div
                        key={i}
                        className={`${item.span} relative bg-gradient-to-br ${item.bg} border ${item.border} rounded-2xl p-5 overflow-hidden group cursor-default`}
                        initial={{ opacity: 0, y: 32, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                    >
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                            <item.icon className={`w-[18px] h-[18px] ${item.iconColor}`} />
                        </div>
                        <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.015] rounded-2xl" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* ─── How It Works — 2-column layout ─── */
const steps = [
    { icon: Ruler, color: "bg-indigo-500", ringColor: "ring-indigo-500/20", label: "Take Measurements", desc: "Record precise customer measurements digitally. Stored forever and accessible in seconds." },
    { icon: Scissors, color: "bg-orange-500", ringColor: "ring-orange-500/20", label: "Assign to Cutter", desc: "Admin sends the order to the cutter with a single tap. Cutter gets an instant push notification." },
    { icon: ShoppingBag, color: "bg-violet-500", ringColor: "ring-violet-500/20", label: "Tailor Stitches", desc: "Tailor receives the cut garment, stitches it, and marks it done. Admin is notified automatically." },
    { icon: CheckCircle2, color: "bg-emerald-500", ringColor: "ring-emerald-500/20", label: "Quality Review", desc: "Admin reviews the completed garment and approves it for final delivery." },
    { icon: Truck, color: "bg-blue-500", ringColor: "ring-blue-500/20", label: "Deliver &amp; Collect", desc: "Cashier delivers the garment, collects the final balance, and closes the order." },
];

const rightStats = [
    { label: "Average order time", value: "3.2 days", icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "WhatsApp messages saved", value: "94%", icon: Bell, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Orders without errors", value: "99.1%", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Monthly revenue tracked", value: "₹84K", icon: IndianRupee, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
];

const roleHighlights = [
    { role: "Admin / Manager", icon: Layers, color: "bg-indigo-500", desc: "Approve orders, assign staff, review deliveries, monitor revenue — all in one view." },
    { role: "Cutter", icon: Scissors, color: "bg-orange-500", desc: "Get notified when cutting is needed. Mark it done and hand off automatically." },
    { role: "Tailor", icon: ShoppingBag, color: "bg-violet-500", desc: "See only your assigned garments. Mark stitching complete with one tap." },
    { role: "Cashier", icon: IndianRupee, color: "bg-emerald-500", desc: "Collect advance and balance payments. Every rupee automatically recorded." },
];

function HowItWorks() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.3"] });
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const smoothLine = useSpring(lineHeight, { stiffness: 80, damping: 20 });

    return (
        <section ref={ref} className="py-28 px-8 lg:px-16 bg-gradient-to-b from-slate-950 to-indigo-950/40">
            <FadeUp>
                <div className="mb-3 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    <ArrowRight className="w-3 h-3" /> Workflow
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 max-w-xl leading-tight">
                    From intake to delivery in 5 seamless steps
                </h2>
                <p className="text-slate-400 text-base max-w-lg mb-16">
                    No WhatsApp chaos. No lost slips. Every handoff is tracked, timestamped, and notified automatically.
                </p>
            </FadeUp>

            {/* 2-column: timeline left, stats right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">

                {/* Left: Animated Timeline */}
                <div className="relative">
                    <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="w-full bg-gradient-to-b from-indigo-500 via-violet-500 to-emerald-500 rounded-full origin-top"
                            style={{ height: smoothLine }}
                        />
                    </div>

                    <div className="space-y-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                className="relative flex gap-5"
                                initial={{ opacity: 0, x: -32 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <motion.div
                                    className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center flex-shrink-0 z-10 shadow-lg ring-4 ${step.ringColor}`}
                                    whileInView={{ scale: [0.6, 1.1, 1] }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                                >
                                    <step.icon className="w-4 h-4 text-white" />
                                </motion.div>
                                <div className="flex-1 pt-1">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Step {i + 1}</p>
                                    <h3 className="text-white font-bold text-base mb-1" dangerouslySetInnerHTML={{ __html: step.label }} />
                                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right: Stats + Role highlights */}
                <div className="flex flex-col gap-6">
                    {/* Stats grid */}
                    <FadeIn delay={0.15}>
                        <div className="grid grid-cols-2 gap-3">
                            {rightStats.map((s, i) => (
                                <motion.div
                                    key={s.label}
                                    className={`flex flex-col gap-2 p-4 rounded-2xl border ${s.bg} backdrop-blur-sm`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-30px" }}
                                    transition={{ duration: 0.5, delay: i * 0.08 }}
                                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                                >
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                    <p className="text-white text-xl font-black leading-none">{s.value}</p>
                                    <p className="text-slate-400 text-xs leading-snug">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </FadeIn>

                    {/* Role highlights */}
                    <SlideIn from="right" delay={0.2}>
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">Every role, perfectly informed</p>
                            {roleHighlights.map((r, i) => (
                                <motion.div
                                    key={r.role}
                                    className="flex items-start gap-3"
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: i * 0.08 }}
                                >
                                    <div className={`w-7 h-7 rounded-lg ${r.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                        <r.icon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-bold mb-0.5">{r.role}</p>
                                        <p className="text-slate-400 text-xs leading-relaxed">{r.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SlideIn>
                </div>
            </div>
        </section>
    );
}

/* ─── Footer ─── */
function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 px-8 lg:px-16 py-12">
            <FadeUp>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                                <Scissors className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold">StitchFlow</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs">
                            Premium Tailoring &amp; Boutique Management OS. Built for Indian craftspeople.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-slate-500 text-sm">
                        {["Features", "Workflow", "Contact"].map((l) => (
                            <span key={l} className="hover:text-white cursor-pointer transition-colors">{l}</span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4 pt-8 mt-8 border-t border-white/5">
                    <p className="text-slate-600 text-xs">© 2026 StitchFlow. All rights reserved.</p>
                    <p className="text-slate-600 text-xs">Made with ❤️ for boutiques across India</p>
                </div>
            </FadeUp>
        </footer>
    );
}

/* ─── Main Export ─── */
export default function LandingContent() {
    return (
        <div>
            <HeroSect />
            <FeatureBento />
            <HowItWorks />
            <Footer />
        </div>
    );
}
