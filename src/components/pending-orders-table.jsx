'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Loader2, Calendar, ArrowRight } from 'lucide-react';

/* Status → CSS variable tokens */
const statusStyle = (status) => {
  const map = {
    'Pending': { bg: 'var(--adm-amber-bg)', text: 'var(--adm-amber-c)', br: 'var(--adm-amber-br)' },
    'Pending_Approval': { bg: 'var(--adm-orange-bg)', text: 'var(--adm-orange-c)', br: 'var(--adm-orange-br)' },
    'PAYMENT_PENDING': { bg: 'var(--adm-blue-bg)', text: 'var(--adm-blue-c)', br: 'var(--adm-blue-br)' },
    'Ready_For_Cutting': { bg: 'var(--adm-blue-bg)', text: 'var(--adm-blue-c)', br: 'var(--adm-blue-br)' },
    'In_Sewing': { bg: 'var(--adm-violet-bg)', text: 'var(--adm-violet-c)', br: 'var(--adm-violet-br)' },
    'Quality_Check': { bg: 'var(--adm-violet-bg)', text: 'var(--adm-violet-c)', br: 'var(--adm-violet-br)' },
    'Ready_To_Deliver': { bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)', br: 'rgba(5,150,105,0.20)' },
    'READY_FOR_DELIVERY': { bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)', br: 'rgba(5,150,105,0.20)' },
    'Delivered': { bg: 'var(--adm-badge)', text: 'var(--adm-text-xs)', br: 'var(--adm-border)' },
  };
  return map[status] || { bg: 'var(--adm-badge)', text: 'var(--adm-text-xs)', br: 'var(--adm-border)' };
};

const daysColor = (days) => {
  if (days < 0) return 'var(--adm-red)';
  if (days <= 2) return 'var(--adm-orange-c)';
  return 'var(--adm-emerald)';
};

const rowV = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03 + 0.35, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
};

export function PendingOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(doc => {
        const d = doc.data();
        const diff = d.workflow?.deliveryDate
          ? Math.ceil((new Date(d.workflow.deliveryDate) - new Date()) / 86400000) : 0;
        return { id: doc.id, ...d, daysLeft: diff };
      }));
      setLoading(false);
    });
  }, []);

  const shell = {
    borderRadius: 14, border: '1px solid var(--adm-border)',
    background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
  };

  return (
    <div style={shell}>
      {/* Section header */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <div className="flex items-center gap-3">
          <h2 className="adm-font-display text-sm font-black uppercase tracking-wide"
            style={{ color: 'var(--adm-text)' }}>Recent Active Orders</h2>
          {/* Live Feed pill */}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ border: '1px solid rgba(5,150,105,0.35)', color: 'var(--adm-emerald)', background: 'transparent' }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live Feed
          </span>
        </div>
        <button onClick={() => router.push('/admin/orders')}
          className="flex items-center gap-1 text-xs font-semibold transition-colors"
          style={{ color: 'var(--adm-blue-c)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
          View All Orders <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--adm-thead)', position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
              {['Order ID', 'Customer', 'Garment', 'Status', 'Timeline', 'Amount', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: 'var(--adm-text-xs)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center gap-2" style={{ color: 'var(--adm-text-xs)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm"
                  style={{ color: 'var(--adm-text-xs)' }}>
                  No orders found. Time to start stitching!
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {orders.map((order, i) => {
                  const st = statusStyle(order.status);
                  return (
                    <motion.tr key={order.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                      className="cursor-pointer"
                      style={{
                        borderBottom: '1px solid var(--adm-divider)',
                        background: i % 2 === 0 ? 'var(--adm-card)' : 'var(--adm-card-alt)',
                      }}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--adm-card)' : 'var(--adm-card-alt)'}
                    >
                      {/* Order ID */}
                      <td className="px-5 py-3.5">
                        <span style={{
                          fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                          background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                          borderRadius: 6, padding: '2px 7px', color: 'var(--adm-text)', letterSpacing: '0.07em'
                        }}>
                          #{order.id.slice(0, 6).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-sm leading-none mb-0.5" style={{ color: 'var(--adm-text)' }}>
                          {order.customer?.name}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--adm-text-xs)' }}>
                          {order.customer?.phone}
                        </p>
                      </td>

                      {/* Garment */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-sm leading-none mb-0.5" style={{ color: 'var(--adm-text)' }}>
                          {order.product?.dressType}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--adm-text-xs)' }}>
                          {order.product?.material}
                        </p>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                          style={{ color: st.text, background: st.bg, border: `1px solid ${st.br}` }}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Timeline */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--adm-text-xs)' }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--adm-text-md)' }}>
                              {order.workflow?.deliveryDate
                                ? new Date(order.workflow.deliveryDate).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-[10px] font-bold" style={{ color: daysColor(order.daysLeft) }}>
                              {order.daysLeft} days left
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="adm-font-display font-bold text-sm"
                          style={{ color: 'var(--adm-text)' }}>
                          {order.financial?.totalPrice ? `₹${order.financial.totalPrice}` : '—'}
                        </span>
                      </td>

                      {/* Eye action */}
                      <td className="px-5 py-3.5 text-center">
                        <button className="w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--adm-text-sm)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-blue-bg)'; e.currentTarget.style.color = 'var(--adm-blue-c)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--adm-text-sm)'; }}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}