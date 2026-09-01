import { useState, useEffect } from 'react';
import { fetchCategoryTypes, fetchCategoriesByTypeId } from '../../services/categoryService';
import { createProduct, updateProduct } from '../../services/productService';

const TAGS     = ['None', 'Bestseller', 'Trending', 'New', 'Popular', 'Premium', 'Luxury'];
const DELIVERY = ['Tomorrow', 'Same Day', '2-3 Days'];

const EMPTY = {
  name: '', price: '', originalPrice: '', stock: '', tag: 'None',
  description: '', contains: '', delivery: 'Tomorrow',
  highlight1: '', highlight2: '', highlight3: '', highlight4: '',
  slots: [null, null, null, null, null],
  categoryIds: [],
};

const inputCls = (err) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${err ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-[#1a6b8a] focus:ring-[#1a6b8a]/15'}`;

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[10px] text-gray-400 mb-1.5">{hint}</p>}
      {children}
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
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

function ImageSlots({ slots, onSlotsChange }) {
  const [dragOver, setDragOver] = useState(null);

  const getPreview = (slot) => {
    if (!slot) return null;
    if (slot instanceof File) return URL.createObjectURL(slot);
    return slot;
  };

  const handleFile = (i, files) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max file size is 5MB'); return; }
    const next = [...slots];
    next[i] = file;
    onSlotsChange(next);
  };

  const removeSlot = (i) => {
    const next = [...slots];
    next[i] = null;
    onSlotsChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-800">Product Images</h3>
        <span className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
          {slots.filter(Boolean).length} / 5 added
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">Upload up to 5 images · Max 5MB each · First image is the main display image</p>

      <div className="grid grid-cols-5 gap-3">
        {slots.map((slot, i) => {
          const preview = getPreview(slot);
          const isDragging = dragOver === i;
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold text-gray-400 text-center">
                {i === 0 ? '⭐ Main' : `Photo ${i + 1}`}
              </p>
              <div
                className={`relative w-full aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer
                  ${ preview
                      ? 'border-[#1a6b8a] shadow-md'
                      : isDragging
                        ? 'border-[#1a6b8a] bg-[#1a6b8a]/5 scale-105'
                        : 'border-gray-200 bg-gray-50 hover:border-[#1a6b8a]/50 hover:bg-[#1a6b8a]/5'
                  }`}
                onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => { e.preventDefault(); setDragOver(null); handleFile(i, e.dataTransfer.files); }}
                onClick={() => document.getElementById(`img-input-${i}`).click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeSlot(i); }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow hover:bg-red-600 z-10"
                    >✕</button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-semibold">Replace</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300 select-none">
                    <span className="text-2xl">{isDragging ? '📂' : i === 0 ? '📷' : '+'}</span>
                    <span className="text-[9px]">{isDragging ? 'Drop here' : 'Click / drag'}</span>
                  </div>
                )}
              </div>
              <input
                id={`img-input-${i}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFile(i, e.target.files)}
              />
              {slot instanceof File && (
                <p className="text-[9px] text-gray-400 text-center truncate">
                  {(slot.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Accordion panel for one category type
function CategoryTypePanel({ type, categories, selectedIds, onToggle, loading }) {
  const [open, setOpen] = useState(false);
  const selectedCount = categories.filter(c => selectedIds.includes(c.id)).length;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-xs font-bold text-[#1a6b8a]">
            {type.categoryTypeName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-700 capitalize">{type.categoryTypeName.replace(/_/g, ' ')}</p>
            {type.categoryTypeDescription && (
              <p className="text-[10px] text-gray-400">{type.categoryTypeDescription}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="text-[10px] font-bold bg-[#1a6b8a] text-white px-2 py-0.5 rounded-full">
              {selectedCount} selected
            </span>
          )}
          <span className={`text-gray-400 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="px-4 py-3 bg-white">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
              Loading…
            </div>
          ) : categories.length === 0 ? (
            <p className="text-xs text-gray-300 py-2">No categories available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => {
                const checked = selectedIds.includes(cat.id);
                return (
                  <button key={cat.id} type="button" onClick={() => onToggle(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                      checked
                        ? 'bg-[#1a6b8a]/10 border-[#1a6b8a] text-[#1a6b8a]'
                        : 'border-gray-200 text-gray-600 hover:border-[#1a6b8a]/50 hover:bg-gray-50'
                    }`}>
                    <span className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      checked ? 'bg-[#1a6b8a] border-[#1a6b8a]' : 'border-gray-300'
                    }`}>
                      {checked && <span className="text-white text-[9px] font-bold">✓</span>}
                    </span>
                    <span className="text-xs font-medium truncate">{cat.categoryName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddProduct({ initial, onSave, onCancel }) {
  const initSlots = initial
    ? [initial.imageUrl || null, initial.imageUrl2 || null, initial.imageUrl3 || null, initial.imageUrl4 || null, initial.imageUrl5 || null]
    : [null, null, null, null, null];

  const [form, setForm] = useState(initial ? {
    ...initial,
    slots: initSlots,
    highlight1: initial.highlight1 || '',
    highlight2: initial.highlight2 || '',
    highlight3: initial.highlight3 || '',
    highlight4: initial.highlight4 || '',
    tag: initial.tag || 'None',
    categoryIds: initial.categoryIds || [],
  } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});   // typeId -> CategoryDetail[]
  const [loadingTypes, setLoadingTypes]   = useState(true);
  const [loadingMap, setLoadingMap]       = useState({});   // typeId -> bool

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = (k) => setErrors(e => ({ ...e, [k]: '' }));

  useEffect(() => {
    fetchCategoryTypes()
      .then(types => {
        setCategoryTypes(types);
        // load all categories for all types in parallel
        types.forEach(type => {
          setLoadingMap(m => ({ ...m, [type.id]: true }));
          fetchCategoriesByTypeId(type.id)
            .then(cats => setCategoriesMap(m => ({ ...m, [type.id]: cats })))
            .catch(() => setCategoriesMap(m => ({ ...m, [type.id]: [] })))
            .finally(() => setLoadingMap(m => ({ ...m, [type.id]: false })));
        });
      })
      .catch(() => {})
      .finally(() => setLoadingTypes(false));
  }, []);

  const toggleCategory = (catId) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(catId)
        ? f.categoryIds.filter(id => id !== catId)
        : [...f.categoryIds, catId],
    }));
    clearErr('categoryIds');
  };

  const removeCategory = (catId) => {
    setForm(f => ({ ...f, categoryIds: f.categoryIds.filter(id => id !== catId) }));
  };

  // flat lookup: id -> name
  const allCategories = Object.values(categoriesMap).flat();
  const getCatName = (id) => allCategories.find(c => c.id === id)?.categoryName || id;

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name        = 'Product name is required';
    if (form.categoryIds.length === 0)  e.categoryIds = 'Select at least one category';
    if (!form.price)                    e.price       = 'Required';
    if (!form.originalPrice)            e.originalPrice = 'Required';
    if (!form.stock)                    e.stock       = 'Required';
    if (!form.description.trim())       e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const slots = form.slots || [null, null, null, null, null];

      // File objects go to Cloudinary via multipart
      const imageFiles = slots.filter(s => s instanceof File);

      // existing URLs (edit mode, not replaced) sent as plain fields
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice),
        stock: parseInt(form.stock),
        tag: form.tag === 'None' ? null : form.tag,
        description: form.description,
        contains: form.contains,
        delivery: form.delivery,
        highlight1: form.highlight1 || null,
        highlight2: form.highlight2 || null,
        highlight3: form.highlight3 || null,
        highlight4: form.highlight4 || null,
        imageUrl:  slots[0] instanceof File ? null : (slots[0] || null),
        imageUrl2: slots[1] instanceof File ? null : (slots[1] || null),
        imageUrl3: slots[2] instanceof File ? null : (slots[2] || null),
        imageUrl4: slots[3] instanceof File ? null : (slots[3] || null),
        imageUrl5: slots[4] instanceof File ? null : (slots[4] || null),
        categoryIds: form.categoryIds,
      };

      const saved = initial?.id
        ? await updateProduct(initial.id, payload, imageFiles)
        : await createProduct(payload, imageFiles);
      onSave(saved);
    } catch (err) {
      setErrors(e => ({ ...e, _api: err.message }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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
          {errors._api && <span className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{errors._api}</span>}
          <button onClick={onCancel}
            className="text-sm px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="text-sm px-6 py-2.5 rounded-xl bg-[#1a6b8a] text-white font-semibold hover:bg-[#155a75] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving
              ? ((form.slots || []).some(s => s instanceof File) ? 'Uploading images…' : 'Saving…')
              : initial ? 'Save Changes' : '+ Publish Product'
            }
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-800">Categories</h3>
          {form.categoryIds.length > 0 && (
            <span className="text-xs font-semibold text-[#1a6b8a] bg-[#1a6b8a]/10 px-2.5 py-1 rounded-full">
              {form.categoryIds.length} selected
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-5">Select one or more categories across any category type</p>

        {/* Selected tags */}
        {form.categoryIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#1a6b8a]/5 rounded-xl border border-[#1a6b8a]/10">
            {form.categoryIds.map(id => (
              <span key={id} className="flex items-center gap-1.5 text-xs font-medium text-[#1a6b8a] bg-white border border-[#1a6b8a]/20 px-2.5 py-1 rounded-lg shadow-sm">
                {getCatName(id)}
                <button type="button" onClick={() => removeCategory(id)}
                  className="text-gray-300 hover:text-red-400 transition-colors leading-none">✕</button>
              </span>
            ))}
          </div>
        )}

        {loadingTypes ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-6 justify-center">
            <span className="w-4 h-4 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
            Loading category types…
          </div>
        ) : (
          <div className="space-y-2">
            {categoryTypes.map(type => (
              <CategoryTypePanel
                key={type.id}
                type={type}
                categories={categoriesMap[type.id] || []}
                selectedIds={form.categoryIds}
                onToggle={toggleCategory}
                loading={!!loadingMap[type.id]}
              />
            ))}
          </div>
        )}
        {errors.categoryIds && <p className="text-[10px] text-red-400 mt-3">{errors.categoryIds}</p>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — main fields */}
        <div className="xl:col-span-2 space-y-5">
          <ImageSlots slots={form.slots || [null,null,null,null,null]} onSlotsChange={v => set('slots', v)} />

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
                <Field label="Original / MRP (₹)" required error={errors.originalPrice}>
                  <input type="number" value={form.originalPrice}
                    onChange={e => { set('originalPrice', e.target.value); clearErr('originalPrice'); }}
                    placeholder="1099" className={inputCls(errors.originalPrice)} />
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

          <Section title="Product Description" sub="Shown on the product detail page">
            <div className="space-y-4">
              <Field label="Description" required error={errors.description}>
                <textarea value={form.description} rows={4}
                  onChange={e => { set('description', e.target.value); clearErr('description'); }}
                  placeholder="Describe the product — what makes it special, who it's for, what's included…"
                  className={inputCls(errors.description) + ' resize-none'} />
              </Field>
              <Field label="Product Contains" hint="Enter each item on a new line">
                <textarea value={form.contains} rows={5}
                  onChange={e => set('contains', e.target.value)}
                  placeholder={"Birthday flower bouquet\nPersonalised birthday card\nDecorative balloons (5 pcs)\nConfetti packet\nGift wrapping"}
                  className={inputCls(false) + ' resize-none font-mono text-xs'} />
              </Field>
            </div>
          </Section>
        </div>

        {/* Right — settings */}
        <div className="space-y-5">
          <Section title="🚚 Delivery Options" sub="Configure delivery availability">
            <div className="space-y-4">
              <Field label="Standard Delivery">
                <select value={form.delivery} onChange={e => set('delivery', e.target.value)}
                  className={inputCls(false) + ' bg-white'}>
                  {DELIVERY.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="✨ Product Highlights" sub="Short feature lines shown on the product page (leave blank to hide)">
            <div className="space-y-3">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{n}</span>
                  <input
                    type="text"
                    value={form[`highlight${n}`]}
                    onChange={e => set(`highlight${n}`, e.target.value)}
                    placeholder={[
                      '🌿 100% Fresh Flowers',
                      '🚚 Same Day Delivery',
                      '↩️ 7-Day Easy Returns',
                      '🎁 Free Gift Wrapping',
                    ][n - 1]}
                    maxLength={60}
                    className={inputCls(false)}
                  />
                </div>
              ))}
            </div>
          </Section>

          <div className="bg-gradient-to-br from-[#0f2942] to-[#1a6b8a] rounded-2xl p-5 text-white">
            <p className="font-bold mb-1">Ready to publish?</p>
            <p className="text-xs text-blue-200 mb-4">Review all details before publishing the product to the store.</p>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl bg-white text-[#1a6b8a] text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <span className="w-3.5 h-3.5 border-2 border-[#1a6b8a]/30 border-t-[#1a6b8a] rounded-full animate-spin" />}
              {saving
                ? ((form.slots || []).some(s => s instanceof File) ? '☁️ Uploading images…' : '⏳ Saving…')
                : initial ? '✅ Save Changes' : '🚀 Publish Product'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
