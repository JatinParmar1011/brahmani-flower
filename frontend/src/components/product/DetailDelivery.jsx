import { useState } from 'react';
import { checkProductServiceability } from '../../services/deliveryService';

/**
 * Delivery section on the product detail page.
 * Calls the backend serviceability API — no business logic in React.
 * Preserves existing delivery info display.
 */
export default function DetailDelivery({ product }) {
  const { delivery } = product;
  const [pincode,  setPincode]  = useState('');
  const [status,   setStatus]   = useState(null); // null | 'checking' | 'available' | 'unavailable' | 'invalid' | 'error'
  const [message,  setMessage]  = useState('');
  const [etd,      setEtd]      = useState('');
  const [charge,   setCharge]   = useState(null);

  const deliveryRows = [
    { label: 'Standard Delivery', value: `Earliest: ${delivery || 'Tomorrow'}`, color: 'text-green-600' },
  ];

  const handleCheck = async () => {
    const trimmed = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
      setStatus('invalid');
      setMessage('Please enter a valid 6-digit pincode.');
      return;
    }

    setStatus('checking');
    setMessage('');
    setEtd('');
    setCharge(null);

    try {
      const result = await checkProductServiceability(product.id, trimmed, '');
      if (result.serviceable) {
        setStatus('available');
        setMessage(result.message || 'Delivery available to this pincode!');
        setEtd(result.estimatedDeliveryDate || '');
        setCharge(result.deliveryCharge);
      } else {
        setStatus('unavailable');
        // Map backend status codes to user-friendly messages
        if (result.status === 'INVALID_PINCODE') {
          setStatus('invalid');
          setMessage('Invalid pincode. Please check and try again.');
        } else if (result.status === 'LOCATION_REQUIRED') {
          setStatus('invalid');
          setMessage('Please enter a valid pincode.');
        } else if (result.status === 'TEMPORARILY_UNAVAILABLE' || result.status === 'PROVIDER_ERROR') {
          setStatus('error');
          setMessage('Delivery check temporarily unavailable. Please try again.');
        } else {
          setMessage(result.message || 'Delivery not available to this pincode.');
        }
      }
    } catch (e) {
      setStatus('error');
      setMessage('Unable to check delivery. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheck();
  };

  // Status indicator component
  const StatusBadge = () => {
    if (!status || status === 'checking') return null;
    if (status === 'available') {
      return (
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-xs text-green-600 font-semibold">✓ {message}</p>
          {etd && <p className="text-xs text-gray-500">📅 Estimated delivery: <span className="font-medium">{etd}</span></p>}
          {charge !== null && Number(charge) > 0 && (
            <p className="text-xs text-gray-500">🚚 Delivery charge: <span className="font-medium">₹{charge}</span></p>
          )}
          {charge !== null && Number(charge) === 0 && (
            <p className="text-xs text-green-600 font-medium">🎉 Free delivery!</p>
          )}
        </div>
      );
    }
    if (status === 'unavailable') {
      return <p className="text-xs text-red-500 font-semibold mt-2">✕ {message}</p>;
    }
    if (status === 'invalid') {
      return <p className="text-xs text-amber-500 font-semibold mt-2">⚠ {message}</p>;
    }
    if (status === 'error') {
      return <p className="text-xs text-gray-500 mt-2">⚠ {message}</p>;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Existing delivery info — preserved */}
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

      {/* Delivery availability check */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2">📍 Check Delivery Availability</p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            onChange={e => {
              setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setStatus(null);
              setMessage('');
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a6b8a]"
          />
          <button
            onClick={handleCheck}
            disabled={status === 'checking' || pincode.length !== 6}
            className="bg-[#1a6b8a] disabled:bg-gray-300 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#155a75] transition-colors border-none min-w-[60px] flex items-center justify-center"
          >
            {status === 'checking'
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Check'}
          </button>
        </div>
        <StatusBadge />
      </div>
    </div>
  );
}
