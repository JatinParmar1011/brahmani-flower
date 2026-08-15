
const products = [
  { id: 1, name: '10 Red Roses Bouquet',            price: 695, original: 779,  off: 10, rating: 4.9, reviews: 1645, emoji: '💐', bg: '#fce4ec' },
  { id: 2, name: 'Profuse Jade Terrarium',           price: 695, original: 989,  off: 31, rating: 4.9, reviews: 68,   emoji: '🌿', bg: '#e8f5e9' },
  { id: 3, name: 'Chocolate Truffle Cake',           price: 595, original: 745,  off: 21, rating: 4.9, reviews: 829,  emoji: '🎂', bg: '#fff8e1' },
  { id: 4, name: 'Bellina Purple Orchid Bouquet',    price: 795, original: 989,  off: 21, rating: 4.9, reviews: 676,  emoji: '💜', bg: '#f3e5f5' },
  { id: 5, name: 'Pastel Blooms Of Serenity',        price: 595, original: 795,  off: 28, rating: 5.0, reviews: 2,    emoji: '🌸', bg: '#fce4ec' },
  { id: 6, name: 'Red Roses Wrapped In Heartfelt…',  price: 545, original: 795,  off: 32, rating: 4.8, reviews: 4,    emoji: '🌹', bg: '#fce4ec' },
  { id: 7, name: 'Decadent Red Velvet Cake',         price: 685, original: 885,  off: 24, rating: 4.9, reviews: 320,  emoji: '🍰', bg: '#fff8e1' },
  { id: 8, name: 'Twin Hearts Floral Balloon',       price: 895, original: 1295, off: 31, rating: 4.6, reviews: 8,    emoji: '🎈', bg: '#fce4ec' },
];

export default function BestSelling({ wishlist = [], toggleWishlist }) {

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Best Selling Flowers &amp; Gifts</h2>
          <p className="text-sm text-gray-400 mt-1">Surprise Your Loved Ones</p>
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
              <p className="text-xs text-gray-500">Earliest Delivery : <strong className="text-gray-800">Tomorrow</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
