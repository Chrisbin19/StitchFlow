'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useAuth } from '@/context/AuthContext';
import { generateUpiQr } from '@/lib/generateUpiQr';
import {
    IndianRupee, User, Scissors, CreditCard,
    Banknote, Smartphone, X, CheckCircle2,
    RefreshCw, Loader2, Scan
} from 'lucide-react';

// ── Payment mode config ──
const MODES = [
    {
        id: 'Cash',
        label: 'Cash',
        icon: Banknote,
        color: 'var(--cf-amber-c)',
        bg: 'var(--cf-amber-bg)',
        border: 'var(--cf-amber-br)',
        desc: 'Collect physically'
    },
    {
        id: 'UPI',
        label: 'UPI / QR',
        icon: Scan,
        color: 'var(--cf-violet-c)',
        bg: 'var(--cf-violet-bg)',
        border: 'var(--cf-violet-br)',
        desc: 'Show QR to scan'
    },
    {
        id: 'Card',
        label: 'Card',
        icon: CreditCard,
        color: 'var(--cf-blue-c)',
        bg: 'var(--cf-blue-bg)',
        border: 'var(--cf-blue-br)',
        desc: 'Debit / Credit'
    },
];

export default function PaymentCollectionDialog({ order, open, onClose }) {
    const { userData } = useAuth();
    const [selectedMode, setSelectedMode] = useState('Cash');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    // UPI QR state
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [shopUpiId, setShopUpiId] = useState(null);

    const advanceAmount = order?.financial?.advanceAmount || 0;
    const totalPrice = order?.financial?.totalPrice || 0;
    const balanceAfter = order?.financial?.balanceAmount || 0;

    // Fetch shop UPI ID from Firestore settings
    useEffect(() => {
        const fetchUpiId = async () => {
            try {
                const settingsDoc = await getDoc(doc(db, 'settings', 'boutique'));
                if (settingsDoc.exists()) {
                    setShopUpiId(settingsDoc.data().upiId);
                }
            } catch (err) {
                console.error('Could not fetch UPI settings:', err);
            }
        };
        if (open) fetchUpiId();
    }, [open]);

    // Generate QR when UPI mode selected
    useEffect(() => {
        if (selectedMode === 'UPI' && shopUpiId && order && !qrDataUrl) {
            generateQr();
        }
    }, [selectedMode, shopUpiId]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setSelectedMode('Cash');
            setQrDataUrl(null);
            setSuccess(false);
            setProcessing(false);
        }
    }, [open]);

    const generateQr = async () => {
        if (!shopUpiId) return;
        setQrLoading(true);
        try {
            const qr = await generateUpiQr(
                shopUpiId,
                'StitchFlow',
                advanceAmount,
                order.id
            );
            setQrDataUrl(qr);
        } catch (err) {
            console.error('QR generation failed:', err);
        } finally {
            setQrLoading(false);
        }
    };

    const handleConfirm = async () => {
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

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1800);

        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setProcessing(false);
        }
    };

    if (!open || !order) return null;

    // Customer initials
    const initials = order.customer?.name
        ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100]"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                onClick={e => e.stopPropagation()}
            >
                <div
                    className="w-full max-w-[420px] cf-font-body overflow-hidden"
                    style={{
                        background: 'var(--cf-card)',
                        borderRadius: 20,
                        border: '1px solid var(--cf-border)',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                    }}
                >
                    {/* ── Header ── */}
                    <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--cf-border)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'rgba(5,150,105,0.12)',
                                    border: '1px solid rgba(5,150,105,0.22)'
                                }}
                            >
                                <IndianRupee className="w-4 h-4" style={{ color: 'var(--cf-emerald)' }} />
                            </div>
                            <div>
                                <p
                                    className="font-black text-[15px] leading-tight"
                                    style={{ color: 'var(--cf-text)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    Collect Advance
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--cf-text-xs)' }}>
                                    Confirm payment from customer
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ color: 'var(--cf-text-xs)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--cf-divider)'; e.currentTarget.style.color = 'var(--cf-text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cf-text-xs)'; }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">

                        {/* ── Customer Info ── */}
                        <div
                            className="flex items-center gap-3 p-3.5 rounded-xl"
                            style={{ background: 'var(--cf-badge)', border: '1px solid var(--cf-border)' }}
                        >
                            {/* Avatar */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
                            >
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="font-bold text-[14px] leading-tight truncate"
                                    style={{ color: 'var(--cf-text)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    {order.customer?.name}
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--cf-text-xs)' }}>
                                    {order.customer?.phone}
                                </p>
                            </div>
                            {/* Garment chip */}
                            <span
                                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
                                style={{
                                    background: 'var(--cf-violet-bg)',
                                    color: 'var(--cf-violet-c)',
                                    border: '1px solid var(--cf-violet-br)'
                                }}
                            >
                                {order.product?.dressType}
                            </span>
                        </div>

                        {/* ── Amount Breakdown ── */}
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{ border: '1px solid var(--cf-border)' }}
                        >
                            <div
                                className="px-4 py-3 flex justify-between items-center"
                                style={{ borderBottom: '1px solid var(--cf-divider)' }}
                            >
                                <span className="text-[12px]" style={{ color: 'var(--cf-text-sm)' }}>
                                    Total Bill
                                </span>
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--cf-text)' }}>
                                    ₹{totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div
                                className="px-4 py-3 flex justify-between items-center"
                                style={{ borderBottom: '1px solid var(--cf-divider)' }}
                            >
                                <span className="text-[12px]" style={{ color: 'var(--cf-text-sm)' }}>
                                    Balance After
                                </span>
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--cf-text-sm)' }}>
                                    ₹{balanceAfter.toLocaleString()}
                                </span>
                            </div>
                            {/* Advance row — highlighted */}
                            <div
                                className="px-4 py-3.5 flex justify-between items-center"
                                style={{ background: 'rgba(5,150,105,0.06)' }}
                            >
                                <span
                                    className="text-[12px] font-bold uppercase tracking-wide"
                                    style={{ color: 'var(--cf-emerald)' }}
                                >
                                    Advance to Collect
                                </span>
                                <span
                                    className="font-black text-[22px] tracking-tight leading-none"
                                    style={{
                                        color: 'var(--cf-emerald)',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif'
                                    }}
                                >
                                    ₹{advanceAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* ── Payment Mode ── */}
                        <div>
                            <p
                                className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3"
                                style={{ color: 'var(--cf-text-xs)' }}
                            >
                                Payment Mode
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {MODES.map((mode) => {
                                    const Icon = mode.icon;
                                    const isSel = selectedMode === mode.id;
                                    return (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedMode(mode.id);
                                                if (mode.id !== 'UPI') setQrDataUrl(null);
                                            }}
                                            className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl transition-all"
                                            style={{
                                                background: isSel ? mode.bg : 'var(--cf-badge)',
                                                border: isSel
                                                    ? `1.5px solid ${mode.border}`
                                                    : '1.5px solid var(--cf-border)',
                                                boxShadow: isSel
                                                    ? `0 0 0 3px ${mode.bg}`
                                                    : 'none',
                                                transform: isSel ? 'scale(1.03)' : 'scale(1)',
                                            }}
                                        >
                                            <Icon
                                                className="w-5 h-5 transition-colors"
                                                style={{ color: isSel ? mode.color : 'var(--cf-text-xs)' }}
                                            />
                                            <span
                                                className="text-[11px] font-bold leading-tight transition-colors"
                                                style={{ color: isSel ? mode.color : 'var(--cf-text-sm)' }}
                                            >
                                                {mode.label}
                                            </span>
                                            <span
                                                className="text-[9px] leading-tight"
                                                style={{ color: isSel ? mode.color : 'var(--cf-text-xs)', opacity: 0.8 }}
                                            >
                                                {mode.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── UPI QR Panel (only when UPI selected) ── */}
                        {selectedMode === 'UPI' && (
                            <div
                                className="rounded-xl p-4 flex flex-col items-center gap-3"
                                style={{
                                    background: 'var(--cf-violet-bg)',
                                    border: '1px solid var(--cf-violet-br)'
                                }}
                            >
                                {!shopUpiId ? (
                                    <p className="text-[12px] text-center" style={{ color: 'var(--cf-violet-c)' }}>
                                        ⚠️ UPI ID not configured. Add it to Firebase → settings → boutique → upiId
                                    </p>
                                ) : qrLoading ? (
                                    <div className="py-8 flex flex-col items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--cf-violet-c)' }} />
                                        <p className="text-[11px]" style={{ color: 'var(--cf-violet-c)' }}>
                                            Generating QR…
                                        </p>
                                    </div>
                                ) : qrDataUrl ? (
                                    <>
                                        {/* QR Image */}
                                        <div
                                            className="p-3 rounded-xl bg-white"
                                            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                                        >
                                            <img
                                                src={qrDataUrl}
                                                alt="UPI QR Code"
                                                width={180}
                                                height={180}
                                                className="block"
                                            />
                                        </div>

                                        {/* Amount label below QR */}
                                        <div className="text-center">
                                            <p
                                                className="font-black text-[20px]"
                                                style={{
                                                    color: 'var(--cf-violet-c)',
                                                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                                                }}
                                            >
                                                ₹{advanceAmount.toLocaleString()}
                                            </p>
                                            <p className="text-[11px]" style={{ color: 'var(--cf-violet-c)', opacity: 0.8 }}>
                                                Scan with GPay · PhonePe · Paytm
                                            </p>
                                        </div>

                                        {/* Refresh QR button */}
                                        <button
                                            type="button"
                                            onClick={() => { setQrDataUrl(null); generateQr(); }}
                                            className="flex items-center gap-1.5 text-[11px] font-semibold"
                                            style={{ color: 'var(--cf-violet-c)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <RefreshCw className="w-3 h-3" /> Refresh QR
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* ── Action Buttons ── */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-full font-bold text-[13px] transition-all"
                                style={{
                                    background: 'var(--cf-badge)',
                                    border: '1.5px solid var(--cf-border)',
                                    color: 'var(--cf-text-sm)',
                                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--cf-divider)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--cf-badge)'}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={processing || success}
                                className="flex-[2] py-3 rounded-full font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all"
                                style={{
                                    background: success
                                        ? 'linear-gradient(135deg, #059669, #047857)'
                                        : 'linear-gradient(135deg, #059669, #047857)',
                                    boxShadow: '0 4px 14px rgba(5,150,105,0.30)',
                                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    opacity: processing ? 0.8 : 1,
                                }}
                                onMouseEnter={e => { if (!processing && !success) e.currentTarget.style.transform = 'scale(1.01)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {success ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Payment Recorded!</>
                                ) : processing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                                ) : (
                                    <>
                                        <IndianRupee className="w-4 h-4" />
                                        Confirm ₹{advanceAmount.toLocaleString()} Received
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}