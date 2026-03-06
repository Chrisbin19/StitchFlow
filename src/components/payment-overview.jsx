'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, IndianRupee } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const statusChip = (s) => {
  if (s === 'Paid') return { bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)', br: 'rgba(5,150,105,0.20)' };
  if (s === 'Partial') return { bg: 'var(--adm-amber-bg)', text: 'var(--adm-amber-c)', br: 'var(--adm-amber-br)' };
  return { bg: 'rgba(220,38,38,0.10)', text: 'var(--adm-red)', br: 'rgba(220,38,38,0.20)' };
};

const rowV = {
  hidden: { opacity: 0, x: 12 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export function PaymentOverview() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
    return onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(doc => {
        const d = doc.data();
        const total = Number(d.financial?.totalPrice || 0);
        const paid = Number(d.financial?.advanceAmount || 0);
        let status = 'Unpaid';
        if (paid >= total && total > 0) status = 'Paid';
        else if (paid > 0) status = 'Partial';
        return { id: doc.id, customer: d.customer?.name || 'Unknown', total, paid, status, remaining: total - paid };
      }));
      setLoading(false);
    });
  }, []);

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
    }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <div className="flex items-center gap-2.5">
          {/* ₹ icon pill */}
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <IndianRupee className="w-3.5 h-3.5" style={{ color: 'var(--adm-emerald)' }} />
          </div>
          <h2 className="adm-font-display text-sm font-black uppercase tracking-wide"
            style={{ color: 'var(--adm-text)' }}>Latest Transactions</h2>
        </div>
        {/* Live Feed badge */}
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ border: '1px solid rgba(5,150,105,0.35)', color: 'var(--adm-emerald)', background: 'transparent' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live Feed
        </span>
      </div>

      {/* Rows */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12" style={{ color: 'var(--adm-text-xs)' }}>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-xs">Fetching ledger…</span>
          </div>
        ) : (
          <AnimatePresence>
            {payments.map((item, i) => {
              const chip = statusChip(item.status);
              return (
                <motion.div key={item.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--adm-divider)' }}
                  onClick={() => router.push(`/admin/orders/${item.id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--adm-card-alt)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Left */}
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold leading-none" style={{ color: 'var(--adm-text)' }}>
                      {item.customer}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--adm-text-xs)' }}>
                        #{item.id.slice(0, 6)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                        style={{ color: chip.text, background: chip.bg, border: `1px solid ${chip.br}` }}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    {item.remaining > 0 ? (
                      <>
                        <p className="adm-font-display text-sm font-black leading-none" style={{ color: 'var(--adm-red)' }}>
                          -{fmt(item.remaining)}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--adm-text-xs)' }}>
                          Paid: {fmt(item.paid)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="adm-font-display text-sm font-black leading-none" style={{ color: 'var(--adm-emerald)' }}>
                          {fmt(item.total)}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--adm-text-xs)' }}>Fully Settled</p>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}