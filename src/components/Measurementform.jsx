"use client";
import { useState } from "react";
import { ImageIcon, Link2, ExternalLink } from "lucide-react"; // Optional: assumes you use lucide-react

export default function MeasurementForm() {
  const [dressType, setDressType] = useState("Shirt");
  const [material, setMaterial] = useState("Cotton");
  const [imageUrl, setImageUrl] = useState(""); // State for the image link

  const measurementFields = {
    Shirt: ["Collar", "Chest", "Sleeve Length", "Shoulder", "Shirt Length"],
    Pant: ["Waist", "Hip", "Inseam", "Outseam", "Bottom Opening"],
    Suit: ["Chest", "Waist", "Shoulder", "Back Length", "Armhole", "Sleeve"],
    Kurta: ["Neck", "Chest", "Waist", "Hip", "Sleeve", "Length"],
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
          {measurementFields[dressType]?.map((field) => (
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

      {/* --- NEW SECTION: REFERENCE IMAGE LINK --- */}
      <div className="mt-8 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Design Reference (URL)</label>
        </div>
        
        <div className="relative group">
          <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="url" 
            placeholder="Paste design link (Imgur, Cloudinary, etc.)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full pl-10 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Image Preview Window */}
        {imageUrl && (
          <div className="mt-4 relative group">
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase flex justify-between">
              Preview 
              <a href={imageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1 hover:underline">
                View Full <ExternalLink className="w-2 h-2" />
              </a>
            </div>
            <div className="h-40 w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img 
                src={imageUrl} 
                alt="Design Preview" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=Invalid+Image+URL'; }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Adjustment Notes</label>
        <textarea 
          placeholder="e.g., Loose fit on waist, tight collar..."
          className="w-full p-3 border rounded-lg bg-gray-50 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
        Save Record
      </button>
    </div>
  );
}