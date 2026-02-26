"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import {
  Scissors,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function CutterStats({ userId }) {
  const [statsData, setStatsData] = useState({
    assigned: 0,
    inProgress: 0,
    completedToday: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Real-time listener for all orders assigned to this specific user
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let counts = {
          assigned: 0,
          inProgress: 0,
          completedToday: 0,
          pending: 0,
        };

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const status = data.status;

          // 1. Total Assigned Orders
          counts.assigned++;

          // 2. In Progress: Orders currently being worked on
          if (status === "In Progress" || status === "CUTTING_READY") {
            counts.inProgress++;
          }

          // 3. Completed Today: Status is 'Completed' or 'STITCHING_COMPLETED' since midnight
          if (
            status === "Completed" ||
            status === "STITCHING_COMPLETED" ||
            status === "CUTTING_COMPLETE"
          ) {
            const completionTime = data.updatedAt?.seconds * 1000 || 0;
            if (completionTime >= startOfToday.getTime()) {
              counts.completedToday++;
            }
          }

          // 4. Pending: Orders assigned but money/cutting not fully cleared yet
          if (status === "ADVANCE_PAID" || status === "Pending") {
            counts.pending++;
          }
        });

        setStatsData(counts);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Stats Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const statsConfig = [
    {
      title: "Assigned Orders",
      value: statsData.assigned,
      icon: Scissors,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "In Progress",
      value: statsData.inProgress,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Completed Today",
      value: statsData.completedToday,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Action",
      value: statsData.pending,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-24 bg-slate-50 border-slate-100" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
