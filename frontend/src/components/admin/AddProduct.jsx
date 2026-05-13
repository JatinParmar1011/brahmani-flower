import { useState } from 'react';
import { CATEGORY_META, NAV_MENU } from '../../data/productData';

const CATEGORIES = Object.keys(CATEGORY_META);
const TAGS       = ['None','Bestseller','Trending','New','Popular','Premium','Luxury'];
const DELIVERY   = ['Tomorrow','Same Day','Within 4 hours','2-3 Days'];

const EMPTY = {
  name:'', category:'Flowers', subcategory:'', price:'', original:'', stock:'', tag:'None',
  description:'', contains:'', delivery:'Tomorrow', expressDelivery:'Within 4 hours',
  midnightDelivery:false, freshFlowers:true, sameDay:true, easyReturns:true, giftWrapping:true,
  waterDaily:true, roomTemp:true, trimStems:true, lasts:'5–7 Days',
  images:['','','','',''],
};

function ImageSlots({ images, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-1">Product Images</h3>
      <p className="text-xs text-gray-400 mb-5">Upload up to 5 images. First image is the main display image.</p>
      <div className="flex gap-4 flex-wrap">
        {images.map((img, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className={`w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${img ? 'border-[#1a6b8a] shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
              {img
                ? <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                : <div className="flex flex-col items-center gap-1 text-gray-300">
                    <span className="text-3xl">{i === 0 ? '📷' : '+'}</span>
                    <span className="text-[10px]">{i === 0 ? 'Main' : `Photo ${i+1}`}</span>
                  </div>
              }
            </div>
            <input type="text" value={img}
              onChange={e => { const n=[...images]; n[i]=e.target.value; onChange(n); }}
              placeholder={i === 0 ? 'Image URL' : `URL ${i+1}`}
              className="w-28 text-[10px] border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#1a6b8a] text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-0.5">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mb-5">{sub}</p>}
      {!sub && <div className="mb-5" />}
      {children}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#1a6b8a]' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

const inputCls = (err) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${err ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/15'}`;

export default function AddProduct({ initial, onSave, onCancel }) {
  const [form, setForm]     = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});
  const [saved, setSaved]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = (k) => setErrors(e => ({ ...e, [k]: '' }));

  const subcols = NAV_MENU[form.category] || [];

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Product name is required';
    if (!form.price)              e.price       = 'Required';
    if (!form.original)           e.original    = 'Required';
    if (!form.stock)              e.stock       = 'Required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm text-lg">
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{initial ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-gray-400">Fill in all the details below</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">✅ Saved successfully</span>}
          <button onClick={onCancel}
            className="text-sm px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="text-sm px-6 py-2.5 rounded-xl bg-[#1a6b8a] text-white font-semibold hover:bg-[#155a75] transition-colors shadow-sm">
            {initial ? 'Save Changes' : '+ Publish Product'}
          </button>
        </div>
      </div>

      {/* ── Category & Subcategory selector (above images) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-0.5">Select Category & Subcategory</h3>
        <p className="text-xs text-gray-400 mb-5">Choose the category and subcategory that matches the NavLinks menu</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button"
                  onClick={() => { set('category', c); set('subcategory', ''); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    form.category === c
                      ? 'bg-[#1a6b8a] text-white border-[#1a6b8a] shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-[#1a6b8a] hover:text-[#1a6b8a] bg-white'
                  }`}>
                  <span>{CATEGORY_META[c]?.emoji}</span>
                  <span className="truncate">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subcategory</label>
            {form.category && subcols.length > 0 ? (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {subcols.map(col => (
                  <div key={col.title}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">{col.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {col.items.map(item => (
                        <button key={item.label} type="button"
                          onClick={() => set('subcategory', item.label)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            form.subcategory === item.label
                              ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]'
                              : 'border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] bg-white'
                          }`}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-gray-100 text-gray-300 text-xs">
                Select a category first
              </div>
            )}
            {form.subcategory && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Selected:</span>
                <span className="text-xs font-semibold text-[#1a6b8a] bg-[#1a6b8a]/10 px-2.5 py-1 rounded-lg">{form.subcategory}</span>
                <button type="button" onClick={() => set('subcategory', '')} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column — main fields */}
        <div className="xl:col-span-2 space-y-5">
          {/* Images */}
          <ImageSlots images={form.images} onChange={v => set('images', v)} />

          {/* Basic Info */}
          <Section title="Basic Information" sub="Core product details shown on the listing page">
            <div className="space-y-4">
              <Field label="Product Name" required error={errors.name}>
                <input type="text" value={form.name}
                  onChange={e => { set('name', e.target.value); clearErr('name'); }}
                  placeholder="e.g. Happy Birthday Flower Box"
                  className={inputCls(errors.name)} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Selling Price (₹)" required error={errors.price}>
                  <input type="number" value={form.price}
                    onChange={e => { set('price', e.target.value); clearErr('price'); }}
                    placeholder="849" className={inputCls(errors.price)} />
                </Field>
                <Field label="Original / MRP (₹)" required error={errors.original}>
                  <input type="number" value={form.original}
                    onChange={e => { set('original', e.target.value); clearErr('original'); }}
                    placeholder="1099" className={inputCls(errors.original)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock Quantity" required error={errors.stock}>
                  <input type="number" value={form.stock}
                    onChange={e => { set('stock', e.target.value); clearErr('stock'); }}
                    placeholder="50" className={inputCls(errors.stock)} />
                </Field>
                <Field label="Product Tag">
                  <select value={form.tag} onChange={e => set('tag', e.target.value)}
                    className={inputCls(false) + ' bg-white'}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          {/* Description */}
          <Section title="Product Description" sub="Shown on the product detail page">
            <div className="space-y-4">
              <Field label="Description" required error={errors.description}>
                <textarea value={form.description} rows={4}
                  onChange={e => { set('description', e.target.value); clearErr('description'); }}
                  placeholder="Describe the product — what makes it special, who it's for, what's included…"
                  className={inputCls(errors.description) + ' resize-none'} />
              </Field>
              <Field label="Product Contains" sub="">
                <p className="text-[10px] text-gray-400 mb-1.5">Enter each item on a new line</p>
                <textarea value={form.contains} rows={5}
                  onChange={e => set('contains', e.target.value)}
                  placeholder={"Birthday flower bouquet\nPersonalised birthday card\nDecorative balloons (5 pcs)\nConfetti packet\nGift wrapping\nRibbon bow"}
                  className={inputCls(false) + ' resize-none font-mono text-xs'} />
              </Field>
            </div>
          </Section>
        </div>

        {/* Right column — settings */}
        <div className="space-y-5">
          {/* Delivery */}
          <Section title="🚚 Delivery Options" sub="Configure delivery availability">
            <div className="space-y-4">
              <Field label="Standard Delivery">
                <select value={form.delivery} onChange={e => set('delivery', e.target.value)}
                  className={inputCls(false) + ' bg-white'}>
                  {DELIVERY.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Express Delivery">
                <input type="text" value={form.expressDelivery}
                  onChange={e => set('expressDelivery', e.target.value)}
                  className={inputCls(false)} />
              </Field>
              <Toggle label="Midnight Delivery" sub="Available for midnight surprise" checked={form.midnightDelivery} onChange={v => set('midnightDelivery', v)} />
            </div>
          </Section>

          {/* Features */}
          <Section title="✨ Product Features" sub="Highlights shown on product page">
            <Toggle label="100% Fresh Flowers" checked={form.freshFlowers} onChange={v => set('freshFlowers', v)} />
            <Toggle label="Same Day Delivery"  checked={form.sameDay}      onChange={v => set('sameDay', v)} />
            <Toggle label="7 Day Easy Returns" checked={form.easyReturns}  onChange={v => set('easyReturns', v)} />
            <Toggle label="Free Gift Wrapping" checked={form.giftWrapping} onChange={v => set('giftWrapping', v)} />
          </Section>

          {/* Care */}
          <Section title="🌸 Care Instructions" sub="Flower care tips for customers">
            <Toggle label="Water Daily"  sub="Keep stems in fresh water" checked={form.waterDaily} onChange={v => set('waterDaily', v)} />
            <Toggle label="Room Temp"    sub="Avoid direct sunlight"     checked={form.roomTemp}   onChange={v => set('roomTemp', v)} />
            <Toggle label="Trim Stems"   sub="Cut at 45° every 2 days"   checked={form.trimStems}  onChange={v => set('trimStems', v)} />
            <div className="pt-3">
              <Field label="Lasts (duration)">
                <input type="text" value={form.lasts} onChange={e => set('lasts', e.target.value)}
                  placeholder="5–7 Days" className={inputCls(false)} />
              </Field>
            </div>
          </Section>

          {/* Publish box */}
          <div className="bg-gradient-to-br from-[#0f2942] to-[#1a6b8a] rounded-2xl p-5 text-white">
            <p className="font-bold mb-1">Ready to publish?</p>
            <p className="text-xs text-blue-200 mb-4">Review all details before publishing the product to the store.</p>
            <button onClick={handleSave}
              className="w-full py-3 rounded-xl bg-white text-[#1a6b8a] text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm">
              {initial ? '✅ Save Changes' : '🚀 Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
