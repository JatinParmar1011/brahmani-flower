import { useState } from 'react';

export default function DetailDelivery({ product }) {
  const { delivery } = product;
  const [pincode, setPincode] = useState('');
  const [checked, setChecked] = useState(false);

  const deliveryRows = [
    { label: 'Standard Delivery', value: `Earliest: ${delivery || 'Tomorrow'}`, color: 'text-green-600' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold text-gray-800 mb-3">🚚 Delivery Details</p>
        <div className="flex flex-col gap-2">
          {deliveryRows.map(d => (
            <div key={d.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-600">{d.label}</span>
              <span className={`text-xs font-semibold ${d.color}`}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-700 mb-2">📍 Check Delivery Availability</p>
        <div className="flex gap-2">
          <input type="text" maxLength={6} placeholder="Enter pincode" value={pincode}
            onChange={e => { setPincode(e.target.value); setChecked(false); }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a6b8a]"
          />
          <button onClick={() => pincode.length === 6 && setChecked(true)}
            className="bg-[#1a6b8a] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#155a75] transition-colors border-none">
            Check
          </button>
        </div>
        {checked && <p className="text-xs text-green-600 font-semibold mt-2">✓ Delivery available to {pincode}!</p>}
      </div>


    </div>
  );
}
