const products = [
  { id: 101, name: 'Silk Rose Bouquet',              price: 499, original: 699,  off: 28, rating: 4.8, reviews: 512,  emoji: '🌹', bg: '#fce4ec' },
  { id: 102, name: 'Artificial Sunflower Bunch',     price: 349, original: 549,  off: 36, rating: 4.7, reviews: 284,  emoji: '🌻', bg: '#fff8e1' },
  { id: 103, name: 'Lavender Stem Arrangement',      price: 429, original: 599,  off: 28, rating: 4.9, reviews: 198,  emoji: '💜', bg: '#f3e5f5' },
  { id: 104, name: 'Tropical Leaf Decor Plant',      price: 599, original: 849,  off: 29, rating: 4.8, reviews: 143,  emoji: '🌿', bg: '#e8f5e9' },
  { id: 105, name: 'Cherry Blossom Branch',          price: 459, original: 649,  off: 29, rating: 4.9, reviews: 376,  emoji: '🌸', bg: '#fce4ec' },
  { id: 106, name: 'Cactus Succulent Set',           price: 379, original: 529,  off: 28, rating: 4.6, reviews: 221,  emoji: '🌵', bg: '#e8f5e9' },
  { id: 107, name: 'White Lily Vase Arrangement',    price: 649, original: 899,  off: 27, rating: 4.9, reviews: 309,  emoji: '🤍', bg: '#f5f5f5' },
  { id: 108, name: 'Mixed Wildflower Wreath',        price: 549, original: 799,  off: 31, rating: 4.7, reviews: 167,  emoji: '💐', bg: '#fff3e0' },
];

export default function BestSellingArtificial({ wishlist = [], toggleWishlist }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Best Selling Artificial Items</h2>
          <p className="text-sm text-gray-400 mt-1">Long-Lasting Beauty for Every Space</p>
        </div>
        <button className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer">
          View All
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {products.map(p => (
          <div key={p.id} className="border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all bg-white">
            <div className="relative h-48 flex items-center justify-center" style={{ background: p.bg }}>
              <span className="text-8xl drop-shadow">{p.emoji}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-base cursor-pointer shadow border-none hover:scale-110 transition-transform"
              >
                {wishlist.includes(p.id) ? '❤️' : '🤍'}
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-800 truncate mb-2">{p.name}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-gray-900">₹ {p.price}</span>
                <span className="text-xs text-gray-400 line-through">₹ {p.original}</span>
                <span className="text-xs font-semibold text-red-500">{p.off}% OFF</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="bg-green-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">⭐ {p.rating}</span>
                <span className="text-xs text-[#1a6b8a]">({p.reviews} Reviews)</span>
              </div>
              <p className="text-xs text-gray-500">Ships in : <strong className="text-gray-800">2–3 Days</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
