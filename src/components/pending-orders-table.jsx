'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Calendar } from 'lucide-react';

// Status → semantic color classes (work in both light & dark)
const getStatusColor = (status) => {
  const map = {
    'Pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    'Pending_Approval': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    'PAYMENT_PENDING': 'bg-blue-500/10   text-blue-600   dark:text-blue-400   border-blue-500/20',
    'Ready_For_Cutting': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    'In_Sewing': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Quality_Check': 'bg-pink-500/10   text-pink-600   dark:text-pink-400   border-pink-500/20',
    'Ready_To_Deliver': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'Delivered': 'bg-muted text-muted-foreground border-border',
  };
  return map[status] || 'bg-muted text-muted-foreground border-border';
};

export function PendingOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, daysLeft: calculateDaysLeft(data.workflow?.deliveryDate) };
      });
      setOrders(liveData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return 0;
    const diffTime = new Date(targetDate) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-bold text-foreground">Recent Active Orders</CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            Live Feed
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 text-xs font-bold"
          onClick={() => router.push('/admin/orders')}
        >
          View All Orders
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Garment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading recent orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No orders found. Time to start stitching!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    {/* ID */}
                    <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{order.customer?.name}</span>
                        <span className="text-xs text-muted-foreground">{order.customer?.phone}</span>
                      </div>
                    </td>

                    {/* Garment */}
                    <td className="px-6 py-4 text-foreground font-medium">
                      {order.product?.dressType}
                      <span className="block text-[10px] text-muted-foreground font-normal">
                        {order.product?.material}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {order.workflow?.deliveryDate ? new Date(order.workflow.deliveryDate).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className={`text-[10px] font-bold ${order.daysLeft <= 2 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {order.daysLeft} days left
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-mono font-medium text-foreground">
                      {order.financial?.totalPrice
                        ? `₹${order.financial.totalPrice}`
                        : <span className="text-muted-foreground/40">--</span>}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-full"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}