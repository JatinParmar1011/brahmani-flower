import { useState } from 'react';

const TAG_COLORS = {
  Bestseller: 'bg-amber-500',  Trending: 'bg-rose-500',   New: 'bg-blue-500',
  Popular:    'bg-emerald-600', Premium: 'bg-violet-600', Luxury: 'bg-yellow-600',
};

export default function DetailInfo({ product, onAddToCart, inWishlist, onToggleWishlist }) {
  const { name, price, originalPrice, rating, reviewCount, tag,
          highlight1, highlight2, highlight3, highlight4, stock } = product;
  const [qty, setQty] = useState(1);
  const discountPercent = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const savings = originalPrice > price ? (originalPrice - price) * qty : 0;

  const highlights = [highlight1, highlight2, highlight3, highlight4].filter(Boolean);

  return (
    <div className="flex flex-col gap-0">

      {/* ── Tag + Wishlist ── */}
      <div className="flex items-center justify-between mb-3">
        {tag
          ? <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-white px-3 py-1 rounded-full ${TAG_COLORS[tag] || 'bg-gray-500'}`}>
              {tag}
            </span>
          : <span />
        }
        <button onClick={onToggleWishlist}
          className={`group w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer
            ${inWishlist
              ? 'bg-rose-50 border-rose-300 shadow-sm'
              : 'bg-white border-gray-200 hover:border-rose-300 hover:bg-rose-50'}`}>
          <span className={`text-base transition-transform duration-200 ${inWishlist ? 'scale-110' : 'group-hover:scale-110'}`}>
            {inWishlist ? '❤️' : '🤍'}
          </span>
        </button>
      </div>

      {/* ── Product Name ── */}
      <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight mb-3">
        {name}
      </h1>

      {/* ── Rating + Stock ── */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        {rating > 0 && (
          <div className="flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
            ★ {rating}
          </div>
        )}
        {reviewCount > 0 && (
          <span className="text-xs text-gray-400 font-medium">{reviewCount.toLocaleString()} Reviews</span>
        )}
        <div className="w-px h-3.5 bg-gray-200" />
        <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md
          ${stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          <span className="text-[10px]">{stock > 0 ? '●' : '●'}</span>
          {stock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* ── Price Block ── */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-100 rounded-2xl px-5 py-4 mb-4">
        <div className="flex items-end gap-3">
          <span className="text-[32px] font-extrabold text-gray-900 leading-none">₹{Number(price).toLocaleString('en-IN')}</span>
          {originalPrice > price && (
            <span className="text-base text-gray-400 line-through mb-0.5">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
          )}
          {discountPercent > 0 && (
            <span className="mb-0.5 text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        {savings > 0 && (
          <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">
            You save ₹{Number(savings).toLocaleString('en-IN')} on this order
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">Inclusive of all taxes</p>
      </div>

      {/* ── Highlights ── */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
              <span className="text-[11px] font-medium text-gray-700">{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-dashed border-gray-200 mb-4" />

      {/* ── Qty + Add to Cart ── */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex-shrink-0">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center text-lg text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none font-light">
            −
          </button>
          <span className="w-10 text-center text-sm font-bold text-gray-900 border-x border-gray-100">{qty}</span>
          <button onClick={() => setQty(q => Math.min(stock || 99, q + 1))}
            className="w-11 h-11 flex items-center justify-center text-lg text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none font-light">
            +
          </button>
        </div>
        <button
          onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product); }}
          disabled={stock === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1a6b8a] hover:bg-[#155a75] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-sm tracking-wide shadow-lg shadow-[#1a6b8a]/20">
          <span className="text-base">🛒</span> Add to Cart
        </button>
      </div>

      {/* ── Buy Now ── */}
      <button
        disabled={stock === 0}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a6b8a] font-semibold py-3.5 rounded-xl border-2 border-[#1a6b8a] transition-all duration-200 cursor-pointer text-sm tracking-wide mt-2.5">
        <span className="text-base">⚡</span> Buy Now
      </button>

    </div>
  );
}
