
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from "@/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  Search, Filter, Calendar, Scissors,
  ChevronDown, X, Check, Download, ClipboardList
} from 'lucide-react';

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const ALLOWED_ROLES = ['Admin', 'Manager'];

export default function OrdersPage() {
  const { currentUser, userData, isLoadingUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // NEW: Filter States
  const [selectedGarment, setSelectedGarment] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const router = useRouter();

  // 🔒 ROUTE GUARD: Only Admin and Manager can access
  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
      router.push('/');
    }
  }, [currentUser, userData, isLoadingUser, router]);

  // 1. Fetch All Orders (Real-time)
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Advanced Filter Logic
  useEffect(() => {
    let result = orders;

    // Filter by Tab (Status Groups)
    if (activeTab === 'pending') {
      result = result.filter(o => ['Pending', 'Pending_Approval'].includes(o.status));
    } else if (activeTab === 'active') {
      result = result.filter(o => !['Pending', 'Pending_Approval', 'Delivered', 'Cancelled'].includes(o.status));
    } else if (activeTab === 'completed') {
      result = result.filter(o => ['Delivered'].includes(o.status));
    }

    // Filter by Garment Type
    if (selectedGarment !== "All") {
      result = result.filter(o => o.product?.dressType === selectedGarment);
    }

    // Filter by Payment Status
    if (paymentStatus === "Paid") {
      result = result.filter(o => o.financial?.balanceAmount === 0);
    } else if (paymentStatus === "Partial") {
      result = result.filter(o => o.financial?.balanceAmount > 0 && o.financial?.advancePaid > 0);
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

    // Filter by Date Range
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter(o => {
        if (!o.createdAt) return false;
        const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return orderDate >= startDate;
      });
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(o => {
        if (!o.createdAt) return false;
        const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return orderDate <= endDate;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, activeTab, selectedGarment, paymentStatus, dateRange]);

  const clearFilters = () => {
    setSelectedGarment("All");
    setPaymentStatus("All");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pending_Approval': 'bg-orange-100 text-orange-800 border-orange-200',
      'PAYMENT_PENDING': 'bg-blue-100 text-blue-800 border-blue-200',
      'ADVANCE_PAID': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Ready_For_Cutting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'CUTTING_COMPLETED': 'bg-violet-100 text-violet-800 border-violet-200',
      'In_Sewing': 'bg-purple-100 text-purple-800 border-purple-200',
      'STITCHING_COMPLETED': 'bg-teal-100 text-teal-800 border-teal-200',
      'Quality_Check': 'bg-pink-100 text-pink-800 border-pink-200',
      'READY_FOR_DELIVERY': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Delivered': 'bg-gray-100 text-gray-800 border-gray-200',
      'DELIVERED': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // 🔒 Show loading while verifying auth
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
    return null;
  }

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV Headers
    const headers = [
      "Order ID", "Customer Name", "Phone", "Garment Type",
      "Status", "Total Price", "Advance Paid", "Balance Amount",
      "Delivery Date", "Created At"
    ];

    // Create CSV Rows
    const csvRows = [headers.join(",")];

    filteredOrders.forEach(order => {
      const deliveryDate = order.workflow?.deliveryDate ? new Date(order.workflow.deliveryDate).toLocaleDateString() : 'N/A';
      const createdDate = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()) : 'N/A';

      const row = [
        order.id,
        `"${order.customer?.name || ''}"`,
        `"${order.customer?.phone || ''}"`,
        order.product?.dressType || 'N/A',
        order.status,
        order.financial?.totalPrice || 0,
        order.financial?.advancePaid || 0,
        order.financial?.balanceAmount || 0,
        deliveryDate,
        createdDate
      ];
      csvRows.push(row.join(","));
    });

    // Generate and Trigger Download
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `StitchFlow_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans">


      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
            }}>
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[2.2rem] font-black text-slate-900 tracking-tight leading-none mb-1">
              StitchFlow Registry
            </h1>
            <p className="text-slate-500 text-[14px] font-medium">
              Manage, filter, and track all tailoring jobs effectively.
            </p>
          </div>
        </div>
        <Button onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:scale-105 h-10 px-4">
          <Download className="w-4 h-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <div className="mb-6 w-full h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />

      {/* CONTROLS SECTION */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4 md:space-y-0 md:flex justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search customer, ID, or garment..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* ADVANCED FILTER POPOVER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 relative">
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {(selectedGarment !== "All" || paymentStatus !== "All") && (
                  <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
                <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Advanced Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs text-indigo-600">Reset</Button>
                </div>
                <Separator />

                {/* Garment Type Filter */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Garment Type</p>
                  {["All", "Shirt", "Suit", "Kurti"].map((type) => (
                    <div
                      key={type}
                      onClick={() => setSelectedGarment(type)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      {type}
                      {selectedGarment === type && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Payment Filter */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Payment</p>
                  {["All", "Paid", "Partial"].map((status) => (
                    <div
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      {status}
                      {paymentStatus === status && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* DATE RANGE POPOVER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 relative">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
                {(dateRange.start || dateRange.end) && (
                  <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
                <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Date Filter</h4>
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({ start: "", end: "" })} className="h-7 px-2 text-xs text-indigo-600">Reset</Button>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ACTIVE FILTER BADGES (Visual helper for user) */}
      {(selectedGarment !== "All" || paymentStatus !== "All" || dateRange.start || dateRange.end) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGarment !== "All" && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              Type: {selectedGarment} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSelectedGarment("All")} />
            </Badge>
          )}
          {paymentStatus !== "All" && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              Payment: {paymentStatus} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setPaymentStatus("All")} />
            </Badge>
          )}
          {(dateRange.start || dateRange.end) && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              Date: {dateRange.start || "Any"} - {dateRange.end || "Any"}
              <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setDateRange({ start: "", end: "" })} />
            </Badge>
          )}
        </div>
      )}

      {/* TABS & TABLE (Same as your original code, now using updated filteredOrders) */}
      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 p-1 rounded-lg h-auto">
          <TabsTrigger value="all" className="px-4 py-2">All Orders</TabsTrigger>
          <TabsTrigger value="pending" className="px-4 py-2">Pending Approval</TabsTrigger>
          <TabsTrigger value="active" className="px-4 py-2">In Production</TabsTrigger>
          <TabsTrigger value="completed" className="px-4 py-2">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
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
                  <TableRow><TableCell colSpan={7} className="text-center h-32 text-slate-400">Loading records...</TableCell></TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p>No orders matching these filters.</p>
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
                      <TableCell className="font-mono text-xs font-bold text-slate-500">#{order.id.slice(0, 6).toUpperCase()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{order.customer?.name}</span>
                          <span className="text-xs text-slate-400">{order.customer?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white text-slate-600 font-semibold">{order.product?.dressType}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{order.workflow?.deliveryDate ? new Date(order.workflow.deliveryDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="font-bold text-slate-900">₹{order.financial?.totalPrice || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusBadge(order.status)} border px-2 py-0.5 rounded-full uppercase text-[10px] font-bold tracking-wide`}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">View</Button>
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