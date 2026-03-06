"use client";

import { motion, AnimatePresence } from "framer-motion";
import RoleSelect from "./RoleSelect";
import { Mail, Lock, ArrowRight, Loader2, X } from "lucide-react";

const formVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, staggerChildren: 0.07, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ─── Desktop floating card ─── */
export function LoginPanel({ email, setEmail, password, setPassword, role, setRole, error, onSubmit, loading }) {
    return (
        <motion.div
            id="login-card-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="w-full max-w-[440px] mx-auto z-40 relative"
        >
            {/* Card shell - Dark Themed Native */}
            <div className="w-full bg-[#131929] rounded-[20px] border border-[rgba(255,255,255,0.14)] overflow-hidden"
                style={{
                    boxShadow: '0 4px 24px rgba(0,0,0,0.40), 0 0 60px rgba(124,58,237,0.15)'
                }}>
                {/* Subtle top accent stripe */}
                <div className="h-[1px] w-full bg-gradient-to-r from-[#F472B6] to-[#7C3AED]" />

                <div className="p-9">
                    <FormContent
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        role={role} setRole={setRole}
                        error={error} onSubmit={onSubmit} loading={loading}
                    />
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Mobile bottom-sheet modal ─── */
export function MobileLoginModal({ open, onClose, email, setEmail, password, setPassword, role, setRole, error, onSubmit, loading }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl px-6 py-8 max-h-[92vh] overflow-y-auto"
                        style={{ background: '#131929', borderTop: '1px solid rgba(255,255,255,0.14)' }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    >
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10"
                        >
                            <X className="w-4 h-4 text-[#8B95B0]" />
                        </button>
                        <FormContent
                            email={email} setEmail={setEmail}
                            password={password} setPassword={setPassword}
                            role={role} setRole={setRole}
                            error={error} onSubmit={onSubmit} loading={loading}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ─── Shared form ─── */
function FormContent({ email, setEmail, password, setPassword, role, setRole, error, onSubmit, loading }) {
    return (
        <motion.div className="w-full" variants={formVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[rgba(124,58,237,0.3)] shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                        style={{ background: 'rgba(124,58,237,0.15)' }}>
                        <Lock size={18} color="#7C3AED" />
                    </div>
                </div>
                <h2 className="text-[1.6rem] font-black text-white tracking-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Welcome back</h2>
                <p className="text-[#8B95B0] text-sm mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Sign in to your workspace</p>
            </motion.div>

            <form onSubmit={onSubmit} className="space-y-5">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.div variants={itemVariants}>
                    <p className="block text-[0.70rem] font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-2 font-body">Select Your Role</p>
                    <RoleSelect value={role} onChange={setRole} />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="block text-[0.70rem] font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-1.5 font-body">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568] transition-colors group-focus-within:text-[#7C3AED]" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0C1020] text-[#F0EBE3] placeholder:text-[#4A5568] transition-all outline-none text-sm font-body"
                            style={{ boxShadow: 'none' }}
                            placeholder="name@stitchflow.com"
                            required
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7C3AED';
                                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="block text-[0.70rem] font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-1.5 font-body">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568] transition-colors group-focus-within:text-[#7C3AED]" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0C1020] text-[#F0EBE3] placeholder:text-[#4A5568] transition-all outline-none text-sm font-body tracking-wider"
                            style={{ boxShadow: 'none' }}
                            placeholder="••••••••"
                            required
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7C3AED';
                                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-3.5 px-4 text-white font-medium rounded-full shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.40)] transition-all flex items-center justify-center gap-2 text-[15px] group"
                        style={{
                            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                            fontFamily: 'Cabinet Grotesk, sans-serif'
                        }}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                        ) : (
                            <>Sign In <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </motion.button>
                </motion.div>
            </form>

            <motion.p variants={itemVariants} className="text-center text-[11px] text-[#4A5568] mt-6 font-body">
                Internal access only · Contact admin for credentials
            </motion.p>
        </motion.div>
    );
}
