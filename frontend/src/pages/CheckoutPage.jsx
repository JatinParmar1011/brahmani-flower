import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getAddresses, createAddress } from '../services/authService';
import { checkoutApi } from '../services/orderService';
import AddressForm, { EMPTY_FORM } from '../components/AddressForm';

// ─────────────────────────────────────────────────────────────────────────────
// STEP BAR
// ─────────────────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = [
    { n: 1, label: 'Address' },
    { n: 2, label: 'Review'  },
    { n: 3, label: 'Payment' },
  ];
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              step > s.n  ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white'
            : step === s.n ? 'bg-white border-[#1a6b8a] text-[#1a6b8a] shadow-md ring-4 ring-[#1a6b8a]/15'
            :                'bg-white border-gray-200 text-gray-400'
            }`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-[11px] font-semibold whitespace-nowrap ${step >= s.n ? 'text-[#1a6b8a]' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-24 h-0.5 mb-5 mx-2 transition-all ${step > s.n ? 'bg-[#1a6b8a]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — ADDRESS
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = { fullName:'', mobileNumber:'', address1:'', address2:'', city:'', state:'', pincode:'', country:'India', addressType:'HOME', isDefault:false };

function validate(f) {
  const e = {};
  if (!f.fullName.trim())                    e.fullName     = 'Required';
  if (!/^[6-9]\d{9}$/.test(f.mobileNumber)) e.mobileNumber = 'Valid 10-digit mobile required';
  if (!f.address1.trim())                    e.address1     = 'Required';
  if (!/^[1-9][0-9]{5}$/.test(f.pincode))   e.pincode      = 'Valid 6-digit pincode required';
  if (!f.city.trim())                        e.city         = 'Required';
  if (!f.state.trim())                       e.state        = 'Required';
  return e;
}

function StepAddress({ onNext }) {
  const [addresses, setAddresses] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveErr,   setSaveErr]   = useState('');

  const TAG_ICON = { HOME: '🏠', WORK: '🏢', OTHER: '📌' };

  const load = () => {
    setLoading(true);
    getAddresses()
      .then(list => {
        setAddresses(list);
        const def = list.find(a => a.isDefault) || list[0];
        if (def) setSelected(def.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true); setSaveErr('');
    try {
      const saved = await createAddress(form);
      load();
      setSelected(saved.id);
      setAdding(false);
    } catch (e) {
      setSaveErr(e.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Select Delivery Address</h2>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1a6b8a] border border-[#1a6b8a] px-3 py-1.5 rounded-lg hover:bg-[#1a6b8a] hover:text-white transition-colors">
            + Add New
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="w-8 h-8 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Saved addresses */}
          {addresses.length > 0 && !adding && (
            <div className="flex flex-col gap-3 mb-6">
              {addresses.map(a => (
                <label key={a.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selected === a.id
                      ? 'border-[#1a6b8a] bg-[#1a6b8a]/4 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-[#1a6b8a]/40 hover:shadow-sm'
                  }`}>
                  <input type="radio" name="addr" checked={selected === a.id}
                    onChange={() => setSelected(a.id)} className="mt-1 accent-[#1a6b8a]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{a.fullName}</span>
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {TAG_ICON[a.addressType] || '📌'} {a.addressType}
                      </span>
                      {a.isDefault && (
                        <span className="text-[10px] font-bold bg-[#1a6b8a] text-white px-2 py-0.5 rounded-full">DEFAULT</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">📞 +91 {a.mobileNumber}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {a.address1}{a.address2 ? `, ${a.address2}` : ''}, {a.city}, {a.state} – {a.pincode}
                    </p>
                  </div>
                  {selected === a.id && (
                    <div className="w-5 h-5 rounded-full bg-[#1a6b8a] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          )}

          {/* Add address form — same component as Address Book in dashboard */}
          {(adding || addresses.length === 0) && (
            <div className="mb-5">
              {saveErr && (
                <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{saveErr}</div>
              )}
              <AddressForm
                onSave={handleSave}
                onCancel={addresses.length > 0 ? () => { setAdding(false); setSaveErr(''); } : undefined}
                saving={saving}
              />
            </div>
          )}

          {addresses.length > 0 && !adding && (
            <button onClick={() => onNext(selected)} disabled={!selected}
              className="w-full bg-gradient-to-r from-[#1a6b8a] to-[#155a75] hover:from-[#155a75] hover:to-[#0f4a62] disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm tracking-wide active:scale-[0.98]">
              Continue to Review →
            </button>
          )}
        </>
      )}
    </div>
  );
}

export { StepBar, StepAddress };


// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — ORDER REVIEW
// ─────────────────────────────────────────────────────────────────────────────
function StepReview({ items, cartTotal, address, onBack, onNext }) {
  const originalTotal = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0);
  const saved = originalTotal - cartTotal;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">Review Your Order</h2>

      {/* Delivery address */}
      <div className="bg-gradient-to-r from-[#1a6b8a]/5 to-blue-50/40 border border-[#1a6b8a]/15 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1a6b8a] flex items-center justify-center flex-shrink-0 text-white text-base shadow-sm">📍</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Delivering to</p>
          <p className="text-sm font-bold text-gray-900">{address?.fullName}</p>
          <p className="text-xs text-gray-500 mt-0.5">📞 +91 {address?.mobileNumber}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {address?.address1}{address?.address2 ? `, ${address.address2}` : ''}, {address?.city}, {address?.state} – {address?.pincode}
          </p>
        </div>
        <button onClick={onBack}
          className="text-xs text-[#1a6b8a] font-semibold hover:underline flex-shrink-0 mt-0.5">
          Change
        </button>
      </div>

      {/* Items list */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">Order Items</p>
          <span className="text-xs text-gray-400 font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        {items.map((item, idx) => {
          const disc = item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
          return (
            <div key={item.id}
              className={`flex items-center gap-4 px-5 py-4 ${idx !== items.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1a6b8a]/10 to-[#1a6b8a]/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  : <span className="text-3xl">🌸</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                  {disc > 0 && <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>}
                  {disc > 0 && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">{disc}% OFF</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400 mb-0.5">Qty: {item.qty}</p>
                <p className="text-sm font-bold text-gray-900">₹{item.subtotal}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
        <p className="text-sm font-bold text-gray-800 mb-4">Price Details</p>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>MRP Total ({items.length} item{items.length !== 1 ? 's' : ''})</span>
            <span className="line-through text-gray-400">₹{originalTotal}</span>
          </div>
          {saved > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount</span>
              <span>− ₹{saved}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Delivery Charges</span>
            <span className="text-green-600 font-semibold">FREE</span>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-base">Total Payable</span>
            <span className="text-xl font-extrabold text-[#1a6b8a]">₹{cartTotal}</span>
          </div>
        </div>
        {saved > 0 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-green-600 text-base">🎉</span>
            <p className="text-xs text-green-700 font-semibold">You are saving ₹{saved} on this order!</p>
          </div>
        )}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: '🔒', title: 'Secure Payment', sub: '100% safe & encrypted' },
          { icon: '🚚', title: 'Free Delivery',  sub: 'On all orders'         },
          { icon: '🔄', title: 'Easy Returns',   sub: '7-day return policy'   },
        ].map(b => (
          <div key={b.title} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl mb-1">{b.icon}</div>
            <p className="text-[11px] font-bold text-gray-700">{b.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{b.sub}</p>
          </div>
        ))}
      </div>

      <button onClick={onNext}
        className="w-full bg-gradient-to-r from-[#1a6b8a] to-[#155a75] hover:from-[#155a75] hover:to-[#0f4a62] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm tracking-wide active:scale-[0.98]">
        Continue to Payment →
      </button>
    </div>
  );
}

export { StepReview };

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — PAYMENT
// ─────────────────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'upi',  icon: '📱', label: 'UPI',           sub: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'nb',   icon: '🏦', label: 'Net Banking',   sub: 'All major banks supported'  },
  { id: 'cod',  icon: '💵', label: 'Cash on Delivery', sub: 'Pay when you receive'    },
];

const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay',  color: 'from-blue-50 to-blue-100',   border: 'border-blue-200',   text: 'text-blue-700',   icon: '🔵' },
  { id: 'phonepe', label: 'PhonePe',     color: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700', icon: '🟣' },
  { id: 'paytm',   label: 'Paytm',       color: 'from-sky-50 to-sky-100',     border: 'border-sky-200',    text: 'text-sky-700',    icon: '🔷' },
  { id: 'bhim',    label: 'BHIM UPI',    color: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700', icon: '🟠' },
];

const BANKS = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Punjab National Bank','Bank of Baroda','Canara Bank'];

function StepPayment({ cartTotal, onBack, onPay, placing }) {
  const [method,   setMethod]   = useState('upi');
  const [upiApp,   setUpiApp]   = useState('gpay');
  const [upiId,    setUpiId]    = useState('');
  const [upiMode,  setUpiMode]  = useState('app');
  const [bank,     setBank]     = useState('');
  const [card,     setCard]     = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [showCvv,  setShowCvv]  = useState(false);
  const [cardErr,  setCardErr]  = useState({});

  const setC = (k, v) => setCard(c => ({ ...c, [k]: v }));

  const fmtCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp  = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d;
  };

  const validateCard = () => {
    const e = {};
    if (card.number.replace(/\s/g,'').length < 16) e.number = 'Enter valid 16-digit card number';
    if (!card.name.trim())                          e.name   = 'Enter cardholder name';
    if (card.expiry.length < 5)                     e.expiry = 'Enter valid expiry MM/YY';
    if (card.cvv.length < 3)                        e.cvv    = 'Enter valid CVV';
    setCardErr(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (method === 'card' && !validateCard()) return;
    if (method === 'nb' && !bank) return;
    onPay(method);
  };

  const inp = (err) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition ${
      err ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
          : 'border-gray-200 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'}`;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Choose Payment Method</h2>
      <p className="text-xs text-gray-400 mb-5">All transactions are secure and encrypted</p>

      {/* Amount banner */}
      <div className="bg-gradient-to-r from-[#1a6b8a] to-[#155a75] rounded-2xl px-5 py-4 mb-6 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-white/70 text-xs font-medium">Amount to Pay</p>
          <p className="text-white text-2xl font-extrabold mt-0.5">₹{cartTotal}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
          <span className="text-white text-base">🔒</span>
          <span className="text-white text-xs font-semibold">Secure</span>
        </div>
      </div>

      {/* Method selector */}
      <div className="flex flex-col gap-2 mb-5">
        {PAYMENT_METHODS.map(m => (
          <label key={m.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              method === m.id
                ? 'border-[#1a6b8a] bg-[#1a6b8a]/4 shadow-sm'
                : 'border-gray-100 bg-white hover:border-[#1a6b8a]/40'
            }`}>
            <input type="radio" name="pay" checked={method === m.id}
              onChange={() => setMethod(m.id)} className="accent-[#1a6b8a]" />
            <span className="text-2xl">{m.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
            </div>
            {method === m.id && (
              <div className="w-5 h-5 rounded-full bg-[#1a6b8a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">✓</span>
              </div>
            )}
          </label>
        ))}
      </div>

      {/* UPI panel */}
      {method === 'upi' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex gap-3 mb-4">
            <button onClick={() => setUpiMode('app')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${upiMode === 'app' ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]' : 'border-gray-200 text-gray-500 hover:border-[#1a6b8a]'}`}>
              UPI App
            </button>
            <button onClick={() => setUpiMode('id')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${upiMode === 'id' ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]' : 'border-gray-200 text-gray-500 hover:border-[#1a6b8a]'}`}>
              UPI ID
            </button>
          </div>
          {upiMode === 'app' ? (
            <div className="grid grid-cols-2 gap-3">
              {UPI_APPS.map(app => (
                <button key={app.id} onClick={() => setUpiApp(app.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    upiApp === app.id
                      ? `bg-gradient-to-r ${app.color} ${app.border} shadow-sm`
                      : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <span className="text-xl">{app.icon}</span>
                  <span className={`text-xs font-bold ${upiApp === app.id ? app.text : 'text-gray-700'}`}>{app.label}</span>
                  {upiApp === app.id && <span className="ml-auto text-[10px] text-green-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Enter UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
              <p className="text-[11px] text-gray-400 mt-1.5">e.g. 9876543210@paytm, name@okaxis</p>
            </div>
          )}
        </div>
      )}

      {/* Card panel */}
      {method === 'card' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-4">
            {['VISA','MC','RuPay','AMEX'].map(b => (
              <span key={b} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">{b}</span>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Card Number</label>
              <input value={card.number} onChange={e => setC('number', fmtCard(e.target.value))}
                placeholder="0000 0000 0000 0000" maxLength={19} className={inp(cardErr.number)} />
              {cardErr.number && <p className="text-[11px] text-red-500 mt-0.5">{cardErr.number}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Cardholder Name</label>
              <input value={card.name} onChange={e => setC('name', e.target.value)}
                placeholder="Name as on card" className={inp(cardErr.name)} />
              {cardErr.name && <p className="text-[11px] text-red-500 mt-0.5">{cardErr.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Expiry</label>
                <input value={card.expiry} onChange={e => setC('expiry', fmtExp(e.target.value))}
                  placeholder="MM/YY" maxLength={5} className={inp(cardErr.expiry)} />
                {cardErr.expiry && <p className="text-[11px] text-red-500 mt-0.5">{cardErr.expiry}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">CVV</label>
                <div className="relative">
                  <input type={showCvv ? 'text' : 'password'} value={card.cvv}
                    onChange={e => setC('cvv', e.target.value.replace(/\D/g,'').slice(0,4))}
                    placeholder="•••" maxLength={4} className={inp(cardErr.cvv)} />
                  <button type="button" onClick={() => setShowCvv(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    {showCvv ? '🙈' : '👁'}
                  </button>
                </div>
                {cardErr.cvv && <p className="text-[11px] text-red-500 mt-0.5">{cardErr.cvv}</p>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <span className="text-blue-500 text-sm">🔒</span>
            <p className="text-[11px] text-blue-600">Your card details are encrypted and never stored.</p>
          </div>
        </div>
      )}

      {/* Net Banking panel */}
      {method === 'nb' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Select Your Bank</label>
          <div className="grid grid-cols-2 gap-2">
            {BANKS.map(b => (
              <button key={b} onClick={() => setBank(b)}
                className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  bank === b
                    ? 'border-[#1a6b8a] bg-[#1a6b8a]/5 text-[#1a6b8a] font-bold'
                    : 'border-gray-100 text-gray-700 hover:border-[#1a6b8a]/40'
                }`}>
                🏦 {b}
              </button>
            ))}
          </div>
          {!bank && <p className="text-[11px] text-amber-500 mt-2">Please select a bank to continue</p>}
        </div>
      )}

      {/* COD panel */}
      {method === 'cod' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 flex items-start gap-3">
          <span className="text-2xl">💵</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Cash on Delivery</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Pay ₹{cartTotal} in cash when your order is delivered. Please keep exact change ready.
            </p>
          </div>
        </div>
      )}

      {/* Pay button */}
      <button onClick={handlePay} disabled={placing || (method === 'nb' && !bank)}
        className="w-full bg-gradient-to-r from-[#1a6b8a] to-[#155a75] hover:from-[#155a75] hover:to-[#0f4a62] disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-sm tracking-wide active:scale-[0.98] flex items-center justify-center gap-2">
        {placing ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Placing Order…
          </>
        ) : (
          <>🔒 Pay ₹{cartTotal} Securely</>
        )}
      </button>

      <button onClick={onBack} disabled={placing}
        className="w-full mt-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl text-sm transition-colors">
        ← Back to Review
      </button>

      {/* Payment logos */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center mb-2 font-medium">ACCEPTED PAYMENTS</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['VISA','Mastercard','RuPay','UPI','Paytm','GPay','PhonePe','AMEX'].map(p => (
            <span key={p} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { StepPayment };

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — ORDER SUCCESS
// ─────────────────────────────────────────────────────────────────────────────
function OrderSuccess({ order, onViewOrders, onContinue }) {
  const steps = ['Order Confirmed', 'Processing', 'Shipped', 'Delivered'];
  return (
    <div className="text-center">
      {/* Animated checkmark */}
      <div className="relative w-28 h-28 mx-auto mb-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200">
          <span className="text-5xl">✓</span>
        </div>
        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Order Placed!</h2>
      <p className="text-sm text-gray-500 mb-4">Thank you for your order. We will deliver it soon.</p>

      {/* Order number */}
      <div className="inline-flex items-center gap-2 bg-[#1a6b8a]/8 border border-[#1a6b8a]/20 rounded-2xl px-5 py-3 mb-6">
        <span className="text-[#1a6b8a] text-base">📦</span>
        <div className="text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Order Number</p>
          <p className="text-base font-extrabold text-[#1a6b8a]">{order?.orderNumber}</p>
        </div>
      </div>

      {/* Order summary card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6 text-left">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Order Summary</p>
          <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            ✅ Confirmed
          </span>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {order?.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-700 flex-1 min-w-0 truncate">🌸 {item.productName}</span>
              <span className="text-gray-500 text-xs ml-2 flex-shrink-0">×{item.quantity}</span>
              <span className="font-semibold text-gray-900 ml-3 flex-shrink-0">₹{item.subtotal}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
            <span className="font-bold text-gray-900">Total Paid</span>
            <span className="text-lg font-extrabold text-[#1a6b8a]">₹{order?.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order?.address && (
        <div className="bg-gradient-to-r from-[#1a6b8a]/5 to-blue-50/40 border border-[#1a6b8a]/15 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
          <span className="text-xl mt-0.5">📍</span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Delivering to</p>
            <p className="text-sm font-bold text-gray-900">{order.address.fullName}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {order.address.address1}{order.address.address2 ? `, ${order.address.address2}` : ''}, {order.address.city}, {order.address.state} – {order.address.pincode}
            </p>
          </div>
        </div>
      )}

      {/* Delivery progress */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <p className="text-sm font-bold text-gray-800 mb-4 text-left">Delivery Progress</p>
        <div className="relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
          <div className="absolute top-4 left-4 h-0.5 bg-[#1a6b8a] z-0 transition-all duration-700" style={{ width: '8%' }} />
          <div className="relative z-10 flex justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2" style={{ width: '25%' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i === 0
                    ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white shadow-md ring-4 ring-[#1a6b8a]/20'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <p className={`text-[10px] text-center leading-tight font-medium ${i === 0 ? 'text-[#1a6b8a]' : 'text-gray-400'}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button onClick={onViewOrders}
          className="w-full bg-gradient-to-r from-[#1a6b8a] to-[#155a75] hover:from-[#155a75] hover:to-[#0f4a62] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm tracking-wide">
          📋 View My Orders
        </button>
        <button onClick={onContinue}
          className="w-full border-2 border-[#1a6b8a] text-[#1a6b8a] hover:bg-[#1a6b8a] hover:text-white font-semibold py-3 rounded-xl text-sm transition-all">
          🌸 Continue Shopping
        </button>
      </div>

      {/* Help note */}
      <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
        A confirmation will be sent to your registered mobile number.<br />
        Need help? <span className="text-[#1a6b8a] font-semibold cursor-pointer hover:underline">Contact Support</span>
      </p>
    </div>
  );
}

export { OrderSuccess };

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHECKOUT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage({ onBack, onViewOrders }) {
  const { items, cartTotal, reload } = useCart();
  const [step,     setStep]     = useState(1);
  const [addrId,   setAddrId]   = useState(null);
  const [addrObj,  setAddrObj]  = useState(null);
  const [placing,  setPlacing]  = useState(false);
  const [order,    setOrder]    = useState(null);
  const [error,    setError]    = useState('');

  // Fetch full address object when addrId is set
  useEffect(() => {
    if (!addrId) return;
    getAddresses().then(list => {
      const found = list.find(a => a.id === addrId);
      if (found) setAddrObj(found);
    }).catch(() => {});
  }, [addrId]);

  const handleAddrNext = (id) => {
    setAddrId(id);
    setStep(2);
  };

  const handlePay = async (method) => {
    setPlacing(true); setError('');
    try {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const placed = await checkoutApi(addrId, key);
      setOrder(placed);
      reload();
      setStep(4);
    } catch (e) {
      setError(e.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // Order summary sidebar data
  const originalTotal = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0);
  const saved = originalTotal - cartTotal;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1300px] mx-auto px-6 py-8">

        {/* Header */}
        {step < 4 && (
          <div className="flex items-center gap-4 mb-8">
            <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all shadow-sm">
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-400">
                {step === 1 ? 'Select delivery address'
               : step === 2 ? 'Review your order'
               :              'Complete payment'}
              </p>
            </div>
          </div>
        )}

        {step < 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: Steps ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <StepBar step={step} />
                {error && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}
                {step === 1 && <StepAddress onNext={handleAddrNext} />}
                {step === 2 && <StepReview items={items} cartTotal={cartTotal} address={addrObj} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
                {step === 3 && <StepPayment cartTotal={cartTotal} onBack={() => setStep(2)} onPay={handlePay} placing={placing} />}
              </div>
            </div>

            {/* ── Right: Order summary sidebar ── */}
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Order Summary</h3>

                {/* Items */}
                <div className="flex flex-col gap-3 mb-4 max-h-52 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6b8a]/10 to-[#1a6b8a]/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          : <span className="text-xl">🌸</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Qty: {item.qty}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 flex-shrink-0">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="line-through text-gray-400">₹{originalTotal}</span>
                  </div>
                  {saved > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount</span>
                      <span>− ₹{saved}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-lg font-extrabold text-[#1a6b8a]">₹{cartTotal}</span>
                  </div>
                </div>

                {saved > 0 && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-green-500 text-sm">🎉</span>
                    <p className="text-[11px] text-green-700 font-semibold">Saving ₹{saved}!</p>
                  </div>
                )}

                {/* Delivery address in sidebar (step 2+) */}
                {step >= 2 && addrObj && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Delivering to</p>
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">📍</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{addrObj.fullName}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          {addrObj.address1}, {addrObj.city}, {addrObj.state} – {addrObj.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security note */}
                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                  <span>🔒</span>
                  <span>Secure 256-bit SSL encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Step 4: Success (full width centered) ── */
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <OrderSuccess
                order={order}
                onViewOrders={onViewOrders}
                onContinue={onBack}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
