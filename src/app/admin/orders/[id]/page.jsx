"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import {
  ArrowLeft,
  Calendar,
  User,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Image as ImageIcon,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * RATE_CARD: Default pricing for StitchFlow services.
 * In a professional setting, this could be managed via a 'settings' collection in Firestore.
 */
const RATE_CARD = {
  Shirt: 600,
  Pant: 700,
  Suit: 5500,
  Kurta: 500,
  Safari: 1200,
  Sherwani: 8000,
};

const ALLOWED_ROLES = ['Admin', 'Manager'];

export default function OrderApprovalPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser, userData, isLoadingUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // --- MANAGER'S INPUT STATES ---
  const [price, setPrice] = useState("");
  const [advance, setAdvance] = useState("");
  const [deadline, setDeadline] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // 🔒 ROUTE GUARD: Only Admin and Manager can access
  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser || !ALLOWED_ROLES.includes(userData?.role)) {
      router.push('/');
    }
  }, [currentUser, userData, isLoadingUser, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });

          // --- AUTO-FILL LOGIC ---
          // 1. Price: Use saved price or default from Rate Card
          const initialPrice =
            data.financial?.totalPrice ||
            RATE_CARD[data.product?.dressType] ||
            0;
          setPrice(initialPrice);

          // 2. Advance: Default to 50% of total price
          const initialAdvance =
            data.financial?.advanceAmount || Math.round(initialPrice * 0.5);
          setAdvance(initialAdvance);

          // 3. Deadline: Initialize with the requested date from the Tailor
          setDeadline(data.workflow?.deliveryDate || "");
        } else {
          alert("Order not found!");
          router.push("/admin/dashboard");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router]);

  /**
   * RE-CALCULATION LOGIC:
   * Automatically updates the 50% advance when the manager modifies the total price.
   */
  useEffect(() => {
    if (price && !order?.financial?.advanceAmount) {
      setAdvance(Math.round(price * 0.5));
    }
  }, [price, order]);

  /**
   * HANDLE APPROVAL:
   * Moves order to 'PAYMENT_PENDING' and records manager's financial/timeline decisions.
   */
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const orderRef = doc(db, "orders", id);
      const advanceVal = parseFloat(advance) || 0;
      const priceVal = parseFloat(price) || 0;

      // If advance > 0, send to cashier for payment collection
      // If advance === 0, skip cashier and go straight to cutting
      const nextStatus = advanceVal > 0 ? "PAYMENT_PENDING" : "CUTTING_READY";
      const timelineNote = advanceVal > 0
        ? `Manager approved at ₹${priceVal}. Sent to Cashier for ₹${advanceVal} advance.`
        : `Manager approved at ₹${priceVal}. No advance required — sent to Cutting.`;

      await updateDoc(orderRef, {
        status: nextStatus,
        financial: {
          totalPrice: priceVal,
          advanceAmount: advanceVal,
          balanceAmount: priceVal - advanceVal,
          isPaid: advanceVal === 0,
        },
        workflow: {
          ...order.workflow,
          deliveryDate: deadline,
        },
        isRead: true,
        timeline: arrayUnion({
          stage: "Manager Approved",
          note: timelineNote,
          timestamp: new Date(),
        }),
        adminNote: adminNote,
      });

      alert(
        advanceVal > 0
          ? "Success: Order sent to Cashier for advance payment."
          : "Success: No advance needed — order sent directly to Cutting."
      );
      router.back();
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve order.");
    } finally {
      setProcessing(false);
    }
  };

  // 🔒 Auth loading check
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

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 animate-pulse font-medium">
        Fetching Order Context...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ACTION HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Order #{order.id.slice(0, 6).toUpperCase()} Review
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase">
              Authored by Tailor ID: {order.tailorId?.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-500 border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={processing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
          >
            {processing ? "Saving..." : "Approve & Send"}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SOURCE DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. CLIENT CONTEXT */}
          <Card className="border-slate-200">
            <CardHeader className="py-3 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <User className="w-3.5 h-3.5" /> Client Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4 font-medium">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">
                  Customer Name
                </p>
                <p className="text-slate-900">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">
                  Phone Number
                </p>
                <p className="text-slate-900 font-mono">
                  {order.customer?.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. PRODUCT SPECIFICATIONS & IMAGE PREVIEW */}
          <Card className="border-slate-200">
            <CardHeader className="py-3 bg-slate-50/50 border-b border-slate-100 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <Scissors className="w-3.5 h-3.5" /> Specs:{" "}
                {order.product?.dressType}
              </CardTitle>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                {order.product?.material}
              </Badge>
            </CardHeader>

            <CardContent className="pt-5 space-y-6">
              {/* --- REFERENCE IMAGE (If exists in DB) --- */}
              {/* --- COMPACT REFERENCE IMAGE SECTION --- */}
              {order.product?.referenceImage && (
                <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3 text-indigo-500" /> Reference
                    Design
                  </p>

                  <div className="flex gap-4 items-center">
                    {/* Short Preview Box */}
                    <div className="w-24 h-24 rounded-md overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                      <img
                        src={order.product.referenceImage}
                        alt="Ref"
                        className="w-full h-full object-cover" // object-cover fills the square box perfectly
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/100x100?text=Error";
                        }}
                      />
                    </div>

                    {/* Info & Action */}
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-bold uppercase border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={() =>
                          window.open(order.product.referenceImage, "_blank")
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> View Full
                        Image
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fabric & Material Summary */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase mb-1">
                    Color/Pattern
                  </p>
                  <p className="font-semibold text-slate-800">
                    {order.product?.fabricColor || "Standard"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase mb-1">
                    Consumption
                  </p>
                  <p className="font-semibold text-indigo-700">
                    {order.product?.consumption} Mtrs
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase mb-1">
                    Source
                  </p>
                  <p className="font-semibold text-slate-800 capitalize">
                    {order.product?.fabricSource}
                  </p>
                </div>
              </div>

              {/* Measurement Matrix */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">
                  Measurement Log (Inches)
                </p>
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                  {Object.entries(order.specs?.measurements || {}).map(
                    ([key, val]) => (
                      <div
                        key={key}
                        className="p-2 border border-slate-100 rounded-md bg-white hover:border-indigo-200 transition-colors"
                      >
                        <span className="block text-[8px] text-slate-400 uppercase truncate">
                          {key}
                        </span>
                        <span className="block font-mono font-bold text-slate-900">
                          {val}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Tailor Instructions */}
              {order.specs?.notes && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900 flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[10px] uppercase mb-1">
                      Tailor Note
                    </span>
                    {order.specs.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: MANAGER'S DECISION CONSOLE */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="border-indigo-100 shadow-lg ring-1 ring-indigo-50">
              <CardHeader className="bg-indigo-600 text-white rounded-t-lg py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Order Approval
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Billing Section */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" /> Total Stitching Bill
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                        ₹
                      </span>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-7 font-bold text-lg h-11 border-indigo-200 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Required Advance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                        ₹
                      </span>
                      <Input
                        type="number"
                        value={advance}
                        onChange={(e) => setAdvance(e.target.value)}
                        className="pl-7 font-semibold h-10 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Delivery Schedule */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Final Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-10 border-indigo-100"
                  />
                </div>

                {/* Internal Communication */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Internal Admin Note
                  </label>
                  <Textarea
                    placeholder="Instructions for the cashier or cutting department..."
                    className="resize-none h-24 text-sm bg-slate-50/50"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>

                {/* Approve Button */}
                <Button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-md"
                >
                  {processing ? "Confirming..." : "Approve & Send to Cashier"}
                </Button>
              </CardContent>
            </Card>

            <p className="text-[10px] text-slate-400 text-center px-4">
              Approving this order will immediately notify the Cashier to
              initiate payment collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
