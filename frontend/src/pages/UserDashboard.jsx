import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/authService';

// ── Sidebar nav items ──────────────────────────────────────────────────────
const NAV = [
  { key: 'profile',  icon: '👤', label: 'Profile' },
  { key: 'orders',   icon: '📋', label: 'Order History' },
  { key: 'address',  icon: '📍', label: 'Address Book' },
  { key: 'track',    icon: '🚚', label: 'Track Order' },
];

// ── Profile Panel ──────────────────────────────────────────────────────────
function ProfilePanel({ user }) {
  const genderFromTitle = t => t === 'Mr.' ? 'Male' : 'Female';
  const [form, setForm] = useState({ title: '', name: '', email: '', mobile: '', dateOfBirth: '', gender: '' });
  const [emailVerified, setEmailVerified]   = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  // email verify UI state
  const [emailCode, setEmailCode]       = useState('');
  const [emailSent, setEmailSent]       = useState(false);
  const [sendingCode, setSendingCode]   = useState(false);
  const [emailError, setEmailError]     = useState('');
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  useEffect(() => {
    getProfile()
      .then(data => {
        setForm({ title: data.title || 'Mr.', name: data.name || '', email: data.email || '', mobile: data.mobileNumber || user?.mobileNumber || '', dateOfBirth: data.dateOfBirth || '', gender: data.gender || '' });
        setEmailVerified(data.emailVerified || false);
        setMobileVerified(data.mobileVerified ?? true);
      })
      .catch(() => {
        setForm({ title: user?.title || 'Mr.', name: user?.name || '', email: user?.email || '', mobile: user?.mobileNumber || '', dateOfBirth: user?.dateOfBirth || '', gender: user?.gender || '' });
        setMobileVerified(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      await updateProfile({ name: form.name, title: form.title, gender: form.gender || genderFromTitle(form.title), dateOfBirth: form.dateOfBirth, email: form.email });
      setSaved(true);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSendCode = async () => {
    setEmailError(''); setSendingCode(true);
    await new Promise(r => setTimeout(r, 800)); // replace with real email API call
    setEmailSent(true); setSendingCode(false);
  };

  const handleVerifyCode = () => {
    if (emailCode.length === 6) { setEmailVerified(true); setEmailError(''); setEmailSent(false); setEmailCode(''); }
    else setEmailError('Enter the 6-digit code sent to your email.');
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const initials = (() => {
    const parts = (form.name || 'U').trim().split(/\s+/);
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">My Profile</h2>
      <p className="text-sm text-gray-400 mb-7">Manage your personal information</p>

      {/* Avatar card */}
      <div className="flex items-center gap-5 mb-8 p-5 bg-gradient-to-r from-[#1a6b8a]/5 to-[#1a6b8a]/10 rounded-2xl border border-[#1a6b8a]/10">
        <div className="w-16 h-16 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">{initials}</div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{form.name || 'Your Name'}</p>
          <p className="text-sm text-gray-500">{form.mobile ? `+91 ${form.mobile}` : 'No mobile'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
          <select value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white transition">
            {['Mr.','Mrs.','Ms.'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
        </div>

        {/* Mobile — read only + verified tick */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Mobile
            {mobileVerified && <span className="ml-1.5 text-green-600">✅ Verified</span>}
          </label>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <span className="flex items-center px-3 border-r border-gray-200 text-sm text-gray-500 select-none">🇮🇳 +91</span>
            <input type="tel" value={form.mobile} readOnly
              className="flex-1 px-4 py-3 text-sm outline-none bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
        </div>

        {/* Email + inline verify */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Email
            {emailVerified
              ? <span className="ml-1.5 text-green-600">✅ Verified</span>
              : form.email && <span className="ml-1.5 text-amber-500 text-[10px]">⚠ Not verified</span>
            }
          </label>
          <div className="flex gap-2">
            <input type="email" value={form.email}
              onChange={e => {
                set('email', e.target.value);
                setEmailSent(false);
                setEmailVerified(false); // reset verified if email changes
                setEmailError('');
              }}
              placeholder="your@email.com"
              disabled={emailVerified}
              className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                emailVerified
                  ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'
              }`}
            />
            {isValidEmail && !emailVerified && (
              <button onClick={handleSendCode} disabled={sendingCode}
                className="px-3 py-2 bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors">
                {sendingCode ? '…' : emailSent ? 'Resend' : 'Send Code'}
              </button>
            )}
          </div>
          {emailSent && !emailVerified && (
            <div className="mt-2 flex gap-2">
              <input type="text" inputMode="numeric" value={emailCode} maxLength={6}
                onChange={e => { setEmailCode(e.target.value.replace(/\D/g,'').slice(0,6)); setEmailError(''); }}
                placeholder="6-digit code"
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  emailError ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'
                }`}
              />
              <button onClick={handleVerifyCode}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors">
                Verify
              </button>
            </div>
          )}
          {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          {emailSent && !emailVerified && <p className="text-xs text-gray-400 mt-1">Check your inbox for the 6-digit code.</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Gender</label>
          <select value={form.gender || genderFromTitle(form.title)} onChange={e => set('gender', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white transition">
            {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date of Birth</label>
          <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-7">
        <button onClick={handleSave} disabled={saving}
          className="bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors active:scale-[0.98]">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✅ Saved successfully!</span>}
      </div>
    </div>
  );
}

// ── Order History Panel ────────────────────────────────────────────────────
const ORDERS = [
  {
    id: '#BF2024001', date: '20 Apr 2025', items: '10 Red Roses Bouquet', amount: 695, status: 'Delivered',
    address: '123, Rose Garden Colony, Mumbai - 400001', payment: 'Credit Card', qty: 1, img: '🌹',
  },
  {
    id: '#BF2024002', date: '15 Apr 2025', items: 'Chocolate Truffle Cake', amount: 595, status: 'In Transit',
    address: '456, Business Park, Andheri East, Mumbai - 400069', payment: 'UPI', qty: 1, img: '🎂',
  },
  {
    id: '#BF2024003', date: '10 Apr 2025', items: 'Pastel Blooms + Balloon', amount: 1490, status: 'Cancelled',
    address: '123, Rose Garden Colony, Mumbai - 400001', payment: 'Net Banking', qty: 2, img: '🌸',
  },
];
const statusStyle = {
  Delivered: 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-600',
};
const statusIcon = { Delivered: '✅', 'In Transit': '🚚', Cancelled: '❌' };

function OrderCard({ o }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-white ${
      open ? 'border-[#1a6b8a] shadow-lg' : 'border-gray-100 hover:shadow-md'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900 text-sm">{o.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{o.date}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[o.status]}`}>{o.status}</span>
        </div>
        <p className="text-sm text-gray-700 mb-3">{o.img} {o.items}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-900">₹ {o.amount}</span>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 text-xs text-[#1a6b8a] font-semibold hover:underline transition-all"
          >
            {open ? 'Hide Details ↑' : 'View Details →'}
          </button>
        </div>
      </div>

      {/* Expanded detail card */}
      {open && (
        <div className="border-t border-[#1a6b8a]/20 bg-gradient-to-br from-[#1a6b8a]/4 to-blue-50/60 px-5 py-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Order Item</p>
              <p className="text-sm font-semibold text-gray-800">{o.img} {o.items}</p>
              <p className="text-xs text-gray-500 mt-0.5">Qty: {o.qty}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Payment</p>
              <p className="text-sm font-semibold text-gray-800">💳 {o.payment}</p>
              <p className="text-xs text-gray-500 mt-0.5">Amount: ₹{o.amount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="text-sm text-gray-700">📍 {o.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
            <span className="text-lg">{statusIcon[o.status]}</span>
            <div>
              <p className="text-xs font-bold text-gray-700">Status: {o.status}</p>
              <p className="text-[11px] text-gray-400">
                {o.status === 'Delivered' ? 'Your order was delivered successfully.' :
                 o.status === 'In Transit' ? 'Your order is on the way!' :
                 'This order was cancelled.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderHistoryPanel() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Order History</h2>
      <p className="text-sm text-gray-400 mb-7">Track and manage your past orders</p>
      {ORDERS.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ORDERS.map(o => <OrderCard key={o.id} o={o} />)}
        </div>
      )}
    </div>
  );
}

// ── Address Book Panel ─────────────────────────────────────────────────────
const ADDRESSES = [
  { id: 1, tag: 'Home', name: 'Test User', line: '123, Rose Garden Colony', city: 'Mumbai', state: 'Maharashtra', pin: '400001', default: true },
  { id: 2, tag: 'Office', name: 'Test User', line: '456, Business Park, Andheri East', city: 'Mumbai', state: 'Maharashtra', pin: '400069', default: false },
];
const TAG_ICONS = { Home: '🏠', Office: '🏢', Other: '📌' };
const EMPTY_ADDR = { tag: 'Home', name: '', line: '', city: '', state: '', pin: '' };

function AddressForm({ initial = EMPTY_ADDR, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="bg-gradient-to-br from-[#1a6b8a]/5 to-blue-50/60 border border-[#1a6b8a]/20 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-[#1a6b8a] text-white flex items-center justify-center text-sm">📍</span>
        {initial.name ? 'Edit Address' : 'Add New Address'}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address Type</label>
          <select value={form.tag} onChange={e => set('tag', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white">
            {['Home', 'Office', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Recipient name"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Street Address</label>
          <input value={form.line} onChange={e => set('line', e.target.value)} placeholder="House no., Street, Area"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">City</label>
          <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">State</label>
          <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">PIN Code</label>
          <input value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6-digit PIN"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={() => onSave(form)}
          className="bg-[#1a6b8a] hover:bg-[#155a75] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Save Address
        </button>
        <button onClick={onCancel}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddressBookPanel() {
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleSave = (form) => {
    if (editId) {
      setAddresses(ads => ads.map(a => a.id === editId ? { ...a, ...form } : a));
      setEditId(null);
    } else {
      setAddresses(ads => [...ads, { ...form, id: Date.now(), default: false }]);
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-gray-900">Address Book</h2>
        {!adding && !editId && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            + Add Address
          </button>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-6">Manage your saved delivery addresses</p>

      {/* Add / Edit form */}
      {(adding || editId) && (
        <div className="mb-6">
          <AddressForm
            initial={editId ? addresses.find(a => a.id === editId) : EMPTY_ADDR}
            onSave={handleSave}
            onCancel={() => { setAdding(false); setEditId(null); }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {addresses.map(a => (
          <div key={a.id} className={`relative border-2 rounded-2xl p-5 transition-all ${
            a.default ? 'border-[#1a6b8a] bg-[#1a6b8a]/3 shadow-sm' : 'border-gray-100 bg-white hover:border-[#1a6b8a]/30 hover:shadow-sm'
          }`}>
            {a.default && (
              <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#1a6b8a] text-white px-2 py-0.5 rounded-full">DEFAULT</span>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{TAG_ICONS[a.tag] || '📌'}</span>
              <span className="text-sm font-bold text-gray-800">{a.tag}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{a.name}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.line},<br />{a.city}, {a.state} - {a.pin}</p>
            <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => { setEditId(a.id); setAdding(false); }}
                className="text-xs text-[#1a6b8a] font-semibold hover:underline">Edit</button>
              <button onClick={() => setAddresses(ads => ads.filter(x => x.id !== a.id))}
                className="text-xs text-red-500 font-semibold hover:underline">Delete</button>
              {!a.default && (
                <button onClick={() => setAddresses(ads => ads.map(x => ({ ...x, default: x.id === a.id })))}
                  className="text-xs text-gray-500 font-semibold hover:underline ml-auto">Set Default</button>
              )}
            </div>
          </div>
        ))}

        {!adding && !editId && (
          <button onClick={() => setAdding(true)}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#1a6b8a] hover:text-[#1a6b8a] transition-colors min-h-[160px]">
            <span className="text-3xl">+</span>
            <span className="text-sm font-medium">Add New Address</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Track Order Panel ──────────────────────────────────────────────────────
const STEPS = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

function TrackOrderPanel() {
  const [orderId, setOrderId] = useState('');
  const [tracked, setTracked] = useState(null);

  const handleTrack = () => {
    if (!orderId.trim()) return;
    // Mock: #BF2024002 is In Transit (step 2), others delivered
    const step = orderId.trim() === '#BF2024002' ? 2 : orderId.trim() === '#BF2024003' ? 1 : 4;
    setTracked({ id: orderId.trim(), step, eta: 'Tomorrow, 26 Apr 2025', item: '10 Red Roses Bouquet' });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Track Order</h2>
      <p className="text-sm text-gray-400 mb-7">Enter your order ID to track delivery status</p>

      <div className="flex gap-3 mb-8">
        <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          placeholder="Enter Order ID (e.g. #BF2024001)"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
        <button onClick={handleTrack}
          className="bg-[#1a6b8a] hover:bg-[#155a75] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          Track
        </button>
      </div>

      {tracked && (
        <div className="bg-gradient-to-br from-[#1a6b8a]/5 to-blue-50 rounded-2xl p-6 border border-[#1a6b8a]/10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-500 font-medium">Order ID</p>
              <p className="font-bold text-gray-900">{tracked.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Expected Delivery</p>
              <p className="font-bold text-[#1a6b8a] text-sm">{tracked.eta}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">🌸 {tracked.item}</p>

          {/* Progress steps */}
          <div className="relative">
            {/* Line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-[#1a6b8a] z-0 transition-all duration-700"
              style={{ width: `${(tracked.step / (STEPS.length - 1)) * (100 - 8)}%` }}
            />
            <div className="relative z-10 flex justify-between">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-2" style={{ width: '20%' }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < tracked.step ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white' :
                    i === tracked.step ? 'bg-white border-[#1a6b8a] text-[#1a6b8a] shadow-md ring-4 ring-[#1a6b8a]/20' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {i < tracked.step ? '✓' : i + 1}
                  </div>
                  <p className={`text-[10px] text-center leading-tight font-medium ${i <= tracked.step ? 'text-[#1a6b8a]' : 'text-gray-400'}`}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!tracked && (
        <div className="text-center py-12 text-gray-300">
          <div className="text-6xl mb-3">🚚</div>
          <p className="text-sm font-medium text-gray-400">Enter an order ID above to track your delivery</p>
          <p className="text-xs text-gray-300 mt-1">Try: #BF2024001 or #BF2024002</p>
        </div>
      )}
    </div>
  );
}

// ── Main UserDashboard ─────────────────────────────────────────────────────
export default function UserDashboard({ user, initialTab = 'profile', onSignOut }) {
  const [active, setActive] = useState(initialTab);
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    getProfile().then(data => setProfile(data)).catch(() => {});
  }, []);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1 ? parts[0][0]?.toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName  = profile?.name   || user?.name   || 'User';
  const displayEmail = profile?.email  || '';
  const displayPhone = profile?.mobileNumber || user?.mobileNumber || '';
  const displaySub   = displayEmail || (displayPhone ? `+91 ${displayPhone}` : '');

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">
      <div className="flex gap-7">

        {/* ── Sidebar ── */}
        <aside className="w-72 flex-shrink-0">
          {/* User card */}
          <div className="bg-gradient-to-br from-[#1a6b8a] to-[#155a75] rounded-2xl p-6 text-white mb-4 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3 shadow">
              {getInitials(displayName)}
            </div>
            <p className="font-bold text-lg leading-tight">{displayName}</p>
          </div>

          {/* Nav */}
          <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {NAV.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3.5 px-5 py-4 text-sm font-medium transition-all group relative ${
                  active === item.key
                    ? 'bg-[#1a6b8a]/8 text-[#1a6b8a]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a6b8a]'
                } ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
                style={{ borderLeft: active === item.key ? '4px solid #1a6b8a' : '4px solid transparent' }}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors ${
                  active === item.key ? 'bg-[#1a6b8a]/15' : 'bg-gray-100 group-hover:bg-[#1a6b8a]/10'
                }`}>{item.icon}</span>
                <span>{item.label}</span>
                <span className={`ml-auto text-xs transition-colors ${active === item.key ? 'text-[#1a6b8a]' : 'text-gray-300'}`}>›</span>
              </button>
            ))}

            <div className="border-t border-gray-100" />

            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors group border-l-4 border-transparent"
            >
              <span className="w-9 h-9 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-base transition-colors">🔴</span>
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
            {active === 'profile' && <ProfilePanel user={user} />}
            {active === 'orders'  && <OrderHistoryPanel />}
            {active === 'address' && <AddressBookPanel />}
            {active === 'track'   && <TrackOrderPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
