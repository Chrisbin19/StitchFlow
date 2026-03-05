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
import {
  Scissors,
  CheckCircle,
  Clock,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CutterNotificationHistory({ params }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "ADVANCE_PAID"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/cutter/${params.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-2 text-slate-500 hover:text-indigo-600"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Workspace
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              TASK HISTORY
            </h1>
            <p className="text-sm text-slate-500">
              View all orders assigned to cutting
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Total Tasks
            </p>
            <p className="text-xl font-black text-indigo-600">
              {history.length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
              <Scissors className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                No cutting history found.
              </p>
            </div>
          ) : (
            history.map((task) => (
              <div
                key={task.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${task.isReadByCutter ? "bg-slate-50 text-slate-300" : "bg-indigo-600 text-white shadow-lg shadow-indigo-100"}`}
                  >
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none mb-2">
                      {task.customer?.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />{" "}
                        {new Date(
                          task.createdAt?.seconds * 1000,
                        ).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">
                        {task.product?.dressType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    {task.isReadByCutter ? (
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 border border-slate-100 px-2 py-0.5 rounded-full bg-slate-50">
                        <CheckCircle className="w-3 h-3" /> ARCHIVED
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full animate-pulse">
                        NEW TASK
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-400">
                    #{task.id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
