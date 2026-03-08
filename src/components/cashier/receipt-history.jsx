'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Receipt } from 'lucide-react';

const PAGE_SIZE = 10;

const rowV = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
};

export default function ReceiptHistory() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "ADVANCE_PAID"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      const data = [];
      snap.docs.forEach(doc => {
        const order = doc.data();
        (order.financial?.payments || []).forEach((p, idx) => {
          data.push({
            id: `${doc.id}-${idx}`,
            orderId: doc.id,
            customer: order.customer?.name || 'Unknown',
            amount: p.amount || 0,
            mode: p.mode || 'Cash',
            type: p.type || 'advance',
            collectedBy: p.collectedBy || 'Cashier',
            date: p.timestamp?.toDate
              ? p.timestamp.toDate().toLocaleDateString('en-IN') : 'N/A',
            time: p.timestamp?.toDate
              ? p.timestamp.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
          });
        });
      });
      setReceipts(data);
      setLoading(false);
    });
  }, []);

  const modeStyle = (mode) => {
    const m = { Cash: ['--cf-amber-c', '--cf-amber-bg', '--cf-amber-br'], UPI: ['--cf-violet-c', '--cf-violet-bg', '--cf-violet-br'], Card: ['--cf-blue-c', '--cf-blue-bg', '--cf-blue-br'] };
    const [c, bg, br] = (m[mode] || m.Cash);
    return { color: `var(${c})`, background: `var(${bg})`, border: `1px solid var(${br})`, borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };
  };

  const totalPages = Math.ceil(receipts.length / PAGE_SIZE);
  const paged = receipts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const cardShell = { borderRadius: 16, border: '1px solid var(--cf-border)', background: 'var(--cf-card)', boxShadow: 'var(--cf-shadow)', overflow: 'hidden' };

  const handleExport = () => {
    if (receipts.length === 0) {
      alert("No receipts to export");
      return;
    }

    const headers = ["Order ID", "Customer", "Amount", "Mode", "Type", "Collected By", "Date", "Time"];
    const csvRows = [headers.join(",")];

    receipts.forEach(r => {
      const row = [
        r.orderId,
        `"${r.customer}"`,
        r.amount,
        r.mode,
        r.type,
        `"${r.collectedBy}"`,
        r.date,
        r.time
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `StitchFlow_Receipts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={cardShell}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--cf-border)' }}>
        <div className="flex items-center gap-2.5">
          <Receipt className="w-4 h-4" style={{ color: 'var(--cf-text-sm)' }} />
          <h2 className="font-display text-sm font-black uppercase tracking-wide"
            style={{ color: 'var(--cf-text)' }}>Receipt History</h2>
          {receipts.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--cf-badge)', color: 'var(--cf-text-xs)', border: '1px solid var(--cf-border)' }}>
              {receipts.length}
            </span>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
          style={{ color: 'var(--cf-text-sm)', border: '1px solid var(--cf-border)', background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cf-badge)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14" style={{ color: 'var(--cf-text-xs)' }}>
          <Loader2 className="w-5 h-5 animate-spin mr-2" /><span className="text-sm">Loading receipts…</span>
        </div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-14 text-sm" style={{ color: 'var(--cf-text-xs)' }}>No receipts yet</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--cf-thead)', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
                  {['Order', 'Customer', 'Amount', 'Mode', 'Type', 'Collected By', 'Date & Time'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                      style={{ color: 'var(--cf-text-xs)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paged.map((r, i) => (
                    <motion.tr key={r.id} custom={i} variants={rowV}
                      initial="hidden" animate="visible"
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid var(--cf-divider)',
                        background: i % 2 === 0 ? 'var(--cf-card)' : 'var(--cf-card-alt)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--cf-card)' : 'var(--cf-card-alt)'}
                    >
                      {/* Order badge */}
                      <td className="py-3.5 px-4">
                        <span style={{ background: 'var(--cf-badge)', border: '1px solid var(--cf-border)', borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--cf-text)', letterSpacing: '0.07em' }}>
                          #{r.orderId.slice(0, 6).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap" style={{ color: 'var(--cf-text)' }}>
                        {r.customer}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="text-base font-black tracking-tight" style={{ color: 'var(--cf-emerald)' }}>
                          ₹{r.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Mode chip — colored */}
                      <td className="py-3.5 px-4">
                        <span style={modeStyle(r.mode)}>{r.mode}</span>
                      </td>

                      {/* Type — outlined */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-semibold capitalize px-2.5 py-1 rounded-full"
                          style={{ border: '1px solid var(--cf-border)', color: 'var(--cf-text-sm)', background: 'transparent' }}>
                          {r.type}
                        </span>
                      </td>

                      {/* Collected By — mini avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#f97316,#ec4899)' }}>
                            {r.collectedBy?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <span className="text-xs" style={{ color: 'var(--cf-text-md)' }}>{r.collectedBy}</span>
                        </div>
                      </td>

                      {/* Date/time split */}
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-semibold leading-none" style={{ color: 'var(--cf-text)' }}>{r.date}</p>
                        <p className="text-[11px] mt-0.5 leading-none" style={{ color: 'var(--cf-text-xs)' }}>{r.time}</p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--cf-border)' }}>
            <p className="text-xs" style={{ color: 'var(--cf-text-xs)' }}>
              Showing{' '}
              <span className="font-semibold" style={{ color: 'var(--cf-text-md)' }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, receipts.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold" style={{ color: 'var(--cf-text-md)' }}>{receipts.length}</span> receipts
            </p>
            <div className="flex gap-2">
              {['← Prev', 'Next →'].map((label, idx) => (
                <button key={label}
                  onClick={() => setPage(p => idx === 0 ? Math.max(0, p - 1) : Math.min(totalPages - 1, p + 1))}
                  disabled={idx === 0 ? page === 0 : page >= totalPages - 1}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'var(--cf-pag-bg)', border: '1px solid var(--cf-border)', color: 'var(--cf-text-md)' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--cf-pag-hover)'; }}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--cf-pag-bg)'}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
