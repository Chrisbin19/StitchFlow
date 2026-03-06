'use client';

import { useEffect, useState } from 'react';
import { Scissors, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import NotificationBell from '@/components/admin/NotificationBell';

/* ─── Shared CSS token system — mirrors cashier exactly ─── */
const AdminThemeVars = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
    .adm-font-display { font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .adm-font-body    { font-family: 'DM Sans', sans-serif !important; }

    /* ── Light tokens ── */
    :root {
      --adm-bg:          #F7F4EF;
      --adm-card:        #FFFFFF;
      --adm-card-alt:    #FAFAFA;
      --adm-nav:         rgba(255,255,255,0.88);
      --adm-nav-border:  rgba(0,0,0,0.06);
      --adm-text:        #111827;
      --adm-text-md:     #374151;
      --adm-text-sm:     #6B7280;
      --adm-text-xs:     #9CA3AF;
      --adm-border:      #E5E7EB;
      --adm-divider:     #F3F4F6;
      --adm-thead:       #F9FAFB;
      --adm-badge:       #F9FAFB;
      --adm-shadow:      0 2px 12px rgba(0,0,0,0.06);
      --adm-shadow-d:    0 4px 24px rgba(0,0,0,0.10);
      --adm-emerald:     #059669;
      --adm-red:         #DC2626;
      --adm-amber-c:     #D97706;
      --adm-amber-bg:    #FEF3C7;
      --adm-amber-br:    #FDE68A;
      --adm-violet-c:    #7C3AED;
      --adm-violet-bg:   #EDE9FE;
      --adm-violet-br:   #DDD6FE;
      --adm-blue-c:      #2563EB;
      --adm-blue-bg:     #EFF6FF;
      --adm-blue-br:     #BFDBFE;
      --adm-orange-c:    #F97316;
      --adm-orange-bg:   #FFF7ED;
      --adm-orange-br:   #FED7AA;
      --adm-toggle-bg:   #E5E7EB;
      --adm-thumb:       #FFFFFF;
    }
    /* ── Dark tokens ── */
    html[data-theme="dark"] {
      --adm-bg:          #141210;
      --adm-card:        #1E1B18;
      --adm-card-alt:    #191611;
      --adm-nav:         rgba(20,18,16,0.92);
      --adm-nav-border:  rgba(255,255,255,0.05);
      --adm-text:        #F0EBE3;
      --adm-text-md:     #D4CFC8;
      --adm-text-sm:     #A09890;
      --adm-text-xs:     #6B6560;
      --adm-border:      rgba(255,255,255,0.07);
      --adm-divider:     rgba(255,255,255,0.05);
      --adm-thead:       #171411;
      --adm-badge:       #252219;
      --adm-shadow:      0 2px 16px rgba(0,0,0,0.35);
      --adm-shadow-d:    0 4px 28px rgba(0,0,0,0.45);
      --adm-emerald:     #10B981;
      --adm-red:         #F87171;
      --adm-amber-c:     #FCD34D;
      --adm-amber-bg:    #2D2208;
      --adm-amber-br:    rgba(252,211,77,0.20);
      --adm-violet-c:    #C4B5FD;
      --adm-violet-bg:   #1E1730;
      --adm-violet-br:   rgba(196,181,253,0.20);
      --adm-blue-c:      #93C5FD;
      --adm-blue-bg:     #0F1F35;
      --adm-blue-br:     rgba(147,197,253,0.20);
      --adm-orange-c:    #FB923C;
      --adm-orange-bg:   #2D1500;
      --adm-orange-br:   rgba(251,146,60,0.20);
      --adm-toggle-bg:   #2A2520;
      --adm-thumb:       #F0EBE3;
    }
    /* Override shadcn's cold-grey dark defaults with our warm tokens */
    html[data-theme="dark"] {
      --background:        220 13% 8%;   /* overridden below via bg-page */
      --card:              30 10% 12%;
      --muted:             30 8% 15%;
      --border:            30 6% 18%;
      --foreground:        35 20% 90%;
      --muted-foreground:  30 8% 55%;
    }
    html[data-theme="dark"] body,
    html[data-theme="dark"] .adm-page {
      background-color: #141210 !important;
    }
    .adm-page, .adm-page * {
      transition: background-color 350ms ease, color 250ms ease,
                  border-color 250ms ease, box-shadow 300ms ease;
    }
    .adm-page [data-framer-motion], .adm-page svg * { transition: none !important; }
  `}</style>
);

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Toggle theme"
      style={{
        width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
        padding: '0 3px', display: 'flex', alignItems: 'center',
        background: 'var(--adm-toggle-bg)', flexShrink: 0, outline: 'none'
      }}>
      <span style={{
        width: 22, height: 22, borderRadius: 999, background: 'var(--adm-thumb)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        transform: isDark ? 'translateX(24px)' : 'translateX(0)',
        transition: 'transform 300ms ease, background 300ms ease',
      }}>
        {isDark
          ? <Moon style={{ width: 11, height: 11, color: 'var(--adm-text-xs)' }} />
          : <Sun style={{ width: 11, height: 11, color: 'var(--adm-text-sm)' }} />}
      </span>
    </button>
  );
}

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stitchflow-theme');
    const dark = saved === 'dark';
    setIsDark(dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.dataset.theme = next ? 'dark' : 'light';
      localStorage.setItem('stitchflow-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <>
      <AdminThemeVars />
      <header className="sticky top-0 z-40 w-full adm-font-body"
        style={{
          background: 'var(--adm-nav)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--adm-nav-border)'
        }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#1C1917 60%,#292524)',
                border: '1.5px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.22)'
              }}>
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="adm-font-display text-[15px] font-black tracking-[-0.01em] leading-none"
                style={{ color: 'var(--adm-text)' }}>StitchFlow</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <p className="text-[11px] font-medium" style={{ color: 'var(--adm-text-sm)' }}>
                  Tailoring Management OS
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <NotificationBell />
            <Link href="/">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                style={{ color: 'var(--adm-text-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--adm-text-sm)'; e.currentTarget.style.background = 'transparent'; }}
                title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-0.5" style={{ background: 'var(--adm-divider)' }}>
          <div className="absolute left-0 top-0 h-full rounded-r-full"
            style={{
              width: '28%', background: 'linear-gradient(90deg,var(--adm-emerald),#34d399)',
              boxShadow: '0 0 8px rgba(5,150,105,0.4)', transition: 'width 700ms ease'
            }} />
        </div>
      </header>
    </>
  );
}