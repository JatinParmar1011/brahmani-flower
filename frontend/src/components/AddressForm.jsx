import { useState } from 'react';
import { INDIA_STATES, getCitiesForState } from '../data/indiaCities';
import CustomDropdown from './CustomDropdown';

export const EMPTY_FORM = {
  fullName: '', mobileNumber: '', address1: '', address2: '',
  city: '', state: '', pincode: '', country: '', addressType: 'HOME', isDefault: false,
};

export function validateAddress(form) {
  const errs = {};
  if (!form.fullName.trim())                    errs.fullName     = 'Full name is required';
  if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) errs.mobileNumber = 'Enter valid 10-digit mobile';
  if (!form.address1.trim())                    errs.address1     = 'Address Line 1 is required';
  if (!/^[1-9][0-9]{5}$/.test(form.pincode))   errs.pincode      = 'Enter valid 6-digit pincode';
  if (!form.city.trim())                        errs.city         = 'City is required';
  if (!form.state.trim())                       errs.state        = 'State is required';
  return errs;
}

function Field({ label, required, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition ${
    err ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/20'
  }`;

export default function AddressForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm]             = useState({ ...EMPTY_FORM, ...initial });
  const [errs, setErrs]             = useState({});
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError]     = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  const handlePincode = async (val) => {
    const pin = val.replace(/\D/g, '').slice(0, 6);
    set('pincode', pin);
    setPinError('');
    if (pin.length !== 6) return;
    setPinLoading(true);
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const json = await res.json();
      if (json[0]?.Status === 'Success') {
        const po = json[0].PostOffice[0];
        setForm(f => ({ ...f, pincode: pin, state: po.State, city: po.District, country: 'India' }));
        setErrs(e => ({ ...e, pincode: '', state: '', city: '' }));
      } else {
        setPinError('Pincode not found');
      }
    } catch {
      setPinError('Could not fetch pincode details');
    } finally {
      setPinLoading(false);
    }
  };

  const handleStateChange = (val) => {
    setForm(f => ({ ...f, state: val, city: '', country: 'India' }));
    setErrs(e => ({ ...e, state: '', city: '' }));
  };

  const citiesForState = getCitiesForState(form.state);

  const handleSubmit = () => {
    const e = validateAddress(form);
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave(form);
  };

  return (
    <div className="bg-gradient-to-br from-[#1a6b8a]/5 to-blue-50/60 border border-[#1a6b8a]/20 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-[#1a6b8a] text-white flex items-center justify-center text-sm">📍</span>
        {initial.fullName ? 'Edit Address' : 'Add New Address'}
      </h3>

      <div className="grid grid-cols-2 gap-4">

        {/* Row 1 — Address Type | Full Name */}
        <Field label="Address Type">
          <select value={form.addressType} onChange={e => set('addressType', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white transition">
            {['HOME', 'WORK', 'OTHER'].map(t => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </Field>

        <Field label="Full Name" required error={errs.fullName}>
          <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
            placeholder="Recipient full name" className={inputCls(errs.fullName)} />
        </Field>

        {/* Row 2 — Mobile | Set as Default */}
        <Field label="Mobile Number" required error={errs.mobileNumber}>
          <div className={`flex border rounded-xl overflow-hidden transition ${
            errs.mobileNumber ? 'border-red-400' : 'border-gray-200 focus-within:border-[#1a6b8a]'
          }`}>
            <span className="flex items-center px-3 border-r border-gray-200 text-sm text-gray-500 bg-gray-50 select-none">🇮🇳 +91</span>
            <input type="tel" value={form.mobileNumber} maxLength={10}
              onChange={e => set('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile" className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" />
          </div>
        </Field>

        <Field label="Set as Default">
          <label className="flex items-center gap-2 h-[42px] cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)}
              className="w-4 h-4 accent-[#1a6b8a]" />
            <span className="text-sm text-gray-600">Make this my default address</span>
          </label>
        </Field>

        {/* Row 3 — Address 1 | Address 2 */}
        <Field label="Address 1" required error={errs.address1}>
          <input value={form.address1} onChange={e => set('address1', e.target.value)}
            placeholder="House / Flat no., Building, Street" className={inputCls(errs.address1)} />
        </Field>

        <Field label="Address 2">
          <input value={form.address2} onChange={e => set('address2', e.target.value)}
            placeholder="Area, Landmark (optional)" className={inputCls(false)} />
        </Field>

        {/* Row 4 — Pincode | City */}
        <Field label="Pincode" required error={errs.pincode || pinError}>
          <div className="relative">
            <input value={form.pincode} onChange={e => handlePincode(e.target.value)}
              placeholder="6-digit pincode" maxLength={6} className={inputCls(errs.pincode || pinError)} />
            {pinLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-[#1a6b8a] border-t-transparent rounded-full animate-spin inline-block" />
              </span>
            )}
            {!pinLoading && form.pincode.length === 6 && !pinError && form.city && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
            )}
          </div>
        </Field>

        <Field label="City" required error={errs.city}>
          <CustomDropdown
            value={form.city}
            onChange={v => set('city', v)}
            options={citiesForState}
            placeholder={form.state ? 'Select city' : 'Select state first'}
            disabled={!form.state}
            error={!!errs.city}
            extraOption={form.city && !citiesForState.includes(form.city) ? { value: form.city } : null}
          />
        </Field>

        {/* Row 5 — State | Country */}
        <Field label="State" required error={errs.state}>
          <CustomDropdown
            value={form.state}
            onChange={handleStateChange}
            options={INDIA_STATES}
            placeholder="Select state"
            error={!!errs.state}
          />
        </Field>

        <Field label="Country">
          <input value={form.country} onChange={e => set('country', e.target.value)}
            placeholder="Country" readOnly={!!form.state}
            className={inputCls(false) + (form.state ? ' bg-gray-50 text-gray-500 cursor-default' : '')} />
        </Field>

      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={handleSubmit} disabled={saving}
          className="bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          {saving ? 'Saving…' : 'Save Address'}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
