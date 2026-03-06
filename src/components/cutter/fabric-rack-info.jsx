"use client";

import { useState, useEffect } from "react";
import { Layers, AlertTriangle, ShieldX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FabricRackInfo({ userId }) {
  // Mock Data aligned with new specs
  const [racks, setRacks] = useState([]);

  useEffect(() => {
    // In actual implementation, this will be fetched from Firebase
    setRacks([
      { rackNo: 'R-12-A', fabric: 'Cotton Blue', length: 15, max: 20, status: 'AVAILABLE' },
      { rackNo: 'R-08-B', fabric: 'Silk Red', length: 4, max: 20, status: 'LOW STOCK' },
      { rackNo: 'R-15-C', fabric: 'Linen White', length: 18, max: 20, status: 'AVAILABLE' },
      { rackNo: 'R-05-A', fabric: 'Chiffon Maroon', length: 0, max: 10, status: 'OUT OF STOCK' },
    ]);
  }, []);

  const cardV = {
    hidden: { opacity: 0, x: 16 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
  };

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)',
      padding: '24px'
    }}>
      {/* Header section identical to prompt */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--adm-amber-bg)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--adm-amber-c)' }} />
          </div>
          <h2 className="adm-font-display text-[1.15rem] font-black tracking-[-0.01em]"
            style={{ color: 'var(--adm-text)' }}>Fabric Rack Info</h2>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px', borderRadius: 999, border: '1px solid var(--adm-amber-br)'
        }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--adm-amber-c)' }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--adm-amber-c)' }} />
          </span>
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--adm-amber-c)' }}>Live</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {racks.map((rack, i) => {
            const pct = (rack.length / rack.max) * 100;

            let st = {
              bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)',
              br: 'rgba(5,150,105,0.25)', fill: 'var(--adm-emerald)',
              icon: <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: 'var(--adm-emerald)' }} />
            };

            if (rack.status === 'LOW STOCK') {
              st = {
                bg: 'rgba(217,119,6,0.12)', text: 'var(--adm-amber-c)',
                br: 'rgba(217,119,6,0.25)', fill: 'var(--adm-amber-c)',
                icon: <AlertTriangle className="w-2.5 h-2.5 mr-1" style={{ color: 'var(--adm-amber-c)' }} />
              };
            } else if (rack.status === 'OUT OF STOCK') {
              st = {
                bg: 'rgba(220,38,38,0.10)', text: 'var(--adm-red)',
                br: 'rgba(220,38,38,0.20)', fill: 'var(--adm-red)',
                icon: <ShieldX className="w-2.5 h-2.5 mr-1" style={{ color: 'var(--adm-red)' }} />
              };
            }

            return (
              <motion.div key={rack.rackNo} custom={i} variants={cardV} initial="hidden" animate="visible"
                className="group relative transition-all duration-300"
                style={{
                  background: 'var(--adm-card-alt)', borderRadius: 10,
                  border: '1px solid var(--adm-border)', padding: '14px 16px', overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = st.br;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--adm-border)';
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span style={{
                      display: 'inline-block', fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                      background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                      borderRadius: 999, padding: '2px 8px', color: 'var(--adm-text)', letterSpacing: '0.07em',
                      marginBottom: 6
                    }}>
                      {rack.rackNo}
                    </span>
                    <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>{rack.fabric}</p>
                  </div>

                  <div className="text-right">
                    <p className="adm-font-display text-[1.1rem] font-bold tracking-tight mb-2" style={{ color: 'var(--adm-text)', lineHeight: 1 }}>
                      {rack.length} <span className="text-[11px] font-medium ml-px" style={{ color: 'var(--adm-text-xs)' }}>m</span>
                    </p>
                    <span className="inline-flex items-center" style={{
                      fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                      background: st.bg, color: st.text, border: `1px solid ${st.br}`,
                      padding: '2.5px 7px', borderRadius: 999
                    }}>
                      <span className={rack.status === 'LOW STOCK' ? 'animate-pulse' : ''}>{st.icon}</span>
                      {rack.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar mapped to stock status */}
                <div style={{ width: '100%', height: 4, borderRadius: 999, background: 'var(--adm-border)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                    style={{ height: '100%', borderRadius: 999, background: st.fill }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
