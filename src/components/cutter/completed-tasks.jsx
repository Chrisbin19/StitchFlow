"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Package, Scissors, Star } from "lucide-react";

export default function CompletedTasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    // Include CUTTING_COMPLETE and CUTTING_COMPLETED
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId),
      where("status", "in", ["Completed", "STITCHING_COMPLETED", "CUTTING_COMPLETE", "CUTTING_COMPLETED"]),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const item = doc.data();
        const updateTime = item.updatedAt?.toDate() || new Date();
        return {
          id: doc.id,
          orderId: item.orderId || doc.id.slice(0, 6).toUpperCase(),
          garment: item.product?.dressType || "Garment",
          material: item.product?.material || "Unknown",
          color: item.product?.fabricColor || "Color",
          quantity: item.product?.quantity || 1,
          completedTime: updateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
          rawTime: updateTime,
          quality: item.qualityControl?.status || "Perfect", // Using Perfect instead of Good for UI
        };
      }).filter((i) => i.rawTime >= startOfToday).sort((a, b) => b.rawTime - a.rawTime);
      setTasks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const rowV = {
    hidden: { opacity: 0, x: -12 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" } }),
  };

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--adm-emerald)' }} />
          </div>
          <div>
            <h2 className="adm-font-display text-[1.10rem] font-black tracking-wide leading-none mb-1"
              style={{ color: 'var(--adm-text)' }}>Completed Today</h2>
            <p className="text-[11px] font-medium" style={{ color: 'var(--adm-text-xs)' }}>
              Your successful deliveries for this shift
            </p>
          </div>
        </div>
        <CheckCircle2 className="w-8 h-8 opacity-20 hidden sm:block" style={{ color: 'var(--adm-emerald)' }} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--adm-thead)' }}>
            <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
              {['Order ID', 'Garment', 'Fabric', 'Qty', 'Time', 'Quality'].map((h, i) => (
                <th key={h} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${i === 5 ? 'text-right' : i === 3 ? 'text-center' : 'text-left'}`}
                  style={{ color: 'var(--adm-text-xs)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
                  <Loader2 className="w-5 h-5 animate-spin inline-block mx-auto mb-2 opacity-50 block" />
                  <span className="pl-2">Updating history…</span>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm">
                  <Scissors className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--adm-text-xs)' }} />
                  <p className="adm-font-display text-sm font-bold tracking-wide" style={{ color: 'var(--adm-text-sm)' }}>No completions yet today</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--adm-text-xs)' }}>Start cutting to see your progress here</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {tasks.map((item, i) => {
                  let qChip = { bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)', br: 'rgba(5,150,105,0.25)', label: 'PERFECT', icon: <Star className="w-2.5 h-2.5 mr-1" fill="var(--adm-emerald)" /> };
                  if (item.quality === 'Average') qChip = { bg: 'rgba(217,119,6,0.12)', text: 'var(--adm-amber-c)', br: 'rgba(217,119,6,0.25)', label: 'AVERAGE', icon: null };
                  else if (item.quality === 'Needs Review') qChip = { bg: 'rgba(220,38,38,0.10)', text: 'var(--adm-red)', br: 'rgba(220,38,38,0.20)', label: 'REVIEW', icon: null };

                  return (
                    <motion.tr key={item.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                      style={{ borderBottom: '1px solid var(--adm-divider)', background: 'var(--adm-card)', cursor: 'default' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.04)';
                        e.currentTarget.children[0].style.borderLeft = '3px solid var(--adm-emerald)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--adm-card)';
                        e.currentTarget.children[0].style.borderLeft = '3px solid transparent';
                      }}
                    >
                      <td className="px-6 py-4 transition-colors" style={{ borderLeft: '3px solid transparent' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                          background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                          borderRadius: 6, padding: '2px 7px', color: 'var(--adm-violet-c)', letterSpacing: '0.07em'
                        }}>
                          #{item.orderId}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>
                        {item.garment}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium" style={{ color: 'var(--adm-text-md)' }}>{item.material}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color.toLowerCase() !== 'unknown' ? item.color : 'var(--adm-border)' }} />
                          <span className="text-[10px]" style={{ color: 'var(--adm-text-xs)' }}>{item.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="adm-font-display text-sm font-bold" style={{ color: 'var(--adm-text)' }}>
                          {item.quantity} <span className="text-[10px] font-medium" style={{ color: 'var(--adm-text-xs)' }}>pcs</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="adm-font-display text-[15px] font-black tracking-wider" style={{ color: 'var(--adm-blue-c)' }}
                          title="Time taken to complete">
                          {item.completedTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 800, padding: '4px 10px',
                          borderRadius: 999, letterSpacing: '0.06em',
                          background: qChip.bg, color: qChip.text, border: `1px solid ${qChip.br}`
                        }}>
                          {qChip.icon}
                          {qChip.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
