'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, Phone, Scissors, User, Package, 
  Save, AlertCircle, CheckCircle2, Ruler 
} from 'lucide-react';

export default function MeasurementDetails() {
  const { currentUser } = useAuth();
  
  // --- UI STATES ---
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({}); // Object to track field-level errors

  // --- 1. CORE IDENTITY ---
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  
  // --- 2. WORKFLOW DATES ---
  const [trialDate, setTrialDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // --- 3. GARMENT & FABRIC ---
  const [dressType, setDressType] = useState('Shirt');
  const [material, setMaterial] = useState('Cotton');
  const [fabricSource, setFabricSource] = useState('Customer'); 
  const [consumption, setConsumption] = useState(''); 

  // --- 4. TECHNICAL SPECS ---
  const [measurements, setMeasurements] = useState({});
  const [notes, setNotes] = useState('');

  // --- CONFIGURATION ---
  const fieldsByDress = {
    Shirt: ['Neck', 'Chest', 'Waist', 'Seat', 'Shoulder', 'Sleeve Length', 'Bicep', 'Cuff', 'Length'],
    Pant: ['Waist', 'Hip', 'Thigh', 'Knee', 'Calf', 'Bottom', 'Length', 'Inseam', 'Crotch'],
    Suit: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve', 'Length', 'Front Cross', 'Back Cross'],
    Kurta: ['Neck', 'Chest', 'Waist', 'Shoulder', 'Sleeve', 'Length'],
  };

  const dressOptions = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Safari', 'Sherwani'];
  const materialOptions = ['Cotton', 'Linen', 'Silk', 'Wool', 'Synthetic', 'Blended'];

  // Reset measurements when dress type changes
  useEffect(() => {
    setMeasurements({});
    setErrors({}); // Clear errors on switch
  }, [dressType]);

  // Handle Dynamic Inputs
  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Customer Name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!deliveryDate) newErrors.deliveryDate = "Delivery date is required";
    if (!consumption && fabricSource === 'Shop') newErrors.consumption = "Consumption required for Shop fabric";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMIT LOGIC ---
  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to top or alert user
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const orderPayload = {
        tailorId: currentUser?.uid || "unknown",
        createdAt: serverTimestamp(),
        status: "Pending", // Initial Status
        
        customer: {
          name: customerName,
          phone: phone,
        },

        workflow: {
          trialDate: trialDate || null,
          deliveryDate: deliveryDate, // Guaranteed by validation
          priority: "Normal", // Logic could be added to auto-set High based on date
        },

        product: {
          dressType,
          material,
          fabricSource,
          consumption: consumption || "0",
        },

        specs: {
          measurements,
          notes,
        }
      };

      await addDoc(collection(db, "orders"), orderPayload);

      setSuccess(true);
      
      // Reset Form for Next Order
      setCustomerName("");
      setPhone("");
      setTrialDate("");
      setDeliveryDate("");
      setConsumption("");
      setNotes("");
      setMeasurements({});
      setErrors({});
      
      setTimeout(() => setSuccess(false), 4000);

    } catch (error) {
      console.error("Error saving order:", error);
      alert("System Error: Could not save order. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for Input Classes
  const inputClass = (error) => `
    flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all outline-none
    ${error 
      ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
      : 'border-input focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
  `;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
      
      {/* --- TOP LOADING BAR --- */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden z-20">
          <div className="h-full bg-indigo-600 animate-progress origin-left-right"></div>
        </div>
      )}

      {/* --- SUCCESS OVERLAY --- */}
      {success && (
        <div className="absolute inset-0 bg-white/90 z-30 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-6 bg-white rounded-2xl shadow-2xl border border-green-100 transform animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Order Created!</h3>
            <p className="text-gray-500 mt-2">Ticket has been sent to the Cutter.</p>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-indigo-600" /> 
            New Order Ticket
          </h3>
          <p className="text-xs text-gray-500 mt-1">Fill in all required details to generate job card.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Live System
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* SECTION 1: CUSTOMER IDENTITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-md text-blue-600"><User className="w-4 h-4" /></div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Details</h4>
             </div>
             
             <div className="space-y-3">
               <div>
                 <input 
                   type="text"
                   value={customerName}
                   onChange={(e) => setCustomerName(e.target.value)}
                   placeholder="Customer Full Name *"
                   className={inputClass(errors.customerName)}
                 />
                 {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
               </div>
               <div>
                 <input 
                   type="tel"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   placeholder="WhatsApp Number *"
                   className={inputClass(errors.phone)}
                 />
                 {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
               </div>
             </div>
          </div>

          {/* SECTION 2: SCHEDULE */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-orange-50 rounded-md text-orange-600"><Calendar className="w-4 h-4" /></div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Production Schedule</h4>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Trial Date</label>
                 <input 
                   type="date"
                   value={trialDate}
                   onChange={(e) => setTrialDate(e.target.value)}
                   className={inputClass(false)}
                 />
               </div>
               <div>
                 <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block text-indigo-600">Delivery Date *</label>
                 <input 
                   type="date"
                   value={deliveryDate}
                   onChange={(e) => setDeliveryDate(e.target.value)}
                   className={inputClass(errors.deliveryDate)}
                 />
                 {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">Required</p>}
               </div>
             </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full" />

        {/* SECTION 3: GARMENT & FABRIC LOGISTICS */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 rounded-md text-purple-600"><Package className="w-4 h-4" /></div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Garment & Fabric Specification</h4>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Type</label>
                <select 
                  value={dressType} 
                  onChange={(e) => setDressType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none focus:border-indigo-500"
                >
                  {dressOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Material</label>
                <select 
                  value={material} 
                  onChange={(e) => setMaterial(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none focus:border-indigo-500"
                >
                  {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Source</label>
                <select 
                  value={fabricSource} 
                  onChange={(e) => setFabricSource(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Customer">Customer Provided</option>
                  <option value="Shop">Shop Inventory</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Consumption (M)</label>
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="0.0"
                    step="0.1"
                    value={consumption}
                    onChange={(e) => setConsumption(e.target.value)}
                    className={`pl-3 pr-8 ${inputClass(errors.consumption)}`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">M</span>
                </div>
              </div>
           </div>
        </div>

        {/* SECTION 4: DYNAMIC MEASUREMENTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600"><Ruler className="w-4 h-4" /></div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dressType} Measurements</h4>
             </div>
             <span className="text-[10px] text-gray-400 font-mono">INCHES</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {fieldsByDress[dressType]?.map((field) => (
              <div key={field} className="group relative">
                <div className={`absolute -top-2.5 left-2 bg-white px-1 text-[10px] font-bold uppercase tracking-wider transition-colors
                  ${measurements[field] ? 'text-indigo-600' : 'text-gray-400 group-focus-within:text-indigo-600'}
                `}>
                  {field}
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  value={measurements[field] || ''} 
                  onChange={(e) => handleMeasurementChange(field, e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-lg font-mono text-gray-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="0.0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: MASTER'S NOTES */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase text-gray-500">Master's Observations</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Right shoulder slightly down, keep loose fit..."
            className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none"
          />
        </div>

        {/* ACTION BAR */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
           {Object.keys(errors).length > 0 && (
             <div className="flex items-center gap-2 text-red-500 text-sm font-medium animate-pulse">
               <AlertCircle className="w-4 h-4" />
               <span>Please fix errors above</span>
             </div>
           )}
           
           <button 
             onClick={handleSave}
             disabled={loading}
             className={`
               relative overflow-hidden group flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]
               ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
             `}
           >
             <Save className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
             <span>{loading ? 'Processing...' : 'Create Order Ticket'}</span>
           </button>
        </div>

      </div>
    </div>
  );
}