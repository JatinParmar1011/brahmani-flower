import ProductCard from './ProductCard';

export default function ProductGrid({ products, wishlist, toggleWishlist, onAddToCart, onProductClick }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl mb-4">🔍</span>
        <p className="text-lg font-bold text-gray-700">No products found</p>
        <p className="text-sm text-gray-400 mt-1">Try a different filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-5">
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}
