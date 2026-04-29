import { useState } from 'react';

export default function DetailInfo({ product, onAddToCart }) {
  const { name, price, original, off, rating, reviews, category, tag } = product;
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-5">
      {/* Category + tag */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#1a6b8a] bg-[#1a6b8a]/10 px-3 py-1 rounded-full">{category}</span>
        {tag && <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{tag}</span>}
      </div>

      {/* Name */}
      <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">{name}</h1>

      {/* Rating row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-green-700 text-white text-sm font-bold px-3 py-1 rounded-lg">
          <span>⭐</span>
          <span>{rating}</span>
        </div>
        <span className="text-sm text-gray-500">({reviews.toLocaleString()} Reviews)</span>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-green-600 font-semibold">✓ In Stock</span>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 py-3 border-y border-gray-100">
        <span className="text-3xl font-extrabold text-gray-900">₹{price}</span>
        <span className="text-lg text-gray-400 line-through mb-0.5">₹{original}</span>
        <span className="text-sm font-bold text-white bg-red-500 px-2.5 py-1 rounded-lg mb-0.5">{off}% OFF</span>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '🌿', text: '100% Fresh Flowers' },
          { icon: '🚚', text: 'Same Day Delivery' },
          { icon: '↩️', text: '7 Day Easy Returns' },
          { icon: '🎁', text: 'Free Gift Wrapping' },
        ].map(h => (
          <div key={h.text} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-base">{h.icon}</span>
            <span className="text-xs font-medium text-gray-700">{h.text}</span>
          </div>
        ))}
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer bg-white border-none"
          >−</button>
          <span className="w-10 text-center text-sm font-bold text-gray-900">{qty}</span>
          <button
            onClick={() => setQty(q => q + 1)}
            className="w-10 h-11 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer bg-white border-none"
          >+</button>
        </div>

        <button
          onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product); }}
          className="flex-1 bg-[#1a6b8a] hover:bg-[#155a75] active:scale-95 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-[#1a6b8a]/30"
        >
          🛒 Add to Cart
        </button>
      </div>

      {/* Buy Now */}
      <button className="w-full border-2 border-[#1a6b8a] text-[#1a6b8a] hover:bg-[#1a6b8a] hover:text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm">
        ⚡ Buy Now
      </button>
    </div>
  );
}
