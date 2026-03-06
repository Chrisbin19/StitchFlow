"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

export default function TaskProgress({ userId }) {
  const [progressData, setProgressData] = useState([
    { label: 'Pending', count: 0, color: 'var(--adm-text-xs)' },
    { label: 'In Progress', count: 0, color: 'var(--adm-blue-c)' },
    { label: 'Completed', count: 0, color: 'var(--adm-emerald)' },
  ]);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let pen = 0, prog = 0, comp = 0;
      const t = new Date(); t.setHours(0, 0, 0, 0);
      snapshot.docs.forEach(doc => {
        const s = doc.data().status;
        if (s === "ADVANCE_PAID" || s === "Pending") pen++;
        else if (s === "In Progress" || s === "CUTTING_READY" || s === "In_Cutting") prog++;
        else if (s === "Completed" || s === "STITCHING_COMPLETED" || s === "CUTTING_COMPLETE" || s === "CUTTING_COMPLETED") {
          const ud = doc.data().updatedAt?.seconds * 1000 || 0;
          if (ud >= t.getTime()) comp++;
        }
      });
      setProgressData([
        { label: 'Pending', count: pen, color: 'var(--adm-text-xs)' },
        { label: 'In Progress', count: prog, color: 'var(--adm-blue-c)' },
        { label: 'Completed', count: comp, color: 'var(--adm-emerald)' },
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
      <h2 className="adm-font-display text-[1.15rem] font-black tracking-[-0.01em] mb-6"
        style={{ color: 'var(--adm-text)' }}>Today's Progress</h2>

      <div className="space-y-5">
        {progressData.map((item, i) => {
          const pct = total === 0 ? 0 : Math.round((item.count / total) * 100);
          return (
            <div key={item.label}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--adm-text)' }}>
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
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                  style={{ height: '100%', borderRadius: 999, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--adm-border)' }}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text-sm)' }}>
              Total Tasks
            </span>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--adm-text-xs)' }}>across all statuses</p>
          </div>
          <span className="adm-font-display text-3xl font-black leading-none" style={{ color: 'var(--adm-text)' }}>
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}
