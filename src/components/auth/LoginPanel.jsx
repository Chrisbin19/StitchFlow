"use client";

import { motion, AnimatePresence } from "framer-motion";
import RoleSelect from "./RoleSelect";
import { LockUnlockIcon } from "@/components/ui/animated-state-icons";
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
            initial={{ opacity: 0, x: 48, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="hidden lg:flex absolute top-[50vh] right-8 xl:right-12 -translate-y-1/2 z-40"
        >
            {/* Card shell */}
            <div className="w-[380px] xl:w-[400px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
                {/* Subtle top accent stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

                <div className="p-8">
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
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl px-6 py-8 max-h-[92vh] overflow-y-auto"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    >
                        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center"
                        >
                            <X className="w-4 h-4 text-gray-500" />
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
            <motion.div variants={itemVariants} className="text-center mb-6">
                <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                        <LockUnlockIcon size={26} color="#4f46e5" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Sign in to your workspace</p>
            </motion.div>

            <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.div variants={itemVariants}>
                    <RoleSelect value={role} onChange={setRole} />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white bg-gray-50/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none text-sm"
                            placeholder="name@stitchflow.com"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white bg-gray-50/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-1">
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 dark:shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                        ) : (
                            <>Sign In <ArrowRight className="w-4 h-4" /></>
                        )}
                    </motion.button>
                </motion.div>
            </form>

            <motion.p variants={itemVariants} className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
                Internal access only · Contact admin for credentials
            </motion.p>
        </motion.div>
    );
}
