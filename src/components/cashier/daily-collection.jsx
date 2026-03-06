'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from 'framer-motion';

/* SVG arc ring — uses currentColor for fill, explicit track color via CSS var */
function ArcRing({ percentage, size = 72, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--cf-arc-track)" strokeWidth={stroke} />
      {/* Fill */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--cf-emerald)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </svg>
  );
}

const MODE_COLORS = {
  Cash: { c: 'var(--cf-amber-c)', track: 'var(--cf-amber-bg)' },
  UPI: { c: 'var(--cf-violet-c)', track: 'var(--cf-violet-bg)' },
  Card: { c: 'var(--cf-blue-c)', track: 'var(--cf-blue-bg)' },
};

export default function DailyCollection() {
  const [collections, setCollections] = useState([
    { label: 'Cash', amount: 0, percentage: 0 },
    { label: 'UPI', amount: 0, percentage: 0 },
    { label: 'Card', amount: 0, percentage: 0 },
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "ADVANCE_PAID"));
    return onSnapshot(q, (snap) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const mt = { Cash: 0, UPI: 0, Card: 0 };
      snap.docs.forEach(d => {
        (d.data().financial?.payments || []).forEach(p => {
          const pd = p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
          if (pd >= today) {
            const m = p.mode || 'Cash';
            if (mt[m] !== undefined) mt[m] += p.amount || 0;
          }
        });
      });
      const grand = Object.values(mt).reduce((s, v) => s + v, 0);
      setTotal(grand);
      setCollections([
        { label: 'Cash', amount: mt.Cash, percentage: grand > 0 ? Math.round((mt.Cash / grand) * 100) : 0 },
        { label: 'UPI', amount: mt.UPI, percentage: grand > 0 ? Math.round((mt.UPI / grand) * 100) : 0 },
        { label: 'Card', amount: mt.Card, percentage: grand > 0 ? Math.round((mt.Card / grand) * 100) : 0 },
      ]);
    });
  }, []);

  const dominant = collections.reduce((a, b) => a.percentage >= b.percentage ? a : b);

  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid var(--cf-border)',
      background: 'var(--cf-card)',
      boxShadow: 'var(--cf-shadow)',
      overflow: 'hidden',
    }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--cf-border)' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--cf-text-xs)' }}>Daily Collection</p>
        <p className="text-base font-black mt-0.5" style={{ color: 'var(--cf-text)' }}>
          Mode Distribution
        </p>
      </div>

      <div className="p-5">
        {/* Arc ring + total */}
        <div className="flex items-center gap-5 mb-5">
          <div className="relative flex-shrink-0">
            <ArcRing percentage={dominant.percentage || 0} />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-base font-black leading-none"
                style={{ color: 'var(--cf-text)' }}>{dominant.percentage}%</span>
              <span className="text-[8px] uppercase tracking-wide leading-none mt-0.5"
                style={{ color: 'var(--cf-text-xs)' }}>{dominant.label}</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight"
              style={{ color: 'var(--cf-text)' }}>₹{total.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--cf-text-xs)' }}>
              Total collected today
            </p>
          </div>
        </div>

        {/* Mode breakdown */}
        <div className="space-y-3">
          {collections.map((c, i) => {
            const mc = MODE_COLORS[c.label];
            return (
              <div key={c.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: mc.c }}>{c.label}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--cf-text-md)' }}>
                    ₹{c.amount.toLocaleString()} · {c.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--cf-arc-track)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ backgroundColor: mc.c }}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.12 + 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
