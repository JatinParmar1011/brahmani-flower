import Navbar from './components/Navbar';
import NavLinks from './components/NavLinks';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NavLinks />
      <main className="max-w-[1300px] mx-auto px-6 py-8">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
