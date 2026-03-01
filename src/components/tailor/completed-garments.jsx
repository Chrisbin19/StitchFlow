
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
  serverTimestamp,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  Loader2,
  Package,
  RefreshCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompletedGarments({ userId }) {
  const [completedList, setCompletedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch garments that were marked as Stitching Completed
    const q = query(
      collection(db, "orders"),
      //where("assignedTo", "==", userId),
      where("status", "==", "STITCHING_COMPLETED"),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const data = snapshot.docs
          .map((doc) => {
            const item = doc.data();
            const updateTime = item.updatedAt?.toDate() || new Date();

            return {
              id: doc.id,
              orderId: item.orderId || doc.id.slice(-6).toUpperCase(),
              customer: item.customer?.name || "Unknown",
              garment: item.product?.dressType || "Garment",
              style: item.product?.style || "Standard",
              completedTime: updateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              rawTime: updateTime,
            };
          })
          .filter((item) => item.rawTime >= startOfToday);

        setCompletedList(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  // Action 1: Revert to In Progress for fixes
  const handleRequestAlteration = async (orderId) => {
    const reason = window.prompt(
      "Enter alteration details (e.g., Neck too deep, shorten sleeves):",
    );
    if (reason === null || reason.trim() === "") return;

    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "NEEDS_ALTERATION",
        "workflow.needsAlteration": true,
        "workflow.alterationNote": reason,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          stage: "Alteration Requested",
          timestamp: new Date(),
          note: `Sent back for fix: ${reason}`,
        }),
      });
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setUpdating(null);
    }
  };

  // Action 2: Finalize for Delivery
  const handleNoAlteration = async (orderId) => {
    if (
      !window.confirm("Confirm this garment is perfect and ready for delivery?")
    )
      return;

    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "READY_FOR_DELIVERY",
        "workflow.progress": 100,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          stage: "Final Quality Check Passed",
          timestamp: new Date(),
          note: "Garment approved with no alterations. Ready for pickup.",
        }),
      });
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <Card className="p-12 flex flex-col items-center justify-center border-none shadow-none">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading history...</p>
      </Card>
    );

  return (
    <Card className="p-6 border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
            Post-Stitching Review
          </h2>
          <p className="text-xs text-slate-500">
            Decide if these garments need adjustments or are ready for customers
          </p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]">
          {completedList.length} Pending Review
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Garment</th>
              <th className="py-3 px-4">Finished At</th>
              <th className="py-3 px-4 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {completedList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-20 text-center text-slate-400 italic"
                >
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  No garments waiting for review.
                </td>
              </tr>
            ) : (
              completedList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600 uppercase">
                    #{item.id.slice(-6)}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {item.customer}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-slate-700">{item.garment}</p>
                    <p className="text-[10px] text-slate-400 uppercase">
                      {item.style}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {item.completedTime}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updating === item.id}
                        onClick={() => handleRequestAlteration(item.id)}
                        className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 text-[10px] font-bold uppercase"
                      >
                        <RefreshCcw className="w-3 h-3 mr-1.5" /> Alter
                      </Button>
                      <Button
                        size="sm"
                        disabled={updating === item.id}
                        onClick={() => handleNoAlteration(item.id)}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase px-3 shadow-sm"
                      >
                        {updating === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Perfect
                          </>
                        )}
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
  );
}

function Badge({ children, className }) {
  return (
    <span className={`px-2.5 py-1 rounded-full font-bold border ${className}`}>
      {children}
    </span>
  );
}
