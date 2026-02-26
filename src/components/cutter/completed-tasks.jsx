"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, Package } from "lucide-react";

export default function CompletedTasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Set the time boundary for "Today" (Midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Query Firestore for completed orders assigned to this user
    // Note: This requires a composite index in Firestore for assignedTo + status + updatedAt
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId),
      where("status", "in", ["Completed", "STITCHING_COMPLETED"]),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const updatedTime = data.updatedAt?.toDate();

            return {
              id: doc.id,
              orderId: data.orderId || doc.id.slice(-6).toUpperCase(),
              garment: data.product?.dressType || "Garment",
              fabric: `${data.product?.material || ""} ${data.product?.fabricColor || ""}`,
              quantity: data.product?.quantity || 1,
              // Format the Firestore timestamp to a readable time
              completedTime: updatedTime
                ? updatedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A",
              timestamp: updatedTime,
              quality: data.qualityControl?.status || "Good",
            };
          })
          // Filter for tasks completed only today
          .filter((task) => task.timestamp >= startOfToday);

        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching completed tasks:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm text-slate-500">Updating history...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Completed Today</h2>
          <p className="text-xs text-slate-500">
            Your successful deliveries for this shift
          </p>
        </div>
        <div className="bg-emerald-50 p-2 rounded-full">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Garment</th>
              <th className="py-3 px-4">Fabric</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4 text-right">Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 italic">
                    No tasks finished yet today.
                  </p>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600">
                    #{task.orderId}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {task.garment}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-xs">
                    {task.fabric}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-700">
                    {task.quantity}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {task.completedTime}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        task.quality === "Excellent"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {task.quality}
                    </span>
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
