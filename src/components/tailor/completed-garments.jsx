"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Package, RefreshCcw, CheckCircle2, Loader2, PlayCircle } from "lucide-react";

export default function CompletedGarments({ userId }) {
  const [completedList, setCompletedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "orders"),
      where("status", "==", "STITCHING_COMPLETED")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const data = snapshot.docs.map((doc) => {
        const item = doc.data();
        const updateTime = item.updatedAt?.toDate() || new Date();
        return {
          id: doc.id,
          orderId: item.orderId || doc.id.slice(-6).toUpperCase(),
          customer: item.customer?.name || "Unknown",
          garment: item.product?.dressType || "Garment",
          style: item.product?.style || "STANDARD",
          completedTime: updateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
          rawTime: updateTime,
        };
      }).filter((i) => i.rawTime >= startOfToday).sort((a, b) => b.rawTime - a.rawTime);
      setCompletedList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleRequestAlteration = async (orderId) => {
    const reason = window.prompt("Enter alteration details:");
    if (!reason?.trim()) return;
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "NEEDS_ALTERATION",
        "workflow.needsAlteration": true,
        "workflow.alterationNote": reason,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({ stage: "Alteration Requested", timestamp: new Date(), note: `Sent back: ${reason}` }),
      });
    } catch (e) { console.error(e); } finally { setUpdating(null); }
  };

  const handleNoAlteration = async (orderId) => {
    if (!window.confirm("Confirm ready for delivery?")) return;
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "READY_FOR_DELIVERY",
        "workflow.progress": 100,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({ stage: "Final Quality Check Passed", timestamp: new Date(), note: "Approved with no alterations." }),
      });
    } catch (e) { console.error(e); } finally { setUpdating(null); }
  };

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
      <div className="px-6 py-4 flex flex-wrap items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <div>
          <h2 className="adm-font-display text-base font-black uppercase tracking-wide leading-none mb-1"
            style={{ color: 'var(--adm-text)', letterSpacing: '0.08em' }}>
            Post-Stitching Review
          </h2>
          <p className="text-[10px] font-medium" style={{ color: 'var(--adm-text-xs)' }}>
            Decide if these garments need adjustments or are ready for customers
          </p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
          color: 'var(--adm-amber-c)', background: 'transparent',
          border: '1px solid var(--adm-amber-br)', textTransform: 'uppercase'
        }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--adm-amber-c)' }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--adm-amber-c)' }} />
          </span>
          {completedList.length} PENDING REVIEW
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--adm-thead)' }}>
            <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
              {['Order ID', 'Customer', 'Garment', 'Finished At', 'Decision'].map((h, i) => (
                <th key={h} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${i === 4 ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--adm-text-xs)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading…
                </td>
              </tr>
            ) : completedList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--adm-text-xs)' }}>
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No garments waiting for review.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {completedList.map((item, i) => (
                  <motion.tr key={item.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--adm-divider)', background: 'var(--adm-card)', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--adm-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--adm-card)'}
                  >
                    <td className="px-6 py-4 transition-colors">
                      <span style={{
                        fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                        background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                        borderRadius: 6, padding: '2px 7px', color: 'var(--adm-blue-c)', letterSpacing: '0.07em'
                      }}>
                        #{item.id.slice(0, 6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>
                      {item.customer}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>{item.garment}</p>
                      <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 mt-0.5 rounded-sm inline-block"
                        style={{ background: 'var(--adm-badge)', color: 'var(--adm-text-xs)' }}>
                        {item.style}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="adm-font-display text-xl font-black" style={{ color: 'var(--adm-emerald)' }}>
                        {item.completedTime}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleRequestAlteration(item.id)} disabled={updating === item.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all"
                          style={{ background: 'transparent', color: 'var(--adm-orange-c)', border: '1.5px solid var(--adm-orange-c)', cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-orange-c)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--adm-orange-c)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <RefreshCcw className="w-3.5 h-3.5" /> ALTER
                        </button>
                        <button onClick={() => handleNoAlteration(item.id)} disabled={updating === item.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
                          style={{ background: 'var(--adm-emerald)', color: 'white', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {updating === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> PERFECT</>}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
