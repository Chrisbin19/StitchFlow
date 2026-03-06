"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from "@/firebase";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, BedDouble as Needle, DollarSign, Trash2, Edit2,
  Loader2, User, Shield, Mail, Save, X, Briefcase, Search, ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Helper to generate consistent avatar gradients purely from initials
const getGradient = (init) => {
  const code = init.charCodeAt(0) || 65;
  if (code % 4 === 0) return 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)'; // Violet
  if (code % 4 === 1) return 'linear-gradient(135deg, #059669 0%, #064E3B 100%)'; // Emerald
  if (code % 4 === 2) return 'linear-gradient(135deg, #F59E0B 0%, #78350F 100%)'; // Amber
  return 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)'; // Blue
};

export function TeamRoster() {
  const [workers, setWorkers] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkers(snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().fullName || "Unknown Staff",
        email: doc.data().email || "No Email",
        role: doc.data().role || "Tailor",
        status: doc.data().status || "Active"
      })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "in", ["Ready_For_Cutting", "In_Cutting", "In_Sewing", "Quality_Check"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = {};
      snapshot.docs.forEach(doc => {
        const userId = doc.data().assignedTo;
        if (userId) counts[userId] = (counts[userId] || 0) + 1;
      });
      setWorkloads(counts);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteWorker = async (workerId) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      try { await deleteDoc(doc(db, "users", workerId)); }
      catch (error) { console.error(error); alert("Failed to delete."); }
    }
  };

  const handleEditClick = (worker) => {
    setEditingWorker({ ...worker, name: worker.name, email: worker.email, role: worker.role });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingWorker || !editingWorker.name) return alert("Name required");
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", editingWorker.id), {
        name: editingWorker.name, email: editingWorker.email, role: editingWorker.role,
      });
      setIsEditOpen(false); setEditingWorker(null);
    } catch (error) {
      console.error(error); alert("Failed to update.");
    } finally { setSaving(false); }
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [workers, searchQuery]);

  const rowV = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.3 } }),
  };

  return (
    <>
      <div style={{
        borderRadius: 14, border: '1px solid var(--adm-border)',
        background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden'
      }}>
        <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-4" style={{ borderBottom: '1px solid var(--adm-border)' }}>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="adm-font-display text-[1.15rem] font-bold" style={{ color: 'var(--adm-text)' }}>Team Roster</h2>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 800, padding: '3px 8px',
                borderRadius: 999, background: 'transparent', color: 'var(--adm-blue-c)',
                border: '1px solid rgba(37,99,235,0.4)'
              }}>{workers.length} Members</span>
            </div>
            <p className="text-[11px] font-medium mt-1" style={{ color: 'var(--adm-text-sm)' }}>Manage your staff and permissions</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--adm-text-xs)' }} />
            <input type="text" placeholder="Search roster..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: 200, padding: '8px 14px 8px 34px', borderRadius: 999, fontSize: '0.8rem',
                background: 'var(--adm-input-bg)', border: '1px solid var(--adm-border)',
                color: 'var(--adm-text)', outline: 'none', transition: 'all 200ms ease'
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--adm-blue-c)'; e.target.style.background = 'var(--adm-card)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--adm-border)'; e.target.style.background = 'var(--adm-input-bg)'; }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--adm-thead)' }}>
              <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
                {['DETAILS', 'CONTACT', 'ROLE', 'LOAD', 'ACTIONS'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap ${i === 3 ? 'text-center' : i === 4 ? 'text-right' : 'text-left'}`}
                    style={{ color: 'var(--adm-text-xs)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 opacity-50 block mx-auto mb-2" />
                    Loading roster...
                  </td>
                </tr>
              ) : filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs" style={{ color: 'var(--adm-text-xs)' }}>
                    No staff members found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredWorkers.map((worker, i) => {
                    const r = worker.role?.toLowerCase() || 'staff';
                    let rStyle = { bg: 'rgba(5,150,105,0.10)', text: 'var(--adm-emerald)', br: 'rgba(5,150,105,0.25)', icon: <Needle className="w-3.5 h-3.5 mr-1.5" /> };
                    if (r === 'cutter') rStyle = { bg: 'rgba(249,115,22,0.10)', text: 'var(--adm-orange-c)', br: 'rgba(249,115,22,0.25)', icon: <Scissors className="w-3.5 h-3.5 mr-1.5" /> };
                    else if (r === 'cashier') rStyle = { bg: 'rgba(124,58,237,0.10)', text: 'var(--adm-violet-c)', br: 'rgba(124,58,237,0.25)', icon: <DollarSign className="w-3.5 h-3.5 mr-1.5" /> };
                    else if (r === 'admin' || r === 'manager') rStyle = { bg: 'rgba(37,99,235,0.10)', text: 'var(--adm-blue-c)', br: 'rgba(37,99,235,0.25)', icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> };

                    const load = workloads[worker.id] || 0;
                    const init = worker.name.charAt(0).toUpperCase();

                    return (
                      <motion.tr key={worker.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                        className="transition-colors duration-200 group context-row"
                        style={{
                          background: i % 2 === 1 ? 'var(--adm-table-alt)' : 'var(--adm-card)',
                          borderBottom: '1px solid var(--adm-divider)', borderLeft: '3px solid transparent'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = rStyle.bg;
                          e.currentTarget.style.borderLeftColor = rStyle.text;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = i % 2 === 1 ? 'var(--adm-table-alt)' : 'var(--adm-card)';
                          e.currentTarget.style.borderLeftColor = 'transparent';
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                              style={{ background: getGradient(init) }}>
                              <span className="adm-font-display font-black text-[13px]">{init}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)' }}>{worker.name}</p>
                              <p className="text-[10px] mt-0.5 mt-1" style={{ color: 'var(--adm-text-xs)' }}>
                                <span style={{ fontFamily: 'monospace', background: 'var(--adm-badge)', border: '1px solid var(--adm-border)', padding: '1px 4px', borderRadius: 4, letterSpacing: '0.05em' }}>
                                  ID: {worker.id.slice(0, 4)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors cursor-pointer" style={{ color: 'var(--adm-text-sm)' }}>
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--adm-text-xs)' }} />
                            <span className="text-xs font-medium group-hover:underline">{worker.email}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '3px 8px',
                            borderRadius: 999, letterSpacing: '0.04em', textTransform: 'capitalize',
                            background: rStyle.bg, color: rStyle.text, border: `1px solid ${rStyle.br}`
                          }}>
                            {rStyle.icon} {worker.role}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          {load > 0 ? (
                            <div className="inline-flex items-center gap-1.5" style={{ background: 'var(--adm-badge)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--adm-border)' }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: rStyle.text }} />
                              <span className="font-bold text-[11px]" style={{ color: 'var(--adm-text-sm)' }}>{load} orders</span>
                            </div>
                          ) : (
                            <span className="font-bold" style={{ color: 'var(--adm-text-xs)' }}>—</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--adm-blue-c)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--adm-badge)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              title="Edit member"
                              onClick={() => handleEditClick(worker)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--adm-text-xs)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = 'var(--adm-red)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--adm-text-xs)' }}
                              title="Remove member"
                              onClick={() => handleDeleteWorker(worker.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-sm p-6 overflow-hidden border border-[var(--adm-border)] shadow-2xl" style={{ background: 'var(--adm-card)', borderRadius: 16 }}>
          <h3 className="adm-font-display text-xl font-bold mb-4" style={{ color: 'var(--adm-text)' }}>Edit Member</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[0.78rem] font-medium mb-1.5 uppercase tracking-widest" style={{ color: 'var(--adm-text-xs)' }}>Name</label>
              <input type="text" value={editingWorker?.name || ''} onChange={e => setEditingWorker({ ...editingWorker, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', background: 'var(--adm-input-bg)', border: '1.5px solid var(--adm-border)', color: 'var(--adm-text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--adm-blue-c)'} onBlur={e => e.target.style.borderColor = 'var(--adm-border)'}
              />
            </div>

            <div>
              <label className="block text-[0.78rem] font-medium mb-1.5 uppercase tracking-widest" style={{ color: 'var(--adm-text-xs)' }}>Email</label>
              <input type="email" value={editingWorker?.email || ''} onChange={e => setEditingWorker({ ...editingWorker, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', background: 'var(--adm-input-bg)', border: '1.5px solid var(--adm-border)', color: 'var(--adm-text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--adm-blue-c)'} onBlur={e => e.target.style.borderColor = 'var(--adm-border)'}
              />
            </div>

            <div>
              <label className="block text-[0.78rem] font-medium mb-1.5 uppercase tracking-widest" style={{ color: 'var(--adm-text-xs)' }}>Role</label>
              <select value={editingWorker?.role || ''} onChange={e => setEditingWorker({ ...editingWorker, role: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', background: 'var(--adm-input-bg)', border: '1.5px solid var(--adm-border)', appearance: 'none', color: 'var(--adm-text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--adm-blue-c)'} onBlur={e => e.target.style.borderColor = 'var(--adm-border)'}>
                <option value="Tailor">Tailor</option>
                <option value="Cutter">Cutter</option>
                <option value="Cashier">Cashier</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsEditOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 8, background: 'transparent', color: 'var(--adm-text-sm)', border: '1px solid var(--adm-border)', fontWeight: 'bold' }}>
              Cancel
            </button>
            <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 8, background: 'var(--adm-blue-c)', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}