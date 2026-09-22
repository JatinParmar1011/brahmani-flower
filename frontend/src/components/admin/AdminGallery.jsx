import { useState, useEffect, useRef } from 'react';
import {
  adminFetchCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminFetchPhotos,
  adminCreatePhoto,
  adminUpdatePhoto,
  adminDeletePhoto,
} from '../../services/galleryService';

const EMPTY_CATEGORY = { name: '', description: '', displayOrder: 0, status: 'ACTIVE' };

// ── Category create / edit form ───────────────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        description: form.description,
        displayOrder: form.displayOrder,
        status: form.status,
      });
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-700">{initial ? 'Edit Category' : 'Add Category'}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Weddings"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Short description..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
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
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Display Order</label>
          <input
            type="number"
            value={form.displayOrder}
            onChange={e => set('displayOrder', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Update' : 'Add Category'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Photo form (add or edit) — name, description, image, category dropdown ─────
function PhotoUpload({ categories, editing, onSaved, onCancelEdit }) {
  const isEdit = !!editing;
  const [form, setForm] = useState(
    editing
      ? { categoryId: String(editing.categoryId ?? ''), name: editing.name || '', description: editing.description || '' }
      : { categoryId: '', name: '', description: '' }
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(editing?.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Sync form fields when the edited photo changes (component stays mounted).
  useEffect(() => {
    if (editing) {
      setForm({
        categoryId: String(editing.categoryId ?? ''),
        name: editing.name || '',
        description: editing.description || '',
      });
      setPreview(editing.imageUrl || null);
    } else {
      setForm({ categoryId: '', name: '', description: '' });
      setPreview(null);
    }
    setImageFile(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }, [editing]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setForm({ categoryId: '', name: '', description: '' });
    setImageFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.categoryId) { setError('Please select a category.'); return; }
    if (!form.name.trim()) { setError('Please enter a photo name.'); return; }
    if (!isEdit && !imageFile) { setError('Please choose an image.'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await adminUpdatePhoto(editing.id, { ...form, imageFile });
      } else {
        await adminCreatePhoto({ ...form, imageFile });
        reset();
      }
      await onSaved();
    } catch (err) {
      setError(err.message || (isEdit ? 'Update failed' : 'Upload failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-700">{isEdit ? 'Edit Photo' : 'Upload Photo'}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {isEdit ? 'Update photo details. Choose a new image to replace it (optional).' : 'Add a photo and assign it to a category.'}
        </p>
      </div>

      {/* Image */}
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          Image {isEdit ? '' : '*'}
        </label>
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
          {isEdit && preview && (
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Change Image</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Photo Name *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Rose Centerpiece"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
          <select
            value={form.categoryId}
            onChange={e => set('categoryId', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white"
          >
            <option value="">— Select category —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Short description..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
          />
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-xs text-amber-600">Create a category first before uploading photos.</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || categories.length === 0}
          className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Photo' : '+ Upload Photo'}
        </button>
        {isEdit ? (
          <button type="button" onClick={onCancelEdit} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            Cancel
          </button>
        ) : (imageFile || form.name || form.description) && (
          <button type="button" onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminGallery() {
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);

  const loadCategories = () => adminFetchCategories().then(setCategories).catch(console.error);
  const loadPhotos = () => adminFetchPhotos().then(setPhotos).catch(console.error);

  const loadAll = () =>
    Promise.all([loadCategories(), loadPhotos()]).finally(() => setLoading(false));

  useEffect(() => { setLoading(true); loadAll(); }, []);

  const handleCreate = async (payload) => {
    await adminCreateCategory(payload);
    setShowForm(false);
    await loadCategories();
  };

  const handleUpdate = async (payload) => {
    await adminUpdateCategory(editing.id, payload);
    setEditing(null);
    await Promise.all([loadCategories(), loadPhotos()]);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and all its photos?')) return;
    setDeletingCat(id);
    try {
      await adminDeleteCategory(id);
      await Promise.all([loadCategories(), loadPhotos()]);
    } finally {
      setDeletingCat(null);
    }
  };

  const handleDeletePhoto = async (id) => {
    setDeletingPhoto(id);
    try {
      await adminDeletePhoto(id);
      await loadPhotos();
    } finally {
      setDeletingPhoto(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Categories card — title + Add button inside the box header, form below */}
      <section>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Box header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Categories</h3>
              <p className="text-xs text-gray-400 mt-0.5">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
            </div>
            {!showForm && !editing && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                + Add Category
              </button>
            )}
          </div>

          {/* Add / edit form (inside the box, below header) */}
          {(showForm || editing) && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              {showForm && <CategoryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}
              {editing && <CategoryForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />}
            </div>
          )}

          {/* Categories table */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🗂️</div>
              <p className="text-sm">No categories yet. Add your first one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                    {['Name', 'Description', 'Order', 'Photos', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map(cat => {
                    const count = photos.filter(p => p.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{cat.name}</td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-[280px] truncate">{cat.description || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-600">{cat.displayOrder}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-semibold bg-[#1a6b8a]/10 text-[#1a6b8a] px-2 py-0.5 rounded-full whitespace-nowrap">{count}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            cat.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setEditing(cat); setShowForm(false); }}
                              className="text-xs text-[#1a6b8a] hover:underline font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              disabled={deletingCat === cat.id}
                              className="text-xs text-red-400 hover:underline font-medium disabled:opacity-50"
                            >
                              {deletingCat === cat.id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Photo upload / edit section */}
      {!loading && (
        <section>
          <h3 className="text-sm font-bold text-gray-700 mb-3">{editingPhoto ? 'Edit Photo' : 'Photos'}</h3>
          <PhotoUpload
            categories={categories}
            editing={editingPhoto}
            onSaved={async () => { setEditingPhoto(null); await loadPhotos(); }}
            onCancelEdit={() => setEditingPhoto(null)}
          />
        </section>
      )}

      {/* All photos across all categories */}
      {!loading && (
        <section>
          <h4 className="text-sm font-bold text-gray-700 mb-3">All Photos ({photos.length})</h4>
          {photos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">No photos uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative h-36 bg-gray-100">
                    <img src={photo.imageUrl} alt={photo.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 text-[#1a6b8a] px-2 py-0.5 rounded-full shadow-sm">{photo.category}</span>
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingPhoto(photo); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-6 h-6 rounded-full bg-[#1a6b8a]/90 hover:bg-[#155a75] text-white text-xs flex items-center justify-center"
                        title="Edit photo"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deletingPhoto === photo.id}
                        className="w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white text-xs flex items-center justify-center disabled:opacity-50"
                        title="Delete photo"
                      >
                        {deletingPhoto === photo.id ? '…' : '✕'}
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-800 truncate">{photo.name}</p>
                    {photo.description && <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{photo.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
