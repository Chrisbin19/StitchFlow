'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card } from '@/components/ui/card';

export default function PaymentModes() {
  const [modes, setModes] = useState([
    { name: 'Cash', count: 0, icon: '💵' },
    { name: 'UPI', count: 0, icon: '📱' },
    { name: 'Card', count: 0, icon: '🏦' },
  ]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "ADVANCE_PAID")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const modeCounts = { Cash: 0, UPI: 0, Card: 0 };

      snapshot.docs.forEach(doc => {
        const payments = doc.data().financial?.payments || [];
        payments.forEach(p => {
          const payDate = p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
          if (payDate >= today) {
            const mode = p.mode || 'Cash';
            if (modeCounts[mode] !== undefined) {
              modeCounts[mode]++;
            }
          }
        });
      });

      setModes([
        { name: 'Cash', count: modeCounts.Cash, icon: '💵' },
        { name: 'UPI', count: modeCounts.UPI, icon: '📱' },
        { name: 'Card', count: modeCounts.Card, icon: '🏦' },
      ]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Payment Methods</h2>

      <div className="space-y-3">
        {modes.map((mode) => (
          <div
            key={mode.name}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-medium text-foreground">{mode.name}</span>
            </div>
            <span className="text-sm font-bold text-primary">{mode.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
