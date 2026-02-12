'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase"; 
import { collection, query, where, onSnapshot, orderBy, limit, writeBatch, doc, updateDoc } from "firebase/firestore";
import { Bell, Scissors, Check, Clock, CheckCircle2, X } from 'lucide-react'; // Added 'X' icon
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  // 1. LIVE LISTENER
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["Pending", "Pending_Approval"]),
      where("isRead", "==", false),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timeAgo: getTimeAgo(doc.data().createdAt?.seconds)
      }));
      
      setNotifications(newNotes);
      setUnreadCount(newNotes.length);
    });

    return () => unsubscribe();
  }, []);

  // 2. MARK ALL READ (Batch Update)
  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    setClearing(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach((note) => {
        const docRef = doc(db, "orders", note.id);
        batch.update(docRef, { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setClearing(false);
    }
  };

  // 3. NEW: DELETE SINGLE NOTIFICATION
  const handleDeleteNotification = async (e, orderId) => {
    e.stopPropagation(); // Prevent triggering the row click (Navigation)
    
    // Optimistic UI Update (Instant removal from list before DB confirms)
    setNotifications(prev => prev.filter(n => n.id !== orderId));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { isRead: true });
    } catch (error) {
      console.error("Failed to dismiss notification", error);
      // Optional: Re-fetch or revert state if error occurs
    }
  };

  const handleItemClick = (orderId) => {
    setIsOpen(false);
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-10 h-10 rounded-full hover:bg-indigo-50 transition-all duration-200"
        >
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-600' : 'text-slate-500'}`} />
          
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-[380px] p-0 shadow-2xl border-slate-100 rounded-xl overflow-hidden bg-white">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800">Inbox</h4>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={unreadCount === 0 || clearing}
            className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 h-auto p-1 px-2"
            onClick={handleMarkAllRead}
          >
            {clearing ? "Clearing..." : "Mark all read"}
            {!clearing && <Check className="w-3 h-3 ml-1" />}
          </Button>
        </div>

        {/* List Content */}
        <ScrollArea className="h-[350px] bg-slate-50/30">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-900">All caught up!</p>
              <p className="text-xs text-slate-500 max-w-[200px] mt-1">
                You have zero pending alerts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((note) => (
                <div 
                  key={note.id} 
                  onClick={() => handleItemClick(note.id)}
                  className="group flex gap-3 p-4 hover:bg-white transition-all cursor-pointer relative bg-white items-start"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Scissors className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-sm font-bold text-slate-800 truncate pr-2">
                        {note.customer?.name}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {note.timeAgo}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-2 line-clamp-1">
                      {note.product?.dressType} • {note.product?.material}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        Action Required
                      </span>
                    </div>
                  </div>

                  {/* THE DELETE BUTTON (Only visible on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      onClick={(e) => handleDeleteNotification(e, note.id)}
                      title="Dismiss notification"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-2 border-t border-slate-100 bg-white">
          <Button 
            variant="ghost" 
            className="w-full text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 justify-center h-9"
            onClick={() => router.push('/admin/orders')}
          >
            View Full History
          </Button>
        </div>

      </PopoverContent>
    </Popover>
  );
}

// Helper Function
function getTimeAgo(seconds) {
  if (!seconds) return 'Just now';
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}