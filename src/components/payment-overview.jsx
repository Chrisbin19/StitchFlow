'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, IndianRupee } from 'lucide-react';

export function PaymentOverview() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => {
        const data = doc.data();
        const total = Number(data.financial?.totalPrice || 0);
        const paid = Number(data.financial?.advanceAmount || 0);
        let status = 'Pending';
        if (paid >= total && total > 0) status = 'Paid';
        else if (paid > 0) status = 'Partial';
        return { id: doc.id, customer: data.customer?.name || 'Unknown', total, paid, status, remaining: total - paid };
      });
      setPayments(liveData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatMoney = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <Card className="h-fit border border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border py-4 px-6 bg-muted/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-500">
              <IndianRupee className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold text-foreground">Latest Transactions</CardTitle>
          </div>
          <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">Live Feed</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching ledger...
            </div>
          ) : payments.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/admin/orders/${item.id}`)}
              className="p-4 hover:bg-muted/40 transition-all cursor-pointer group flex items-center justify-between"
            >
              {/* Left: Customer Info */}
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold text-foreground group-hover:text-indigo-500 transition-colors">
                  {item.customer}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">#{item.id.slice(0, 6)}</span>
                  {item.status === 'Paid' ? (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">PAID</span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{item.status.toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Right: The Numbers */}
              <div className="text-right">
                {item.remaining > 0 ? (
                  <>
                    <p className="text-sm font-bold text-red-500">-{formatMoney(item.remaining)}</p>
                    <p className="text-[10px] text-muted-foreground">Paid: {formatMoney(item.paid)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-emerald-500">{formatMoney(item.total)}</p>
                    <p className="text-[10px] text-muted-foreground">Fully Settled</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-muted/20 border-t border-border">
          <Button variant="ghost" className="w-full text-xs font-semibold text-muted-foreground hover:text-indigo-500 h-8">
            View All Payments <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}