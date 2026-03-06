"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User, Loader2, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReadyForDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "READY_FOR_DELIVERY")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        let displayDate = "Today";
        if (d.updatedAt) displayDate = d.updatedAt.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        return {
          id: doc.id, ...d,
          displayCustomer: d.customer?.name || "Unknown Customer",
          displayPhone: d.customer?.phone || "N/A",
          displayGarment: d.product?.dressType || "Garment",
          displayDate,
        };
      });
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const rowV = {
    hidden: { opacity: 0, x: 12 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" } }),
  };

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--adm-emerald)' }} />
          </div>
          <div>
            <h2 className="adm-font-display text-sm font-black uppercase tracking-wide leading-none mb-1"
              style={{ color: 'var(--adm-text)' }}>Final Pickup List</h2>
            <p className="text-[10px]" style={{ color: 'var(--adm-text-xs)' }}>
              Orders passed QC and ready for customer
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(5,150,105,0.10)', color: 'var(--adm-emerald)', border: '1px solid rgba(5,150,105,0.25)' }}>
          {orders.length} READY
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--adm-thead)' }}>
            <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
              {['Order ID', 'Customer Name', 'Phone', 'Garment Type'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: 'var(--adm-text-xs)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--adm-text-xs)' }}>
                  <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No items currently awaiting pickup.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {orders.map((order, i) => (
                  <motion.tr key={order.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--adm-divider)', background: 'var(--adm-card)', cursor: 'default' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.04)';
                      e.currentTarget.children[0].style.borderLeft = '3px solid var(--adm-emerald)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--adm-card)';
                      e.currentTarget.children[0].style.borderLeft = '3px solid transparent';
                    }}
                  >
                    <td className="px-6 py-4 transition-colors" style={{ borderLeft: '3px solid transparent' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                        background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                        borderRadius: 6, padding: '2px 7px', color: 'var(--adm-text)', letterSpacing: '0.07em'
                      }}>
                        #{order.id.slice(0, 6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--adm-text)' }}>
                      <User className="w-3.5 h-3.5" style={{ color: 'var(--adm-text-xs)' }} />
                      {order.displayCustomer}
                    </td>
                    <td className="px-6 py-4" style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--adm-text-sm)' }}>
                      {order.displayPhone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--adm-badge)', color: 'var(--adm-text-sm)', border: '1px solid var(--adm-border)' }}>
                        {order.displayGarment}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
