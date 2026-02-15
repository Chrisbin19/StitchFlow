'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, query, onSnapshot, doc, deleteDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scissors, BedDouble as Needle, DollarSign, Trash2, Edit2, Loader2, User, Shield, AlertTriangle } from 'lucide-react';

export function TeamRoster() {
  const [workers, setWorkers] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. FETCH USERS (The Team)
  useEffect(() => {
    const q = query(collection(db, "users"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          // DEFENSIVE CODING: Fallback if 'name' is missing
          name: data.name || data.fullName || data.displayName || "Unknown Staff",
          email: data.email || "No Email",
          role: data.role || "staff",
          status: data.status || "Active"
        };
      });
      setWorkers(staffList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. FETCH WORKLOADS (Active Tasks)
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["Ready_For_Cutting", "In_Sewing", "Quality_Check"])
    );

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

  // 3. DELETE FUNCTION
  const handleDeleteWorker = async (workerId) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      try {
        await deleteDoc(doc(db, "users", workerId));
      } catch (error) {
        console.error("Error removing staff:", error);
        alert("Failed to delete.");
      }
    }
  };

  // Helper: Icons & Colors
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

  if (loading) {
    return (
      <Card className="border border-slate-200 shadow-sm h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
           <Loader2 className="w-6 h-6 animate-spin" />
           <p className="text-xs">Loading team...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Team Roster</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Live staff overview</p>
        </div>
        <Badge variant="outline" className="bg-white text-slate-600">
          {workers.length} Active
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold text-center">Load</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <User className="w-8 h-8 opacity-20" />
                       <p>No staff found in database.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* NAME */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{worker.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {worker.id.slice(0, 4)}</p>
                    </td>
                    
                    {/* EMAIL */}
                    <td className="px-6 py-4 text-slate-600">
                      {worker.email}
                    </td>
                    
                    {/* ROLE */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleStyle(worker.role)}`}>
                        {getRoleIcon(worker.role)}
                        <span className="capitalize">{worker.role}</span>
                      </span>
                    </td>
                    
                    {/* WORKLOAD (Smart Badge) */}
                    <td className="px-6 py-4 text-center">
                      {(worker.role === 'tailor' || worker.role === 'cutter') ? (
                         <div className="flex justify-center">
                           <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full text-[10px] font-bold ${
                             (workloads[worker.id] || 0) > 4 
                             ? 'bg-red-100 text-red-700 border border-red-200' 
                             : (workloads[worker.id] || 0) > 0
                             ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                             : 'bg-slate-100 text-slate-400 border border-slate-200'
                           }`}>
                             {workloads[worker.id] || 0}
                           </span>
                         </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    
                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={() => console.log("Edit clicked for:", worker.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteWorker(worker.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}