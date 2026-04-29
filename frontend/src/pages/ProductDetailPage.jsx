import { useMemo, useState } from 'react';
import { ALL_PRODUCTS } from '../data/productData';
import DetailImagePanel from '../components/product/DetailImagePanel';
import DetailInfo       from '../components/product/DetailInfo';
import DetailDelivery   from '../components/product/DetailDelivery';
import DetailContents   from '../components/product/DetailContents';
import DetailReviews    from '../components/product/DetailReviews';
import DetailSimilar    from '../components/product/DetailSimilar';
import ProductToast     from '../components/product/ProductToast';

export default function ProductDetailPage({ product, wishlist, toggleWishlist, onAddToCart, onBack, onCategoryClick, onSelectProduct }) {
  const [toast, setToast] = useState('');

  const handleAdd = (p) => {
    onAddToCart(p);
    setToast(`${p.name} added to cart!`);
  };

  const similar = useMemo(() =>
    ALL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8),
    [product]
  );

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">Home</button>
        <span>/</span>
        <button onClick={() => onCategoryClick(product.category)} className="hover:text-[#1a6b8a] transition-colors cursor-pointer font-medium">{product.category}</button>
        <span>/</span>
        <span className="text-gray-700 font-semibold truncate max-w-[240px]">{product.name}</span>
      </div>

      {/* ── Single box: image left + all details right ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-8">
        <div className="flex gap-6 items-start">

          {/* LEFT — sticky image panel */}
          <div className="flex-shrink-0 sticky top-[120px] p-6 border-r border-gray-100" style={{ width: 560 }}>
            <DetailImagePanel
              product={product}
              inWishlist={wishlist.includes(product.id)}
              onToggleWishlist={() => toggleWishlist(product.id)}
            />
          </div>

          {/* RIGHT — scrollable sections separated by dividers */}
          <div className="flex-1 min-w-0 divide-y divide-gray-100">

            <div className="p-6">
              <DetailInfo product={product} onAddToCart={handleAdd} />
            </div>

            <div className="p-6">
              <DetailDelivery delivery={product.delivery} />
            </div>

            <div className="p-6">
              <DetailContents category={product.category} productName={product.name} />
            </div>

            <div className="p-6">
              <DetailReviews rating={product.rating} reviews={product.reviews} />
            </div>

          </div>
        </div>
      </div>

      {/* ── You May Also Like — outside the box, full width ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <DetailSimilar
          products={similar}
          onSelect={onSelectProduct}
          onAddToCart={handleAdd}
        />
      </div>

      <ProductToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
