'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Loader2, Phone, AlertCircle } from 'lucide-react';
import PaymentCollectionDialog from './PaymentCollectionDialog';

const rowV = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] } }),
};

export default function PendingPaymentsTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "PAYMENT_PENDING"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const badge = { background: 'var(--cf-badge)', border: '1px solid var(--cf-border)', borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--cf-text)', letterSpacing: '0.07em' };
  const chip = { background: 'var(--cf-badge)', border: '1px solid var(--cf-border)', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cf-text-sm)' };

  return (
    <>
      <div style={{ borderRadius: 16, border: '1px solid var(--cf-border)', background: 'var(--cf-card)', boxShadow: 'var(--cf-shadow)', overflow: 'hidden' }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--cf-border)' }}>
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--cf-amber-c)' }} />
            <h2 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--cf-text)' }}>
              Pending Payments
            </h2>
            {orders.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--cf-amber-bg)', color: 'var(--cf-amber-c)', border: '1px solid var(--cf-amber-br)' }}>
                {orders.length}
              </span>
            )}
          </div>
          <span className="text-[11px]" style={{ color: 'var(--cf-text-xs)' }}>Advance collection needed</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12" style={{ color: 'var(--cf-text-xs)' }}>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--cf-text-xs)' }}>
            No pending payments 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cf-thead)', borderBottom: '1px solid var(--cf-border)' }}>
                  {['Order ID', 'Customer', 'Garment', 'Total', 'Advance Due', 'Balance', 'Status', ''].map(h => (
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
                      style={{
                        borderBottom: '1px solid var(--cf-divider)',
                        background: i % 2 === 0 ? 'var(--cf-card)' : 'var(--cf-card-alt)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cf-amber-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--cf-card)' : 'var(--cf-card-alt)'}
                    >
                      <td className="py-3.5 px-4"><span style={badge}>#{order.id.slice(0, 6).toUpperCase()}</span></td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-sm leading-none mb-0.5" style={{ color: 'var(--cf-text)' }}>
                          {order.customer?.name}
                        </p>
                        <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--cf-text-xs)' }}>
                          <Phone className="w-2.5 h-2.5" />{order.customer?.phone}
                        </p>
                      </td>
                      <td className="py-3.5 px-4"><span style={chip}>{order.product?.dressType}</span></td>
                      <td className="py-3.5 px-4 font-semibold whitespace-nowrap" style={{ color: 'var(--cf-text)' }}>
                        ₹{order.financial?.totalPrice?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold whitespace-nowrap" style={{ color: 'var(--cf-amber-c)' }}>
                        ₹{order.financial?.advanceAmount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap" style={{ color: 'var(--cf-text-sm)' }}>
                        ₹{order.financial?.balanceAmount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                          style={order.financial?.isPaid
                            ? { background: 'rgba(16,185,129,0.12)', color: 'var(--cf-emerald)', border: '1px solid rgba(16,185,129,0.25)' }
                            : { background: 'var(--cf-amber-bg)', color: 'var(--cf-amber-c)', border: '1px solid var(--cf-amber-br)' }
                          }>
                          {order.financial?.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          disabled={order.financial?.isPaid}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          style={{ background: 'var(--cf-text)' }}
                        >
                          <CreditCard className="w-3 h-3" />
                          Collect
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PaymentCollectionDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
