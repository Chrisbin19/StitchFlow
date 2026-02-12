'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/firebase"; 
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { 
  Search, Filter, Calendar, User, 
  Scissors, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Fetch All Orders (Real-time)
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Client-side Filter Logic (Search & Tabs)
  useEffect(() => {
    let result = orders;

    // Filter by Tab
    if (activeTab === 'pending') {
      result = result.filter(o => ['Pending', 'Pending_Approval'].includes(o.status));
    } else if (activeTab === 'active') {
      result = result.filter(o => !['Pending', 'Pending_Approval', 'Delivered', 'Cancelled'].includes(o.status));
    } else if (activeTab === 'completed') {
      result = result.filter(o => ['Delivered'].includes(o.status));
    }

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.customer?.name?.toLowerCase().includes(lowerQuery) ||
        o.id.toLowerCase().includes(lowerQuery) ||
        o.product?.dressType?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, activeTab]);

  // Helper: Status Badge Color
  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pending_Approval': 'bg-orange-100 text-orange-800 border-orange-200',
      'PAYMENT_PENDING': 'bg-blue-100 text-blue-800 border-blue-200',
      'Ready_For_Cutting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'In_Sewing': 'bg-purple-100 text-purple-800 border-purple-200',
      'Quality_Check': 'bg-pink-100 text-pink-800 border-pink-200',
      'Ready_To_Deliver': 'bg-green-100 text-green-800 border-green-200',
      'Delivered': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Registry</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all tailoring jobs.</p>
        </div>
        <Button 
          onClick={() => router.push('/tailor')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Scissors className="w-4 h-4 mr-2" /> New Measurement
        </Button>
      </div>

      {/* CONTROLS SECTION */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4 md:space-y-0 md:flex justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search customer, ID, or garment..." 
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date Filter (Placeholder) */}
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="text-slate-600 border-slate-200">
             <Filter className="w-4 h-4 mr-2" /> Filter
           </Button>
           <Button variant="outline" size="sm" className="text-slate-600 border-slate-200">
             <Calendar className="w-4 h-4 mr-2" /> Date Range
           </Button>
        </div>
      </div>

      {/* TABS & TABLE */}
      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 p-1 rounded-lg h-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 px-4 py-2">All Orders</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 px-4 py-2">Pending Approval</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2">In Production</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 px-4 py-2">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}> {/* Note: We reuse logic, so filteredOrders works for all tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Garment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-slate-400">Loading records...</TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p>No orders found matching your criteria.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <TableCell className="font-mono text-xs font-bold text-slate-500">
                        #{order.id.slice(0, 6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{order.customer?.name}</span>
                          <span className="text-xs text-slate-400">{order.customer?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="bg-white text-slate-600 font-normal">
                             {order.product?.dressType}
                           </Badge>
                           <span className="text-xs text-slate-500">{order.product?.fabricColor}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {order.workflow?.deliveryDate ? (
                          new Date(order.workflow.deliveryDate).toLocaleDateString() 
                        ) : <span className="text-slate-300 italic">Not set</span>}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {order.financial?.totalPrice 
                          ? `₹${order.financial.totalPrice}` 
                          : <span className="text-slate-300 text-xs">--</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusBadge(order.status)} border px-2 py-0.5 rounded-full uppercase text-[10px] font-bold tracking-wide`}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-600">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}