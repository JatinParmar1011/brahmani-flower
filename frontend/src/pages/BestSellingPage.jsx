import { useState, useMemo } from 'react';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductToast from '../components/product/ProductToast';

const SECTION_META = {
  'Best Selling Flowers & Gifts': {
    emoji: '💐',
    gradient: 'from-pink-50 to-rose-100',
    accent: '#e91e8c',
    desc: 'Our most-loved flowers and gifts — handpicked and delivered fresh to your door.',
    products: [
      { id: 1,   name: '10 Red Roses Bouquet',           price: 695, originalPrice: 779,  discountPercent: 10, rating: 4.9, reviewCount: 1645, emoji: '💐', bg: '#fce4ec', tag: 'Bestseller', delivery: 'Tomorrow' },
      { id: 2,   name: 'Profuse Jade Terrarium',          price: 695, originalPrice: 989,  discountPercent: 31, rating: 4.9, reviewCount: 68,   emoji: '🌿', bg: '#e8f5e9', tag: 'Trending',   delivery: 'Tomorrow' },
      { id: 3,   name: 'Chocolate Truffle Cake',          price: 595, originalPrice: 745,  discountPercent: 21, rating: 4.9, reviewCount: 829,  emoji: '🎂', bg: '#fff8e1', tag: 'Popular',    delivery: 'Tomorrow' },
      { id: 4,   name: 'Bellina Purple Orchid Bouquet',   price: 795, originalPrice: 989,  discountPercent: 21, rating: 4.9, reviewCount: 676,  emoji: '💜', bg: '#f3e5f5', tag: 'Trending',   delivery: 'Tomorrow' },
      { id: 5,   name: 'Pastel Blooms Of Serenity',       price: 595, originalPrice: 795,  discountPercent: 28, rating: 5.0, reviewCount: 2,    emoji: '🌸', bg: '#fce4ec', tag: 'New',        delivery: 'Tomorrow' },
      { id: 6,   name: 'Red Roses Wrapped In Heartfelt',  price: 545, originalPrice: 795,  discountPercent: 32, rating: 4.8, reviewCount: 4,    emoji: '🌹', bg: '#fce4ec', tag: null,         delivery: 'Tomorrow' },
      { id: 7,   name: 'Decadent Red Velvet Cake',        price: 685, originalPrice: 885,  discountPercent: 24, rating: 4.9, reviewCount: 320,  emoji: '🍰', bg: '#fff8e1', tag: 'Popular',    delivery: 'Tomorrow' },
      { id: 8,   name: 'Twin Hearts Floral Balloon',      price: 895, originalPrice: 1295, discountPercent: 31, rating: 4.6, reviewCount: 8,    emoji: '🎈', bg: '#fce4ec', tag: null,         delivery: 'Tomorrow' },
    ],
  },
  'Best Selling Artificial Items': {
    emoji: '🌺',
    gradient: 'from-emerald-50 to-green-100',
    accent: '#10b981',
    desc: 'Long-lasting artificial flowers and decor — beautiful, maintenance-free, forever fresh.',
    products: [
      { id: 101, name: 'Silk Rose Bouquet',               price: 499, originalPrice: 699,  discountPercent: 28, rating: 4.8, reviewCount: 512,  emoji: '🌹', bg: '#fce4ec', tag: 'Bestseller', delivery: '2–3 Days' },
      { id: 102, name: 'Artificial Sunflower Bunch',      price: 349, originalPrice: 549,  discountPercent: 36, rating: 4.7, reviewCount: 284,  emoji: '🌻', bg: '#fff8e1', tag: 'Popular',    delivery: '2–3 Days' },
      { id: 103, name: 'Lavender Stem Arrangement',       price: 429, originalPrice: 599,  discountPercent: 28, rating: 4.9, reviewCount: 198,  emoji: '💜', bg: '#f3e5f5', tag: 'Trending',   delivery: '2–3 Days' },
      { id: 104, name: 'Tropical Leaf Decor Plant',       price: 599, originalPrice: 849,  discountPercent: 29, rating: 4.8, reviewCount: 143,  emoji: '🌿', bg: '#e8f5e9', tag: null,         delivery: '2–3 Days' },
      { id: 105, name: 'Cherry Blossom Branch',           price: 459, originalPrice: 649,  discountPercent: 29, rating: 4.9, reviewCount: 376,  emoji: '🌸', bg: '#fce4ec', tag: 'Bestseller', delivery: '2–3 Days' },
      { id: 106, name: 'Cactus Succulent Set',            price: 379, originalPrice: 529,  discountPercent: 28, rating: 4.6, reviewCount: 221,  emoji: '🌵', bg: '#e8f5e9', tag: 'New',        delivery: '2–3 Days' },
      { id: 107, name: 'White Lily Vase Arrangement',     price: 649, originalPrice: 899,  discountPercent: 27, rating: 4.9, reviewCount: 309,  emoji: '🤍', bg: '#f5f5f5', tag: 'Premium',    delivery: '2–3 Days' },
      { id: 108, name: 'Mixed Wildflower Wreath',         price: 549, originalPrice: 799,  discountPercent: 31, rating: 4.7, reviewCount: 167,  emoji: '💐', bg: '#fff3e0', tag: null,         delivery: '2–3 Days' },
    ],
  },
};

export default function BestSellingPage({ title, wishlist, toggleWishlist, onAddToCart, onBack, onProductClick }) {
  const meta = SECTION_META[title] || SECTION_META['Best Selling Flowers & Gifts'];
  const [sort, setSort]         = useState('popular');
  const [activeTag, setActiveTag] = useState('All');
  const [toast, setToast]       = useState('');

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setToast(`${product.name} added to cart!`);
  };

  const filtered = useMemo(() => {
    let list = activeTag !== 'All' ? meta.products.filter(p => p.tag === activeTag) : meta.products;
    switch (sort) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].sort((a, b) => b.id - a.id);
      default:           return [...list].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
  }, [sort, activeTag, meta.products]);

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">Home</button>
        <span>/</span>
        <span className="text-gray-800 font-semibold">{title}</span>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-r ${meta.gradient} rounded-2xl px-10 py-10 flex items-center justify-between mb-8 overflow-hidden relative`}>
        <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10" style={{ background: meta.accent, transform: 'translate(30%,-30%)' }} />
        <div className="z-10">
          <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: meta.accent }}>
            Free Delivery on orders above ₹999
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">{title}</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-md">{meta.desc}</p>
          <div className="flex items-center gap-6 mt-5">
            {[['🚚', 'Same Day Delivery'], ['✅', '100% Fresh'], ['↩️', 'Easy Returns']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="text-[120px] leading-none drop-shadow-lg z-10 select-none hidden sm:block">{meta.emoji}</span>
      </div>

      {/* Filters */}
      <ProductFilters
        sort={sort} setSort={setSort}
        activeTag={activeTag} setActiveTag={setActiveTag}
        total={filtered.length} accent={meta.accent}
      />

      {/* Grid */}
      <ProductGrid
        products={filtered}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onProductClick={(p) => onProductClick?.(p, filtered)}
      />

      <ProductToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
