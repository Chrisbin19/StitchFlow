"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
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
  PackageCheck,
  Truck,
  Sparkles,
  Loader2 as SpinIcon,
} from "lucide-react";
import { SuccessIcon } from '@/components/ui/animated-state-icons';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPricingHistory } from '@/lib/getPricingHistory';

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

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiCard, setShowAiCard] = useState(false);

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

  const handleSuggestPrice = async () => {
    setAiLoading(true);
    setShowAiCard(false);

    try {
      // Fetch historical pricing data
      const history = await getPricingHistory(
        order.product?.dressType,
        order.product?.material
      );

      const response = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dressType: order.product?.dressType,
          material: order.product?.material,
          fabricSource: order.product?.fabricSource,
          consumption: order.product?.consumption,
          historicalOrders: history,
        })
      });

      const data = await response.json();

      if (data.success) {
        setAiSuggestion(data.suggestion);
        setShowAiCard(true);
      }
    } catch (err) {
      console.error('AI suggestion failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

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
        isReadByAdmin: true,
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

  /**
   * HANDLE MARK READY FOR DELIVERY:
   * Admin reviews completed garment and approves for customer delivery.
   */
  const handleMarkReadyForDelivery = async () => {
    if (!window.confirm("Mark this order as ready for customer delivery?")) return;
    setProcessing(true);
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, {
        status: "READY_FOR_DELIVERY",
        isReadByAdmin: true,
        isReadByCashierDelivery: false,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          stage: "Ready for Delivery",
          note: "Quality reviewed by Admin. Ready for customer pickup & balance collection.",
          timestamp: new Date(),
        }),
      });
      alert("Order marked as Ready for Delivery. Cashier has been notified.");
      router.back();
    } catch (error) {
      console.error("Error marking ready for delivery:", error);
      alert("Failed to update order.");
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
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          {order.status === "STITCHING_COMPLETED" ? (
            <Button
              onClick={handleMarkReadyForDelivery}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
            >
              {processing ? <><SuccessIcon size={18} color="white" className="inline" /> Updating...</> : (<><PackageCheck className="w-4 h-4 mr-2" /> Mark Ready for Delivery</>)}
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={processing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
            >
              {processing ? <><SuccessIcon size={18} color="white" className="inline" /> Saving...</> : "Approve & Send"}
            </Button>
          )}
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

            {/* --- STITCHING COMPLETED: Show delivery approval panel --- */}
            {order.status === "STITCHING_COMPLETED" ? (
              <Card className="border-emerald-200 shadow-lg ring-1 ring-emerald-50">
                <CardHeader className="bg-emerald-600 text-white rounded-t-lg py-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PackageCheck className="w-4 h-4" /> Delivery Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  {/* Status Summary */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-emerald-900">Stitching Complete</span>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      The tailor has finished this garment. Review the order and approve it for customer delivery.
                    </p>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Bill</span>
                      <span className="font-bold text-slate-900">₹{order.financial?.totalPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Advance Paid</span>
                      <span className="font-medium text-emerald-600">₹{order.financial?.advanceAmount?.toLocaleString()}</span>
                    </div>
                    <hr className="border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-900">Balance Due</span>
                      <span className="font-bold text-lg text-orange-600">₹{order.financial?.balanceAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Delivery Date:</span>
                      <span className="font-bold text-slate-900">{order.workflow?.deliveryDate || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Priority:</span>
                      <span className="font-bold text-slate-900">{order.workflow?.priority || 'Normal'}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleMarkReadyForDelivery}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-md"
                  >
                    {processing ? "Updating..." : (<><Truck className="w-4 h-4 mr-2" /> Approve for Delivery</>)}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* --- PENDING APPROVAL: Show original approval panel --- */
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
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" /> Total Stitching Bill
                        </label>

                        {/* AI Suggest Button */}
                        <button
                          type="button"
                          onClick={handleSuggestPrice}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
                          style={{
                            background: 'rgba(124,58,237,0.10)',
                            border: '1px solid rgba(124,58,237,0.30)',
                            color: '#7C3AED',
                          }}
                        >
                          {aiLoading
                            ? <><SpinIcon className="w-3 h-3 animate-spin" /> Thinking...</>
                            : <><Sparkles className="w-3 h-3" /> AI Suggest</>
                          }
                        </button>
                      </div>

                      {/* AI Suggestion Card — appears below the button */}
                      {showAiCard && aiSuggestion && (
                        <div className="p-3 rounded-xl border mb-2 shadow-sm"
                          style={{
                            background: 'rgba(124,58,237,0.03)',
                            borderColor: 'rgba(124,58,237,0.25)',
                          }}>

                          {/* Price range */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600">
                              AI Recommendation
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                              style={{
                                background: aiSuggestion.confidence === 'high'
                                  ? 'rgba(5,150,105,0.12)' : 'rgba(217,119,6,0.12)',
                                color: aiSuggestion.confidence === 'high' ? '#059669' : '#D97706',
                              }}>
                              {aiSuggestion.confidence} confidence
                            </span>
                          </div>

                          {/* Suggested price + range */}
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-black text-violet-700">
                              ₹{aiSuggestion.suggestedPrice}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Range: ₹{aiSuggestion.minPrice} – ₹{aiSuggestion.maxPrice}
                            </span>
                          </div>

                          {/* Reasoning */}
                          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            {aiSuggestion.reasoning}
                          </p>

                          {/* Apply button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPrice(aiSuggestion.suggestedPrice);
                              setAdvance(Math.round(aiSuggestion.suggestedPrice * 0.5));
                              setShowAiCard(false);
                            }}
                            className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-[1.01]"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                          >
                            Apply ₹{aiSuggestion.suggestedPrice} →
                          </button>
                        </div>
                      )}

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
            )}

            <p className="text-[10px] text-slate-400 text-center px-4">
              {order.status === "STITCHING_COMPLETED"
                ? "Approving will notify the Cashier to collect balance and deliver."
                : "Approving this order will immediately notify the Cashier to initiate payment collection."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
