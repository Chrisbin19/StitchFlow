'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from 'framer-motion';
import { Banknote, Smartphone, CreditCard } from 'lucide-react';

const MODE = {
  Cash: { icon: Banknote, cVar: 'var(--cf-amber-c)', bgVar: 'var(--cf-amber-bg)', brVar: 'var(--cf-amber-br)' },
  UPI: { icon: Smartphone, cVar: 'var(--cf-violet-c)', bgVar: 'var(--cf-violet-bg)', brVar: 'var(--cf-violet-br)' },
  Card: { icon: CreditCard, cVar: 'var(--cf-blue-c)', bgVar: 'var(--cf-blue-bg)', brVar: 'var(--cf-blue-br)' },
};

export default function PaymentModes() {
  const [modes, setModes] = useState([
    { name: 'Cash', count: 0, amount: 0 },
    { name: 'UPI', count: 0, amount: 0 },
    { name: 'Card', count: 0, amount: 0 },
  ]);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "ADVANCE_PAID"));
    return onSnapshot(q, (snap) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const counts = { Cash: 0, UPI: 0, Card: 0 };
      const amounts = { Cash: 0, UPI: 0, Card: 0 };
      snap.docs.forEach(d => {
        (d.data().financial?.payments || []).forEach(p => {
          const pd = p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
          if (pd >= today) {
            const m = p.mode || 'Cash';
            if (counts[m] !== undefined) { counts[m]++; amounts[m] += p.amount || 0; }
          }
        });
      });
      setModes([
        { name: 'Cash', count: counts.Cash, amount: amounts.Cash },
        { name: 'UPI', count: counts.UPI, amount: amounts.UPI },
        { name: 'Card', count: counts.Card, amount: amounts.Card },
      ]);
    });
  }, []);

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
          style={{ color: 'var(--cf-text-xs)' }}>Payment Methods</p>
        <p className="text-base font-black mt-0.5" style={{ color: 'var(--cf-text)' }}>
          Today&apos;s Breakdown
        </p>
      </div>

      <div className="p-4 space-y-3">
        {modes.map((mode, i) => {
          const cfg = MODE[mode.name];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={mode.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{
                background: cfg.bgVar,
                border: `1px solid ${cfg.brVar}`,
                cursor: 'default',
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bgVar, border: `1px solid ${cfg.brVar}` }}>
                <Icon className="w-[18px] h-[18px]" style={{ color: cfg.cVar }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: cfg.cVar }}>{mode.name}</p>
                <p className="text-xs" style={{ color: 'var(--cf-text-xs)' }}>
                  {mode.count} transaction{mode.count !== 1 ? 's' : ''}
                </p>
              </div>
              <p className="text-base font-black" style={{ color: 'var(--cf-text)' }}>
                ₹{mode.amount.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
