import { useState, useEffect, useMemo } from 'react';
import { fetchProductsByCategoryName } from '../services/productService';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

const GRADIENT_MAP = {
  'Shop By Occasion':  'from-orange-50 to-amber-100',
  'Shop By Recipient': 'from-pink-50 to-rose-100',
};

const ACCENT_MAP = {
  'Shop By Occasion':  '#f97316',
  'Shop By Recipient': '#e91e8c',
};

export default function CategoryItemPage({ item, wishlist, toggleWishlist, onAddToCart, onBack, onProductClick }) {
  const { label, emoji, parent } = item;
  const gradient = GRADIENT_MAP[parent] || 'from-pink-50 to-rose-100';
  const accent   = ACCENT_MAP[parent]   || '#1a6b8a';

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState('popular');
  const [activeTag, setActiveTag] = useState('All');
  const [toast, setToast]       = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProductsByCategoryName(label, 0, 50)
      .then(data => setProducts(data.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [label]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setToast(`${product.name} added to cart!`);
  };

  const filtered = useMemo(() => {
    let list = activeTag !== 'All' ? products.filter(p => p.tag === activeTag) : products;
    switch (sort) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].sort((a, b) => b.id - a.id);
      default:           return [...list].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
  }, [products, sort, activeTag]);

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">Home</button>
        <span>/</span>
        <span className="text-gray-500 font-medium">{parent}</span>
        <span>/</span>
        <span className="text-gray-800 font-semibold">{label}</span>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl px-10 py-10 flex items-center justify-between mb-8 overflow-hidden relative`}>
        <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10" style={{ background: accent, transform: 'translate(30%,-30%)' }} />
        <div className="z-10">
          <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: accent }}>
            {parent}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">{label}</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-md">
            Handpicked flowers &amp; gifts perfect for <span className="font-semibold text-gray-700">{label}</span> — delivered fresh to your door.
          </p>
          <div className="flex items-center gap-6 mt-5">
            {[['🚚', 'Same Day Delivery'], ['✅', '100% Fresh'], ['↩️', 'Easy Returns']].map(([icon, lbl]) => (
              <div key={lbl} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span>{icon}</span><span>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="text-[120px] leading-none drop-shadow-lg z-10 select-none hidden sm:block">{emoji}</span>
      </div>

      {/* Filters */}
      <ProductFilters
        sort={sort} setSort={setSort}
        activeTag={activeTag} setActiveTag={setActiveTag}
        total={filtered.length} accent={accent}
      />

      {/* Products */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <span className="w-6 h-6 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
          Loading products…
        </div>
      ) : (
        <ProductGrid
          products={filtered}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onProductClick={(p) => onProductClick?.(p, filtered)}
        />
      )}

      <ProductToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
