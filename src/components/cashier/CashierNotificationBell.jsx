'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { Bell, IndianRupee, Clock, CheckCircle2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function CashierNotificationBell({ onCollect }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Live listener for PAYMENT_PENDING orders
    useEffect(() => {
        // Only filter by status — no need for financial.isPaid check since
        // PAYMENT_PENDING already implies payment hasn't been collected.
        // This also avoids requiring a Firestore composite index.
        const q = query(
            collection(db, "orders"),
            where("status", "==", "PAYMENT_PENDING"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timeAgo: getTimeAgo(doc.data().createdAt?.seconds)
                }))
                // Safety net: only show orders with advance > 0
                .filter(order => (order.financial?.advanceAmount || 0) > 0);

            setNotifications(orders);
            setUnreadCount(orders.length);
        });

        return () => unsubscribe();
    }, []);

    const handleItemClick = (order) => {
        setIsOpen(false);
        if (onCollect) onCollect(order);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                >
                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary' : ''}`} />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
                                {unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[380px] p-0 shadow-2xl rounded-xl overflow-hidden">

                {/* Header */}
                <div className="px-4 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">Payment Alerts</h4>
                        {unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* List */}
                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">No pending payments!</p>
                            <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                                All advance payments have been collected.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => handleItemClick(note)}
                                    className="group flex gap-3 p-4 hover:bg-secondary/50 transition-all cursor-pointer items-start"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                                            <IndianRupee className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-sm font-bold text-foreground truncate pr-2">
                                                {note.customer?.name}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {note.timeAgo}
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                            {note.product?.dressType} • {note.product?.material}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                                Collect ₹{note.financial?.advanceAmount?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

function getTimeAgo(seconds) {
    if (!seconds) return 'Just now';
    const diff = Math.floor(Date.now() / 1000) - seconds;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
