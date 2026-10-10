import { tagBadgeClass } from '../../utils/tagColors';

export default function DetailSimilar({ products, onSelect, onAddToCart }) {
  if (!products.length) return null;
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-4">You May Also Like</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {products.map(p => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex-shrink-0 w-44 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-32 flex items-center justify-center" style={{ background: p.bg }}>
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
              {p.tag && (
                <span className={`absolute top-2 left-2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full ${tagBadgeClass(p.tag)}`}>
                  {p.tag}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-800 truncate mb-1">{p.name}</p>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm font-bold text-gray-900">₹{p.price}</span>
                <span className="text-[10px] text-red-500 font-bold">{p.off}% OFF</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onAddToCart(p); }}
                className="w-full bg-[#1a6b8a] hover:bg-[#155a75] text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer border-none"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
