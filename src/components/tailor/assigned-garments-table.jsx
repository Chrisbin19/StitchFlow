

"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  CheckCircle,
  Loader2,
  Calendar,
  PackageOpen,
  Ruler,
  ImageIcon,
  Maximize2,
  Info,
  PlayCircle,
  StopCircle,
  RefreshCcw,
  AlertTriangle,
  MessageSquareText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AssignedGarmentsTable({ userId }) {
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [localInProgress, setLocalInProgress] = useState([]);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "orders"),
      where("status", "in", [
        "CUTTING_COMPLETED",
        "CUTTING_COMPLETE",
        "Ready_For_Stitching",
        "NEEDS_ALTERATION",
      ]),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => {
        const data = doc.data();

        let deliveryDate = "No Date";
        const rawDate = data.workflow?.deliveryDate || data.deliveryDate;
        if (rawDate) {
          const dateObj = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
          deliveryDate = dateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }

        return {
          id: doc.id,
          ...data,
          isAlteration: data.status === "NEEDS_ALTERATION",
          formattedDeliveryDate: deliveryDate,
          customerName: data.customer?.name || "Unknown",
          garmentType: data.product?.dressType || "Garment",
          previewImage: data.product?.referenceImage || null,
        };
      });

      setGarments(tasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleStartWork = (id) => setLocalInProgress((prev) => [...prev, id]);

  const handleStopWork = (id) => {
    if (!window.confirm("Stop working on this task and return it to 'Ready'?"))
      return;
    setLocalInProgress((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleMarkComplete = async (orderId) => {
    if (!window.confirm("Mark this garment as finished?")) return;
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "STITCHING_COMPLETED",
        "workflow.progress": 100,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          stage: "Stitching Completed",
          timestamp: new Date(),
          note: "Garment finalized by tailor.",
        }),
      });
      setLocalInProgress((prev) => prev.filter((id) => id !== orderId));
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    <>
      <Card className="p-0 border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
            Work Queue
          </h2>
          <Badge className="bg-indigo-100 text-indigo-700 font-bold uppercase text-[10px]">
            {garments.length} Active Tasks
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b">
                <th className="py-4 px-6 w-10">
                  <Checkbox />
                </th>
                <th className="py-4 px-6">Garment ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {garments.map((item) => {
                const isInProgress = localInProgress.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${item.isAlteration ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-slate-50"}`}
                  >
                    <td className="py-4 px-6">
                      <Checkbox />
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {item.isAlteration && (
                          <div
                            className="flex items-center justify-center w-6 h-6 bg-amber-100 rounded-full animate-pulse border border-amber-200"
                            title="Needs Alteration"
                          >
                            <RefreshCcw className="w-3 h-3 text-amber-700" />
                          </div>
                        )}
                        <span className="font-mono font-bold text-indigo-600 uppercase text-xs">
                          #{item.id.slice(-6)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {item.customerName}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-medium">
                        {item.garmentType}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.formattedDeliveryDate}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Badge
                        className={
                          item.isAlteration
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isInProgress
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-blue-100 text-blue-700"
                        }
                      >
                        {item.isAlteration
                          ? "ALTERATION"
                          : isInProgress
                            ? "WORKING"
                            : "READY"}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-indigo-600"
                          onClick={() => {
                            setSelectedGarment(item);
                            setIsPreviewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {!isInProgress ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-indigo-600 h-9 px-4 font-bold text-[10px] uppercase border-indigo-200 hover:bg-indigo-50"
                            onClick={() => handleStartWork(item.id)}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" /> Start
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStopWork(item.id)}
                              title="Stop Work"
                            >
                              <StopCircle className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 font-bold text-[10px] uppercase text-white shadow-sm"
                              onClick={() => handleMarkComplete(item.id)}
                            >
                              {updating === item.id ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                              ) : (
                                "Finish"
                              )}
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
          <DialogHeader
            className={`p-6 text-white ${selectedGarment?.isAlteration ? "bg-amber-600" : "bg-indigo-600"}`}
          >
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedGarment?.isAlteration ? (
                <RefreshCcw className="w-5 h-5" />
              ) : (
                <Ruler className="w-5 h-5" />
              )}
              {selectedGarment?.isAlteration
                ? "Alteration Details"
                : "Sewing Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Design Image Preview */}
            <div className="relative aspect-video rounded-xl bg-slate-100 border overflow-hidden flex items-center justify-center">
              {selectedGarment?.previewImage ? (
                <>
                  <img
                    src={selectedGarment.previewImage}
                    alt="Design"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full shadow-md"
                    onClick={() =>
                      window.open(selectedGarment.previewImage, "_blank")
                    }
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    No Image
                  </p>
                </div>
              )}
            </div>

            {/* --- ALTERATION NOTE (If status is Needs Alteration) --- */}
            {selectedGarment?.isAlteration &&
              selectedGarment?.workflow?.alterationNote && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      Alteration Fix
                    </span>
                  </div>
                  <p className="text-sm font-bold text-red-900 italic">
                    "{selectedGarment.workflow.alterationNote}"
                  </p>
                </div>
              )}

            {/* --- ADDITIONAL CUSTOMER NOTES --- */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer Requirements
                </span>
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                {selectedGarment?.specs?.notes ||
                  "No additional notes provided by customer."}
              </p>
            </div>

            {/* Measurements Grid */}
            <div className="grid grid-cols-2 gap-3">
              {selectedGarment?.specs?.measurements &&
                Object.entries(selectedGarment.specs.measurements).map(
                  ([key, val]) => (
                    <div
                      key={key}
                      className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {key}
                      </span>
                      <span className="text-sm font-bold text-indigo-700 font-mono">
                        {val || "0"}"
                      </span>
                    </div>
                  ),
                )}
            </div>

            <Button
              className="w-full bg-slate-900 h-12 rounded-xl font-bold shadow-lg text-white"
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
