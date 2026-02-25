'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card } from '@/components/ui/card';
import { IndianRupee, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function PaymentStats() {
  const [pendingCount, setPendingCount] = useState(0);
  const [paidTodayCount, setPaidTodayCount] = useState(0);
  const [todayCollection, setTodayCollection] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    // Listen for PAYMENT_PENDING orders
    const pendingQ = query(
      collection(db, "orders"),
      where("status", "==", "PAYMENT_PENDING")
    );

    const unsubPending = onSnapshot(pendingQ, (snapshot) => {
      setPendingCount(snapshot.size);
      let total = 0;
      snapshot.docs.forEach(doc => {
        total += doc.data().financial?.advanceAmount || 0;
      });
      setTotalPending(total);
    });

    // Listen for ADVANCE_PAID orders (to compute today's collections)
    const paidQ = query(
      collection(db, "orders"),
      where("status", "==", "ADVANCE_PAID")
    );

    const unsubPaid = onSnapshot(paidQ, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let count = 0;
      let collection = 0;

      snapshot.docs.forEach(doc => {
        const payments = doc.data().financial?.payments || [];
        payments.forEach(p => {
          const payDate = p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
          if (payDate >= today) {
            count++;
            collection += p.amount || 0;
          }
        });
      });

      setPaidTodayCount(count);
      setTodayCollection(collection);
    });

    return () => {
      unsubPending();
      unsubPaid();
    };
  }, []);

  const stats = [
    {
      title: 'Today Collection',
      value: `₹${todayCollection.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Pending Advances',
      value: `₹${totalPending.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Collected Today',
      value: String(paidTodayCount),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Awaiting Collection',
      value: String(pendingCount),
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
