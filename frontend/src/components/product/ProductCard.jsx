const TAG_COLORS = {
  Bestseller: 'bg-orange-500',
  Trending:   'bg-pink-500',
  New:        'bg-blue-500',
  Popular:    'bg-green-600',
  Premium:    'bg-purple-600',
  Luxury:     'bg-yellow-600',
};

export default function ProductCard({ product, wishlist, toggleWishlist, onAddToCart, onProductClick }) {
  const { id, name, price, originalPrice, rating, reviewCount, tag, delivery, imageUrl } = product;
  const inWishlist = wishlist.includes(id);
  const discountPercent = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;

  const bg = '#fce4ec';

  return (
    <div
      onClick={() => onProductClick?.(product)}
      className="group border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image area */}
      <div className="relative h-52 flex items-center justify-center flex-shrink-0 bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`} style={{ background: bg }}>
          <span className="text-8xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">🌸</span>
        </div>

        {tag && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${TAG_COLORS[tag] || 'bg-gray-500'}`}>
            {tag}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow transition-all border-none cursor-pointer ${inWishlist ? 'bg-red-50 scale-110' : 'bg-white/90 hover:scale-110'}`}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm font-semibold text-gray-800 truncate mb-2">{name}</p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold text-gray-900">₹{price}</span>
          {originalPrice && <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>}
          {discountPercent > 0 && <span className="text-xs font-bold text-red-500">{discountPercent}% OFF</span>}
        </div>

        {(rating > 0 || reviewCount > 0) && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="bg-green-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">⭐ {rating}</span>
            <span className="text-xs text-[#1a6b8a]">({reviewCount} Reviews)</span>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-3">
          🚚 Earliest: <strong className="text-gray-700">{delivery || 'Tomorrow'}</strong>
        </p>

        <button
          onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          className="mt-auto w-full bg-[#1a6b8a] hover:bg-[#155a75] active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
