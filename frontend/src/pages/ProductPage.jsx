import { useState, useEffect, useMemo } from 'react';
import { CATEGORY_META } from '../data/productData';
import { fetchProductsByCategory } from '../services/productService';
import ProductHero from '../components/product/ProductHero';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

export default function ProductPage({ category, wishlist, toggleWishlist, onAddToCart, onBack, onCategoryClick, onProductClick }) {
  const meta = CATEGORY_META[category] || { emoji: '🌸', gradient: 'from-pink-50 to-rose-100', accent: '#1a6b8a', desc: '' };
  const [sort, setSort]         = useState('popular');
  const [activeTag, setActiveTag] = useState('All');
  const [toast, setToast]       = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductsByCategory(category, 0, 50)
      .then(data => setProducts(data.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

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
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">Home</button>
        <span>/</span>
        <button onClick={() => onCategoryClick(category)} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">{category}</button>
      </div>

      <ProductHero category={category} meta={meta} />

      <ProductFilters
        sort={sort} setSort={setSort}
        activeTag={activeTag} setActiveTag={setActiveTag}
        total={filtered.length} accent={meta.accent}
      />

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
