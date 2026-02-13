'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { 
  Save, AlertCircle, CheckCircle2, 
  User, Calendar, Scissors, Package, Ruler 
} from 'lucide-react';

export default function MeasurementDetails() {
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
  const [fabricColor, setFabricColor] = useState(''); // NEW FIELD
  const [fabricSource, setFabricSource] = useState('Customer'); 
  const [consumption, setConsumption] = useState(''); 

  // --- 3. DYNAMIC MEASUREMENTS ---
  const [measurements, setMeasurements] = useState({});
  const [notes, setNotes] = useState('');

  // Configuration
  const fieldsByDress = {
    Shirt: ['Neck', 'Chest', 'Waist', 'Seat', 'Shoulder', 'Sleeve', 'Cuff', 'Length'],
    Pant: ['Waist', 'Hip', 'Thigh', 'Knee', 'Calf', 'Bottom', 'Inseam', 'Length'],
    Suit: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve', 'Length', 'Front Cross', 'Back Cross'],
    Kurta: ['Neck', 'Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
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
  // const validateForm = () => {
  //   const newErrors = {};
  //   if (!customerName.trim()) newErrors.customerName = "Required";
  //   if (!phone.trim()) newErrors.phone = "Required";
  //   if (!deliveryDate) newErrors.deliveryDate = "Required";
  //   if (!fabricColor.trim()) newErrors.fabricColor = "Required";
    
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };



  const validateForm = () => {
  const newErrors = {};
  if (!customerName.trim()) newErrors.customerName = "Required";
  if (!phone.trim()) newErrors.phone = "Required";
  
  // Date Validation Logic
  if (!deliveryDate) {
    newErrors.deliveryDate = "Required";
  } else {
    const selectedDate = new Date(deliveryDate).toISOString().split('T')[0];
    if (selectedDate < currentDate) {
      newErrors.deliveryDate = "Date cannot be in the past";
    } else if (selectedDate > maxDate) {
      newErrors.deliveryDate = "Date must be within 3 months";
    }
  }

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
        product: { dressType, material, fabricColor, fabricSource, consumption },
        specs: { measurements, notes }
      });

      setSuccess(true);
      // Reset
      setCustomerName(""); setPhone(""); setTrialDate(""); setDeliveryDate("");
      setConsumption(""); setFabricColor(""); setNotes(""); setMeasurements({});
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Error saving order.");
    } finally {
      setLoading(false);
    }
  };

  // Clean Input Styling
  const baseInputClass = `
    w-full h-10 px-3 rounded-md border text-sm transition-all outline-none
    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
  `;


  // 1. Get the current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// 2. Calculate the date exactly 3 months from now
const threeMonthsFromNow = new Date();
threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
const maxDate = threeMonthsFromNow.toISOString().split('T')[0];


  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
      
      {/* Loading Overlay */}
      {loading && <div className="absolute top-0 w-full h-1 bg-indigo-500 animate-progress z-20" />}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-indigo-600" /> New Order Ticket
          </h3>
        </div>
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
              <input 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Rajesh Kumar"
                className={`${baseInputClass} ${errors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Phone Number</label>
              <input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                className={`${baseInputClass} ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Delivery Date</label>
              <input 
                type="date"
                value={deliveryDate}
                min={currentDate} // Restricts anything before today
                max={maxDate}     // Restricts anything beyond 3 months
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={`${baseInputClass} ${errors.deliveryDate ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Trial Date (Opt)</label>
              <input 
                type="date"
                value={trialDate}
                min={currentDate} 
                max={maxDate}
                onChange={(e) => setTrialDate(e.target.value)}
                className={`${baseInputClass} border-gray-200`}
              />
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
              <select 
                value={dressType} 
                onChange={(e) => setDressType(e.target.value)}
                className={`${baseInputClass} border-gray-200 bg-white`}
              >
                {dressOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Fabric Material</label>
              <select 
                value={material} 
                onChange={(e) => setMaterial(e.target.value)}
                className={`${baseInputClass} border-gray-200 bg-white`}
              >
                {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Color / Pattern</label>
              <input 
                value={fabricColor}
                onChange={(e) => setFabricColor(e.target.value)}
                placeholder="Ex: Navy Blue Checked"
                className={`${baseInputClass} ${errors.fabricColor ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Consumption (M)</label>
              <input 
                type="number"
                step="0.1"
                placeholder="0.0"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                className={`${baseInputClass} border-gray-200`}
              />
            </div>
          </div>
        </section>

        {/* 3. MEASUREMENTS */}
        <section className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wide">
              <Ruler className="w-3 h-3" /> Measurements
            </div>
            <span className="text-[10px] text-gray-400 font-mono">INCHES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fieldsByDress[dressType]?.map((field) => (
              <div key={field}>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{field}</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={measurements[field] || ''} 
                  onChange={(e) => handleMeasurementChange(field, e.target.value)}
                  className="w-full h-9 px-2 rounded border border-gray-200 text-sm focus:border-indigo-500 outline-none font-mono placeholder-gray-300"
                  placeholder="0.0"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 4. NOTES */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Special Instructions</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-200 text-sm focus:border-indigo-500 outline-none resize-none h-20"
            placeholder="Fitting preference, extra pockets..."
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all
            ${loading ? 'bg-gray-400 cursor-not-allowed' : success ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100'}
          `}
        >
          {loading ? 'Processing...' : success ? (
            <><CheckCircle2 className="w-4 h-4" /> Sent to Manager</>
          ) : (
            <><Save className="w-4 h-4" /> Create Ticket</>
          )}
        </button>

      </div>
    </div>
  );
}