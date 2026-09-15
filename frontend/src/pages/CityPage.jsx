import { useState, useEffect, useMemo } from 'react';
import { CATEGORY_META } from '../data/productData';
import { fetchCategories } from '../services/categoryService';
import { fetchProductsByCategory } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

const EMOJI_MAP = {
  Flowers: '🌸', Cakes: '🎂', Combos: '🎁', Birthday: '🎉',
  Anniversary: '💑', Plants: '🌿', Chocolates: '🍫', Personalised: '✨',
};

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function CityPage({ wishlist, toggleWishlist, onAddToCart, onBack, onProductClick }) {
  const [categories, setCategories]         = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [sort, setSort]                     = useState('popular');
  const [toast, setToast]                   = useState('');

  useEffect(() => {
    fetchCategories('city_delivery')
      .then(data => {
        const cats = data.map(c => ({ key: c.categoryName, emoji: EMOJI_MAP[c.categoryName] || '🌸' }));
        setCategories(cats);
        if (cats.length) setActiveCategory(cats[0].key);
      })
      .catch(() => {
        const fallback = Object.keys(EMOJI_MAP).map(k => ({ key: k, emoji: EMOJI_MAP[k] }));
        setCategories(fallback);
        setActiveCategory(fallback[0].key);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProductsByCategory(activeCategory, 0, 50)
      .then(data => setProducts(data.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleCategoryClick = (key) => {
    setActiveCategory(key);
    setSort('popular');
  };

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setToast(`${product.name} added to cart!`);
  };

  const filtered = useMemo(() => {
    if (!products.length) return [];
    switch (sort) {
      case 'price_asc':  return [...products].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...products].sort((a, b) => b.price - a.price);
      case 'rating':     return [...products].sort((a, b) => b.rating - a.rating);
      default:           return [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
  }, [products, sort]);

  const meta = activeCategory ? (CATEGORY_META[activeCategory] || {}) : {};

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">Home</button>
        <span>/</span>
        <span className="text-gray-800 font-semibold flex items-center gap-1">📍 City Delivery</span>
      </div>

      {/* Page Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: '180px' }}>
        <img
          src="https://images.unsplash.com/photo-1487530811015-780780169993?w=1200&h=400&fit=crop"
          alt="Surat Delivery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f4c5c]/90 via-[#1a6b8a]/75 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-green-300 uppercase tracking-widest">Delivering in Your City</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Flowers &amp; Gifts for Your City 🌸</h1>
          <p className="text-sm text-white/70 mt-1">Same-day · Midnight · Free gift wrap</p>
        </div>
      </div>

      {/* Category Tabs */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Shop by Category</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryClick(cat.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#1a6b8a] text-white border-[#1a6b8a] shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6b8a] hover:text-[#1a6b8a]'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.key}
            </button>
          );
        })}
      </div>

      {/* Products Section */}
      {activeCategory && (
        <div id="city-products">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {meta.emoji} {activeCategory} — City Delivery
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{meta.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{filtered.length} products</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#1a6b8a] cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <span className="w-6 h-6 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <span className="text-5xl mb-4">🌸</span>
              <p className="font-semibold text-gray-600">No products found</p>
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
        </div>
      )}

      <ProductToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
