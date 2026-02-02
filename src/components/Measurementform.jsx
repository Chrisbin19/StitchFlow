"use client";
import { useState } from "react";

export default function MeasurementForm() {
  const [dressType, setDressType] = useState("Shirt");
  const [material, setMaterial] = useState("Cotton");

  // Define measurement fields for each dress type
  const measurementFields = {
    Shirt: ["Collar", "Chest", "Sleeve Length", "Shoulder", "Shirt Length"],
    Pant: ["Waist", "Hip", "Inseam", "Outseam", "Bottom Opening"],
    Suit: ["Chest", "Waist", "Shoulder", "Back Length", "Armhole", "Sleeve"],
  };

  const dressOptions = ["Shirt", "Pant", "Suit", "Kurta"];
  const materialOptions = ["Cotton", "Linen", "Silk", "Wool", "Synthetic"];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Record Measurements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Dress Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dress Type</label>
          <select 
            value={dressType}
            onChange={(e) => setDressType(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {dressOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Material Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
          <select 
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {materialOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Fields Section */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">
          {dressType} Measurements (Inches)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {measurementFields[dressType].map((field) => (
            <div key={field}>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">
                {field}
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder="0.0"
                className="w-full p-2 border-b-2 border-indigo-200 bg-transparent focus:border-indigo-600 outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section as per SRS 3.5 */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Adjustment Notes</label>
        <textarea 
          placeholder="e.g., Loose fit on waist, tight collar..."
          className="w-full p-3 border rounded-lg bg-gray-50 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
        ></textarea>
      </div>
    </div>
  );
}