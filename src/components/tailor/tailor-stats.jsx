"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Scissors, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const CARDS = [
  { key: 'total', title: 'Active Tasks', icon: Scissors, accent: 'var(--adm-violet-c)', accentBg: 'var(--adm-violet-bg)', accentBr: 'var(--adm-violet-br)' },
  { key: 'inProgress', title: 'In Progress', icon: Clock, accent: 'var(--adm-orange-c)', accentBg: 'var(--adm-orange-bg)', accentBr: 'var(--adm-orange-br)' },
  { key: 'qcPending', title: 'Pending QC', icon: CheckCircle, accent: 'var(--adm-emerald)', accentBg: 'rgba(5,150,105,0.10)', accentBr: 'rgba(5,150,105,0.20)' },
  { key: 'fixNeeded', title: 'Alterations', icon: AlertTriangle, accent: 'var(--adm-red)', accentBg: 'rgba(220,38,38,0.10)', accentBr: 'rgba(220,38,38,0.20)' },
];

const cardV = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 + 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function TailorStats({ userId }) {
  const [counts, setCounts] = useState({ total: 0, inProgress: 0, qcPending: 0, fixNeeded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // FIX 1: Changed "assignedTo" to "tailorId"
    // FIX 2: Added "STITCHING_COMPLETED" to the query list
    const q = query(
      collection(db, "orders"),
      where("tailorId", "==", userId),
      where("status", "in", [
        "Ready_For_Cutting",
        "In_Sewing",
        "Quality_Check",
        "STITCHING_COMPLETED",
        "Alteration_Needed",
        "NEEDS_ALTERATION"
      ])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newCounts = snapshot.docs.reduce((acc, doc) => {
        const status = doc.data().status;

        acc.total += 1;

        if (["In_Sewing", "Ready_For_Cutting"].includes(status)) {
          acc.inProgress += 1;
        }

        // FIX 3: Make sure STITCHING_COMPLETED counts towards the "Pending QC" card
        if (["Quality_Check", "STITCHING_COMPLETED"].includes(status)) {
          acc.qcPending += 1;
        }

        if (["Alteration_Needed", "NEEDS_ALTERATION"].includes(status)) {
          acc.fixNeeded += 1;
        }

        return acc;
      }, { total: 0, inProgress: 0, qcPending: 0, fixNeeded: 0 });

      setCounts(newCounts);
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
                    style={{ color: 'var(--adm-text-xs)' }}>{card.title}</p>
                  <p className="text-3xl font-black tracking-tight mt-1.5 leading-none adm-font-display"
                    style={{ color: 'var(--adm-text)' }}>
                    {loading ? '—' : counts[card.key]}
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