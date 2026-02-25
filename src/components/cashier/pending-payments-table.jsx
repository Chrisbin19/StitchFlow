'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import PaymentCollectionDialog from './PaymentCollectionDialog';

export default function PendingPaymentsTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "PAYMENT_PENDING"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Pending Payments</h2>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No pending payments</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Garment</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Advance</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-primary font-mono text-sm">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      <div>
                        <p className="font-medium">{order.customer?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{order.product?.dressType}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      ₹{order.financial?.totalPrice?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-orange-600 font-medium">
                      ₹{order.financial?.advanceAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      ₹{order.financial?.balanceAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.financial?.isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-orange-100 text-orange-800'
                        }`}>
                        {order.financial?.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        disabled={order.financial?.isPaid}
                        className="font-bold"
                      >
                        <CreditCard className="w-4 h-4 mr-1" /> Collect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PaymentCollectionDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
