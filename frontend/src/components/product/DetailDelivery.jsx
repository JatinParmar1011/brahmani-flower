import { useState } from 'react';

const CARE = [
  { icon: '💧', title: 'Water Daily',      desc: 'Keep stems in fresh water' },
  { icon: '🌡️', title: 'Room Temp',       desc: 'Avoid direct sunlight' },
  { icon: '✂️', title: 'Trim Stems',      desc: 'Cut at 45° every 2 days' },
  { icon: '🌸', title: 'Lasts 5–7 Days',  desc: 'With proper care' },
];

export default function DetailDelivery({ delivery }) {
  const [pincode, setPincode] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Delivery info */}
      <div>
        <p className="text-sm font-bold text-gray-800 mb-3">🚚 Delivery Details</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Standard Delivery', value: `Earliest: ${delivery}`, color: 'text-green-600' },
            { label: 'Express Delivery',  value: 'Within 4 hours',        color: 'text-orange-500' },
            { label: 'Midnight Delivery', value: 'Available',             color: 'text-purple-600' },
          ].map(d => (
            <div key={d.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-600">{d.label}</span>
              <span className={`text-xs font-semibold ${d.color}`}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pincode checker */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2">📍 Check Delivery Availability</p>
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            onChange={e => { setPincode(e.target.value); setChecked(false); }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a6b8a]"
          />
          <button
            onClick={() => pincode.length === 6 && setChecked(true)}
            className="bg-[#1a6b8a] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#155a75] transition-colors border-none"
          >
            Check
          </button>
        </div>
        {checked && (
          <p className="text-xs text-green-600 font-semibold mt-2">✓ Delivery available to {pincode}!</p>
        )}
      </div>

      {/* Care tips */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-3">🌸 Care Instructions</p>
        <div className="grid grid-cols-2 gap-2">
          {CARE.map(c => (
            <div key={c.title} className="flex items-start gap-2 bg-gray-50 rounded-xl p-2.5">
              <span className="text-base mt-0.5">{c.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-gray-800">{c.title}</p>
                <p className="text-[10px] text-gray-500">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
