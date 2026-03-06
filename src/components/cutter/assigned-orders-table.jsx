"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Loader2, Calendar, CheckCircle2, PlayCircle, StopCircle, ImageIcon, Maximize2, Ruler } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AssignedOrdersTable({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [localInProgress, setLocalInProgress] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    // Also include CUTTING_READY and In_Cutting based on normal workflows
    const q = query(collection(db, "orders"), where("status", "in", ["ADVANCE_PAID", "CUTTING_READY", "In_Cutting"]), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const rawDate = data.workflow?.deliveryDate || data.deliveryDate;
        let dDate = "No Date", isDueToday = false, isOverdue = false;

        if (rawDate) {
          const dt = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
          dDate = dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
          const dtMidnight = new Date(dt); dtMidnight.setHours(0, 0, 0, 0);
          if (dtMidnight.getTime() === today.getTime()) isDueToday = true;
          else if (dtMidnight < today) isOverdue = true;
        }

        return {
          id: doc.id, ...data,
          displayDeliveryDate: dDate,
          isDueToday, isOverdue,
          priority: data.workflow?.priority || "Normal",
          previewImage: data.product?.referenceImage || null,
          displayCustomer: data.customer?.name || "Unknown Customer",
          displayGarment: data.product?.dressType || "Garment",
        };
      });
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartWork = async (orderId) => {
    setLocalInProgress((prev) => [...prev, orderId]);
    try {
      if (orders.find(o => o.id === orderId)?.status !== "In_Cutting") {
        await updateDoc(doc(db, "orders", orderId), { status: "In_Cutting" });
      }
    } catch (e) { }
  };

  const handleStopWork = (orderId) => {
    setLocalInProgress((prev) => prev.filter((id) => id !== orderId));
  };

  const handleMarkComplete = async (orderId) => {
    if (!window.confirm("Is the cutting complete?")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "CUTTING_COMPLETED",
        "workflow.progress": 30,
        timeline: arrayUnion({ stage: "Cutting Completed", timestamp: new Date(), note: "Fabric cut and prepared." }),
      });
      handleStopWork(orderId);
    } catch (error) { console.error("Update failed:", error); }
  };

  const rowV = {
    hidden: { opacity: 0, y: 5 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
  };

  return (
    <>
      <div style={{
        borderRadius: 14, border: '1px solid var(--adm-border)',
        background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
      }}>
        <div className="px-6 py-4 flex flex-wrap items-center justify-between"
          style={{ borderBottom: '1px solid var(--adm-border)' }}>
          <h2 className="adm-font-display font-black uppercase tracking-[0.10em] text-[1.1rem]"
            style={{ color: 'var(--adm-text)' }}>
            Cutting Production
          </h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
            color: 'var(--adm-violet-c)', background: 'transparent',
            border: '1px solid rgba(124,58,237,0.4)', textTransform: 'uppercase'
          }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--adm-violet-c)' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--adm-violet-c)' }} />
            </span>
            {orders.length} Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--adm-thead)' }}>
              <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
                {['', 'Order ID', 'Customer', 'Delivery Date', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap ${i === 4 ? 'text-center' : i === 5 ? 'text-right' : 'text-left'}`}
                    style={{ color: 'var(--adm-text-xs)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading queue…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--adm-text-xs)' }}>
                    Queue empty. No garments mapped for cutting.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {orders.map((item, i) => {
                    const isProg = localInProgress.includes(item.id) || item.status === "In_Cutting";
                    const isHover = hoveredRow === item.id;

                    let bg = isHover ? 'var(--adm-card-hover)' : 'var(--adm-card)';
                    if (isHover) bg = 'var(--adm-card-hover)';
                    else if (i % 2 === 1) bg = 'var(--adm-table-alt-row)';

                    let stChip = { bg: 'rgba(124,58,237,0.10)', text: 'var(--adm-violet-c)', br: 'rgba(124,58,237,0.25)', label: 'CUTTING READY' };
                    if (isProg) stChip = { bg: 'rgba(217,119,6,0.12)', text: 'var(--adm-amber-c)', br: 'rgba(251,191,36,0.20)', label: 'IN PROGRESS' };

                    return (
                      <motion.tr key={item.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                        className="transition-colors duration-200"
                        onMouseEnter={() => setHoveredRow(item.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          background: bg,
                          borderBottom: '1px solid var(--adm-divider)',
                          cursor: 'default', borderLeft: isHover ? '3px solid var(--adm-violet-c)' : '3px solid transparent'
                        }}
                      >
                        {/* Checkbox cell */}
                        <td className="px-5 py-4 w-12 text-center" style={{ borderLeft: '3px solid transparent' }}>
                          <button style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0, padding: 0,
                            border: isProg ? 'none' : '1.5px solid var(--adm-border)',
                            background: isProg ? 'var(--adm-violet-c)' : 'transparent',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}>
                            {isProg && (
                              <svg width="10" height="10" viewBox="0 0 9 9" fill="none">
                                <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span style={{
                            fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                            background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                            borderRadius: 6, padding: '2px 7px', color: 'var(--adm-violet-c)', letterSpacing: '0.07em'
                          }}>
                            #{item.id.slice(0, 6).toUpperCase()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>{item.displayCustomer}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--adm-text-sm)' }}>{item.displayGarment}</p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" style={{ color: item.isOverdue ? 'var(--adm-red)' : 'var(--adm-text-xs)' }} />
                              <span className="font-medium text-[11px]" style={{ color: item.isOverdue ? 'var(--adm-red)' : (item.isDueToday ? 'var(--adm-amber-c)' : 'var(--adm-text-sm)'), fontWeight: (item.isOverdue || item.isDueToday) ? 800 : 500 }}>
                                {item.displayDeliveryDate}
                              </span>
                            </div>
                            {item.priority === "Urgent" && (
                              <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', background: 'rgba(220,38,38,0.1)', color: 'var(--adm-red)', padding: '1px 4px', borderRadius: 4, width: 'fit-content' }}>
                                Urgent
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span style={{
                            display: 'inline-block', fontSize: 9, fontWeight: 700, padding: '4px 10px',
                            borderRadius: 999, letterSpacing: '0.06em',
                            background: stChip.bg, color: stChip.text, border: `1px solid ${stChip.br}`
                          }}>
                            {stChip.label}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-badge)'; e.currentTarget.style.color = 'var(--adm-blue-c)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--adm-text-sm)'; }}
                              onClick={() => { setSelectedOrder(item); setIsPreviewOpen(true); }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {!isProg ? (
                              <button onClick={() => handleStartWork(item.id)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all"
                                style={{ background: 'transparent', color: 'var(--adm-violet-c)', border: '1.5px solid var(--adm-violet-c)', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-violet-c)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--adm-violet-c)'; e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                <PlayCircle className="w-3.5 h-3.5" /> START
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => handleStopWork(item.id)} title="Stop"
                                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm"
                                  style={{ background: 'var(--adm-orange-bg)', color: 'var(--adm-orange-c)', border: `1px solid var(--adm-orange-br)`, cursor: 'pointer' }}
                                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  <StopCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleMarkComplete(item.id)}
                                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
                                  style={{ background: 'var(--adm-emerald)', color: 'white', border: 'none', cursor: 'pointer' }}
                                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'}
                                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Finish
                                </button>
                              </div>
                            )}
                          </div>
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl" style={{ background: 'var(--adm-card)' }}>
          <DialogHeader className="p-6 text-white" style={{ background: 'var(--adm-violet-c)' }}>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 adm-font-display">
              <Ruler className="w-5 h-5" /> Design & Specs
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto w-full">
            <div className="relative aspect-video rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--adm-badge)', border: '1px solid var(--adm-border)' }}>
              {selectedOrder?.previewImage ? (
                <>
                  <img src={selectedOrder.previewImage} alt="Design" className="w-full h-full object-cover" />
                  <button onClick={() => window.open(selectedOrder.previewImage, "_blank")}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-black/50 text-white hover:bg-black/70">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center opacity-30" style={{ color: 'var(--adm-text)' }}>
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Image</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2 w-full">
              {selectedOrder?.specs?.measurements && Object.entries(selectedOrder.specs.measurements).map(([key, val]) => (
                <div key={key} className="p-3 rounded-lg flex justify-between items-center shadow-sm"
                  style={{ background: 'var(--adm-card-alt)', border: '1px solid var(--adm-border)' }}>
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--adm-text-xs)' }}>{key}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: 'var(--adm-violet-c)' }}>{val || "0"}"</span>
                </div>
              ))}
            </div>

            <button className="w-full h-12 rounded-xl font-bold shadow-lg text-white uppercase text-xs tracking-wider transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--adm-text)', border: 'none' }}
              onClick={() => setIsPreviewOpen(false)}>
              Close Details
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
