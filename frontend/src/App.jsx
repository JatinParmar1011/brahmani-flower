import { useState } from 'react';
import Navbar from './components/Navbar';
import NavLinks from './components/NavLinks';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import MorePage from './pages/MorePage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ProductPage from './pages/ProductPage';
import './App.css';

const INITIAL_CART = [
  { id: 1, name: 'Red Rose Bouquet',  category: 'Bouquets',  originalPrice: 799, price: 599, qty: 2, emoji: '🌹', tag: 'Bestseller' },
  { id: 2, name: 'Sunflower Delight', category: 'Seasonal',  originalPrice: 599, price: 449, qty: 1, emoji: '🌻', tag: 'Fresh' },
  { id: 3, name: 'Lavender Dreams',   category: 'Aromatics', originalPrice: 999, price: 749, qty: 1, emoji: '💜', tag: 'Premium' },
];

function App() {
  const [page, setPage]               = useState('home');
  const [user, setUser]               = useState(null);
  const [dashTab, setDashTab]         = useState('profile');
  const [morePage, setMorePage]       = useState(null);
  const [cartItems, setCartItems]     = useState(INITIAL_CART);
  const [wishlist, setWishlist]       = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const toggleWishlist = (id) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, originalPrice: product.original, qty: 1 }];
    });
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setPage('product');
  };

  const handleAuthDone = (userData) => {
    if (userData) setUser(userData);
    setPage('home');
  };

  const handleMenuClick = (tab) => { setDashTab(tab); setPage('dashboard'); };
  const handleSignOut   = () => { setUser(null); setPage('home'); };
  const handleMoreClick = (key) => { setMorePage(key); setPage('more'); };

  const goHome = () => { setPage('home'); setActiveCategory(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onSignIn={() => setPage('auth')}
        user={user}
        onSignOut={handleSignOut}
        onMenuClick={handleMenuClick}
        onMoreClick={handleMoreClick}
        onCartClick={() => setPage('cart')}
        cartCount={cartCount}
        onWishlistClick={() => setPage('wishlist')}
        wishlistCount={wishlist.length}
        onHome={goHome}
      />
      <NavLinks onCategoryClick={handleCategoryClick} activeCategory={activeCategory} />

      {page === 'home' && (
        <main className="max-w-[1300px] mx-auto px-6 py-8">
          <div className="flex flex-col gap-10">
            <HomePage wishlist={wishlist} toggleWishlist={toggleWishlist} />
          </div>
        </main>
      )}

      {page === 'product' && (
        <ProductPage
          category={activeCategory}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onBack={goHome}
        />
      )}

      {page === 'auth' && <AuthPage onAuthDone={handleAuthDone} />}

      {page === 'dashboard' && (
        <UserDashboard user={user} initialTab={dashTab} onSignOut={handleSignOut} />
      )}

      {page === 'more' && (
        <MorePage pageKey={morePage} onBack={goHome} />
      )}

      {page === 'cart' && (
        <CartPage
          key="cart"
          cartItems={cartItems}
          setCartItems={setCartItems}
          onBack={goHome}
        />
      )}

      {page === 'wishlist' && (
        <WishlistPage
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onBack={goHome}
          onGoToCart={() => setPage('cart')}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
