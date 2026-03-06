'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader2, ArrowRight, Calendar, Clock } from 'lucide-react';

export function UpcomingDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [arrowHovered, setArrowHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(db, "orders"), where("status", "not-in", ["Delivered", "Cancelled", "Pending"]));
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => {
          const d = doc.data();
          if (!d.workflow?.deliveryDate) return null;
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const due = new Date(d.workflow.deliveryDate); due.setHours(0, 0, 0, 0);
          const daysLeft = Math.ceil((due - today) / 86400000);
          return {
            id: doc.id,
            customer: d.customer?.name || 'Unknown',
            garment: d.product?.dressType || 'Item',
            day: due.toLocaleDateString('en-GB', { day: 'numeric' }),
            month: due.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
            daysLeft,
            urgent: daysLeft <= 3,
            rawDate: due,
          };
        }).filter(Boolean).sort((a, b) => a.rawDate - b.rawDate).slice(0, 5);
        setDeliveries(items);
      } finally { setLoading(false); }
    };
    fetchDeliveries();
  }, []);

  return (
    <div style={{
      borderRadius: 14,
      border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)',
      boxShadow: 'var(--adm-shadow)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--adm-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--adm-blue-bg)', border: '1px solid var(--adm-blue-br)' }}>
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--adm-blue-c)' }} />
          </div>
          <h2 className="adm-font-display text-sm font-black uppercase tracking-wide"
            style={{ color: 'var(--adm-text)' }}>Deadlines</h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--adm-badge)', color: 'var(--adm-text-sm)', border: '1px solid var(--adm-border)' }}>
          Next 5
        </span>
      </div>

      {/* Rows */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-10" style={{ color: 'var(--adm-text-xs)' }}>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-xs">Checking dates…</span>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-10 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
            No upcoming deadlines
          </div>
        ) : deliveries.map((item, i) => (
          <div key={item.id}
            onClick={() => router.push(`/admin/orders/${item.id}`)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', cursor: 'pointer',
              background: hovered === item.id ? 'var(--adm-badge)' : 'transparent',
              borderBottom: i < deliveries.length - 1 ? '1px solid var(--adm-divider)' : 'none',
              transition: 'background 200ms ease',
            }}
          >
            {/* Left: date box + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Date block */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: item.urgent ? 'rgba(220,38,38,0.15)' : 'var(--adm-badge)',
                border: item.urgent ? '1px solid rgba(248,113,113,0.20)' : '1px solid var(--adm-border)',
              }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: 14, lineHeight: 1,
                  color: item.urgent ? 'var(--adm-red)' : 'var(--adm-text)',
                }}>{item.day}</span>
                <span style={{
                  fontSize: 8, letterSpacing: '0.05em', lineHeight: 1, marginTop: 1,
                  color: item.urgent ? 'var(--adm-red)' : 'var(--adm-text-xs)'
                }}>
                  {item.month}
                </span>
              </div>

              {/* Customer + garment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', lineHeight: 1 }}>
                  {item.customer}
                </p>
                <p style={{ fontSize: 10, color: 'var(--adm-text-xs)', lineHeight: 1 }}>
                  {item.garment} · <span style={{ fontFamily: 'monospace' }}>#{item.id.slice(0, 4)}</span>
                </p>
              </div>
            </div>

            {/* Right: badge */}
            {item.urgent ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 999,
                color: 'var(--adm-red)',
                background: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(248,113,113,0.20)',
              }}>
                <Clock style={{ width: 10, height: 10 }} />
                {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d Late` : `${item.daysLeft} days`}
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text-sm)' }}>
                {item.daysLeft} days
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--adm-border)' }}>
        <button
          onMouseEnter={() => setArrowHovered(true)}
          onMouseLeave={() => setArrowHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            width: '100%', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'var(--adm-blue-c)',
            textDecoration: arrowHovered ? 'underline' : 'none',
            transition: 'text-decoration 150ms',
          }}
        >
          View Calendar
          <ArrowRight style={{
            width: 12, height: 12,
            transform: arrowHovered ? 'translateX(3px)' : 'translateX(0)',
            transition: 'transform 200ms ease',
          }} />
        </button>
      </div>
    </div>
  );
}