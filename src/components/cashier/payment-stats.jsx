'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from 'framer-motion';
import { IndianRupee, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

function Sparkline({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120, h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible"
      style={{ color: 'var(--cf-emerald)' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
    </svg>
  );
}

const sparkDummy = [12, 18, 9, 24, 15, 30, 22];

const cardV = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function PaymentStats() {
  const [pendingCount, setPendingCount] = useState(0);
  const [paidTodayCount, setPaidTodayCount] = useState(0);
  const [todayCollection, setTodayCollection] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    const pendingQ = query(collection(db, "orders"), where("status", "==", "PAYMENT_PENDING"));
    const unsubPending = onSnapshot(pendingQ, (snap) => {
      setPendingCount(snap.size);
      let total = 0;
      snap.docs.forEach(d => { total += d.data().financial?.advanceAmount || 0; });
      setTotalPending(total);
    });

    // LOGIC FIX: Changed "==" "ADVANCE_PAID" to "!=" "PAYMENT_PENDING"
    // This ensures we catch payments even if the order moved to STITCHING_COMPLETED etc.
    const paidQ = query(collection(db, "orders"), where("status", "!=", "PAYMENT_PENDING"));
    const unsubPaid = onSnapshot(paidQ, (snap) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      let count = 0, col = 0;
      snap.docs.forEach(d => {
        (d.data().financial?.payments || []).forEach(p => {
          const pd = p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
          if (pd >= today) { count++; col += p.amount || 0; }
        });
      });
      setPaidTodayCount(count); setTodayCollection(col);
    });

    return () => { unsubPending(); unsubPaid(); };
  }, []);

  const cardBase = {
    borderRadius: 16,
    border: '1px solid var(--cf-border)',
    background: 'var(--cf-card)',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'default',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Today Collection — col-span-2 */}
      <motion.div custom={0} variants={cardV} initial="hidden" animate="visible"
        className="md:col-span-2"
        style={{ ...cardBase, boxShadow: 'var(--cf-shadow)' }}
        whileHover={{ scale: 1.015, boxShadow: '0 8px 32px rgba(5,150,105,0.15)', transition: { duration: 0.2 } }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[16px]"
          style={{ background: 'var(--cf-emerald)' }} />
        <div className="pl-5 pr-6 pt-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
                style={{ color: 'var(--cf-emerald)' }}>Today&apos;s Collection</p>
              <p className="text-4xl font-black tracking-tight"
                style={{ color: 'var(--cf-text)' }}>
                ₹{todayCollection.toLocaleString()}
              </p>
              <p className="text-xs mt-1 flex items-center gap-1"
                style={{ color: 'var(--cf-text-xs)' }}>
                <TrendingUp className="w-3 h-3" style={{ color: 'var(--cf-emerald)' }} />
                7-day trend
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)' }}>
              <IndianRupee className="w-5 h-5" style={{ color: 'var(--cf-emerald)' }} />
            </div>
          </div>
          <Sparkline data={sparkDummy} />
        </div>
      </motion.div>

      {/* Pending Advances */}
      <motion.div custom={1} variants={cardV} initial="hidden" animate="visible"
        style={{ ...cardBase, boxShadow: 'var(--cf-shadow)' }}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(245,158,11,0.18)', transition: { duration: 0.2 } }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[16px] bg-amber-500" />
        <div className="pl-5 pr-5 pt-5 pb-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--cf-amber-c)' }}>Pending Advances</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--cf-amber-bg)', border: '1px solid var(--cf-amber-br)' }}>
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--cf-amber-c)' }} />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight"
            style={{ color: 'var(--cf-text)' }}>₹{totalPending.toLocaleString()}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--cf-text-xs)' }}>Awaiting first payment</p>
        </div>
      </motion.div>

      {/* Collected Today */}
      <motion.div custom={2} variants={cardV} initial="hidden" animate="visible"
        style={{ ...cardBase, boxShadow: 'var(--cf-shadow)' }}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(59,130,246,0.18)', transition: { duration: 0.2 } }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[16px] bg-blue-500" />
        <div className="pl-5 pr-5 pt-5 pb-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--cf-blue-c)' }}>Collected Today</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--cf-blue-bg)', border: '1px solid var(--cf-blue-br)' }}>
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--cf-blue-c)' }} />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight"
            style={{ color: 'var(--cf-text)' }}>{paidTodayCount}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--cf-text-xs)' }}>Payments received</p>
        </div>
      </motion.div>

    </div>
  );
}