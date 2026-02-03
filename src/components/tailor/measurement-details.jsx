'use client';

import { useState } from 'react';

export default function MeasurementDetails() {
  // Initialize state for the new customer fields [cite: 58, 71]
  const [customerName, setCustomerName] = useState('');
  const [dressType, setDressType] = useState('Shirt');
  const [material, setMaterial] = useState('Cotton');

  // Measurement fields derived from SRS Section 3.5 [cite: 71]
  const fieldsByDress = {
    Shirt: ['Collar', 'Chest', 'Sleeve', 'Shoulder', 'Length'],
    Pant: ['Waist', 'Hip', 'Inseam', 'Outseam', 'Bottom'],
    Suit: ['Chest', 'Waist', 'Shoulder', 'Back Length', 'Armhole'],
    Kurta: ['Neck', 'Chest', 'Sleeve', 'Shoulder', 'Length'],
  };

  const dressOptions = ['Shirt', 'Pant', 'Suit', 'Kurta'];
  const materialOptions = ['Cotton', 'Linen', 'Silk', 'Wool', 'Synthetic'];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      <div className="flex flex-col space-y-1.5 mb-6">
        <h3 className="font-semibold leading-none tracking-tight text-indigo-900">
          Garment Measurements
        </h3>
        {/* Updated description to include customer tracking [cite: 6, 58] */}
        <p className="text-sm text-muted-foreground">Enter customer name and garment details to record measurements[cite: 58, 71].</p>
      </div>

      <div className="grid gap-4">
        {/* NEW FIELD: Customer Name  */}
        <div className="space-y-2 mb-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer Name</label>
          <input 
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter full name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* Selection Row: Dress and Material [cite: 63, 66] */}
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
            <label className="text-xs font-medium">Material [cite: 67]</label>
            <select 
              value={material} 
              onChange={(e) => setMaterial(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {/* Measurement Inputs Area [cite: 71] */}
        <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
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
                  className="bg-transparent border-b border-indigo-200 focus:border-indigo-600 outline-none text-sm py-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fitting Adjustment Notes [cite: 73] */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Adjustment Notes</label>
          <textarea 
            placeholder="e.g. Loose fit on shoulders..."
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white shadow hover:bg-indigo-700 h-10 px-4 py-2 transition-colors">
          Save for {customerName || 'Customer'} [cite: 71, 123]
        </button>
      </div>
    </div>
  );
}