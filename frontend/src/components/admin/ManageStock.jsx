import { useState } from 'react';
import { InventoryPanel } from './ProductDetailPanel';

const STATUS_STYLE = {
  Active:        'bg-emerald-100 text-emerald-700',
  'Low Stock':   'bg-amber-100 text-amber-700',
  'Out of Stock':'bg-red-100 text-red-600',
};

const getStatus = (stock) =>
  stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'Active';

/**
 * Focused stock-management screen for a single product.
 * Shows product identity/details on the left and the audited
 * stock-adjustment panel (InventoryPanel) on the right.
 */
export default function ManageStock({ product: initialProduct, onBack, onStockUpdated }) {
  const [product, setProduct] = useState(initialProduct);
  const stock  = product.stock ?? 0;
  const status = getStatus(stock);

  const handleStockUpdated = (updated) => {
    setProduct(p => ({ ...p, stock: updated.stock }));
    onStockUpdated?.(updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm text-lg">
          ←
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">📦 Manage Stock</h2>
          <p className="text-xs text-gray-400">{product.name} · Product ID #{product.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Product details */}
        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              {product.imageUrl
                ? <img src={product.imageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                       onError={e => { e.target.style.display = 'none'; }} />
                : <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-3xl flex-shrink-0">🌸</div>
              }
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>
                <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">Selling Price</span>
              <span className="text-xs font-semibold text-gray-700">₹{product.price}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">Original / MRP</span>
              <span className="text-xs font-semibold text-gray-700">₹{product.originalPrice}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-xs text-gray-400">Current Stock</span>
              <span className="text-xs font-semibold text-gray-700">{stock}</span>
            </div>
          </div>
        </div>

        {/* Stock update section */}
        <div className="xl:col-span-2">
          <InventoryPanel product={product} onStockUpdated={handleStockUpdated} />
        </div>
      </div>
    </div>
  );
}
