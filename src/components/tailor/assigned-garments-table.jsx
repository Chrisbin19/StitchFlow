"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Loader2, PlayCircle, StopCircle, CheckCircle2, RefreshCcw, Image as ImageIcon, Ruler, AlertTriangle, Maximize2, MessageSquareText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AssignedGarmentsTable({ userId }) {
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [localInProgress, setLocalInProgress] = useState([]);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["CUTTING_COMPLETED", "CUTTING_COMPLETE", "Ready_For_Stitching", "NEEDS_ALTERATION"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const d = doc.data();
        let date = "No Date";
        const raw = d.workflow?.deliveryDate || d.deliveryDate;
        if (raw) {
          const dt = raw.toDate ? raw.toDate() : new Date(raw);
          date = dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        }
        return {
          id: doc.id, ...d,
          isAlteration: d.status === "NEEDS_ALTERATION",
          dispDate: date,
          dispCust: d.customer?.name || "Unknown",
          dispGarm: d.product?.dressType || "Garment",
          previewImage: d.product?.referenceImage || null,
        };
      });
      setGarments(tasks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleStartWork = (id) => setLocalInProgress(prev => [...prev, id]);

  const handleStopWork = (id) => {
    if (!window.confirm("Stop working on this task and return it to 'Ready'?")) return;
    setLocalInProgress(prev => prev.filter(i => i !== id));
  };

  const handleMarkComplete = async (orderId) => {
    if (!window.confirm("Mark this garment as finished?")) return;
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "STITCHING_COMPLETED",
        "workflow.progress": 100,
        isReadByAdmin: false,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({ stage: "Stitching Completed", timestamp: new Date(), note: "Garment finalized by tailor." }),
      });
      setLocalInProgress(prev => prev.filter(i => i !== orderId));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const rowV = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" } }),
  };

  return (
    <>
      <div style={{
        borderRadius: 14, border: '1px solid var(--adm-border)',
        background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between"
          style={{ borderBottom: '1px solid var(--adm-border)' }}>
          <h2 className="adm-font-display text-base font-black uppercase tracking-wide leading-none"
            style={{ color: 'var(--adm-text)', letterSpacing: '0.10em' }}>
            Work Queue
          </h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
            color: 'var(--adm-emerald)', background: 'transparent',
            border: '1px solid rgba(16,185,129,0.4)', textTransform: 'uppercase'
          }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            {garments.length} Active Tasks
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--adm-thead)' }}>
              <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
                {['', 'Garment ID', 'Customer', 'Type', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${i === 4 ? 'text-center' : i === 5 ? 'text-right' : 'text-left'}`}
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
              ) : garments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--adm-text-xs)' }}>
                    Queue is empty. Take a break!
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {garments.map((item, i) => {
                    const isProg = localInProgress.includes(item.id);
                    const isAlter = item.isAlteration;
                    const isHover = hoveredRow === item.id;

                    let bg = isHover ? 'var(--adm-card-hover)' : 'var(--adm-card)';
                    if (isHover) bg = 'var(--adm-card-hover)';
                    else if (isProg) bg = 'rgba(217,119,6,0.03)';
                    else if (isAlter) bg = 'rgba(220,38,38,0.03)';
                    else if (i % 2 === 1) bg = 'var(--adm-card-alt)';

                    let stChip = { bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)', br: 'rgba(5,150,105,0.25)', label: 'READY' };
                    if (isAlter) stChip = { bg: 'rgba(220,38,38,0.12)', text: 'var(--adm-red)', br: 'rgba(248,113,113,0.20)', label: 'BLOCKED' };
                    else if (isProg) stChip = { bg: 'rgba(217,119,6,0.12)', text: 'var(--adm-amber-c)', br: 'rgba(251,191,36,0.20)', label: 'IN PROGRESS' };

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
                            border: isProg ? 'none' : '1.5px solid rgba(255,255,255,0.20)',
                            background: isProg ? 'var(--adm-violet-c)' : 'transparent',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'default'
                          }}>
                            {isProg && (
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {isAlter && (
                              <div className="flex items-center justify-center w-5 h-5 rounded-full animate-pulse flex-shrink-0"
                                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }} title="Alteration">
                                <RefreshCcw className="w-2.5 h-2.5" style={{ color: 'var(--adm-red)' }} />
                              </div>
                            )}
                            <span style={{
                              fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                              background: 'var(--adm-badge)', border: '1px solid var(--adm-border)',
                              borderRadius: 6, padding: '2px 7px', color: 'var(--adm-violet-c)', letterSpacing: '0.07em'
                            }}>
                              #{item.id.slice(0, 6).toUpperCase()}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>{item.dispCust}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--adm-text-sm)' }}>{item.dispDate}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>{item.dispGarm}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--adm-text-xs)' }}>Standard fit</p>
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
                            <button
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-badge)'; e.currentTarget.style.color = 'var(--adm-blue-c)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--adm-text-sm)'; }}
                              onClick={() => { setSelectedGarment(item); setIsPreviewOpen(true); }}
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
                                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                  style={{ background: 'transparent', color: 'var(--adm-red)', border: '1px solid rgba(220,38,38,0.3)', cursor: 'pointer' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <StopCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleMarkComplete(item.id)} disabled={updating === item.id}
                                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
                                  style={{ background: 'var(--adm-emerald)', color: 'white', border: 'none', cursor: 'pointer' }}
                                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'}
                                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                  {updating === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Finish</>}
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
          <DialogHeader className="p-6 text-white" style={{ background: selectedGarment?.isAlteration ? 'var(--adm-orange-c)' : 'var(--adm-violet-c)' }}>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 adm-font-display">
              {selectedGarment?.isAlteration ? <RefreshCcw className="w-5 h-5" /> : <Ruler className="w-5 h-5" />}
              {selectedGarment?.isAlteration ? "Alteration Ticket" : "Sewing Instructions"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto w-full">
            <div className="relative aspect-video rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--adm-badge)', border: '1px solid var(--adm-border)' }}>
              {selectedGarment?.previewImage ? (
                <>
                  <img src={selectedGarment.previewImage} alt="Design" className="w-full h-full object-cover" />
                  <button onClick={() => window.open(selectedGarment.previewImage, "_blank")}
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

            {selectedGarment?.isAlteration && selectedGarment?.workflow?.alterationNote && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" style={{ color: 'var(--adm-red)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--adm-red)' }}>Alteration Fix</span>
                </div>
                <p className="text-sm font-bold italic" style={{ color: 'var(--adm-text)' }}>"{selectedGarment.workflow.alterationNote}"</p>
              </div>
            )}

            <div className="p-4 rounded-lg" style={{ background: 'var(--adm-badge)', border: '1px solid var(--adm-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="w-4 h-4" style={{ color: 'var(--adm-violet-c)' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--adm-text-sm)' }}>Requirements</span>
              </div>
              <p className="text-sm italic leading-relaxed" style={{ color: 'var(--adm-text-md)' }}>
                {selectedGarment?.specs?.notes || "No additional notes provided by customer."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2 w-full">
              {selectedGarment?.specs?.measurements && Object.entries(selectedGarment.specs.measurements).map(([key, val]) => (
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
