'use client';

import { useState, useEffect } from 'react';
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function MeasurementDetails() {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Core Form State
  const [customerName, setCustomerName] = useState('');
  const [dressType, setDressType] = useState('Shirt');
  const [material, setMaterial] = useState('Cotton');
  const [notes, setNotes] = useState('');
  
  // Dynamic Measurements State
  const [measurements, setMeasurements] = useState({});

  // Configuration
  const fieldsByDress = {
    Shirt: ['Collar', 'Chest', 'Sleeve', 'Shoulder', 'Length'],
    Pant: ['Waist', 'Hip', 'Inseam', 'Outseam', 'Bottom'],
    Suit: ['Chest', 'Waist', 'Shoulder', 'Back Length', 'Armhole'],
    Kurta: ['Neck', 'Chest', 'Sleeve', 'Shoulder', 'Length'],
  };

  const dressOptions = ['Shirt', 'Pant', 'Suit', 'Kurta'];
  const materialOptions = ['Cotton', 'Linen', 'Silk', 'Wool', 'Synthetic'];

  // Reset measurements when dress type changes
  useEffect(() => {
    setMeasurements({});
  }, [dressType]);

  // Handle Dynamic Inputs
  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit Logic
  const handleSave = async () => {
    if (!customerName) {
      alert("Please enter a customer name");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await addDoc(collection(db, "measurements"), {
        tailorId: currentUser?.uid || "unknown", // Link to logged-in tailor
        customerName,
        dressType,
        material,
        measurements, // The dynamic object { Collar: "15", Chest: "40"... }
        notes,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      
      // Optional: Clear form after success
      setCustomerName("");
      setNotes("");
      setMeasurements({});
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("Error saving measurement:", error);
      alert("Failed to save. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6 relative overflow-hidden">
      
      {/* Success Overlay Animation */}
      {success && (
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
      )}

      <div className="flex flex-col space-y-1.5 mb-6">
        <h3 className="font-semibold leading-none tracking-tight text-indigo-900">
          Garment Measurements
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter customer name and garment details to record measurements.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Customer Name */}
        <div className="space-y-2 mb-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer Name</label>
          <input 
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter full name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Selection Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Dress Type</label>
            <select 
              value={dressType} 
              onChange={(e) => setDressType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {dressOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Material</label>
            <select 
              value={material} 
              onChange={(e) => setMaterial(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {/* Dynamic Measurement Inputs Area */}
        <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 transition-all">
          <p className="text-[10px] font-bold text-indigo-700 uppercase mb-4 tracking-wider">
            Required for {dressType}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fieldsByDress[dressType]?.map((field) => (
              <div key={field} className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">{field}</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0" 
                  value={measurements[field] || ''} 
                  onChange={(e) => handleMeasurementChange(field, e.target.value)}
                  className="bg-transparent border-b border-indigo-200 focus:border-indigo-600 outline-none text-sm py-1 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fitting Adjustment Notes */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Adjustment Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Loose fit on shoulders..."
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-md text-sm font-medium text-white shadow h-10 px-4 py-2 transition-all active:scale-95
            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
            ${success ? 'bg-green-600 hover:bg-green-700' : ''}
          `}
        >
          {loading ? 'Saving...' : success ? 'Saved Successfully!' : `Save for ${customerName || 'Customer'}`}
        </button>
      </div>
    </div>
  );
}