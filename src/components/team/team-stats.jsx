"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Scissors, BedDouble, Container, TrendingUp, Loader2 } from "lucide-react";

export function TeamStats() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    cutters: 0,
    tailors: 0,
    cashiers: 0,
    activeOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // LISTEN TO STAFF (Users Collection)
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const counts = snapshot.docs.reduce((acc, doc) => {
        const role = doc.data().role?.toLowerCase();
        acc.totalWorkers++;
        if (role === 'cutter') acc.cutters++;
        else if (role === 'tailor') acc.tailors++;
        else if (role === 'cashier') acc.cashiers++;
        return acc;
      }, { totalWorkers: 0, cutters: 0, tailors: 0, cashiers: 0 });

      setStats(prev => ({ ...prev, ...counts }));
    });

    // LISTEN TO WORKLOAD (Orders Collection)
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "in", ["Ready_For_Cutting", "In_Sewing", "Quality_Check", "Alteration_Needed", "In_Cutting"])
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeOrders: snapshot.size }));
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
    };
  }, []);

  const statsData = [
    {
      title: 'Total Staff',
      value: stats.totalWorkers,
      subtitle: 'Active members',
      icon: Users,
      accent: 'var(--adm-blue-c)',
    },
    {
      title: 'Cutters',
      value: stats.cutters,
      subtitle: 'Masters',
      icon: Scissors,
      accent: 'var(--adm-orange-c)',
    },
    {
      title: 'Tailors',
      value: stats.tailors,
      subtitle: 'Sewing team',
      icon: BedDouble,
      accent: 'var(--adm-emerald)',
    },
    {
      title: 'Cashiers',
      value: stats.cashiers,
      subtitle: 'Front desk',
      icon: Container, // Cash register feel
      accent: 'var(--adm-violet-c)',
    },
    {
      title: 'Active Load',
      value: stats.activeOrders,
      subtitle: 'Orders in progress',
      icon: TrendingUp,
      accent: 'var(--adm-amber-c)',
    },
  ];

  const cardV = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <AnimatePresence>
        {!loading && statsData.map((stat, i) => {
          const Icon = stat.icon;
          const bgOpacity = `rgba(${stat.accent === 'var(--adm-emerald)' ? '16,185,129' :
            stat.accent === 'var(--adm-blue-c)' ? '37,99,235' :
              stat.accent === 'var(--adm-orange-c)' ? '249,115,22' :
                stat.accent === 'var(--adm-violet-c)' ? '124,58,237' : '245,158,11'}, 0.10)`;

          return (
            <motion.div key={stat.title} custom={i} variants={cardV} initial="hidden" animate="visible"
              className="relative overflow-hidden group col-span-1"
              style={{
                borderRadius: 14, border: '1px solid var(--adm-border)',
                background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', cursor: 'default'
              }}
              whileHover={{ scale: 1.02, boxShadow: 'var(--adm-shadow-d)', transition: { duration: 0.2 } }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 transition-all"
                style={{ background: stat.accent, borderRadius: '14px 0 0 14px', boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.1)' }} />

              <div className="pl-6 pr-5 py-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] mt-1"
                    style={{ color: 'var(--adm-text-xs)' }}>
                    {stat.title}
                  </p>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: bgOpacity }}>
                    <Icon className="w-5 h-5" style={{ color: stat.accent }} />
                  </div>
                </div>

                <div className="mt-2">
                  <p className="adm-font-display text-[2.8rem] font-black tracking-tight leading-none"
                    style={{ color: 'var(--adm-text)', marginBottom: 2 }}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--adm-text-sm)' }}>
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}