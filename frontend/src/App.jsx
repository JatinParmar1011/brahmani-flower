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
import ProductDetailPage from './pages/ProductDetailPage';
import CityPage from './pages/CityPage';
import BestSellingPage from './pages/BestSellingPage';
import CategoryItemPage from './pages/CategoryItemPage';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutPage from './pages/CheckoutPage';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user, login, logout } = useAuth();
  const { itemCount, addItem }  = useCart();

  const [page, setPage]               = useState('home');
  const [dashTab, setDashTab]         = useState('profile');
  const [morePage, setMorePage]       = useState(null);
  const [wishlist, setWishlist]       = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [bestSellingTitle, setBestSellingTitle] = useState(null);
  const [categoryItem, setCategoryItem]         = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(null);

  const toggleWishlist = (id) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddToCart = (product) => addItem(product);

  const handleProductClick = (product, categoryName) => {
    setSelectedProduct(product);
    if (categoryName) setActiveCategory(categoryName);
    setPage('detail');
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSelectedProduct(null);
    setPage('product');
  };

  const handleAuthDone = (userData) => {
    if (userData) login(userData);   // ← updates AuthContext → triggers CartContext merge
    const dest = redirectAfterAuth || 'home';
    setRedirectAfterAuth(null);
    setPage(dest);
  };

  const handleAdminLogin = () => setPage('admin');

  const handleMenuClick = (tab) => { setDashTab(tab); setPage('dashboard'); };

  const handleSignOut = async () => {
    await logout();                  // ← clears token + calls clearAuth() → triggers CartContext guest mode
    setPage('home');
  };

  const handleMoreClick = (key) => { setMorePage(key); setPage('more'); };

  const handleCityClick = () => { setSelectedProduct(null); setPage('city'); };
  const handleBestSellingClick = (title) => { setBestSellingTitle(title); setSelectedProduct(null); setPage('bestselling'); };
  const handleItemClick = (item) => { setCategoryItem(item); setSelectedProduct(null); setPage('categoryitem'); };

  const goHome = () => {
    setPage('home');
    setActiveCategory(null);
    setBestSellingTitle(null);
    setCategoryItem(null);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {page !== 'admin' && (
        <>
          <Navbar
            onSignIn={() => setPage('auth')}
            user={user}
            onSignOut={handleSignOut}
            onMenuClick={handleMenuClick}
            onMoreClick={handleMoreClick}
            onCartClick={() => setPage('cart')}
            cartCount={itemCount}
            onWishlistClick={() => setPage('wishlist')}
            wishlistCount={wishlist.length}
            onHome={goHome}
          />
          <NavLinks onCategoryClick={handleCategoryClick} activeCategory={activeCategory} />
        </>
      )}

      {page === 'home' && (
        <main className="max-w-[1300px] mx-auto px-6 py-8">
          <div className="flex flex-col gap-10">
            <HomePage
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              onSuratClick={handleCityClick}
              onBestSellingClick={handleBestSellingClick}
              onItemClick={handleItemClick}
              onProductClick={(p) => { setAllProducts([]); handleProductClick(p); }}
            />
          </div>
        </main>
      )}

      {page === 'product' && (
        <ProductPage
          key={activeCategory}
          category={activeCategory}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onBack={goHome}
          onCategoryClick={handleCategoryClick}
          onProductClick={(p, products) => { setAllProducts(products || []); handleProductClick(p); }}
        />
      )}

      {page === 'detail' && selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          categoryName={activeCategory}
          allProducts={allProducts}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onBack={goHome}
          onCategoryClick={handleCategoryClick}
          onSelectProduct={handleProductClick}
        />
      )}

      {page === 'categoryitem' && categoryItem && (
        <CategoryItemPage
          key={categoryItem.label}
          item={categoryItem}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onBack={goHome}
          onProductClick={(p, products) => { setAllProducts(products || []); handleProductClick(p); }}
        />
      )}

      {page === 'bestselling' && bestSellingTitle && (
        <BestSellingPage
          key={bestSellingTitle}
          title={bestSellingTitle}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onBack={goHome}
          onProductClick={(p, products) => { setAllProducts(products || []); handleProductClick(p); }}
        />
      )}

      {page === 'city' && (
        <CityPage
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onAddToCart={handleAddToCart}
          onBack={goHome}
          onProductClick={(p, products) => { setAllProducts(products || []); handleProductClick(p); }}
        />
      )}

      {page === 'auth' && (
        <AuthPage
          onAuthDone={handleAuthDone}
          onAdminLogin={handleAdminLogin}
          onMoreClick={handleMoreClick}
        />
      )}

      {page === 'admin' && <AdminDashboard onSignOut={() => setPage('home')} />}

      {page !== 'admin' && page === 'dashboard' && (
        <UserDashboard user={user} initialTab={dashTab} onSignOut={handleSignOut} />
      )}

      {page === 'more' && <MorePage pageKey={morePage} onBack={goHome} />}

      {page === 'cart' && (
        <CartPage
          key="cart"
          onBack={goHome}
          onViewOrders={() => { setDashTab('orders'); setPage('dashboard'); }}
          onSignIn={() => { setRedirectAfterAuth('checkout'); setPage('auth'); }}
          onCheckout={() => setPage('checkout')}
        />
      )}

      {page === 'checkout' && (
        <CheckoutPage
          onBack={() => setPage('cart')}
          onViewOrders={() => { setDashTab('orders'); setPage('dashboard'); }}
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

      {page !== 'admin' && <Footer />}
    </div>
  );
}

export default App;
