import { useState, useEffect, useRef } from 'react';
import {
  adminFetchGallery,
  adminCreateGalleryItem,
  adminUpdateGalleryItem,
  adminDeleteGalleryItem,
} from '../../services/galleryService';

const EMPTY_FORM = { name: '', category: '', description: '', displayOrder: 0, status: 'ACTIVE' };

function GalleryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial?.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('category', form.category);
      fd.append('description', form.description || '');
      fd.append('displayOrder', form.displayOrder);
      fd.append('status', form.status);
      if (imageFile) fd.append('image', imageFile);
      await onSave(fd);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-700">{initial ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>

      {/* Image upload */}
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Image</label>
        <div
          className="relative w-full h-40 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1a6b8a] transition-colors flex items-center justify-center bg-gray-50"
          onClick={() => fileRef.current.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-3xl mb-1">📷</div>
              <p className="text-xs">Click to upload image</p>
            </div>
          )}
          {preview && (
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Change Image</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Marigold Backdrop"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
          <input
            value={form.category}
            onChange={e => set('category', e.target.value)}
            placeholder="e.g. Decoration"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={2}
            placeholder="Short description..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 resize-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Display Order</label>
          <input
            type="number"
            value={form.displayOrder}
            onChange={e => set('displayOrder', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
        {initial && (
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Update' : 'Add Item'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    adminFetchGallery().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (fd) => {
    await adminCreateGalleryItem(fd);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (fd) => {
    await adminUpdateGalleryItem(editing.id, fd);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await adminDeleteGalleryItem(id);
      load();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Gallery Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} items total</p>
        </div>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <span>+</span> Add Item
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <GalleryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {/* Edit form */}
      {editing && (
        <GalleryForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />
      )}

      {/* Items grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm">No gallery items yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative h-44 bg-gray-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🌸</div>
                )}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-800 leading-tight">{item.name}</p>
                  <span className="text-[10px] font-semibold bg-[#1a6b8a]/10 text-[#1a6b8a] px-2 py-0.5 rounded-full flex-shrink-0">{item.category}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">Order: {item.displayOrder}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setEditing(item); setShowForm(false); }}
                    className="flex-1 text-xs font-semibold text-[#1a6b8a] border border-[#1a6b8a]/30 hover:bg-[#1a6b8a]/5 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="flex-1 text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === item.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
