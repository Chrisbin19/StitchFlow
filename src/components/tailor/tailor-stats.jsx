'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card } from '@/components/ui/card';
import { Scissors, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function TailorStats({ userId }) {
  const [counts, setCounts] = useState({
    total: 0,
    inProgress: 0,
    qcPending: 0,
    fixNeeded: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // 1. Query: Fetch ALL active work for this user
    // We exclude 'Delivered' and 'Cancelled' to keep stats relevant to "Now"
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId),
      where("status", "in", [
        "Ready_For_Cutting", 
        "In_Sewing", 
        "Quality_Check", 
        "Alteration_Needed"
      ])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 2. The Reducer: Sort the raw docs into buckets
      const newCounts = snapshot.docs.reduce((acc, doc) => {
        const status = doc.data().status;
        
        // Bucket 1: Total Active Load
        acc.total += 1;

        // Bucket 2: In Progress (Working now)
        if (['In_Sewing', 'Ready_For_Cutting'].includes(status)) {
          acc.inProgress += 1;
        }
        
        // Bucket 3: Waiting for Approval (Done by tailor, waiting for manager)
        if (status === 'Quality_Check') {
          acc.qcPending += 1;
        }

        // Bucket 4: Rejected/Fix Needed (High Priority)
        if (status === 'Alteration_Needed') {
          acc.fixNeeded += 1;
        }

        return acc;
      }, { total: 0, inProgress: 0, qcPending: 0, fixNeeded: 0 });

      setCounts(newCounts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const stats = [
    {
      title: 'Active Tasks',
      value: counts.total,
      icon: Scissors,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'In Progress',
      value: counts.inProgress,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Pending QC',
      value: counts.qcPending,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Alterations',
      value: counts.fixNeeded,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-5 border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                   {loading ? (
                     <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                   ) : (
                     <h3 className="text-2xl font-bold text-slate-900">
                       {stat.value}
                     </h3>
                   )}
                </div>
              </div>
              <div className={`${stat.bg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}