import { useState } from 'react';
import Navbar from './components/Navbar';
import NavLinks from './components/NavLinks';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  const [page, setPage] = useState('home'); // 'home' | 'auth'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSignIn={() => setPage('auth')} />
      <NavLinks />

      {page === 'home' && (
        <main className="max-w-[1300px] mx-auto px-6 py-8">
          <div className="flex flex-col gap-10">
            <HomePage />
          </div>
        </main>
      )}

      {page === 'auth' && (
        <AuthPage onAuthDone={() => setPage('home')} />
      )}

      <Footer />
    </div>
  );
}

export default App;
