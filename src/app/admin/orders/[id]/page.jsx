'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from "@/firebase"; 
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { 
  ArrowLeft, Calendar, User, Scissors, CheckCircle2, 
  AlertTriangle, IndianRupee, Save, Clock 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- 1. THE RATE CARD (Simple Version) ---
// In a real app, you might fetch this from a 'settings' collection
const RATE_CARD = {
  'Shirt': 600,
  'Pant': 700,
  'Suit': 5500,
  'Kurta': 500,
  'Safari': 1200,
  'Sherwani': 8000
};

export default function OrderApprovalPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // --- MANAGER'S INPUTS (Initialized with Defaults) ---
  const [price, setPrice] = useState('');
  const [advance, setAdvance] = useState('');
  const [deadline, setDeadline] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });

          // --- AUTO-PILOT LOGIC ---
          // 1. Price: Use existing or Rate Card Default
          if (data.financial?.totalPrice) {
            setPrice(data.financial.totalPrice);
          } else {
            const defaultPrice = RATE_CARD[data.product?.dressType] || 0;
            setPrice(defaultPrice); // <--- PRE-FILLS PRICE
          }

          // 2. Advance: Default to 50% of Price
          if (data.financial?.advanceAmount) {
            setAdvance(data.financial.advanceAmount);
          } else {
             // We'll calc this dynamically when price changes, or set initial here
             const defaultPrice = data.financial?.totalPrice || RATE_CARD[data.product?.dressType] || 0;
             setAdvance(Math.round(defaultPrice * 0.5)); // <--- PRE-FILLS ADVANCE
          }

          // 3. Deadline: Use Tailor's requested date
          setDeadline(data.workflow?.deliveryDate || ''); 

        } else {
          alert("Order not found!");
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router]);

  // Update Advance automatically when Price is changed (Convenience)
  useEffect(() => {
    if (price && !order?.financial?.advanceAmount) {
       setAdvance(Math.round(price * 0.5));
    }
  }, [price, order]);

  // --- THE ONE-CLICK ACTION ---
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const orderRef = doc(db, "orders", id);
      
      await updateDoc(orderRef, {
        // 1. Move to Cashier's Queue
        status: "PAYMENT_PENDING", 
        
        // 2. Save the Financials (Even if just defaults)
        financial: {
          totalPrice: parseFloat(price),
          advanceAmount: parseFloat(advance),
          balanceAmount: parseFloat(price) - parseFloat(advance),
          isPaid: false, 
        },
        
        // 3. Confirm Schedule
        workflow: {
          ...order.workflow,
          deliveryDate: deadline
        },

        // 4. Mark Notification as Read
        isRead: true, 
        
        // 5. Audit Log
        timeline: arrayUnion({
          stage: "Manager Approved",
          note: `Price set to ₹${price}.`,
          timestamp: new Date()
        }),

        adminNote: adminNote
      });

      // router.push('/admin/dashboard'); // Or go back to list
      alert("Order Approved & Sent to Cashier");
      router.back();

    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Order Context...</div>;
  if (!order) return <div className="p-10 text-center">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Review Order #{order.id.slice(0, 6).toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Created {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50">
             Reject
           </Button>
           <Button 
             onClick={handleConfirm} 
             disabled={processing}
             className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
           >
             {processing ? "Saving..." : "Confirm & Send"}
           </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: READ-ONLY CONTEXT (The Tailor's Input) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Customer Context */}
          <Card className="shadow-sm border-slate-200">
             <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                 <User className="w-4 h-4" /> Client Details
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-4 grid grid-cols-2 gap-4">
               <div>
                 <p className="text-xs text-slate-400 font-medium">Name</p>
                 <p className="text-base font-semibold text-slate-900">{order.customer?.name}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 font-medium">Contact</p>
                 <p className="text-base font-mono text-slate-900">{order.customer?.phone}</p>
               </div>
             </CardContent>
          </Card>

          {/* 2. Technical Specs */}
          <Card className="shadow-sm border-slate-200">
             <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100 flex flex-row justify-between items-center">
               <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                 <Scissors className="w-4 h-4" /> Specification: {order.product?.dressType}
               </CardTitle>
               <Badge variant="outline" className="bg-white">
                 {order.product?.fabricSource} Fabric
               </Badge>
             </CardHeader>
             
             <CardContent className="pt-4 space-y-6">
               {/* Material Grid */}
               <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Material</span>
                    <span className="font-medium text-slate-800">{order.product?.material}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Color</span>
                    <span className="font-medium text-slate-800">{order.product?.fabricColor}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Consumption</span>
                    <span className="font-bold text-indigo-700">{order.product?.consumption} M</span>
                  </div>
               </div>

               {/* Measurements */}
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase mb-3">Measurements (Inches)</p>
                 <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                    {Object.entries(order.specs?.measurements || {}).map(([key, val]) => (
                      <div key={key} className="p-2 border rounded bg-white text-center">
                        <span className="block text-[10px] text-slate-400 uppercase">{key}</span>
                        <span className="block font-mono font-bold text-slate-800">{val}</span>
                      </div>
                    ))}
                 </div>
               </div>

               {/* Notes */}
               {order.specs?.notes && (
                 <div className="p-3 bg-amber-50 border border-amber-100 rounded text-sm text-amber-800 flex gap-2">
                   <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                   <div>
                     <span className="font-bold block text-xs uppercase mb-1">Tailor Note:</span>
                     {order.specs.notes}
                   </div>
                 </div>
               )}
             </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: ACTION CONSOLE (Editable Defaults) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            
            <Card className="border-indigo-100 shadow-md">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-3">
                 <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4" /> Manager Decision
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                
                {/* 1. Pricing (Pre-filled) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> Total Bill Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <Input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-7 font-bold text-lg h-11 border-indigo-200 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">
                    {order.product?.dressType} Base Rate: ₹{RATE_CARD[order.product?.dressType]}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Advance to Collect</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <Input 
                      type="number" 
                      value={advance}
                      onChange={(e) => setAdvance(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Schedule (Pre-filled) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Confirmed Delivery
                  </label>
                  <Input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                {/* 3. Internal Note */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Internal Note</label>
                  <Textarea 
                    placeholder="Any instruction for the Cashier/Cutter?"
                    className="resize-none h-20 text-xs"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>

                {/* Confirm Button (Duplicate of Header for ease) */}
                <Button 
                   onClick={handleConfirm} 
                   disabled={processing}
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 h-11"
                 >
                   {processing ? "Confirming..." : "Approve Order"}
                 </Button>

              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}