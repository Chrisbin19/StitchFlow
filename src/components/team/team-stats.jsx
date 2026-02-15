'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from '@/components/ui/card';
import { Users, Scissors, BedDouble as Needle, CreditCard, TrendingUp, Loader2 } from 'lucide-react';

export  function TeamStats() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    cutters: 0,
    tailors: 0,
    cashiers: 0,
    activeOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. LISTEN TO STAFF (Users Collection)
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

    // 2. LISTEN TO WORKLOAD (Orders Collection)
    // We count only orders that are currently being worked on
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "in", ["Ready_For_Cutting", "In_Sewing", "Quality_Check", "Alteration_Needed"])
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
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Cutters',
      value: stats.cutters,
      subtitle: 'Masters',
      icon: Scissors,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Tailors',
      value: stats.tailors,
      subtitle: 'Sewing team',
      icon: Needle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Cashiers',
      value: stats.cashiers,
      subtitle: 'Front desk',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Load',
      value: stats.activeOrders,
      subtitle: 'Orders in progress',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1,2,3,4,5].map((i) => (
          <Card key={i} className="border border-slate-200 shadow-sm h-28 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
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