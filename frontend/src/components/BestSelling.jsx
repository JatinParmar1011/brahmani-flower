import { useState, useEffect } from 'react';
import { fetchProductsByCategoryName } from '../services/productService';
import { fetchCategories } from '../services/categoryService';
import { tagBadgeClass } from '../utils/tagColors';

// Category name as stored in DB under best_selling type
const CATEGORY_NAME = 'Best Selling Flowers';

export default function BestSelling({ wishlist = [], toggleWishlist, onViewAll, onProductClick }) {
  const [products, setProducts] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    fetchProductsByCategoryName(CATEGORY_NAME, 0, 8)
      .then(data => setProducts(data.content || []))
      .catch(() => setProducts([]));

    fetchCategories('best_selling')
      .then(cats => {
        const match = cats.find(c => c.categoryName === CATEGORY_NAME);
        setImageUrl(match?.imageUrl || null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Best Selling Flowers &amp; Gifts</h2>
          <p className="text-sm text-gray-400 mt-1">Surprise Your Loved Ones</p>
        </div>
        <button onClick={onViewAll} className="bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🌸</div>
          <p className="text-sm">No products yet in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} onClick={() => onProductClick?.(p)} className="border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all bg-white">
              <div className="relative h-48 bg-gray-100">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-base cursor-pointer shadow border-none hover:scale-110 transition-transform"
                >
                  {wishlist.includes(p.id) ? '❤️' : '🤍'}
                </button>
                {p.tag && (
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${tagBadgeClass(p.tag)}`}>{p.tag}</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 truncate mb-2">{p.name}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-900">₹ {p.price}</span>
                  {p.originalPrice > p.price && (
                    <>
                      <span className="text-xs text-gray-400 line-through">₹ {p.originalPrice}</span>
                      <span className="text-xs font-semibold text-red-500">{Math.round((1 - p.price / p.originalPrice) * 100)}% OFF</span>
                    </>
                  )}
                </div>
                {p.rating > 0 && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="bg-green-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">⭐ {p.rating}</span>
                    <span className="text-xs text-[#1a6b8a]">({p.reviewCount} Reviews)</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">Earliest Delivery : <strong className="text-gray-800">{p.delivery || 'Tomorrow'}</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
