import { useState, useMemo } from 'react';
import { ALL_PRODUCTS, CATEGORY_META } from '../data/productData';
import ProductHero from '../components/product/ProductHero';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

export default function ProductPage({ category, wishlist, toggleWishlist, onAddToCart, onBack }) {
  const meta = CATEGORY_META[category] || CATEGORY_META['Flowers'];
  const [sort, setSort] = useState('popular');
  const [activeTag, setActiveTag] = useState('All');
  const [toast, setToast] = useState('');

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setToast(`${product.name} added to cart!`);
  };

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.filter(p => p.category === category);
    if (activeTag !== 'All') list = list.filter(p => p.tag === activeTag);
    switch (sort) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].sort((a, b) => b.id - a.id);
      default:           return [...list].sort((a, b) => b.reviews - a.reviews);
    }
  }, [category, sort, activeTag]);

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">
          Home
        </button>
        <span>/</span>
        <span className="text-gray-700 font-semibold">{category}</span>
      </div>

      <ProductHero category={category} meta={meta} />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📦', label: 'Products', value: ALL_PRODUCTS.filter(p => p.category === category).length + '+' },
          { icon: '⭐', label: 'Avg Rating', value: '4.8' },
          { icon: '🚚', label: 'Delivery', value: 'Same Day' },
          { icon: '↩️', label: 'Returns', value: '7 Days' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-base font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <ProductFilters
        sort={sort}
        setSort={setSort}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        total={filtered.length}
        accent={meta.accent}
      />

      <ProductGrid
        products={filtered}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
      />

      <ProductToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
