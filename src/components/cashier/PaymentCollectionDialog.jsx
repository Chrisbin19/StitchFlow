'use client';

import { useState } from 'react';
import { db } from "@/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from '@/context/AuthContext';
import { IndianRupee, User, Scissors, CreditCard, Banknote, Smartphone, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

const PAYMENT_MODES = [
    { id: 'Cash', label: 'Cash', icon: Banknote, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'UPI', label: 'UPI', icon: Smartphone, color: 'bg-violet-100 text-violet-700 border-violet-200' },
    { id: 'Card', label: 'Card', icon: CreditCard, color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

export default function PaymentCollectionDialog({ order, open, onClose }) {
    const { userData } = useAuth();
    const [selectedMode, setSelectedMode] = useState('Cash');
    const [processing, setProcessing] = useState(false);

    if (!order) return null;

    const advanceAmount = order.financial?.advanceAmount || 0;

    const handleConfirmPayment = async () => {
        setProcessing(true);
        try {
            const orderRef = doc(db, "orders", order.id);

            await updateDoc(orderRef, {
                "financial.isPaid": true,
                "financial.payments": arrayUnion({
                    amount: advanceAmount,
                    mode: selectedMode,
                    type: "advance",
                    collectedBy: userData?.name || "Cashier",
                    collectedById: userData?.uid || "",
                    timestamp: new Date(),
                }),
                status: "ADVANCE_PAID",
                timeline: arrayUnion({
                    stage: "Advance Collected",
                    note: `₹${advanceAmount.toLocaleString()} advance collected via ${selectedMode} by ${userData?.name || "Cashier"}`,
                    timestamp: new Date(),
                }),
            });

            onClose();
        } catch (error) {
            console.error("Error confirming payment:", error);
            alert("Failed to record payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <IndianRupee className="w-5 h-5 text-primary" />
                        Collect Advance Payment
                    </DialogTitle>
                    <DialogDescription>
                        Confirm payment collection from the customer.
                    </DialogDescription>
                </DialogHeader>

                {/* Order Summary */}
                <div className="space-y-4 py-2">
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{order.customer?.name}</span>
                            <span className="text-xs text-muted-foreground">• {order.customer?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{order.product?.dressType}</span>
                            <Badge variant="outline" className="text-[10px]">{order.product?.material}</Badge>
                        </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Bill</span>
                            <span className="font-medium text-foreground">₹{order.financial?.totalPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Balance After</span>
                            <span className="font-medium text-foreground">₹{order.financial?.balanceAmount?.toLocaleString()}</span>
                        </div>
                        <hr className="border-primary/10" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">Advance to Collect</span>
                            <span className="text-2xl font-bold text-primary">₹{advanceAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment Mode Selection */}
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-wider">Payment Mode</p>
                        <div className="grid grid-cols-3 gap-2">
                            {PAYMENT_MODES.map((mode) => {
                                const Icon = mode.icon;
                                const isSelected = selectedMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setSelectedMode(mode.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${isSelected
                                            ? 'border-primary bg-primary/10 shadow-sm'
                                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {mode.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmPayment}
                        disabled={processing}
                        className="font-bold px-6"
                    >
                        {processing ? "Processing..." : `Confirm ₹${advanceAmount.toLocaleString()} Received`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
