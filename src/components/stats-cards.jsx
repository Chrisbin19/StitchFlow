'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle, CheckCircle2, IndianRupee, Activity } from 'lucide-react';

export function StatsCards() {
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    pendingCount: 0,
    readyCount: 0,
    paymentDueAmount: 0,
    paymentDueCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen to the database
    // Optimization: In a huge app, you'd use server-side aggregation. 
    // For this size, reading all orders is fine and gives instant updates.
    const q = query(collection(db, "orders"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const newStats = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const created = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

        // Metric 1: Total Orders (This Month)
        if (created.getMonth() === currentMonth && created.getFullYear() === currentYear) {
          acc.totalThisMonth += 1;
        }

        // Metric 2: Pending (Needs Admin Attention)
        // Includes: New submissions + Custom price requests
        if (['Pending', 'Pending_Approval'].includes(data.status)) {
          acc.pendingCount += 1;
        }

        // Metric 3: Ready for Delivery (Completed Work)
        if (data.status === 'Ready_To_Deliver') {
          acc.readyCount += 1;
        }

        // Metric 4: Pending Payments (Zone 2 Bottleneck)
        // Orders waiting for Cashier to collect Advance
        if (data.status === 'PAYMENT_PENDING') {
          acc.paymentDueCount += 1;
          // Sum the total price (or you could sum the advance required)
          acc.paymentDueAmount += Number(data.financial?.totalPrice || 0);
        }

        return acc;
      }, {
        totalThisMonth: 0,
        pendingCount: 0,
        readyCount: 0,
        paymentDueAmount: 0,
        paymentDueCount: 0
      });

      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper for Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const dynamicStatsData = [
    {
      title: 'Total Orders',
      value: loading ? '...' : stats.totalThisMonth,
      subtitle: 'Placed this month',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Pending Approval',
      value: loading ? '...' : stats.pendingCount,
      subtitle: 'Needs Admin Action',
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Ready for Pickup',
      value: loading ? '...' : stats.readyCount,
      subtitle: 'Production done',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Pending Payment',
      value: loading ? '...' : formatCurrency(stats.paymentDueAmount),
      subtitle: `${stats.paymentDueCount} invoices unpaid`,
      icon: IndianRupee,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dynamicStatsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}