import { useState } from 'react';
import { ALL_PRODUCTS, CATEGORY_META } from '../../data/productData';
import AddProduct from './AddProduct';

const withStock = ALL_PRODUCTS.map((p, i) => {
  const stocks = [42,18,7,0,25,11,33,5,20,0,14,8,30,22,16,9,27,3,19,12,0,35,6,28,40,15,0,24,17,11,38,7,29,13,0,21,8,32,5,26,44,10,0,18,36,14,23,9,31,7,0,20,16,28,12,4,39,22,0,17,33,8,25,11,46,19,0,27,14,6,35,9,41,13,0,22,30,7,18,24,5,11,0,16,28,3,20,8];
  const stock = stocks[i] ?? 10;
  return { ...p, stock, status: stock === 0 ? 'Out of Stock' : stock <= 8 ? 'Low Stock' : 'Active' };
});

const CATEGORIES  = Object.keys(CATEGORY_META);
const STATUS_STYLE = { 'Active':'bg-emerald-100 text-emerald-700', 'Low Stock':'bg-amber-100 text-amber-700', 'Out of Stock':'bg-red-100 text-red-600' };
const TAG_STYLE    = { Bestseller:'bg-orange-100 text-orange-600', Trending:'bg-blue-100 text-blue-600', New:'bg-emerald-100 text-emerald-600', Popular:'bg-violet-100 text-violet-600', Premium:'bg-yellow-100 text-yellow-700', Luxury:'bg-rose-100 text-rose-600' };

const toInitial = (p) => ({
  ...p,
  tag: p.tag || 'None',
  images: p.images || ['','','','',''],
  contains: p.contains || '',
  description: p.description || '',
  delivery: p.delivery || 'Tomorrow',
  expressDelivery: p.expressDelivery || 'Within 4 hours',
  midnightDelivery: p.midnightDelivery || false,
  freshFlowers: true, sameDay: true, easyReturns: true, giftWrapping: true,
  waterDaily: true, roomTemp: true, trimStems: true,
  lasts: p.lasts || '5–7 Days',
  subcategory: p.subcategory || '',
});

export default function AdminProducts() {
  const [products, setProducts]   = useState(withStock);
  const [catFilter, setCatFilter] = useState('All');
  const [search, setSearch]       = useState('');
  const [view, setView]           = useState('list'); // 'list' | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(null);

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchQ   = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const handleAdd = (form) => {
    const newP = {
      ...form, id: Date.now(),
      price: Number(form.price), original: Number(form.original), stock: Number(form.stock),
      tag: form.tag === 'None' ? null : form.tag,
      rating: 0, reviews: 0,
      emoji: CATEGORY_META[form.category]?.emoji || '🌸',
      bg: '#f5f5f5',
      status: Number(form.stock) === 0 ? 'Out of Stock' : Number(form.stock) <= 8 ? 'Low Stock' : 'Active',
    };
    setProducts(prev => [newP, ...prev]);
    setView('list');
  };

  const handleEdit = (form) => {
    setProducts(prev => prev.map(p => p.id === editProduct.id ? {
      ...p, ...form,
      price: Number(form.price), original: Number(form.original), stock: Number(form.stock),
      tag: form.tag === 'None' ? null : form.tag,
      status: Number(form.stock) === 0 ? 'Out of Stock' : Number(form.stock) <= 8 ? 'Low Stock' : 'Active',
    } : p));
    setEditProduct(null);
    setView('list');
  };

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  // ── Full-page Add / Edit view ──────────────────────────────────────────
  if (view === 'add') {
    return <AddProduct onSave={handleAdd} onCancel={() => setView('list')} />;
  }
  if (view === 'edit' && editProduct) {
    return (
      <AddProduct
        initial={toInitial(editProduct)}
        onSave={handleEdit}
        onCancel={() => { setEditProduct(null); setView('list'); }}
      />
    );
  }

  // ── List view ──────────────────────────────────────────────────────────
  const totalActive = products.filter(p => p.status === 'Active').length;
  const totalLow    = products.filter(p => p.status === 'Low Stock').length;
  const totalOut    = products.filter(p => p.status === 'Out of Stock').length;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: '🌸', color: 'from-pink-400 to-rose-500' },
          { label: 'Active',         value: totalActive,     icon: '✅', color: 'from-emerald-400 to-teal-500' },
          { label: 'Low Stock',      value: totalLow,        icon: '⚠️', color: 'from-amber-400 to-orange-500' },
          { label: 'Out of Stock',   value: totalOut,        icon: '❌', color: 'from-red-400 to-rose-500' },
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
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">All Products</h3>
              <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {products.length} products</p>
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
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {['All', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                  catFilter === c ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]' : 'border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a]'
                }`}>
                {CATEGORY_META[c]?.emoji} {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                {['Product', 'Category', 'Price', 'MRP', 'Stock', 'Tag', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-300 text-sm">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: p.bg }}>{p.emoji}</div>
                      <span className="font-medium text-gray-700 max-w-[180px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{p.category}{p.subcategory ? ` › ${p.subcategory}` : ''}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">₹{p.price}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs line-through">₹{p.original}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{p.stock}</td>
                  <td className="px-5 py-3.5">
                    {p.tag
                      ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TAG_STYLE[p.tag] || 'bg-gray-100 text-gray-500'}`}>{p.tag}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditProduct(p); setView('edit'); }}
                        className="text-xs text-[#1a6b8a] hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-400 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
