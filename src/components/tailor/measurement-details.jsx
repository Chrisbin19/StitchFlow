"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Scissors, User, Package, ImageIcon, Link2, Ruler, Save, CheckCircle2 } from "lucide-react";

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
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 3); const maxDStr = maxDate.toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    if (!deliveryDate) newErrors.deliveryDate = "Required";
    if (!fabricColor.trim()) newErrors.fabricColor = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true); setSuccess(false);
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
    <div id="new-order-ticket-form" onKeyDown={handleKeyDown} style={{
      borderRadius: 14, border: '1px solid var(--adm-border)',
      background: 'var(--adm-card)', boxShadow: 'var(--adm-shadow)', overflow: 'hidden', position: 'relative'
    }}>
      {loading && <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 animate-pulse z-20" />}

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
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--adm-amber-bg)' }}>
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
                  <input type="number" step="0.1" value={measurements[field] || ""} onChange={e => handleMeasurementChange(field, e.target.value)}
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

          <button onClick={handleSave} disabled={loading}
            className="w-full mt-6 h-12 flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-transform shadow-md cursor-pointer"
            style={{
              background: loading ? 'var(--adm-text-xs)' : (success ? 'var(--adm-emerald)' : 'var(--adm-violet-c)'),
              color: 'white', border: 'none'
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? "Processing..." : success ? <><CheckCircle2 className="w-4 h-4" /> Sent to Manager</> : <><Save className="w-4 h-4" /> Create Ticket</>}
          </button>
        </div>
      </div>
    </div>
  );
}
