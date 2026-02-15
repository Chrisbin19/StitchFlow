'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase"; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Calendar, Clock } from 'lucide-react';

export function UpcomingDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(db, "orders"), where("status", "not-in", ["Delivered", "Cancelled", "Pending"]));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          if (!data.workflow?.deliveryDate) return null;
          const today = new Date(); today.setHours(0,0,0,0);
          const due = new Date(data.workflow.deliveryDate); due.setHours(0,0,0,0);
          const daysLeft = Math.ceil((due - today) / (86400000));
          return {
            id: doc.id,
            customer: data.customer?.name || 'Unknown',
            garment: data.product?.dressType || 'Item',
            date: due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            daysLeft,
            priority: daysLeft <= 3 ? 'urgent' : 'normal',
            rawDate: due
          };
        }).filter(Boolean).sort((a,b) => a.rawDate - b.rawDate).slice(0, 5);
        setDeliveries(items);
      } finally { setLoading(false); }
    };
    fetchDeliveries();
  }, []);

  return (
    <Card className="h-fit border-none shadow-md bg-white ring-1 ring-slate-900/5">
      <CardHeader className="border-b border-slate-50 py-4 px-6 bg-slate-50/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-800">Deadlines</CardTitle>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Next 5</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {loading ? (
             <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /> Checking dates...
             </div>
          ) : deliveries.map((item) => (
            <div 
              key={item.id} 
              onClick={() => router.push(`/admin/orders/${item.id}`)}
              className="p-4 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between"
            >
               {/* Left: Info */}
               <div className="flex items-center gap-3">
                 {/* The "Date Box" - Replaces the icon */}
                 <div className={`
                    flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-xs font-bold leading-none
                    ${item.priority === 'urgent' 
                      ? 'bg-red-50 text-red-600 border-red-100' 
                      : 'bg-slate-50 text-slate-600 border-slate-100'}
                 `}>
                    <span>{item.date.split(' ')[0]}</span>
                    <span className="text-[8px] uppercase">{item.date.split(' ')[1]}</span>
                 </div>
                 
                 <div className="flex flex-col gap-0.5">
                   <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                     {item.customer}
                   </p>
                   <p className="text-[10px] text-slate-400">
                     {item.garment} • <span className="font-mono">#{item.id.slice(0, 4)}</span>
                   </p>
                 </div>
               </div>

               {/* Right: Days Left */}
               <div className="text-right">
                 {item.priority === 'urgent' ? (
                   <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                     <Clock className="w-3 h-3" />
                     {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d Late` : `${item.daysLeft} days`}
                   </span>
                 ) : (
                   <span className="text-xs font-semibold text-slate-500">
                     {item.daysLeft} days
                   </span>
                 )}
               </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50/50 border-t border-slate-100">
          <Button variant="ghost" className="w-full text-xs font-semibold text-slate-500 hover:text-indigo-600 h-8">
            View Calendar <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}