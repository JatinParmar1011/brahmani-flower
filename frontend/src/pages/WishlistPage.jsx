const ALL_PRODUCTS = [
  { id: 1, name: '10 Red Roses Bouquet',           price: 695, original: 779,  off: 10, rating: 4.9, reviews: 1645, emoji: '💐', bg: '#fce4ec' },
  { id: 2, name: 'Profuse Jade Terrarium',          price: 695, original: 989,  off: 31, rating: 4.9, reviews: 68,   emoji: '🌿', bg: '#e8f5e9' },
  { id: 3, name: 'Chocolate Truffle Cake',          price: 595, original: 745,  off: 21, rating: 4.9, reviews: 829,  emoji: '🎂', bg: '#fff8e1' },
  { id: 4, name: 'Bellina Purple Orchid Bouquet',   price: 795, original: 989,  off: 21, rating: 4.9, reviews: 676,  emoji: '💜', bg: '#f3e5f5' },
  { id: 5, name: 'Pastel Blooms Of Serenity',       price: 595, original: 795,  off: 28, rating: 5.0, reviews: 2,    emoji: '🌸', bg: '#fce4ec' },
  { id: 6, name: 'Red Roses Wrapped In Heartfelt',  price: 545, original: 795,  off: 32, rating: 4.8, reviews: 4,    emoji: '🌹', bg: '#fce4ec' },
  { id: 7, name: 'Decadent Red Velvet Cake',        price: 685, original: 885,  off: 24, rating: 4.9, reviews: 320,  emoji: '🍰', bg: '#fff8e1' },
  { id: 8, name: 'Twin Hearts Floral Balloon',      price: 895, original: 1295, off: 31, rating: 4.6, reviews: 8,    emoji: '🎈', bg: '#fce4ec' },
];

export default function WishlistPage({ wishlist, toggleWishlist, onBack, onGoToCart }) {
  const items = ALL_PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1300px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all shadow-sm">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-28 h-28 rounded-full bg-red-50 flex items-center justify-center text-6xl mb-6">🤍</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 text-sm mb-6">Save your favourite flowers by clicking the ❤️ icon.</p>
            <button onClick={onBack}
              className="bg-[#1a6b8a] hover:bg-[#155a75] text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map(p => (
              <div key={p.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">

                {/* Image area */}
                <div className="relative h-48 flex items-center justify-center" style={{ background: p.bg }}>
                  <span className="text-8xl drop-shadow">{p.emoji}</span>
                  {/* Remove from wishlist */}
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-base hover:scale-110 transition-transform">
                    ❤️
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-800 truncate mb-2">{p.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-900">₹{p.price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{p.original}</span>
                    <span className="text-xs font-bold text-red-500">{p.off}% OFF</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="bg-green-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">⭐ {p.rating}</span>
                    <span className="text-xs text-[#1a6b8a]">({p.reviews} Reviews)</span>
                  </div>
                  <button
                    onClick={() => onGoToCart()}
                    className="w-full bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
