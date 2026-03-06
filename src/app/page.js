"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LandingContent from "@/components/auth/LandingContent";
import { MobileLoginModal } from "@/components/auth/LoginPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      // Important: Ensure role validation logic exists based on your schema.
      // E.g if (result.role !== role) ...

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
    <main className="relative min-h-screen selection:bg-violet-500/30 selection:text-white"
      style={{
        background: '#080B14', // --bg-page
        color: '#F0EBE3' // --text-primary
      }}>

      {/* ── Desktop Navbar ── */}
      <header className={`hidden lg:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[rgba(8,11,20,0.85)] border-b border-[rgba(255,255,255,0.08)] backdrop-blur-[16px] py-4" : "bg-transparent border-transparent py-6"
        }`}>
        <div className="w-full max-w-[1440px] mx-auto px-8 xl:px-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>StitchFlow</span>
            </div>

            <span className="text-[11px] font-bold text-[#8B95B0] border border-[rgba(255,255,255,0.14)] rounded-full px-3 py-1 uppercase tracking-widest mt-0.5">
              Boutique OS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-bold text-white/70 hover:text-white px-4 py-2 transition-colors">
              Sign In
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("login-card-container");
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Basic exact focus
                  const emailInput = el.querySelector('input[type="email"]');
                  if (emailInput) setTimeout(() => emailInput.focus(), 500);
                }
              }}
              className="text-sm font-bold text-white px-5 py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                boxShadow: '0 4px 14px rgba(124,58,237,0.3)'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile header bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 backdrop-blur-[16px]"
        style={{ background: 'rgba(8,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <Scissors className="w-5 h-5 text-white" />
          <span className="text-white font-black text-lg" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>StitchFlow</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen(true)}
          className="px-4 py-2 text-white text-xs font-bold rounded-full transition-colors"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
        >
          Sign In
        </motion.button>
      </header>

      {/* ── Content ── */}
      <div className="pt-16 lg:pt-0">
        <LandingContent formProps={formProps} />
      </div>

      {/* ── Mobile: Bottom sheet login modal ── */}
      <MobileLoginModal
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        {...formProps}
      />
    </main>
  );
}
