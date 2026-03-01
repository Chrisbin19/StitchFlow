"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  PackageCheck,
  Calendar,
  User,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReadyForDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FETCHING DATA: Only items marked as Ready for Delivery
    const q = query(
      collection(db, "orders"),
      where("status", "==", "READY_FOR_DELIVERY"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deliveryData = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Formatting the date when it was ready
          let readyDate = "Today";
          if (data.updatedAt) {
            const dateObj = data.updatedAt.toDate();
            readyDate = dateObj.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            });
          }

          return {
            id: doc.id,
            ...data,
            displayCustomer: data.customer?.name || "Unknown Customer",
            displayPhone: data.customer?.phone || "N/A",
            displayGarment: data.product?.dressType || "Garment",
            displayDate: readyDate,
          };
        });
        setOrders(deliveryData);
        setLoading(false);
      },
      (error) => {
        console.error("Delivery fetch error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto w-8 h-8 text-indigo-600" />
      </div>
    );

  return (
    <Card className="p-0 border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            Final Pickup List
          </h2>
          <p className="text-xs text-slate-500">
            Orders passed QC and ready for customer
          </p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px] font-bold">
          {orders.length} Ready
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b">
            <tr>
              <th className="py-4 px-6">Order ID</th>
              <th className="py-4 px-6">Customer Name</th>
              <th className="py-4 px-6">Phone</th>
              <th className="py-4 px-6">Garment Type</th>
              <th className="py-4 px-6 text-right">Ready Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-slate-400 italic"
                >
                  <PackageCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  No items currently awaiting delivery.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-6 font-mono font-bold text-indigo-600 text-xs">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-900">
                        {order.displayCustomer}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {order.displayPhone}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                      {order.displayGarment}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">{order.displayDate}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
