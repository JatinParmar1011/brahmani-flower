import { useState } from 'react';
import Navbar from './components/Navbar';
import NavLinks from './components/NavLinks';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import MorePage from './pages/MorePage';
import CartPage from './pages/CartPage';
import './App.css';

const INITIAL_CART = [
  { id: 1, name: 'Red Rose Bouquet',  category: 'Bouquets',  originalPrice: 799, price: 599, qty: 2, emoji: '🌹', tag: 'Bestseller' },
  { id: 2, name: 'Sunflower Delight', category: 'Seasonal',  originalPrice: 599, price: 449, qty: 1, emoji: '🌻', tag: 'Fresh' },
  { id: 3, name: 'Lavender Dreams',   category: 'Aromatics', originalPrice: 999, price: 749, qty: 1, emoji: '💜', tag: 'Premium' },
];

function App() {
  const [page, setPage]         = useState('home');
  const [user, setUser]         = useState(null);
  const [dashTab, setDashTab]   = useState('profile');
  const [morePage, setMorePage] = useState(null);
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleAuthDone = (userData) => {
    if (userData) setUser(userData);
    setPage('home');
  };

  const handleMenuClick = (tab) => {
    setDashTab(tab);
    setPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setPage('home');
  };

  const handleMoreClick = (key) => {
    setMorePage(key);
    setPage('more');
  };

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
        onHome={() => setPage('home')}
      />
      <NavLinks />

      {page === 'home' && (
        <main className="max-w-[1300px] mx-auto px-6 py-8">
          <div className="flex flex-col gap-10">
            <HomePage />
          </div>
        </main>
      )}

      {page === 'auth' && (
        <AuthPage onAuthDone={handleAuthDone} />
      )}

      {page === 'dashboard' && (
        <UserDashboard
          user={user}
          initialTab={dashTab}
          onSignOut={handleSignOut}
        />
      )}

      {page === 'more' && (
        <MorePage pageKey={morePage} onBack={() => setPage('home')} />
      )}

      {page === 'cart' && (
        <CartPage
          cartItems={cartItems}
          setCartItems={setCartItems}
          onBack={() => setPage('home')}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
