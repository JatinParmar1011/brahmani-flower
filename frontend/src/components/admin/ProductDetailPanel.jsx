import { useState, useEffect } from 'react';
import { adjustStockApi, fetchInventoryTransactions } from '../../services/orderService';

const STATUS_STYLE = {
  Active:        'bg-emerald-100 text-emerald-700',
  'Low Stock':   'bg-amber-100 text-amber-700',
  'Out of Stock':'bg-red-100 text-red-600',
};

const TAG_STYLE = {
  Bestseller: 'bg-orange-100 text-orange-600',
  Trending:   'bg-blue-100 text-blue-600',
  New:        'bg-emerald-100 text-emerald-600',
  Popular:    'bg-violet-100 text-violet-600',
  Premium:    'bg-yellow-100 text-yellow-700',
  Luxury:     'bg-rose-100 text-rose-600',
};

const TX_TYPE_STYLE = {
  RESTOCK:     'bg-green-100 text-green-700',
  SALE:        'bg-blue-100 text-blue-700',
  RETURN:      'bg-teal-100 text-teal-700',
  DAMAGE:      'bg-red-100 text-red-600',
  ADJUSTMENT:  'bg-purple-100 text-purple-700',
  CANCELLATION:'bg-amber-100 text-amber-700',
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-gray-700">{value ?? '—'}</span>
    </div>
  );
}

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

// ── Inventory Panel ────────────────────────────────────────────────────────
function InventoryPanel({ product, onStockUpdated }) {
  const [txType, setTxType]   = useState('RESTOCK');
  const [qty, setQty]         = useState('');
  const [notes, setNotes]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [txns, setTxns]       = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  const loadTxns = () => {
    setTxLoading(true);
    fetchInventoryTransactions(product.id)
      .then(data => setTxns(data.content ?? []))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  };

  useEffect(() => { loadTxns(); }, [product.id]); // eslint-disable-line

  const handleAdjust = async () => {
    const q = parseInt(qty, 10);
    if (!q || q === 0) { setError('Enter a valid quantity'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await adjustStockApi(product.id, txType, q, notes);
      setSuccess(`Stock updated. New stock: ${updated.stock}`);
      setQty(''); setNotes('');
      onStockUpdated(updated);
      loadTxns();
    } catch (e) {
      setError(e.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h3 className="font-bold text-gray-800">📦 Inventory Management</h3>

      {/* Current stock */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{product.stock ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Current Stock</p>
        </div>
        <div className="flex-1 text-sm text-gray-500">
          {(product.stock ?? 0) === 0
            ? <span className="text-red-500 font-semibold">⚠️ Out of stock</span>
            : (product.stock ?? 0) <= 8
            ? <span className="text-amber-500 font-semibold">⚠️ Low stock</span>
            : <span className="text-green-600 font-semibold">✅ In stock</span>}
        </div>
      </div>

      {/* Adjustment form */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stock Adjustment</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select value={txType} onChange={e => setTxType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white transition">
              {['RESTOCK', 'ADJUSTMENT', 'DAMAGE', 'RETURN'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Quantity {txType === 'ADJUSTMENT' ? '(+/-)' : ''}
            </label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)}
              placeholder={txType === 'ADJUSTMENT' ? 'e.g. -5 or +10' : 'e.g. 20'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
          </div>
        </div>
        <input value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-600 font-semibold">{success}</p>}
        <button onClick={handleAdjust} disabled={saving}
          className="w-full bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
          {saving ? 'Updating…' : 'Update Stock'}
        </button>
      </div>

      {/* Transaction history */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Transaction History</p>
        {txLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : txns.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {txns.map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${TX_TYPE_STYLE[tx.transactionType] || 'bg-gray-100 text-gray-500'}`}>
                    {tx.transactionType}
                  </span>
                  <span className={tx.quantityChange > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                    {tx.quantityChange > 0 ? '+' : ''}{tx.quantityChange}
                  </span>
                  <span className="text-gray-400">{tx.stockBefore} → {tx.stockAfter}</span>
                </div>
                <span className="text-gray-300">{fmtDate(tx.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ProductDetailPanel ────────────────────────────────────────────────
export default function ProductDetailPanel({ product: initialProduct, onEdit, onBack }) {
  const [product, setProduct] = useState(initialProduct);

  const images = [
    product.imageUrl, product.imageUrl2, product.imageUrl3,
    product.imageUrl4, product.imageUrl5,
  ].filter(Boolean);

  const stock  = product.stock ?? 0;
  const status = stock === 0 ? 'Out of Stock' : stock <= 8 ? 'Low Stock' : 'Active';

  const highlights = [
    product.highlight1, product.highlight2,
    product.highlight3, product.highlight4,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm text-lg">
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
            <p className="text-xs text-gray-400">Product ID: #{product.id}</p>
          </div>
        </div>
        <button onClick={onEdit}
          className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          ✏️ Edit Product
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left */}
        <div className="xl:col-span-2 space-y-5">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Product Images</h3>
            {images.length === 0 ? (
              <div className="w-full h-40 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 text-4xl">🌸</div>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Basic Information</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
              {product.tag && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TAG_STYLE[product.tag] || 'bg-gray-100 text-gray-500'}`}>{product.tag}</span>
              )}
            </div>
            <InfoRow label="Selling Price"  value={`₹${product.price}`} />
            <InfoRow label="Original / MRP" value={`₹${product.originalPrice}`} />
            <InfoRow label="Stock"          value={stock} />
            <InfoRow label="Rating"         value={`${product.rating ?? 0} ⭐ (${product.reviewCount ?? 0} reviews)`} />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-3">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description || '—'}</p>
            {product.contains && (
              <>
                <h3 className="font-bold text-gray-800 mt-5 mb-3">Contains</h3>
                <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap bg-gray-50 rounded-xl p-4">{product.contains}</pre>
              </>
            )}
          </div>

          {/* Inventory Management — NEW */}
          <InventoryPanel product={product} onStockUpdated={updated => setProduct(p => ({ ...p, stock: updated.stock }))} />
        </div>

        {/* Right */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">🚚 Delivery</h3>
            <InfoRow label="Standard" value={product.delivery} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">✨ Product Highlights</h3>
            {highlights.length === 0 ? (
              <p className="text-xs text-gray-400">No highlights added</p>
            ) : (
              <div className="flex flex-col gap-2">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className="text-[#1a6b8a] font-bold text-xs">{i + 1}</span>
                    <span className="text-xs font-medium text-gray-700">{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
