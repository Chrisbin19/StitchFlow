'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase"; 
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Calendar } from 'lucide-react';

// Helper to map DB status to UI colors
const getStatusColor = (status) => {
  const map = {
    'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Pending_Approval': 'bg-orange-50 text-orange-700 border-orange-200',
    'PAYMENT_PENDING': 'bg-blue-50 text-blue-700 border-blue-200',
    'Ready_For_Cutting': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'In_Sewing': 'bg-purple-50 text-purple-700 border-purple-200',
    'Quality_Check': 'bg-pink-50 text-pink-700 border-pink-200',
    'Ready_To_Deliver': 'bg-green-50 text-green-700 border-green-200',
    'Delivered': 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[status] || 'bg-gray-50 text-gray-600';
};

export function PendingOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Query: Get the 10 most recent active orders
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    // 2. Listener: Real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Calculate Days Left dynamically
          daysLeft: calculateDaysLeft(data.workflow?.deliveryDate)
        };
      });
      setOrders(liveData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper: Date Logic
  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return 0;
    const today = new Date();
    const due = new Date(targetDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
           <CardTitle className="text-base font-bold text-slate-800">Recent Active Orders</CardTitle>
           <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-500">
             Live Feed
           </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-xs font-bold"
          onClick={() => router.push('/admin/orders')}
        >
          View All Orders
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
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
            
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading recent orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No orders found. Time to start stitching!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    
                    {/* ID */}
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{order.customer?.name}</span>
                        <span className="text-xs text-slate-400">{order.customer?.phone}</span>
                      </div>
                    </td>

                    {/* Garment */}
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {order.product?.dressType}
                      <span className="block text-[10px] text-slate-400 font-normal">
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
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <div>
                          <p className="text-xs font-medium text-slate-700">
                            {order.workflow?.deliveryDate ? new Date(order.workflow.deliveryDate).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className={`text-[10px] font-bold ${order.daysLeft <= 2 ? 'text-red-500' : 'text-slate-400'}`}>
                            {order.daysLeft} days left
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                      {order.financial?.totalPrice 
                        ? `₹${order.financial.totalPrice}` 
                        : <span className="text-slate-300">--</span>}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
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