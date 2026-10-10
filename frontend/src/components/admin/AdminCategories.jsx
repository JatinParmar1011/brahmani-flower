import { useState, useEffect, useRef } from 'react';
import {
  adminFetchCategoryTypes,
  adminFetchAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../../services/categoryService';

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-700 font-medium">{message}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline Add / Edit Form (inside each type box) ──────────────────────────────
function CategoryForm({ typeId, initial, onSave, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    categoryName:        initial?.categoryName        || '',
    categoryDescription: initial?.categoryDescription || '',
    categoryDisplayOrder: initial?.categoryDisplayOrder ?? 0,
    status:              initial?.status              || 'ACTIVE',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(initial?.imageUrl || null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (initial) {
      setForm({
        categoryName:        initial.categoryName        || '',
        categoryDescription: initial.categoryDescription || '',
        categoryDisplayOrder: initial.categoryDisplayOrder ?? 0,
        status:              initial.status              || 'ACTIVE',
      });
      setPreview(initial.imageUrl || null);
      setImageFile(null);
    }
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }, [initial]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file (JPG, PNG, WebP).'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Image size must be less than 5 MB.'); return; }
    setError('');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.categoryName.trim()) { setError('Category name is required.'); return; }
    setSaving(true);
    try {
      await onSave({ categoryTypeId: String(typeId), ...form, imageFile });
    } catch (err) {
      setError(err.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50/80 border-t border-gray-100 px-6 py-5 space-y-4">
      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
        {isEdit ? 'Edit Category' : 'Add New Category'}
      </h4>

      {/* Image upload */}
      <div
        className="relative w-full h-36 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1a6b8a] transition-colors flex items-center justify-center bg-white"
        onClick={() => fileRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-1">📷</div>
            <p className="text-xs">Click to upload image</p>
            <p className="text-[10px] mt-0.5 text-gray-300">JPG, PNG, WebP — max 5 MB</p>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Change Image</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      {preview && (
        <button type="button" onClick={() => { setPreview(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ''; }}
          className="text-[11px] text-red-400 hover:text-red-600 transition-colors -mt-2">
          Remove image
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Name *</label>
          <input value={form.categoryName} onChange={e => set('categoryName', e.target.value)}
            placeholder="e.g. Roses" required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
          <input type="text" value={form.categoryDescription} onChange={e => set('categoryDescription', e.target.value)}
            placeholder="Short description..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Display Order</label>
          <input type="number" min="0" value={form.categoryDisplayOrder}
            onChange={e => set('categoryDisplayOrder', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : isEdit ? 'Update' : '+ Add Category'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Single category type box ───────────────────────────────────────────────────
function CategoryTypeBox({ type, categories, onRefresh, showToast }) {
  const typeCats = categories
    .filter(c => c.categoryTypeId === type.id)
    .sort((a, b) => (a.categoryDisplayOrder ?? 0) - (b.categoryDisplayOrder ?? 0));

  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);  // category being edited
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleCreate = async (payload) => {
    await adminCreateCategory(payload);
    setShowForm(false);
    showToast('success', 'Category added!');
    await onRefresh();
  };

  const handleUpdate = async (payload) => {
    await adminUpdateCategory(editing.id, payload);
    setEditing(null);
    showToast('success', 'Category updated!');
    await onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    setConfirmDelete(null);
    try {
      await adminDeleteCategory(confirmDelete.id);
      showToast('success', `"${confirmDelete.categoryName}" deleted.`);
      await onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (cat) => { setShowForm(false); setEditing(cat); };
  const cancelForm = () => { setShowForm(false); setEditing(null); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Box header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="font-bold text-gray-800 text-lg truncate">{type.categoryTypeName}</h3>
            {type.categoryTypeDescription && (
              <span className="text-xs text-gray-400 truncate">{type.categoryTypeDescription}</span>
            )}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
              type.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {type.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {typeCats.length} {typeCats.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        {!showForm && !editing && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* Inline add / edit form */}
      {(showForm || editing) && (
        <CategoryForm
          typeId={type.id}
          initial={editing}
          onSave={editing ? handleUpdate : handleCreate}
          onCancel={cancelForm}
        />
      )}

      {/* Category table rows */}
      {typeCats.length === 0 && !showForm && !editing ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-3xl mb-2">📂</div>
          <p className="text-xs">No categories yet. Add your first one!</p>
        </div>
      ) : typeCats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                {['Image', 'Name', 'Description', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {typeCats.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-2">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.categoryName} className="w-16 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🌸</div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-800 max-w-[180px] truncate">{cat.categoryName}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[260px] truncate">{cat.categoryDescription || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{cat.categoryDisplayOrder}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      cat.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(cat)}
                        className="text-xs text-[#1a6b8a] hover:underline font-medium">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(cat)} disabled={deletingId === cat.id}
                        className="text-xs text-red-400 hover:underline font-medium disabled:opacity-50">
                        {deletingId === cat.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.categoryName}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [types, cats] = await Promise.all([
        adminFetchCategoryTypes(),
        adminFetchAllCategories(),
      ]);
      setCategoryTypes(types);
      setCategories(cats);
    } catch (err) {
      showToast('error', err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">🌸</div>
          <p className="text-sm">Loading categories…</p>
        </div>
      ) : categoryTypes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🗂️</div>
          <p className="text-sm font-medium text-gray-500">No category types found.</p>
          <p className="text-xs mt-1">Category types are managed in the database (category_type_mst table).</p>
        </div>
      ) : (
        categoryTypes.map(type => (
          <CategoryTypeBox
            key={type.id}
            type={type}
            categories={categories}
            onRefresh={loadAll}
            showToast={showToast}
          />
        ))
      )}
    </div>
  );
}
