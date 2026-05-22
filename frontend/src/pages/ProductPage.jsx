import { useState, useMemo } from 'react';
import { ALL_PRODUCTS, CATEGORY_META, SUBCATEGORY_PRODUCTS, NAV_MENU } from '../data/productData';
import ProductHero from '../components/product/ProductHero';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

export default function ProductPage({ category, subcategory, wishlist, toggleWishlist, onAddToCart, onBack, onCategoryClick, onSubcategoryClick, onProductClick }) {
  const meta = CATEGORY_META[category] || CATEGORY_META['Flowers'];
  const [sort, setSort] = useState('popular');
  const [activeTag, setActiveTag] = useState('All');
  const [toast, setToast] = useState('');

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setToast(`${product.name} added to cart!`);
  };

  // All subcategory items for this category only — no deduplication needed since NAV_MENU[category] is category-specific
  const subcategoryItems = useMemo(
    () => (NAV_MENU[category] || []).flatMap(col => col.items),
    [category]
  );

  const baseProducts = useMemo(() => {
    if (subcategory) {
      const ids = SUBCATEGORY_PRODUCTS[subcategory] || [];
      return ids.map(id => ALL_PRODUCTS.find(p => p.id === id)).filter(Boolean);
    }
    return ALL_PRODUCTS.filter(p => p.category === category);
  }, [category, subcategory]);

  const filtered = useMemo(() => {
    let list = activeTag !== 'All' ? baseProducts.filter(p => p.tag === activeTag) : baseProducts;
    switch (sort) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].sort((a, b) => b.id - a.id);
      default:           return [...list].sort((a, b) => b.reviews - a.reviews);
    }
  }, [baseProducts, sort, activeTag]);

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">Home</button>
        <span>/</span>
        <button onClick={() => onCategoryClick(category)} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">{category}</button>
        {subcategory && (
          <>
            <span>/</span>
            <span className="text-gray-700 font-semibold">{subcategory}</span>
          </>
        )}
      </div>

      {/* Hero — only show when no subcategory */}
      {!subcategory && <ProductHero category={category} meta={meta} />}

      {/* Subcategory Hero Banner */}
      {subcategory && (
        <div className={`relative bg-gradient-to-r ${meta.gradient} rounded-3xl p-8 mb-8 overflow-hidden`}>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ color: meta.accent }}>
              {meta.emoji} {category}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{subcategory}</h1>
            <p className="text-gray-500 text-sm">Handpicked collection · Same day delivery · 100% fresh</p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">{meta.emoji}</div>
        </div>
      )}

      {/* Subcategory chips — shown when on main category page */}
      {!subcategory && subcategoryItems.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Browse by Type</p>
          <div className="flex flex-wrap gap-3">
            {subcategoryItems.map(item => (
              <button
                key={item.sub}
                onClick={() => onSubcategoryClick?.(category, item.sub)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#1a6b8a] hover:text-[#1a6b8a] hover:bg-[#1a6b8a]/5 transition-all shadow-sm hover:shadow-md"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📦', label: 'Products',   value: baseProducts.length + '+' },
          { icon: '⭐', label: 'Avg Rating', value: '4.8' },
          { icon: '🚚', label: 'Delivery',   value: 'Same Day' },
          { icon: '↩️', label: 'Returns',    value: '7 Days' },
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
        onProductClick={onProductClick}
      />

      <ProductToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
