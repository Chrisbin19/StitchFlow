"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Scissors, User, Package, Link2, Ruler, Save, CheckCircle2, AlertTriangle, X } from "lucide-react";

const SectH = ({ icon: I, title }) => (
  <div className="flex items-center gap-2 mb-3">
    <I className="w-3.5 h-3.5" style={{ color: 'var(--adm-text-sm)' }} />
    <span style={{ fontSize: '0.70rem', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', color: 'var(--adm-text-xs)' }}>
      {title}
    </span>
  </div>
);

const Lbl = ({ text }) => (
  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--adm-text-md)', marginBottom: 6 }}>
    {text}
  </label>
);

const Input = ({ hasErr, ...props }) => (
  <input style={{
    width: '100%', height: 42, padding: '0 14px', borderRadius: 8, fontSize: '0.9rem',
    background: 'var(--adm-input-bg)', color: 'var(--adm-text)',
    border: `1.5px solid ${hasErr ? 'var(--adm-red)' : 'var(--adm-border)'}`,
    outline: 'none', transition: 'box-shadow 200ms ease, border 200ms ease'
  }}
    onFocus={e => {
      e.currentTarget.style.borderColor = 'var(--adm-violet-c)';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
    }}
    onBlur={e => {
      e.currentTarget.style.borderColor = hasErr ? 'var(--adm-red)' : 'var(--adm-border)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    {...props} />
);

const Select = ({ ...props }) => (
  <div className="relative">
    <select style={{
      width: '100%', height: 42, padding: '0 32px 0 14px', borderRadius: 8, fontSize: '0.9rem',
      background: 'var(--adm-input-bg)', color: 'var(--adm-text)', border: '1.5px solid var(--adm-border)',
      outline: 'none', transition: 'box-shadow 200ms ease, border 200ms ease', appearance: 'none'
    }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--adm-violet-c)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--adm-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}>
      {props.children}
    </select>
    <div className="absolute right-3 top-0 h-full flex items-center pointer-events-none">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--adm-text-xs)' }}>
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </div>
);

export default function MeasurementDetails({ userId }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // AI states
  const [checking, setChecking] = useState(false);
  const [anomalyFlags, setAnomalyFlags] = useState([]);
  const [showWarning, setShowWarning] = useState(false);

  // 1. CORE DATA
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // 2. GARMENT SPECS
  const [dressType, setDressType] = useState("Shirt");
  const [material, setMaterial] = useState("Cotton");
  const [fabricColor, setFabricColor] = useState("");
  const [fabricSource, setFabricSource] = useState("Customer");
  const [consumption, setConsumption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // 3. DYNAMIC MEASUREMENTS
  const [measurements, setMeasurements] = useState({});
  const [notes, setNotes] = useState("");

  const fieldsByDress = {
    Shirt: ["Neck", "Chest", "Waist", "Seat", "Shoulder", "Sleeve", "Cuff", "Length"],
    Pant: ["Waist", "Hip", "Thigh", "Knee", "Calf", "Bottom", "Inseam", "Length"],
    Suit: ["Chest", "Waist", "Hip", "Shoulder", "Sleeve", "Length", "Front Cross", "Back Cross"],
    Kurta: ["Neck", "Chest", "Waist", "Shoulder", "Sleeve", "Length"],
    Safari: ["Neck", "Chest", "Waist", "Shoulder", "Sleeve", "Length"],
    Sherwani: ["Neck", "Chest", "Waist", "Shoulder", "Sleeve", "Length"],
  };

  const dressOptions = ["Shirt", "Pant", "Suit", "Kurta", "Safari", "Sherwani"];
  const materialOptions = ["Cotton", "Linen", "Silk", "Wool", "Synthetic", "Blended", "Denim"];

  useEffect(() => { setMeasurements({}); setErrors({}); }, [dressType]);
  const handleMeasurementChange = (field, value) => setMeasurements(prev => ({ ...prev, [field]: value }));

  const currentDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDStr = maxDate.toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    if (!deliveryDate) newErrors.deliveryDate = "Required";
    if (!fabricColor.trim()) newErrors.fabricColor = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Original save logic
  const actualSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await addDoc(collection(db, "orders"), {
        tailorId: currentUser?.uid || "unknown",
        createdAt: serverTimestamp(),
        status: "Pending",
        isRead: false,
        customer: { name: customerName, phone },
        workflow: { trialDate, deliveryDate, priority: "Normal" },
        product: { dressType, material, fabricColor, fabricSource, consumption, referenceImage: imageUrl },
        specs: { measurements, notes },
      });
      setSuccess(true);
      setCustomerName(""); setPhone(""); setTrialDate(""); setDeliveryDate("");
      setConsumption(""); setFabricColor(""); setNotes(""); setMeasurements({}); setImageUrl("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Error saving order.");
    } finally {
      setLoading(false);
    }
  };

  // AI check then save
  const handleSave = async () => {
    if (!validateForm()) return;

    const filledMeasurements = Object.fromEntries(
      Object.entries(measurements).filter(([_, v]) => v !== "" && v !== undefined)
    );

    if (Object.keys(filledMeasurements).length > 0) {
      setChecking(true);
      try {
        const res = await fetch('/api/ai/check-measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            garment_type: dressType,
            measurements: filledMeasurements
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.flag_count > 0) {
            setAnomalyFlags(data.flags);
            setShowWarning(true);
            setChecking(false);
            return;
          }
        }
      } catch {
        console.warn('AI check unavailable — saving directly');
      }
      setChecking(false);
    }

    await actualSave();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target.tagName.toLowerCase() === 'textarea') return;
      e.preventDefault();
      const form = document.getElementById("new-order-ticket-form");
      if (!form) return;
      const elements = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'));
      const currentIndex = elements.indexOf(target);
      if (currentIndex > -1 && currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      }
    }
  };

  return (
    <>
      <div id="new-order-ticket-form" onKeyDown={handleKeyDown} style={{
        borderRadius: 14, border: '1px solid var(--adm-border)',
        background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden', position: 'relative'
      }}>
        {(loading || checking) && (
          <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 animate-pulse z-20" />
        )}

        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid var(--adm-border)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--adm-violet-bg)' }}>
            <Scissors className="w-3.5 h-3.5" style={{ color: 'var(--adm-violet-c)' }} />
          </div>
          <h2 className="adm-font-display text-[1.15rem] font-bold" style={{ color: 'var(--adm-text)' }}>
            New Order Ticket
          </h2>
        </div>

        <div className="p-0">
          {/* IDENTITY & SCHEDULE */}
          <div className="p-6 pb-5" style={{ borderBottom: '1px solid var(--adm-border)' }}>
            <SectH icon={User} title="Identity & Schedule" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div><Lbl text="Customer Name" />
                <Input hasErr={errors.customerName} value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              <div><Lbl text="Phone Number" />
                <Input hasErr={errors.phone} value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><Lbl text="Delivery Date" />
                <Input type="date" hasErr={errors.deliveryDate} value={deliveryDate} min={currentDate} max={maxDStr} onChange={e => setDeliveryDate(e.target.value)} /></div>
              <div><Lbl text="Trial Date (Opt)" />
                <Input type="date" value={trialDate} min={currentDate} max={maxDStr} onChange={e => setTrialDate(e.target.value)} /></div>
            </div>
          </div>

          {/* GARMENT DETAILS */}
          <div className="p-6 pb-5" style={{ borderBottom: '1px solid var(--adm-border)' }}>
            <SectH icon={Package} title="Garment Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mb-5">
              <div><Lbl text="Type" />
                <Select value={dressType} onChange={e => setDressType(e.target.value)}>
                  {dressOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </Select></div>
              <div><Lbl text="Fabric Material" />
                <Select value={material} onChange={e => setMaterial(e.target.value)}>
                  {materialOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </Select></div>
              <div><Lbl text="Color / Pattern" />
                <Input placeholder="Ex: Navy Blue" hasErr={errors.fabricColor} value={fabricColor} onChange={e => setFabricColor(e.target.value)} /></div>
              <div><Lbl text="Consumption (M)" />
                <Input type="number" step="0.1" value={consumption} onChange={e => setConsumption(e.target.value)} /></div>
            </div>

            <Lbl text="Design Reference Link" />
            <div className="relative mt-1 mb-3">
              <Link2 className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--adm-text-xs)' }} />
              <Input type="url" placeholder="Paste image URL..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ paddingLeft: 38 }} />
            </div>
            {imageUrl && (
              <div className="h-32 w-full rounded-lg overflow-hidden flex items-center justify-center mt-2"
                style={{ background: 'var(--adm-badge)', border: '1.5px solid var(--adm-border)' }}>
                <img src={imageUrl} className="max-w-full max-h-full object-contain" onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* MEASUREMENTS GRID */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--adm-amber-bg)' }}>
                <Ruler className="w-3 h-3" style={{ color: 'var(--adm-amber-c)' }} />
              </div>
              <span style={{ fontSize: '0.70rem', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', color: 'var(--adm-text-xs)' }}>
                Measurements
              </span>
              <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 999, background: 'var(--adm-badge)', color: 'var(--adm-text-xs)' }}>
                (Inches)
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {fieldsByDress[dressType]?.map((field) => (
                <div key={field} style={{
                  background: 'var(--adm-input-bg)', borderRadius: 10, padding: '10px 12px',
                  border: '1.5px solid var(--adm-border)', transition: 'border 200ms, box-shadow 200ms'
                }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--adm-amber-c)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.12)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--adm-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <label style={{
                    display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--adm-text-xs)'
                  }}>
                    {field}
                  </label>
                  <div className="flex items-end gap-1 mt-0.5">
                    <input type="number" step="0.1"
                      value={measurements[field] || ""}
                      onChange={e => handleMeasurementChange(field, e.target.value)}
                      className="adm-font-display text-lg font-bold p-0"
                      placeholder="—"
                      style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--adm-text)' }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--adm-text-xs)', marginBottom: 2 }}>in</span>
                  </div>
                </div>
              ))}
            </div>

            <Lbl text="Special Instructions" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special cuts, adjustments, or notes..."
              style={{
                width: '100%', minHeight: 80, padding: '12px 14px', borderRadius: 8, fontSize: '0.9rem',
                background: 'var(--adm-input-bg)', color: 'var(--adm-text)', resize: 'vertical',
                border: '1.5px solid var(--adm-border)', outline: 'none', transition: 'box-shadow 200ms, border 200ms'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--adm-amber-c)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--adm-border)'; e.currentTarget.style.boxShadow = 'none'; }}
            />

            <button
              onClick={handleSave}
              disabled={loading || checking}
              className="w-full mt-6 h-12 flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-transform shadow-md cursor-pointer"
              style={{
                background: (loading || checking) ? 'var(--adm-text-xs)' : (success ? 'var(--adm-emerald)' : 'var(--adm-violet-c)'),
                color: 'white', border: 'none'
              }}
              onMouseEnter={e => !(loading || checking) && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => !(loading || checking) && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {checking
                ? "AI Checking Measurements..."
                : loading
                  ? "Processing..."
                  : success
                    ? <><CheckCircle2 className="w-4 h-4" /> Sent to Manager</>
                    : <><Save className="w-4 h-4" /> Create Ticket</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* AI Warning Modal */}
      {showWarning && anomalyFlags.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-[400px] rounded-2xl overflow-hidden"
            style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>

            {/* Modal Header */}
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: 'rgba(217,119,6,0.08)', borderBottom: '1px solid var(--adm-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--adm-amber-bg)', border: '1px solid var(--adm-amber-br)' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: 'var(--adm-amber-c)' }} />
                </div>
                <div>
                  <p className="adm-font-display font-bold text-[14px]" style={{ color: 'var(--adm-text)' }}>
                    Measurement Warning
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--adm-text-xs)' }}>
                    {anomalyFlags.length} unusual value(s) — {dressType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowWarning(false); setAnomalyFlags([]); }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--adm-badge)', border: 'none', cursor: 'pointer' }}>
                <X className="w-3.5 h-3.5" style={{ color: 'var(--adm-text-xs)' }} />
              </button>
            </div>

            {/* Flags */}
            <div className="p-4 space-y-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {anomalyFlags.map((flag, i) => (
                <div key={i} className="p-3 rounded-xl"
                  style={{
                    background: flag.severity === 'high' ? 'rgba(220,38,38,0.07)' : 'rgba(217,119,6,0.07)',
                    border: `1px solid ${flag.severity === 'high' ? 'rgba(220,38,38,0.20)' : 'rgba(217,119,6,0.20)'}`
                  }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-text)' }}>
                      {flag.field}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '1px 6px', borderRadius: 999, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      background: flag.severity === 'high' ? 'rgba(220,38,38,0.12)' : 'rgba(217,119,6,0.12)',
                      color: flag.severity === 'high' ? 'var(--adm-red)' : 'var(--adm-amber-c)'
                    }}>
                      {flag.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--adm-text-sm)', lineHeight: 1.5 }}>
                    {flag.message}
                  </p>
                  {flag.range && (
                    <p style={{ fontSize: 10, color: 'var(--adm-text-xs)', marginTop: 3 }}>
                      Expected: {flag.range}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="px-4 pb-4 flex gap-3">
              <button
                onClick={() => { setShowWarning(false); setAnomalyFlags([]); }}
                className="flex-1 h-11 rounded-full font-bold text-[12px]"
                style={{ background: 'var(--adm-badge)', border: '1.5px solid var(--adm-border)', color: 'var(--adm-text-sm)', cursor: 'pointer' }}>
                ← Fix Measurements
              </button>
              <button
                onClick={async () => { setShowWarning(false); setAnomalyFlags([]); await actualSave(); }}
                className="flex-1 h-11 rounded-full font-bold text-[12px] text-white"
                style={{ background: 'linear-gradient(135deg, var(--adm-amber-c), #B45309)', border: 'none', cursor: 'pointer' }}>
                Save Anyway →
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}