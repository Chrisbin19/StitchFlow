'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card } from '@/components/ui/card';

export default function DailyCollection() {
  const [collections, setCollections] = useState([
    { label: 'Cash', amount: 0, percentage: 0 },
    { label: 'UPI', amount: 0, percentage: 0 },
    { label: 'Card', amount: 0, percentage: 0 },
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "ADVANCE_PAID")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const modeTotals = { Cash: 0, UPI: 0, Card: 0 };

      snapshot.docs.forEach(doc => {
        const payments = doc.data().financial?.payments || [];
        payments.forEach(p => {
          const payDate = p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
          if (payDate >= today) {
            const mode = p.mode || 'Cash';
            if (modeTotals[mode] !== undefined) {
              modeTotals[mode] += p.amount || 0;
            }
          }
        });
      });

      const grandTotal = Object.values(modeTotals).reduce((sum, v) => sum + v, 0);
      setTotal(grandTotal);

      setCollections([
        { label: 'Cash', amount: modeTotals.Cash, percentage: grandTotal > 0 ? Math.round((modeTotals.Cash / grandTotal) * 100) : 0 },
        { label: 'UPI', amount: modeTotals.UPI, percentage: grandTotal > 0 ? Math.round((modeTotals.UPI / grandTotal) * 100) : 0 },
        { label: 'Card', amount: modeTotals.Card, percentage: grandTotal > 0 ? Math.round((modeTotals.Card / grandTotal) * 100) : 0 },
      ]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Daily Collection</h2>

      <div className="space-y-4">
        {collections.map((collection) => (
          <div key={collection.label}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                {collection.label}
              </span>
              <span className="text-sm font-bold text-primary">
                ₹{collection.amount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${collection.percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {collection.percentage}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Total Today</span>
          <span className="text-xl font-bold text-primary">₹{total.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
}
