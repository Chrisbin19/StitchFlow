'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AssignedGarmentsTable({ userId }) {
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Track which item is being updated
  const router = useRouter();

  // 1. FETCH ASSIGNED TASKS (Real-time)
  useEffect(() => {
    if (!userId) return;

    // Query: Find orders where 'assignedTo' matches the logged-in user
    // Note: Ensure your Firestore 'orders' collection has an 'assignedTo' field
    const q = query(
      collection(db, "orders"),
      where("assignedTo", "==", userId),
      where("status", "in", ["Ready_For_Cutting", "In_Sewing", "Cutting_Done"]) // Only show active tasks
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGarments(tasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // 2. HANDLE STATUS UPDATE (Mark as Done)
  const handleMarkReady = async (orderId) => {
    setUpdating(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      
      // Update status to move it to the Manager's QC list
      await updateDoc(orderRef, {
        status: "Quality_Check", 
        completedAt: serverTimestamp() // Record when they finished
      });
      
      // Optional: You could show a toast notification here
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  // Helper to format date safely
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    // Handle both Firestore Timestamp and string dates
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-0 border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          My Work Queue
        </h2>
        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
          {garments.length} Active Tasks
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-3 px-6 w-10"><Checkbox /></th>
              <th className="py-3 px-6">Task ID</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Garment</th>
              <th className="py-3 px-6">Deadline</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your tasks...
                  </div>
                </td>
              </tr>
            ) : garments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle className="w-8 h-8 opacity-20" />
                    <p>No active tasks assigned to you.</p>
                  </div>
                </td>
              </tr>
            ) : (
              garments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-6">
                    <Checkbox />
                  </td>
                  
                  <td className="py-3 px-6 font-mono text-xs font-bold text-slate-500">
                    #{item.id.slice(0, 6).toUpperCase()}
                  </td>
                  
                  <td className="py-3 px-6 font-medium text-slate-900">
                    {item.customer?.name || "Unknown"}
                  </td>
                  
                  <td className="py-3 px-6">
                    <div className="flex flex-col">
                      <span className="text-slate-800 font-medium">{item.product?.dressType}</span>
                      <span className="text-[10px] text-slate-400">{item.product?.material}</span>
                    </div>
                  </td>

                  <td className="py-3 px-6">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                       // Logic: Highlight if due date is close
                       new Date(item.workflow?.deliveryDate) < new Date() 
                       ? 'bg-red-50 text-red-600 border-red-100'
                       : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                      {formatDate(item.workflow?.deliveryDate)}
                    </span>
                  </td>

                  <td className="py-3 px-6 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      item.status === 'In_Sewing' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      item.status === 'Ready_For_Cutting' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="View Details"
                        onClick={() => router.push(`/staff/tasks/${item.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === item.id}
                        onClick={() => handleMarkReady(item.id)}
                        className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors"
                        title="Mark as Ready for QC"
                      >
                        {updating === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            <span className="text-xs font-bold">Done</span>
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