"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
    Scissors, Ruler, Users, FileText, CheckCircle2,
    ArrowRight, Truck, Sparkles, BarChart3,
    Clock, Zap, ChevronDown, IndianRupee, Bell,
    ShieldCheck, Layers, Activity, Shirt, Banknote,
} from "lucide-react";
import FeatureCarousel from "./FeatureCarousel";
import { LoginPanel } from "./LoginPanel";

/* ─── Reusable animation primitives ─── */
const FadeUp = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 30 }}
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
        initial={{ opacity: 0, x: from === "left" ? -40 : 40 }}
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
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

/* ─── Hero Section — 55/45 Split ─── */
function HeroSect({ formProps }) {
    return (
        <section className="relative min-h-screen flex flex-col justify-center overflow-x-hidden pt-24 pb-20" style={{ backgroundColor: '#080B14' }}>

            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[rgba(124,58,237,0.06)] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-[rgba(16,185,129,0.03)] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                backgroundSize: "64px 64px",
            }} />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 xl:px-16">

                {/* 55/45 Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">

                    {/* LEFT COLUMN: Hero Copy + Carousel (Stacked) */}
                    <div className="flex flex-col gap-6 lg:gap-8 pt-8 relative">

                        <div className="flex flex-col gap-5">
                            <FadeUp delay={0}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit border"
                                    style={{
                                        background: 'rgba(124,58,237,0.15)',
                                        borderColor: 'rgba(124,58,237,0.35)',
                                        color: '#7C3AED',
                                    }}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.85rem' }}>
                                        Premium Tailoring & Boutique OS
                                    </span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={0.08}>
                                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.05] tracking-tight"
                                    style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                                    Run your tailoring<br />
                                    business like <span
                                        className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #F472B6 0%, #7C3AED 100%)' }}>
                                        clockwork
                                    </span>
                                </h1>
                            </FadeUp>

                            <FadeUp delay={0.16}>
                                <p className="text-[1.1rem] leading-[1.65] max-w-[480px]" style={{ color: '#8B95B0', fontFamily: 'DM Sans, sans-serif' }}>
                                    From the first measurement to the final stitch — manage every order, staff member, and rupee from one beautifully simple dashboard.
                                </p>
                            </FadeUp>

                            {/* Trust badges */}
                            <FadeUp delay={0.24}>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-[#8B95B0] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    {[
                                        { label: "No setup required" },
                                        { label: "Role-based access" },
                                        { label: "Real-time sync" },
                                    ].map((b, i) => (
                                        <div key={b.label} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                                            <span>{b.label}</span>
                                            {i < 2 && <span className="text-[#4A5568] mx-1">·</span>}
                                        </div>
                                    ))}
                                </div>
                            </FadeUp>
                        </div>

                        {/* Carousel Card stacked directly below trust badges */}
                        <FadeUp className="mt-4 pt-4 w-full" delay={0.32}>
                            <FeatureCarousel />
                        </FadeUp>

                        {/* Stat pills row */}
                        <FadeUp delay={0.40}>
                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                {[
                                    { label: "Orders managed", value: "10K+" },
                                    { label: "Boutiques", value: "200+" },
                                    { label: "Time saved", value: "4h/day" },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.10)] transition-colors cursor-default group">
                                        <span className="font-black text-white text-[15px] group-hover:scale-105 transition-transform" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{s.value}</span>
                                        <span className="text-[#8B95B0] text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                    </div>

                    {/* RIGHT COLUMN: Redesigned Dark Login Card */}
                    <div className="relative w-full lg:pt-8 flex justify-end">
                        <LoginPanel {...formProps} />
                    </div>

                </div>
            </div>

            {/* Scroll hint bouncing CTA */}
            <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#4A5568] text-[12px] z-10 cursor-pointer hover:text-white transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                onClick={() => {
                    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <span>Scroll to explore ↓</span>
            </motion.div>
        </section>
    );
}

/* ─── FEATURES — Bento Grid Fix ─── */
const bentoItems = [
    {
        icon: Ruler, title: "Smart Measurements",
        desc: "Store every customer's precise measurements. Access instantly, update anytime.",
        span: "col-span-1 lg:col-span-2 row-span-1",
        containerBg: "rgba(16,185,129,0.15)", iconColor: "#10B981",
        gradientAccent: "radial-gradient(circle at top left, rgba(16,185,129,0.12), transparent 40%)"
    },
    {
        icon: Users, title: "Team Workloads",
        desc: "See exactly who's cutting, stitching, or idle — at a glance. Prevent bottlenecks before they happen.",
        span: "col-span-1 lg:col-span-1 row-span-1 lg:row-span-2",
        containerBg: "rgba(124,58,237,0.15)", iconColor: "#7C3AED",
        gradientAccent: "radial-gradient(circle at top right, rgba(124,58,237,0.12), transparent 50%)"
    },
    {
        icon: BarChart3, title: "Revenue Analytics",
        desc: "Daily, weekly, monthly revenue breakdowns. Spot your best-selling items quickly.",
        span: "col-span-1 row-span-1",
        containerBg: "rgba(251,191,36,0.15)", iconColor: "#FBBF24",
        gradientAccent: "radial-gradient(circle at top left, rgba(251,191,36,0.10), transparent 60%)"
    },
    {
        icon: FileText, title: "Auto-Invoicing",
        desc: "Generate professional WhatsApp-ready receipts the moment a payment lands.",
        span: "col-span-1 row-span-1",
        containerBg: "rgba(249,115,22,0.15)", iconColor: "#F97316",
        gradientAccent: "radial-gradient(circle at top left, rgba(249,115,22,0.10), transparent 60%)"
    },
    {
        icon: Clock, title: "Deadline Tracking",
        desc: "Never miss a delivery. Built-in alerts when orders fall slightly behind schedule.",
        span: "col-span-1 lg:col-span-1 row-span-1",
        containerBg: "rgba(244,114,182,0.15)", iconColor: "#F472B6",
        gradientAccent: "radial-gradient(circle at bottom left, rgba(244,114,182,0.10), transparent 60%)"
    },
    {
        icon: Zap, title: "Instant Notifications",
        desc: "The right person gets the right alert securely pushed to their dashboard instantly.",
        span: "col-span-1 lg:col-span-2 row-span-1",
        containerBg: "rgba(59,130,246,0.15)", iconColor: "#3B82F6",
        gradientAccent: "radial-gradient(circle at bottom right, rgba(59,130,246,0.10), transparent 60%)"
    },
];

function FeatureBento() {
    return (
        <section id="features-section" className="py-32 px-8 lg:px-16" style={{ background: '#0C1020' }}>
            <div className="max-w-[1440px] mx-auto">
                <FadeUp>
                    <div className="mb-4 inline-flex items-center gap-2 border px-3 py-1 rounded-full uppercase tracking-widest text-[#10B981]"
                        style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.35)', fontSize: '0.70rem', fontWeight: 800 }}>
                        <Sparkles className="w-3 h-3" /> Features
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 max-w-2xl leading-[1.1]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                        Everything your boutique needs.<br />Nothing it doesn&apos;t.
                    </h2>
                    <p className="text-[1.05rem] max-w-xl mb-14" style={{ color: '#8B95B0', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                        A purpose-built OS for tailors. Stop wrestling with generic spreadsheets and WhatsApp groups. Start tracking every garment visually.
                    </p>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {bentoItems.map((item, i) => (
                        <motion.div
                            key={item.title}
                            className={`${item.span} relative rounded-[16px] p-7 overflow-hidden group cursor-default border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)] transition-colors duration-300`}
                            style={{
                                backgroundColor: '#131929',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
                                backgroundImage: item.gradientAccent
                            }}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300"
                                style={{ backgroundColor: item.containerBg }}>
                                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
                            </div>
                            <h3 className="text-white font-bold text-[1.1rem] mb-2.5" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{item.title}</h3>
                            <p className="text-[#8B95B0] text-[0.92rem] leading-[1.6]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.desc}</p>

                            {/* Inner ambient glow on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[rgba(255,255,255,0.015)] pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── WORKFLOW — Refinements ─── */
const steps = [
    { icon: Ruler, color: "#7C3AED", label: "Take Measurements", desc: "Record precise customer measurements digitally. Stored securely forever." }, // Violet
    { icon: Scissors, color: "#F97316", label: "Assign to Cutter", desc: "Admin routes order to a cutter with a single tap. They get an instant push note." }, // Orange
    { icon: Shirt, color: "#10B981", label: "Tailor Stitches", desc: "Tailor receives the cut garment, stitches it, and marks it done cleanly." }, // Emerald
    { icon: CheckCircle2, color: "#3B82F6", label: "Quality Review", desc: "Admin reviews the completed garment and approves it for final delivery." }, // Blue
    { icon: Truck, color: "#FBBF24", label: "Deliver &amp; Collect", desc: "Cashier delivers garment, collects final balance, and closes order." }, // Amber
];

const rightStats = [
    { label: "Avg cycle time", value: "3.2 days", icon: Clock, accent: "#3B82F6" },   // Blue (Precision)
    { label: "Messages saved", value: "94%", icon: Bell, accent: "#7C3AED" },        // Violet (Comm)
    { label: "Error-free rate", value: "99.1%", icon: CheckCircle2, accent: "#10B981" }, // Green (Accuracy)
    { label: "Tracked today", value: "₹84K", icon: IndianRupee, accent: "#FBBF24" },  // Amber (Revenue)
];

const roleHighlights = [
    { role: "Admin / Manager", color: "#3B82F6", desc: "Approve orders, assign staff, review deliveries, monitor revenue — all in one view." },
    { role: "Cutter", color: "#F97316", desc: "Get notified immediately when cutting is needed. Mark it done and hand off automatically." },
    { role: "Tailor", color: "#10B981", desc: "See only your assigned garments. Mark stitching complete with one tap." },
    { role: "Cashier", color: "#7C3AED", desc: "Collect advance and balance payments without errors. Hand over to client smoothly." },
];

function HowItWorks() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });
    // Spring animates the drawing of the dotted timeline line
    const progressHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
        stiffness: 80, damping: 20
    });

    return (
        <section ref={ref} className="py-32 px-8 lg:px-16" style={{ background: '#080B14' }}>
            <div className="max-w-[1440px] mx-auto">
                <FadeUp>
                    <div className="mb-4 inline-flex items-center gap-2 border px-3 py-1 rounded-full uppercase tracking-widest text-[#FBBF24]"
                        style={{ background: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)', fontSize: '0.70rem', fontWeight: 800 }}>
                        <ArrowRight className="w-3 h-3" /> Workflow
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 max-w-2xl leading-[1.1]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                        From intake to delivery in 5 seamless steps
                    </h2>
                    <p className="text-[1.05rem] max-w-xl mb-20" style={{ color: '#8B95B0', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                        No WhatsApp chaos. No lost paper slips. Every handoff is tracked, timestamped, and notified automatically across your staff.
                    </p>
                </FadeUp>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-16 lg:gap-24 items-start">

                    {/* Left: Animated Timeline */}
                    <div className="relative pl-2">
                        {/* The dashed track */}
                        <div className="absolute left-[25px] top-6 bottom-6 w-[2px] border-l-2 border-dashed border-[rgba(255,255,255,0.08)]" />

                        {/* The lit drawn line */}
                        <div className="absolute left-[25px] top-6 bottom-6 w-[2px] overflow-hidden">
                            <motion.div
                                className="w-[3px] -ml-[1px]"
                                style={{
                                    height: progressHeight,
                                    backgroundImage: 'linear-gradient(to bottom, #7C3AED, #10B981)',
                                    boxShadow: '0 0 10px rgba(124,58,237,0.5)'
                                }}
                            />
                        </div>

                        <div className="space-y-12">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.label}
                                    className="relative flex gap-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-40%" }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                                >
                                    <motion.div
                                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-lg relative"
                                        style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}40`, border: `3px solid ${step.color}4d` }}
                                        whileInView={{ scale: [0, 1.1, 1] }}
                                        viewport={{ once: true, margin: "-40%" }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
                                    >
                                        <step.icon className="w-5 h-5 text-white" />
                                    </motion.div>

                                    <div className="flex-1 pt-1.5 pb-2">
                                        <p className="text-[#4A5568] text-[0.68rem] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            Step {i + 1}
                                        </p>
                                        <h3 className="text-white font-bold text-[1.1rem] mb-1.5" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }} dangerouslySetInnerHTML={{ __html: step.label }} />
                                        <p className="text-[#8B95B0] text-[0.90rem] leading-relaxed max-w-[380px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Stats + Role highlights */}
                    <div className="flex flex-col">

                        {/* 4 Stat Grid */}
                        <FadeIn delay={0.15}>
                            <div className="grid grid-cols-2 gap-4">
                                {rightStats.map((s, i) => (
                                    <motion.div
                                        key={s.label}
                                        className="flex flex-col p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] transition-all cursor-default"
                                        style={{
                                            backgroundColor: '#131929',
                                            backgroundImage: `radial-gradient(circle at top right, ${s.accent}15, transparent 70%)`,
                                            boxShadow: '0 4px 24px rgba(0,0,0,0.30)'
                                        }}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-30px" }}
                                        transition={{ duration: 0.5, delay: i * 0.08 }}
                                        whileHover={{ y: -3, borderColor: `${s.accent}33` }}
                                    >
                                        <s.icon className="w-6 h-6 mb-3" style={{ color: s.accent }} />
                                        <p className="text-white font-black leading-none mb-1.5" style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '2.2rem' }}>{s.value}</p>
                                        <p className="text-[#8B95B0] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </FadeIn>

                        {/* Thin divider */}
                        <div className="w-full h-[1px] bg-[rgba(255,255,255,0.08)] my-10" />

                        {/* Role highlights breakdown */}
                        <SlideIn from="right" delay={0.25}>
                            <p className="text-[#4A5568] text-[0.70rem] font-bold uppercase tracking-[0.12em] mb-5 font-body">Every role, perfectly informed</p>
                            <div className="space-y-3">
                                {roleHighlights.map((r, i) => (
                                    <div key={r.role} className="flex items-start gap-4 p-4 rounded-xl bg-[#131929] hover:bg-[#1A2236] transition-colors overflow-hidden relative group border border-[rgba(255,255,255,0.03)] cursor-default">
                                        {/* Color accent bar left */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: r.color }} />

                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: r.color }}>
                                            <span className="text-white font-black text-sm" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{r.role.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="text-white text-[15px] font-medium mb-1" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>{r.role}</p>
                                            <p className="text-[#8B95B0] text-[0.85rem] leading-[1.6]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{r.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SlideIn>
                    </div>

                </div>
            </div>
        </section>
    );
}

/* ─── Footer ─── */
function Footer() {
    return (
        <footer className="border-t border-[rgba(255,255,255,0.06)] px-8 lg:px-16 py-14" style={{ backgroundColor: '#080B14' }}>
            <div className="max-w-[1440px] mx-auto">
                <FadeUp>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Scissors className="w-5 h-5 text-white" />
                                <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>StitchFlow</span>
                            </div>
                            <p className="text-[#8B95B0] text-[0.95rem] max-w-sm" style={{ fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                                Premium Tailoring &amp; Boutique Management OS. Built precisely for modern craftspeople.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[#8B95B0] text-sm font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            {["Features", "Workflow", "Contact"].map((l) => (
                                <span key={l} className="hover:text-white cursor-pointer transition-colors">{l}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4 pt-10 mt-10 border-t border-[rgba(255,255,255,0.06)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        <p className="text-[#4A5568] text-xs">© 2026 StitchFlow. All rights reserved.</p>
                        <p className="text-[#4A5568] text-xs font-medium">Made with ❤️ for Indian Boutiques</p>
                    </div>
                </FadeUp>
            </div>
        </footer>
    );
}

/* ─── Main Export ─── */
export default function LandingContent({ formProps }) {
    return (
        <div style={{ backgroundColor: '#080B14' }}>
            <HeroSect formProps={formProps} />
            <FeatureBento />
            <HowItWorks />
            <Footer />
        </div>
    );
}
