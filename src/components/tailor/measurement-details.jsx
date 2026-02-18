'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  Save, AlertCircle, CheckCircle2,
  User, Calendar, Scissors, Package, Ruler,
  ImageIcon, Link2, ExternalLink
} from 'lucide-react';

export default function MeasurementDetails({ userId }) {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // --- 1. CORE DATA ---
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [trialDate, setTrialDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // --- 2. GARMENT SPECS ---
  const [dressType, setDressType] = useState('Shirt');
  const [material, setMaterial] = useState('Cotton');
  const [fabricColor, setFabricColor] = useState('');
  const [fabricSource, setFabricSource] = useState('Customer');
  const [consumption, setConsumption] = useState('');
  const [imageUrl, setImageUrl] = useState(""); // NEW: For reference image

  // --- 3. DYNAMIC MEASUREMENTS ---
  const [measurements, setMeasurements] = useState({});
  const [notes, setNotes] = useState('');

  // Configuration
  const fieldsByDress = {
    Shirt: ['Neck', 'Chest', 'Waist', 'Seat', 'Shoulder', 'Sleeve', 'Cuff', 'Length'],
    Pant: ['Waist', 'Hip', 'Thigh', 'Knee', 'Calf', 'Bottom', 'Inseam', 'Length'],
    Suit: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve', 'Length', 'Front Cross', 'Back Cross'],
    Kurta: ['Neck', 'Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
    Safari: ['Neck', 'Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
    Sherwani: ['Neck', 'Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
  };

  const dressOptions = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Safari', 'Sherwani'];
  const materialOptions = ['Cotton', 'Linen', 'Silk', 'Wool', 'Synthetic', 'Blended', 'Denim'];

  useEffect(() => {
    setMeasurements({});
    setErrors({});
  }, [dressType]);

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  // --- VALIDATION ---
  const currentDate = new Date().toISOString().split('T')[0];
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const maxDate = threeMonthsFromNow.toISOString().split('T')[0];

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    if (!deliveryDate) newErrors.deliveryDate = "Required";
    if (!fabricColor.trim()) newErrors.fabricColor = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!validateForm()) return;

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
        product: { 
            dressType, 
            material, 
            fabricColor, 
            fabricSource, 
            consumption,
            referenceImage: imageUrl // SAVING THE IMAGE URL TO FIRESTORE
        },
        specs: { measurements, notes }
      });

      setSuccess(true);
      // Reset
      setCustomerName(""); setPhone(""); setTrialDate(""); setDeliveryDate("");
      setConsumption(""); setFabricColor(""); setNotes(""); setMeasurements({});
      setImageUrl("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Error saving order.");
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = `w-full h-10 px-3 rounded-md border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
      {loading && <div className="absolute top-0 w-full h-1 bg-indigo-500 animate-pulse z-20" />}

      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-indigo-600" /> New Order Ticket
          </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. CUSTOMER & DATES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <User className="w-3 h-3" /> Identity & Schedule
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Customer Name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`${baseInputClass} ${errors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${baseInputClass} ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Delivery Date</label>
              <input type="date" value={deliveryDate} min={currentDate} max={maxDate} onChange={(e) => setDeliveryDate(e.target.value)} className={`${baseInputClass} ${errors.deliveryDate ? 'border-red-500' : 'border-gray-200'}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Trial Date (Opt)</label>
              <input type="date" value={trialDate} min={currentDate} max={maxDate} onChange={(e) => setTrialDate(e.target.value)} className={`${baseInputClass} border-gray-200`} />
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* 2. GARMENT SPECS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <Package className="w-3 h-3" /> Garment Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
              <select value={dressType} onChange={(e) => setDressType(e.target.value)} className={`${baseInputClass} border-gray-200 bg-white`}>
                {dressOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Fabric Material</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className={`${baseInputClass} border-gray-200 bg-white`}>
                {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Color / Pattern</label>
              <input value={fabricColor} onChange={(e) => setFabricColor(e.target.value)} placeholder="Ex: Navy Blue" className={`${baseInputClass} ${errors.fabricColor ? 'border-red-500' : 'border-gray-200'}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Consumption (M)</label>
              <input type="number" step="0.1" value={consumption} onChange={(e) => setConsumption(e.target.value)} className={`${baseInputClass} border-gray-200`} />
            </div>
          </div>
        </section>

        {/* --- 3. REFERENCE IMAGE LINK SECTION --- */}
        <section className="mt-4 p-4 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/30">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            <ImageIcon className="w-3 h-3 text-indigo-600" /> Design Reference Link
          </div>
          <div className="relative">
            <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="url" 
              placeholder="Paste image URL (Pinterest, Imgur, etc.)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`${baseInputClass} pl-10 border-gray-200 bg-white`}
            />
          </div>
          {imageUrl && (
            <div className="mt-3 relative group">
              <div className="h-32 w-full rounded-md overflow-hidden border border-gray-200 bg-white">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=Invalid+Image+URL'; }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 4. MEASUREMENTS */}
        <section className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wide">
              <Ruler className="w-3 h-3" /> Measurements (Inches)
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fieldsByDress[dressType]?.map((field) => (
              <div key={field}>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{field}</label>
                <input type="number" step="0.1" value={measurements[field] || ''} onChange={(e) => handleMeasurementChange(field, e.target.value)} className="w-full h-9 px-2 rounded border border-gray-200 text-sm focus:border-indigo-500 outline-none font-mono" />
              </div>
            ))}
          </div>
        </section>

        {/* 5. NOTES */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Special Instructions</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 rounded-md border border-gray-200 text-sm focus:border-indigo-500 outline-none resize-none h-20" />
        </div>

        <button onClick={handleSave} disabled={loading} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : success ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}`}>
          {loading ? 'Processing...' : success ? <><CheckCircle2 className="w-4 h-4" /> Sent to Manager</> : <><Save className="w-4 h-4" /> Create Ticket</>}
        </button>
      </div>
    </div>
  );
}