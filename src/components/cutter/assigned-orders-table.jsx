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
  Calendar,
  CheckCircle2,
  PlayCircle,
  StopCircle,
  ImageIcon,
  Maximize2,
  Ruler,
  AlertTriangle,
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
  const [localInProgress, setLocalInProgress] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["ADVANCE_PAID", "CUTTING_READY"]),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();

        // --- FIXED NESTED DATE FETCHING ---
        // Accessing the date from the workflow object as per your DB structure
        const rawDate = data.workflow?.deliveryDate || data.deliveryDate;
        let formattedDate = "No Date";

        if (rawDate) {
          const dateObj = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
          formattedDate = dateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }

        return {
          id: doc.id,
          ...data,
          displayDeliveryDate: formattedDate,
          priority: data.workflow?.priority || "Normal",
          previewImage: data.product?.referenceImage || null,
          displayCustomer: data.customer?.name || "Unknown Customer",
          displayGarment: data.product?.dressType || "Garment",
        };
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ... (handleOpenPreview, handleStartWork, handleStopWork, handleMarkComplete functions remain the same)

  const handleOpenPreview = (order) => {
    setSelectedOrder(order);
    setIsPreviewOpen(true);
  };

  const handleStartWork = (orderId) => {
    setLocalInProgress((prev) => [...prev, orderId]);
  };

  const handleStopWork = (orderId) => {
    setLocalInProgress((prev) => prev.filter((id) => id !== orderId));
  };

  const handleMarkComplete = async (orderId) => {
    if (!window.confirm("Is the cutting complete?")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "CUTTING_COMPLETED",
        "workflow.progress": 100,
        timeline: arrayUnion({
          stage: "Cutting Completed",
          timestamp: new Date(),
          note: "Fabric cut and prepared.",
        }),
      });
      handleStopWork(orderId);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto w-10 h-10 text-indigo-600" />
      </div>
    );

  return (
    <>
      <Card className="p-6 border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 uppercase">
            Cutting Production
          </h2>
          <Badge className="bg-indigo-50 text-indigo-700">
            {orders.length} Orders
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <th className="py-3 px-4 w-10">
                  <Checkbox />
                </th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const isInProgress = localInProgress.includes(order.id);
                const isUrgent =
                  order.priority === "Urgent" || order.priority === "High";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <Checkbox />
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-indigo-600 uppercase">
                      #{order.id.slice(-6)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">
                        {order.displayCustomer}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {order.displayGarment}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar
                            className={`w-3.5 h-3.5 ${isUrgent ? "text-red-500" : "text-slate-400"}`}
                          />
                          <span
                            className={`font-medium text-xs ${isUrgent ? "text-red-600 font-bold" : ""}`}
                          >
                            {order.displayDeliveryDate}
                          </span>
                        </div>
                        {isUrgent && (
                          <span className="text-[8px] font-extrabold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded w-fit">
                            {order.priority}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={
                          isInProgress
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }
                      >
                        {isInProgress ? "IN PROGRESS" : "CUTTING READY"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenPreview(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isInProgress ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-indigo-600 border-indigo-200 h-9 px-4 font-bold text-[10px] uppercase"
                            onClick={() => handleStartWork(order.id)}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" /> Start
                          </Button>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 h-9"
                              onClick={() => handleStopWork(order.id)}
                            >
                              <StopCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 h-9 font-bold text-[10px] uppercase text-white shadow-sm"
                              onClick={() => handleMarkComplete(order.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Finish
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- PREVIEW MODAL --- */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-indigo-600 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Ruler /> Design & Specs
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="relative aspect-video rounded-xl bg-slate-100 border overflow-hidden flex items-center justify-center">
              {selectedOrder?.previewImage ? (
                <>
                  <img
                    src={selectedOrder.previewImage}
                    alt="Design"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full shadow-md"
                    onClick={() =>
                      window.open(selectedOrder.previewImage, "_blank")
                    }
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                    No Image Found
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selectedOrder?.specs?.measurements &&
                Object.entries(selectedOrder.specs.measurements).map(
                  ([key, val]) => (
                    <div
                      key={key}
                      className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        {key}
                      </span>
                      <span className="text-sm font-bold text-indigo-700">
                        {val || "0"}"
                      </span>
                    </div>
                  ),
                )}
            </div>
            <Button
              className="w-full bg-slate-900 h-11 font-bold shadow-lg"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
