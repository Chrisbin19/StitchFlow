"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LandingContent from "@/components/auth/LandingContent";
import { LoginPanel, MobileLoginModal } from "@/components/auth/LoginPanel";
import { motion } from "framer-motion";
import { Scissors, Menu } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tailor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result || !result.success) {
        setError(result?.error || "Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      if (result.role !== role) {
        setError(`Access Denied: Your account is not registered as a "${role}".`);
        setLoading(false);
        return;
      }

      const userId = localStorage.getItem('stitch_user_id');
      if (!userId) {
        setError("User ID not found. Please contact support.");
        setLoading(false);
        return;
      }

      switch (result.role) {
        case "Admin": router.push("/admin"); break;
        case "Tailor": router.push(`/tailor/${userId}`); break;
        case "Cutter": router.push(`/cutter/${userId}`); break;
        case "Manager": router.push("/admin"); break;
        case "Cashier": router.push("/cashier"); break;
        default: router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Incorrect email or password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  const formProps = { email, setEmail, password, setPassword, role, setRole, error, onSubmit: handleLogin, loading };

  return (
    <main className="relative min-h-screen bg-slate-950">
      {/* ── Mobile header bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3.5 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Scissors className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">StitchFlow</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-colors"
        >
          Sign In
        </motion.button>
      </header>

      {/* ── Full-width landing content ── */}
      <div className="pt-14 lg:pt-0">
        <LandingContent />
      </div>

      {/* ── Right: Fixed glassmorphism login panel (35%) ── */}
      <LoginPanel {...formProps} />

      {/* ── Mobile: Bottom sheet login modal ── */}
      <MobileLoginModal
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        {...formProps}
      />
    </main>
  );
}
