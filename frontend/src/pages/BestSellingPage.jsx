import { useState, useEffect, useMemo } from 'react';
import { fetchProductsByCategoryName } from '../services/productService';
import { fetchCategories } from '../services/categoryService';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

// Map the title passed from HomePage to the exact DB category name
const TITLE_TO_CATEGORY = {
  'Best Selling Flowers & Gifts':  'Best Selling Flowers',
  'Best Selling Artificial Items': 'Best Selling Artificial Items',
};

export default function BestSellingPage({ title, wishlist, toggleWishlist, onAddToCart, onBack, onProductClick }) {
  const categoryName = TITLE_TO_CATEGORY[title] || title;

  const [products,  setProducts]  = useState([]);
  const [imageUrl,  setImageUrl]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [sort,      setSort]      = useState('popular');
  const [activeTag, setActiveTag] = useState('All');
  const [toast,     setToast]     = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProductsByCategoryName(categoryName, 0, 50)
      .then(data => setProducts(data.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    fetchCategories('best_selling')
      .then(cats => {
        const match = cats.find(c => c.categoryName === categoryName);
        setImageUrl(match?.imageUrl || null);
      })
      .catch(() => {});
  }, [categoryName]);

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
        <span className="text-gray-800 font-semibold">{title}</span>
      </div>

      {/* Hero — category image only */}
      {imageUrl ? (
        <div className="rounded-2xl overflow-hidden shadow-sm mb-8" style={{ height: '220px' }}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 mb-8"
          style={{ height: '220px' }}
        >
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm font-medium">No image found</p>
        </div>
      )}

      {/* Filters */}
      <ProductFilters
        sort={sort} setSort={setSort}
        activeTag={activeTag} setActiveTag={setActiveTag}
        total={filtered.length} accent="#1a6b8a"
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
