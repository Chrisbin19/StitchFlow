"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/admin/NotificationBell";

export function AdminHeader() {
  const { userData } = useAuth();
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cabinet+Grotesk:wght@700;800;900&display=swap');
        
        .adm-font-display { font-family: 'Cabinet Grotesk', sans-serif !important; }
        .adm-font-body    { font-family: 'DM Sans', sans-serif !important; }

        :root {
          --adm-bg:          #F7F4EF;
          --adm-card:        #FFFFFF;
          --adm-card-hover:  #FAFAFA;
          --adm-card-alt:    #FAFAF9;
          --adm-nav:         rgba(255,255,255,0.90);
          --adm-nav-border:  #E5E7EB;
          --adm-text:        #111827;
          --adm-text-md:     #374151;
          --adm-text-sm:     #6B7280;
          --adm-text-xs:     #9CA3AF;
          --adm-border:      #E5E7EB;
          --adm-divider:     #F3F4F6;
          --adm-thead:       #F9FAFB;
          --adm-badge:       #F3F4F6;
          --adm-input-bg:    #F9FAFB;
          --adm-table-alt:   #FAFAF9;
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
        
        html[data-theme="dark"] {
          --adm-bg:          #141210;
          --adm-card:        #1E1B18;
          --adm-card-hover:  #24211D;
          --adm-card-alt:    #191611;
          --adm-nav:         rgba(20,18,16,0.92);
          --adm-nav-border:  rgba(255,255,255,0.07);
          --adm-text:        #F0EBE3;
          --adm-text-md:     #D4CFC8;
          --adm-text-sm:     #A09890;
          --adm-text-xs:     #6B6560;
          --adm-border:      rgba(255,255,255,0.07);
          --adm-divider:     rgba(255,255,255,0.05);
          --adm-thead:       #171411;
          --adm-badge:       #252219;
          --adm-input-bg:    #1C1917;
          --adm-table-alt:   #191611;
          --adm-shadow:      0 2px 16px rgba(0,0,0,0.35);
          --adm-shadow-d:    0 4px 28px rgba(0,0,0,0.45);
          
          --adm-emerald:     #10B981;
          --adm-red:         #F87171;
          --adm-amber-c:     #FBBF24;
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
          
          --background:        220 13% 8%;
        }
        
        html[data-theme="dark"] body,
        html[data-theme="dark"] .adm-page {
          background-color: #141210 !important;
        }

        .adm-page, .adm-page * {
          transition: background-color 350ms ease, border-color 250ms ease, box-shadow 300ms ease;
        }
        .adm-page [data-framer-motion], .adm-page svg * { transition: none !important; }
      `}</style>

      <header className="sticky top-0 z-40 w-full adm-font-body"
        style={{
          background: 'var(--adm-nav)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--adm-nav-border)'
        }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* LEFT: Branding */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/admin" className="cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#1C1917 60%,#292524)',
                  border: '1.5px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.22)'
                }}>
                <span className="adm-font-display font-black text-white text-[15px] tracking-wide mt-0.5">SK</span>
              </div>
            </Link>
            <div className="hidden sm:block">
              <Link href="/admin"><p className="adm-font-display text-[16px] font-black tracking-[-0.01em] leading-none"
                style={{ color: 'var(--adm-text)' }}>StitchFlow</p></Link>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <p className="text-[11px] font-medium" style={{ color: 'var(--adm-text-sm)' }}>
                  Admin — Team Management
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme"
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

            <NotificationBell />

            <Link href={`/admin/profile`}>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: 'var(--adm-text-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid var(--adm-border)'; e.currentTarget.style.color = 'var(--adm-text)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.color = 'var(--adm-text-sm)'; }}
                title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group"
                style={{ background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: 'var(--adm-text-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid var(--adm-red)'; e.currentTarget.style.color = 'var(--adm-red)'; e.currentTarget.style.background = 'rgba(220,38,38,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.color = 'var(--adm-text-sm)'; e.currentTarget.style.background = 'transparent'; }}
                onClick={() => localStorage.clear()}
                title="Sign Out">
                <LogOut className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
