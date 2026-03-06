'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { PackageCheck, Truck, Loader2, IndianRupee, Phone, CheckCircle2 } from 'lucide-react';
import BalancePaymentDialog from './BalancePaymentDialog';

const ShimmerStyle = () => (
    <style>{`
    @keyframes shimmer-btn {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .btn-shimmer:hover {
      background-image: linear-gradient(90deg,#059669 0%,#34d399 40%,#059669 100%);
      background-size: 200% auto;
      animation: shimmer-btn 1.6s linear infinite;
    }
  `}</style>
);

const rowV = {
    hidden: { opacity: 0, x: -16 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export default function DeliveryQueue() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, "orders"),
            where("status", "==", "READY_FOR_DELIVERY"),
            orderBy("createdAt", "desc")
        );
        return onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
    }, []);

    const s = { // shorthand inline style builder
        card: { borderRadius: 16, border: '1px solid var(--cf-border)', background: 'var(--cf-card)', boxShadow: 'var(--cf-shadow)', overflow: 'hidden' },
        hdrBrd: { borderBottom: '1px solid var(--cf-border)' },
        thead: { background: 'var(--cf-thead)', borderBottom: '1px solid var(--cf-border)' },
        badge: { background: 'var(--cf-badge)', border: '1px solid var(--cf-border)', borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--cf-text)', letterSpacing: '0.07em' },
        chip: { background: 'var(--cf-badge)', border: '1px solid var(--cf-border)', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cf-text-sm)' },
    };

    return (
        <>
            <ShimmerStyle />
            <div style={s.card}>
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center" style={s.hdrBrd}>
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <Truck className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--cf-text)' }}>
                            Ready for Delivery
                        </h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--cf-emerald)', border: '1px solid rgba(5,150,105,0.2)' }}>
                        {orders.length} Orders
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12" style={{ color: 'var(--cf-text-xs)' }}>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm">Loading queue…</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-14 text-sm" style={{ color: 'var(--cf-text-xs)' }}>
                        <PackageCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold">No orders pending delivery</p>
                        <p className="text-xs mt-1 opacity-60">Orders appear here after admin approval</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={s.thead}>
                                    {['Order ID', 'Customer', 'Garment', 'Total', 'Advance', 'Balance Due', ''].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                                            style={{ color: 'var(--cf-text-xs)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {orders.map((order, i) => (
                                        <motion.tr key={order.id} custom={i} variants={rowV}
                                            initial="hidden" animate="visible"
                                            className="transition-colors"
                                            style={{
                                                borderBottom: '1px solid var(--cf-divider)',
                                                background: i % 2 === 0 ? 'var(--cf-card)' : 'var(--cf-card-alt)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,150,105,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--cf-card)' : 'var(--cf-card-alt)'}
                                        >
                                            <td className="py-3.5 px-4">
                                                <span style={s.badge}>#{order.id.slice(0, 6).toUpperCase()}</span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-sm leading-none mb-0.5" style={{ color: 'var(--cf-text)' }}>
                                                    {order.customer?.name}
                                                </p>
                                                <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--cf-text-xs)' }}>
                                                    <Phone className="w-2.5 h-2.5" />{order.customer?.phone}
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span style={s.chip}>{order.product?.dressType}</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold whitespace-nowrap" style={{ color: 'var(--cf-text)' }}>
                                                ₹{order.financial?.totalPrice?.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 font-medium whitespace-nowrap text-emerald-500">
                                                ₹{order.financial?.advanceAmount?.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="text-lg font-black tracking-tight leading-none whitespace-nowrap"
                                                    style={{ color: 'var(--cf-red)' }}>
                                                    ₹{order.financial?.balanceAmount?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button onClick={() => setSelectedOrder(order)}
                                                    className="btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white whitespace-nowrap"
                                                    style={{ background: '#059669', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
                                                >
                                                    <IndianRupee className="w-3 h-3" />
                                                    Collect &amp; Deliver
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}

                                    {/* Empty-state strip when < 3 rows */}
                                    {orders.length < 3 && (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: orders.length * 0.06 + 0.1, duration: 0.4 }}
                                        >
                                            <td colSpan={7} className="px-4 py-5">
                                                <div className="flex items-center justify-center gap-2.5 rounded-xl py-4"
                                                    style={{ border: '1.5px dashed var(--cf-border)', color: 'var(--cf-text-xs)' }}>
                                                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="text-xs font-medium">No more pending deliveries right now</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <BalancePaymentDialog
                order={selectedOrder}
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </>
    );
}
