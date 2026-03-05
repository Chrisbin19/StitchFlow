"use client";

import { motion } from "framer-motion";
import RoleSelect from "./RoleSelect";
import { LockUnlockIcon } from "@/components/ui/animated-state-icons";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const formVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LoginForm({
  email, setEmail,
  password, setPassword,
  role, setRole,
  error, onSubmit,
  loading,
}) {
  return (
    <motion.div
      className="w-full max-w-md lg:max-w-lg mx-auto p-6 lg:p-10"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8 lg:mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
            <LockUnlockIcon size={32} color="#4f46e5" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-500 mt-1 text-sm">Sign in to your workspace</p>
      </motion.div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Role Selector */}
        <motion.div variants={itemVariants}>
          <RoleSelect value={role} onChange={setRole} />
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm bg-gray-50/50 hover:bg-white"
              placeholder="name@stitchflow.com"
              required
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm bg-gray-50/50 hover:bg-white"
              placeholder="••••••••"
              required
            />
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Footer */}
      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-gray-400 mt-8"
      >
        Internal access only • Contact admin for credentials
      </motion.p>
    </motion.div>
  );
}