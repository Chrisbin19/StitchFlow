'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';

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
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const newStats = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const created = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

        if (created.getMonth() === currentMonth && created.getFullYear() === currentYear) {
          acc.totalThisMonth += 1;
        }
        if (['Pending', 'Pending_Approval'].includes(data.status)) {
          acc.pendingCount += 1;
        }
        if (data.status === 'Ready_To_Deliver') {
          acc.readyCount += 1;
        }
        if (data.status === 'PAYMENT_PENDING') {
          acc.paymentDueCount += 1;
          acc.paymentDueAmount += Number(data.financial?.totalPrice || 0);
        }
        return acc;
      }, { totalThisMonth: 0, pendingCount: 0, readyCount: 0, paymentDueAmount: 0, paymentDueCount: 0 });

      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);

  const dynamicStatsData = [
    {
      title: 'Total Orders',
      value: loading ? '...' : stats.totalThisMonth,
      subtitle: 'Placed this month',
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      accent: 'border-l-indigo-500',
    },
    {
      title: 'Pending Approval',
      value: loading ? '...' : stats.pendingCount,
      subtitle: 'Needs Admin Action',
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      accent: 'border-l-orange-500',
    },
    {
      title: 'Ready for Pickup',
      value: loading ? '...' : stats.readyCount,
      subtitle: 'Production done',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      accent: 'border-l-emerald-500',
    },
    {
      title: 'Pending Payment',
      value: loading ? '...' : formatCurrency(stats.paymentDueAmount),
      subtitle: `${stats.paymentDueCount} invoices unpaid`,
      icon: IndianRupee,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      accent: 'border-l-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dynamicStatsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`border border-border bg-card hover:shadow-md transition-all duration-200 border-l-4 ${stat.accent}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}