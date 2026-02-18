'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Scissors, BedDouble as Needle, DollarSign, Trash2, Edit2, 
  Loader2, User, Shield, Mail, Save, X, Briefcase
} from 'lucide-react';

export function TeamRoster() {
  const [workers, setWorkers] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [loading, setLoading] = useState(true);

  // --- EDIT STATE ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [saving, setSaving] = useState(false);

  // 1. FETCH USERS
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkers(snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().fullName || "Unknown Staff",
        email: doc.data().email || "No Email",
        role: doc.data().role || "staff",
        status: doc.data().status || "Active"
      })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. FETCH WORKLOADS
  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "in", ["Ready_For_Cutting", "In_Sewing", "Quality_Check"]));
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

  // 3. ACTIONS
  const handleDeleteWorker = async (workerId) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      try { await deleteDoc(doc(db, "users", workerId)); }
      catch (error) { console.error(error); alert("Failed to delete."); }
    }
  };

  const handleEditClick = (worker) => {
    // Initializing with fallbacks to prevent "controlled to uncontrolled" error
    setEditingWorker({ 
      ...worker,
      name: worker.name || '',
      email: worker.email || '',
      role: worker.role || 'staff'
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingWorker || !editingWorker.name) {
        alert("Name is required");
        return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", editingWorker.id), {
        name: editingWorker.name,
        email: editingWorker.email,
        role: editingWorker.role,
      });
      setIsEditOpen(false);
      setEditingWorker(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  // Helper Functions
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'cutter': return <Scissors className="w-3.5 h-3.5" />;
      case 'tailor': return <Needle className="w-3.5 h-3.5" />;
      case 'cashier': return <DollarSign className="w-3.5 h-3.5" />;
      case 'admin': return <Shield className="w-3.5 h-3.5" />;
      default: return <User className="w-3.5 h-3.5" />;
    }
  };

  const getRoleStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'cutter': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'tailor': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cashier': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (loading) return <Card className="h-64 flex items-center justify-center border-slate-200 shadow-sm"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></Card>;

  return (
    <>
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">Team Roster</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Manage your staff and permissions</p>
          </div>
          <Badge variant="outline" className="bg-white text-slate-600 shadow-sm">{workers.length} Members</Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Details</th>
                  <th className="px-6 py-3 font-semibold">Contact</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold text-center">Load</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase border border-slate-200">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{worker.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {worker.id.slice(0, 4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{worker.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleStyle(worker.role)}`}>
                        {getRoleIcon(worker.role)}
                        <span className="capitalize">{worker.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {(worker.role === 'tailor' || worker.role === 'cutter') ? (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                            {workloads[worker.id] || 0}
                          </Badge>
                        ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEditClick(worker)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteWorker(worker.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- DESIGNER EDIT MODAL --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 pb-10 text-center relative">
             <button 
               onClick={() => setIsEditOpen(false)}
               className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
             
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-indigo-700 shadow-xl border-4 border-white/20 mx-auto mb-4">
               {editingWorker?.name?.charAt(0).toUpperCase() || 'U'}
             </div>
             
             <DialogTitle className="text-xl font-bold text-white tracking-tight">
               {editingWorker?.name || 'User Profile'}
             </DialogTitle>
             <DialogDescription className="text-indigo-100 text-xs mt-1 font-medium opacity-80">
               Edit profile details and permissions
             </DialogDescription>
          </div>

          <div className="bg-white -mt-4 rounded-t-2xl px-8 pt-8 pb-6 space-y-5 relative z-10">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Display Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                    value={editingWorker?.name || ''} 
                    onChange={(e) => setEditingWorker({...editingWorker, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                    value={editingWorker?.email || ''} 
                    onChange={(e) => setEditingWorker({...editingWorker, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assigned Role</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                  <Select 
                    value={editingWorker?.role || ''} 
                    onValueChange={(val) => setEditingWorker({...editingWorker, role: val})}
                  >
                    <SelectTrigger className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Manager (Admin)</SelectItem>
                      <SelectItem value="cutter">Master (Cutter)</SelectItem>
                      <SelectItem value="tailor">Tailor (Worker)</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          </div>

          <div className="px-8 pb-8 pt-2 flex gap-3 bg-white">
            <Button 
              variant="ghost" 
              onClick={() => setIsEditOpen(false)}
              className="flex-1 h-11 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={saving} 
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 rounded-lg transition-all active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}