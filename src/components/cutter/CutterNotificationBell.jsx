"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  Bell,
  Scissors,
  Clock,
  CheckCircle2,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

export default function CutterNotificationBell({ userId, onSelectTask }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for orders ready for cutting
    const q = query(
      collection(db, "orders"),
      // 🔥 Change "==" to "in" and provide an array of statuses
      where("status", "in", ["ADVANCE_PAID", "CUTTING_READY"]),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timeAgo: getTimeAgo(doc.data().createdAt?.seconds),
      }));
      // Only show items that haven't been "read" yet
      setNotifications(allTasks.filter((t) => t.isReadByCutter !== true));
    });

    return () => unsubscribe();
  }, []);

  const handleItemClick = async (task) => {
    setIsOpen(false);
    const orderRef = doc(db, "orders", task.id);
    await updateDoc(orderRef, { isReadByCutter: true });
    if (onSelectTask) onSelectTask(task);
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach((task) => {
      const docRef = doc(db, "orders", task.id);
      batch.update(docRef, { isReadByCutter: true });
    });
    await batch.commit();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-slate-200"
        >
          <Bell
            className={`w-5 h-5 ${notifications.length > 0 ? "text-indigo-600" : "text-slate-400"}`}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full items-center justify-center ring-2 ring-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[350px] p-0 shadow-2xl rounded-xl border-indigo-100 overflow-hidden"
      >
        {/* Header with Mark All button */}
        <div className="px-4 py-3 border-b bg-indigo-50/50 flex justify-between items-center">
          <h4 className="font-bold text-indigo-900 text-[10px] uppercase tracking-widest">
            New Alerts
          </h4>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>

        {/* Unread List */}
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-100 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">
                All caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleItemClick(task)}
                  className="p-4 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate uppercase">
                      {task.customer?.name}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {task.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {task.product?.dressType} • {task.product?.material}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* History Link - Immediate next step */}
        {/* <Link href={`/cutter/${userId || "default"}/history`}>
          <div className="p-3 bg-indigo-600 text-white text-center text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors cursor-pointer">
            VIEW ALL HISTORY <ChevronRight className="w-3 h-3" />
          </div>
        </Link> */}
      </PopoverContent>
    </Popover>
  );
}

function getTimeAgo(s) {
  if (!s) return "Now";
  const d = Math.floor(Date.now() / 1000) - s;
  if (d < 60) return "Now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}
