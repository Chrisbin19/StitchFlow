"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  Loader2,
  PackageOpen,
  IndianRupee,
  Ruler,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdvancePaidOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    // UPDATED: Now fetching where status is specifically "CUTTING_READY"
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["ADVANCE_PAID", "CUTTING_READY"]),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          displayCustomer: doc.data().customer?.name || "Unknown Customer",
          displayGarment: doc.data().product?.dressType || "Garment",
          displayFabric: `${doc.data().product?.material || ""} ${doc.data().product?.fabricColor || ""}`,
          advanceAmount: doc.data().financial?.advanceAmount || 0,
        }));

        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error.code, error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleOpenPreview = (order) => {
    setSelectedOrder(order);
    setIsPreviewOpen(true);
  };

  const handleMarkComplete = async (orderId) => {
    const confirmDone = window.confirm(
      "Are you sure the stitching is complete for this order?",
    );
    if (!confirmDone) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "CUTTING_COMPLETED",
        "workflow.progress": 100,
        timeline: arrayUnion({
          stage: "Stitching Completed",
          timestamp: new Date(),
          note: "Garment finalized and ready for delivery.",
        }),
      });
      alert("Order marked as completed!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm text-slate-500 font-medium">
          Loading production queue...
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              Ready for Stitching
            </h2>
            <p className="text-xs text-slate-500">
              Orders cleared by the cutting department
            </p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
            {orders.length} Prepared
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4 w-10">
                  <Checkbox />
                </th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4 text-center">Advance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-20 text-center text-slate-400 italic text-sm"
                  >
                    <PackageOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    Waiting for fabric to be cut.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <Checkbox />
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">
                        {order.displayCustomer}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-slate-700 font-medium">
                        {order.displayGarment}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {order.displayFabric}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                        <IndianRupee className="w-3 h-3" />{" "}
                        {order.advanceAmount}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={() => handleOpenPreview(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase h-9 px-4"
                          onClick={() => handleMarkComplete(order.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-indigo-600 text-white">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Ruler className="w-5 h-5" /> Measurements
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {selectedOrder?.specs?.measurements &&
                Object.entries(selectedOrder.specs.measurements).map(
                  ([key, val]) => (
                    <div
                      key={key}
                      className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {key}
                      </span>
                      <span className="text-sm font-bold text-indigo-700 font-mono">
                        {val || "0"}"
                      </span>
                    </div>
                  ),
                )}
            </div>

            {selectedOrder?.specs?.notes && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Instructions
                </p>
                <p className="text-sm text-amber-800 italic leading-relaxed">
                  "{selectedOrder.specs.notes}"
                </p>
              </div>
            )}

            <Button
              className="w-full bg-slate-900"
              onClick={() => setIsPreviewOpen(false)}
            >
              Back to List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
