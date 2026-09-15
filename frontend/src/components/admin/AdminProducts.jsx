import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, deleteProduct } from '../../services/productService';
import AddProduct from './AddProduct';
import ProductDetailPanel from './ProductDetailPanel';

const STATUS_STYLE = {
  Active: 'bg-emerald-100 text-emerald-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  'Out of Stock': 'bg-red-100 text-red-600',
};
const TAG_STYLE = {
  Bestseller: 'bg-orange-100 text-orange-600',
  Trending: 'bg-blue-100 text-blue-600',
  New: 'bg-emerald-100 text-emerald-600',
  Popular: 'bg-violet-100 text-violet-600',
  Premium: 'bg-yellow-100 text-yellow-700',
  Luxury: 'bg-rose-100 text-rose-600',
};

const getStatus = (stock) =>
  stock === 0 ? 'Out of Stock' : stock <= 8 ? 'Low Stock' : 'Active';

const toFormInitial = (p) => ({
  id: p.id,
  name: p.name || '',
  price: p.price ?? '',
  originalPrice: p.originalPrice ?? '',
  stock: p.stock ?? '',
  tag: p.tag || 'None',
  description: p.description || '',
  contains: p.contains || '',
  delivery: p.delivery || 'Tomorrow',
  highlight1: p.highlight1 || '',
  highlight2: p.highlight2 || '',
  highlight3: p.highlight3 || '',
  highlight4: p.highlight4 || '',
  imageUrl:  p.imageUrl  || null,
  imageUrl2: p.imageUrl2 || null,
  imageUrl3: p.imageUrl3 || null,
  imageUrl4: p.imageUrl4 || null,
  imageUrl5: p.imageUrl5 || null,
  categoryIds: p.categoryIds || [],
});

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [view, setView]         = useState('list');
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState(null); // { msg, type }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback((p = 0) => {
    setLoading(true);
    fetchProducts(p, 20)
      .then(data => {
        setProducts(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setTotal(data.totalElements ?? 0);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      load(page);
    } catch {
      alert('Failed to delete product.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (savedProduct) => {
    const isEdit = !!selected;
    setSelected(null);
    setView('list');
    load(page);
    showToast(isEdit ? `✅ "${savedProduct?.name}" updated successfully!` : `🌸 "${savedProduct?.name}" published successfully!`);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Views ──────────────────────────────────────────────────────────────
  if (view === 'add') {
    return <AddProduct onSave={handleSaved} onCancel={() => setView('list')} />;
  }

  if (view === 'edit' && selected) {
    return (
      <AddProduct
        initial={toFormInitial(selected)}
        onSave={handleSaved}
        onCancel={() => setView('detail')}
      />
    );
  }

  if (view === 'detail' && selected) {
    return (
      <ProductDetailPanel
        product={selected}
        onEdit={() => setView('edit')}
        onBack={() => { setSelected(null); setView('list'); }}
      />
    );
  }

  // ── List view ──────────────────────────────────────────────────────────
  const totalActive = products.filter(p => getStatus(p.stock) === 'Active').length;
  const totalLow    = products.filter(p => getStatus(p.stock) === 'Low Stock').length;
  const totalOut    = products.filter(p => getStatus(p.stock) === 'Out of Stock').length;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-fade-in
          ${ toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white' }`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/70 hover:text-white text-base leading-none">✕</button>
        </div>
      )}
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: total,       icon: '🌸', color: 'from-pink-400 to-rose-500' },
          { label: 'Active',         value: totalActive, icon: '✅', color: 'from-emerald-400 to-teal-500' },
          { label: 'Low Stock',      value: totalLow,    icon: '⚠️', color: 'from-amber-400 to-orange-500' },
          { label: 'Out of Stock',   value: totalOut,    icon: '❌', color: 'from-red-400 to-rose-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md mb-4`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">All Products</h3>
              <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {total} products</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 w-48 transition-all"
              />
              <button onClick={() => setView('add')}
                className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                + Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-400 text-sm">
              <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
              Loading products…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  {['Product', 'Price', 'MRP', 'Stock', 'Tag', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-300 text-sm">No products found</td></tr>
                ) : filtered.map(p => {
                  const status = getStatus(p.stock);
                  return (
                    <tr key={p.id}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => { setSelected(p); setView('detail'); }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                            : <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-xl flex-shrink-0">🌸</div>
                          }
                          <span className="font-medium text-gray-700 max-w-[200px] truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">₹{p.price}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs line-through">₹{p.originalPrice}</td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">{p.stock}</td>
                      <td className="px-5 py-3.5">
                        {p.tag
                          ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TAG_STYLE[p.tag] || 'bg-gray-100 text-gray-500'}`}>{p.tag}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-3">
                          <button onClick={() => { setSelected(p); setView('edit'); }}
                            className="text-xs text-[#1a6b8a] hover:underline font-medium">Edit</button>
                          <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                            className="text-xs text-red-400 hover:underline font-medium disabled:opacity-50">
                            {deleting === p.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
