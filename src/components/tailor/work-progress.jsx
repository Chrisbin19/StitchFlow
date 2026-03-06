"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkProgress({ userId }) {
  const [progressData, setProgressData] = useState([
    { label: 'Pending', count: 0, color: 'var(--adm-text-xs)' },
    { label: 'In Progress', count: 0, color: 'var(--adm-blue-c)' },
    { label: 'Ready for QC', count: 0, color: 'var(--adm-emerald)' },
    { label: 'Returned', count: 0, color: 'var(--adm-red)' },
  ]);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId),
      where("status", "in", ["Pending", "Ready_For_Cutting", "In_Sewing", "Quality_Check", "Alteration_Needed", "NEEDS_ALTERATION"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let pen = 0, prog = 0, qc = 0, ret = 0;
      snapshot.docs.forEach(doc => {
        const s = doc.data().status;
        if (s === "Pending") pen++;
        else if (["Ready_For_Cutting", "In_Sewing"].includes(s)) prog++;
        else if (s === "Quality_Check") qc++;
        else if (["Alteration_Needed", "NEEDS_ALTERATION"].includes(s)) ret++;
      });
      setProgressData([
        { label: 'Pending', count: pen, color: 'var(--adm-text-xs)' },
        { label: 'In Progress', count: prog, color: 'var(--adm-blue-c)' },
        { label: 'Ready for QC', count: qc, color: 'var(--adm-emerald)' },
        { label: 'Returned', count: ret, color: 'var(--adm-red)' },
      ]);
    });
    return () => unsubscribe();
  }, [userId]);

  const total = progressData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)',
      padding: '24px'
    }}>
      <h2 className="adm-font-display text-sm font-black uppercase tracking-wide mb-6"
        style={{ color: 'var(--adm-text)' }}>Work Status</h2>

      <div className="space-y-5">
        {progressData.map((item, i) => {
          const pct = total === 0 ? 0 : Math.round((item.count / total) * 100);
          return (
            <div key={item.label}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--adm-text)' }}>
                  {item.label}
                </span>
                <span className="adm-font-display text-base font-black leading-none" style={{ color: 'var(--adm-text)' }}>
                  {item.count}
                </span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'var(--adm-badge)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                  style={{ height: '100%', borderRadius: 999, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--adm-border)' }}>
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text-sm)' }}>
            Total Garments
          </span>
          <span className="adm-font-display text-3xl font-black leading-none" style={{ color: 'var(--adm-text)' }}>
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}
