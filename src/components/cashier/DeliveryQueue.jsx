'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageCheck, Truck, Loader2, IndianRupee, Phone } from 'lucide-react';
import BalancePaymentDialog from './BalancePaymentDialog';

export default function DeliveryQueue() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, "orders"),
            where("status", "==", "READY_FOR_DELIVERY"),
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
            <Card className="p-0 overflow-hidden border border-border">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-emerald-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-bold text-foreground">Ready for Delivery</h2>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px] uppercase">
                        {orders.length} Orders
                    </Badge>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading delivery queue...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <PackageCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium">No orders pending delivery</p>
                        <p className="text-xs mt-1">Orders will appear here after admin approval</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Order ID</th>
                                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Customer</th>
                                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Garment</th>
                                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Total</th>
                                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Advance</th>
                                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Balance Due</th>
                                    <th className="text-right py-3 px-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-border hover:bg-emerald-50/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-mono font-bold text-primary text-xs">
                                            #{order.id.slice(0, 6).toUpperCase()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-semibold text-foreground">{order.customer?.name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {order.customer?.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                                                {order.product?.dressType}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-foreground">
                                            ₹{order.financial?.totalPrice?.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-emerald-600 font-medium">
                                            ₹{order.financial?.advanceAmount?.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-bold text-orange-600 text-base">
                                                ₹{order.financial?.balanceAmount?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedOrder(order)}
                                                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <IndianRupee className="w-3.5 h-3.5 mr-1" />
                                                Collect & Deliver
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <BalancePaymentDialog
                order={selectedOrder}
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </>
    );
}
