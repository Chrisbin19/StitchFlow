"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Scissors, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const CARDS = [
  { key: 'assigned', title: 'Assigned Orders', icon: Scissors, accent: 'var(--adm-violet-c)', accentBg: 'var(--adm-violet-bg)', accentBr: 'var(--adm-violet-br)' },
  { key: 'inProgress', title: 'In Progress', icon: Clock, accent: 'var(--adm-orange-c)', accentBg: 'var(--adm-orange-bg)', accentBr: 'var(--adm-orange-br)' },
  { key: 'completedToday', title: 'Completed Today', icon: CheckCircle, accent: 'var(--adm-emerald)', accentBg: 'rgba(5,150,105,0.10)', accentBr: 'rgba(5,150,105,0.20)' },
  { key: 'pending', title: 'Pending Action', icon: AlertTriangle, accent: 'var(--adm-red)', accentBg: 'rgba(220,38,38,0.10)', accentBr: 'rgba(220,38,38,0.20)' },
];

const cardV = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 + 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function CutterStats({ userId }) {
  const [statsData, setStatsData] = useState({ assigned: 0, inProgress: 0, completedToday: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "orders"), where("assignedTo", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let counts = { assigned: 0, inProgress: 0, completedToday: 0, pending: 0 };
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const status = data.status;
        counts.assigned++;
        if (status === "In Progress" || status === "CUTTING_READY" || status === "In_Cutting") counts.inProgress++;
        if (status === "Completed" || status === "STITCHING_COMPLETED" || status === "CUTTING_COMPLETE" || status === "CUTTING_COMPLETED") {
          const t = data.updatedAt?.seconds * 1000 || 0;
          if (t >= startOfToday.getTime()) counts.completedToday++;
        }
        if (status === "ADVANCE_PAID" || status === "Pending") counts.pending++;
      });
      setStatsData(counts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.key} custom={i} variants={cardV} initial="hidden" animate="visible"
            className="relative overflow-hidden group"
            style={{
              borderRadius: 14, border: '1px solid var(--adm-border)',
              background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', cursor: 'default'
            }}
            whileHover={{ scale: 1.02, boxShadow: 'var(--adm-shadow-d)', transition: { duration: 0.2 } }}
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 transition-all"
              style={{ background: card.accent, borderRadius: '14px 0 0 14px', opacity: 1, boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.1)' }} />

            <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(180deg, ${card.accent} 0%, white 100%)`, borderRadius: '14px 0 0 14px' }} />

            <div className="pl-6 pr-5 pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em]"
                    style={{ color: 'var(--adm-text-xs)' }}>{card.title}</p>
                  <p className="text-[2.8rem] font-black tracking-tight mt-1 leading-none adm-font-display"
                    style={{ color: 'var(--adm-text)' }}>
                    {loading ? '—' : statsData[card.key]}
                  </p>
                </div>
                <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: card.accentBg }}>
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
