'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default function ReceiptHistory() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get orders that have been paid (ADVANCE_PAID status)
    const q = query(
      collection(db, "orders"),
      where("status", "==", "ADVANCE_PAID"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.docs.forEach(doc => {
        const order = doc.data();
        const payments = order.financial?.payments || [];
        payments.forEach((payment, index) => {
          data.push({
            id: `${doc.id}-${index}`,
            orderId: doc.id,
            customer: order.customer?.name || 'Unknown',
            amount: payment.amount || 0,
            mode: payment.mode || 'Cash',
            type: payment.type || 'advance',
            collectedBy: payment.collectedBy || 'Cashier',
            date: payment.timestamp?.toDate
              ? payment.timestamp.toDate().toLocaleDateString('en-IN')
              : 'N/A',
            time: payment.timestamp?.toDate
              ? payment.timestamp.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : '',
          });
        });
      });
      setReceipts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Receipt History</h2>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground animate-pulse">Loading receipts...</div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No receipts yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Mode</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Collected By</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="border-b border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-primary font-mono text-xs">
                    #{receipt.orderId.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-foreground">{receipt.customer}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    ₹{receipt.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium">
                      {receipt.mode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded bg-secondary text-foreground text-xs font-medium capitalize">
                      {receipt.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground text-xs">{receipt.collectedBy}</td>
                  <td className="py-3 px-4 text-foreground text-xs">
                    {receipt.date}
                    <br />
                    <span className="text-muted-foreground">{receipt.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
