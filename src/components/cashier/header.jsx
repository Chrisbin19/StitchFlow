'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Scissors, LogOut, Settings2, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import CashierNotificationBell from './CashierNotificationBell';
import PaymentCollectionDialog from './PaymentCollectionDialog';

/* ─── CSS custom properties + global transition ─── */
const CashierThemeVars = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
    .font-display { font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .font-body    { font-family: 'DM Sans', sans-serif !important; }

    /* ── Light mode tokens (default) ── */
    :root {
      --cf-bg:         #F7F4EF;
      --cf-card:       #FFFFFF;
      --cf-card-alt:   #FAFAFA;
      --cf-nav:        rgba(255,255,255,0.88);
      --cf-nav-border: rgba(0,0,0,0.06);
      --cf-text:       #111827;
      --cf-text-md:    #374151;
      --cf-text-sm:    #6B7280;
      --cf-text-xs:    #9CA3AF;
      --cf-border:     #E5E7EB;
      --cf-divider:    #F3F4F6;
      --cf-thead:      #F9FAFB;
      --cf-badge:      #F9FAFB;
      --cf-shadow:     0 2px 12px rgba(0,0,0,0.06);
      --cf-shadow-d:   0 4px 24px rgba(0,0,0,0.10);
      /* accents */
      --cf-emerald:    #059669;
      --cf-red:        #DC2626;
      --cf-amber-c:    #D97706;
      --cf-amber-bg:   #FEF3C7;
      --cf-amber-br:   #FDE68A;
      --cf-violet-c:   #7C3AED;
      --cf-violet-bg:  #EDE9FE;
      --cf-violet-br:  #DDD6FE;
      --cf-blue-c:     #2563EB;
      --cf-blue-bg:    #EFF6FF;
      --cf-blue-br:    #BFDBFE;
      --cf-arc-track:  #E5E7EB;
      --cf-pag-bg:     #FFFFFF;
      --cf-pag-hover:  #F3F4F6;
      --cf-toggle-bg:  #E5E7EB;
      --cf-thumb:      #FFFFFF;
    }

    /* ── Dark mode tokens ── */
    html[data-theme="dark"] {
      --cf-bg:         #141210;
      --cf-card:       #1E1B18;
      --cf-card-alt:   #191611;
      --cf-nav:        rgba(20,18,16,0.92);
      --cf-nav-border: rgba(255,255,255,0.05);
      --cf-text:       #F0EBE3;
      --cf-text-md:    #D4CFC8;
      --cf-text-sm:    #A09890;
      --cf-text-xs:    #6B6560;
      --cf-border:     rgba(255,255,255,0.07);
      --cf-divider:    rgba(255,255,255,0.05);
      --cf-thead:      #171411;
      --cf-badge:      #252219;
      --cf-shadow:     0 2px 16px rgba(0,0,0,0.35);
      --cf-shadow-d:   0 4px 28px rgba(0,0,0,0.45);
      /* accents */
      --cf-emerald:    #10B981;
      --cf-red:        #F87171;
      --cf-amber-c:    #FCD34D;
      --cf-amber-bg:   #2D2208;
      --cf-amber-br:   rgba(252,211,77,0.20);
      --cf-violet-c:   #C4B5FD;
      --cf-violet-bg:  #1E1730;
      --cf-violet-br:  rgba(196,181,253,0.20);
      --cf-blue-c:     #93C5FD;
      --cf-blue-bg:    #0F1F35;
      --cf-blue-br:    rgba(147,197,253,0.20);
      --cf-arc-track:  #2A2520;
      --cf-pag-bg:     #252219;
      --cf-pag-hover:  #2E2A24;
      --cf-toggle-bg:  #2A2520;
      --cf-thumb:      #F0EBE3;
    }

    /* ── Smooth theme transitions on the cashier page ── */
    .cf-page, .cf-page * {
      transition:
        background-color 350ms ease,
        color 250ms ease,
        border-color 250ms ease,
        box-shadow 300ms ease;
    }
    /* But don't slow down framer-motion or SVG animations */
    .cf-page [data-framer-motion], .cf-page svg * {
      transition: none !important;
    }
  `}</style>
);

/* ─── Pill theme toggle ─── */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 52, height: 28,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        padding: '0 3px',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--cf-toggle-bg)',
        flexShrink: 0,
        position: 'relative',
        outline: 'none',
      }}
    >
      <span style={{
        width: 22, height: 22,
        borderRadius: 999,
        background: 'var(--cf-thumb)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isDark ? 'translateX(24px)' : 'translateX(0)',
        transition: 'transform 300ms ease, background 300ms ease',
      }}>
        {isDark
          ? <Moon style={{ width: 11, height: 11, color: 'var(--cf-text-xs)' }} />
          : <Sun style={{ width: 11, height: 11, color: 'var(--cf-text-sm)' }} />
        }
      </span>
    </button>
  );
}

export default function CashierHeader() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const { userData } = useAuth() || {};
  const name = userData?.name || 'Cashier';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  /* Restore saved theme on mount */
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

  const collectionProgress = 0; // wire to real data when available

  return (
    <>
      <CashierThemeVars />

      <header className="sticky top-0 z-40 w-full font-body"
        style={{
          background: 'var(--cf-nav)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--cf-nav-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* LEFT — brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#1C1917 60%,#292524)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
              }}
            >
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display text-[15px] font-black tracking-[-0.01em] leading-none"
                style={{ color: 'var(--cf-text)' }}>
                StitchFlow
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <p className="text-[11px] font-medium" style={{ color: 'var(--cf-text-sm)' }}>
                  Cashier Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — before the bell */}
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

            {/* Notification bell */}
            <CashierNotificationBell onCollect={(order) => setSelectedOrder(order)} />

            {/* Settings */}
            <Link href="/cashier/profile">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
                style={{ color: 'var(--cf-text-sm)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cf-divider)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </Link>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none"
              style={{ background: 'linear-gradient(135deg,#f97316,#ec4899)' }}
              title={name}
            >
              {initials}
            </div>

            {/* Logout */}
            <Link href="/">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                style={{ color: 'var(--cf-text-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--cf-text-sm)'; e.currentTarget.style.background = 'transparent'; }}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Collection progress bar */}
        <div className="relative h-0.5" style={{ background: 'var(--cf-arc-track)' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-r-full"
            style={{
              width: `${collectionProgress}%`,
              background: 'linear-gradient(90deg, var(--cf-emerald), #34d399)',
              boxShadow: '0 0 8px rgba(5,150,105,0.4)',
              transition: 'width 700ms ease',
            }}
          />
        </div>
      </header>

      <PaymentCollectionDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
