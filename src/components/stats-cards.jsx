'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';

const CARDS = [
  { key: 'totalThisMonth', title: 'Total Orders', subtitle: 'Placed this month', icon: TrendingUp, accent: 'var(--adm-blue-c)', accentBg: 'var(--adm-blue-bg)', accentBr: 'var(--adm-blue-br)' },
  { key: 'pendingCount', title: 'Pending Approval', subtitle: 'Needs admin action', icon: AlertCircle, accent: 'var(--adm-orange-c)', accentBg: 'var(--adm-orange-bg)', accentBr: 'var(--adm-orange-br)' },
  { key: 'readyCount', title: 'Ready for Pickup', subtitle: 'Production done', icon: CheckCircle2, accent: 'var(--adm-emerald)', accentBg: 'rgba(5,150,105,0.10)', accentBr: 'rgba(5,150,105,0.20)' },
  { key: 'paymentDue', title: 'Pending Payment', subtitle: '', icon: IndianRupee, accent: 'var(--adm-blue-c)', accentBg: 'var(--adm-blue-bg)', accentBr: 'var(--adm-blue-br)' },
];

const cardV = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 + 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function StatsCards() {
  const [stats, setStats] = useState({ totalThisMonth: 0, pendingCount: 0, readyCount: 0, paymentDueAmount: 0, paymentDueCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"));
    return onSnapshot(q, (snap) => {
      const now = new Date();
      const cm = now.getMonth(), cy = now.getFullYear();
      const s = snap.docs.reduce((acc, doc) => {
        const d = doc.data();
        const created = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
        if (created.getMonth() === cm && created.getFullYear() === cy) acc.totalThisMonth++;
        if (['Pending', 'Pending_Approval'].includes(d.status)) acc.pendingCount++;
        if (d.status === 'Ready_To_Deliver') acc.readyCount++;
        if (d.status === 'PAYMENT_PENDING') { acc.paymentDueCount++; acc.paymentDueAmount += Number(d.financial?.totalPrice || 0); }
        return acc;
      }, { totalThisMonth: 0, pendingCount: 0, readyCount: 0, paymentDueAmount: 0, paymentDueCount: 0 });
      setStats(s);
      setLoading(false);
    });
  }, []);

  const values = {
    totalThisMonth: loading ? '—' : stats.totalThisMonth,
    pendingCount: loading ? '—' : stats.pendingCount,
    readyCount: loading ? '—' : stats.readyCount,
    paymentDue: loading ? '—' : fmt(stats.paymentDueAmount),
  };
  const subtitles = {
    totalThisMonth: 'Placed this month',
    pendingCount: 'Needs admin action',
    readyCount: 'Production done',
    paymentDue: `${stats.paymentDueCount} invoice${stats.paymentDueCount !== 1 ? 's' : ''} unpaid`,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.key} custom={i} variants={cardV} initial="hidden" animate="visible"
            className="relative overflow-hidden"
            style={{
              borderRadius: 14, border: '1px solid var(--adm-border)',
              background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', cursor: 'default'
            }}
            whileHover={{ scale: 1.02, boxShadow: 'var(--adm-shadow-d)', transition: { duration: 0.2 } }}
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: card.accent, borderRadius: '14px 0 0 14px' }} />

            <div className="pl-6 pr-5 pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: card.accent }}>{card.title}</p>
                  <p className="text-3xl font-black tracking-tight mt-1.5 leading-none adm-font-display"
                    style={{ color: 'var(--adm-text)' }}>{values[card.key]}</p>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--adm-text-xs)' }}>
                    {subtitles[card.key]}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.accentBg, border: `1px solid ${card.accentBr}` }}>
                  <Icon className="w-5 h-5" style={{ color: card.accent }} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}