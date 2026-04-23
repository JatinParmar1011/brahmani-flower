import { useState } from 'react';

export default function Navbar() {
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1300px] mx-auto flex items-center gap-4 px-6 py-3">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4C14 4 10 8 10 12c0 3 2 5.5 5 7-3 1.5-5 4-5 7h16c0-3-2-5.5-5-7 3-1.5 5-4 5-7 0-4-4-8-8-8z" fill="#1a6b8a" opacity="0.8"/>
            <circle cx="18" cy="18" r="3" fill="#1a6b8a"/>
          </svg>
          <span className="text-lg font-bold text-[#1a6b8a] tracking-wide">BRAMHANI FLOWER</span>
        </div>

        {/* Delivery */}
        <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer flex-shrink-0 text-sm text-gray-700 hover:border-[#1a6b8a] transition-colors">
          <span className="text-lg">🇮🇳</span>
          <span>Deliver To ?</span>
          <span className="text-xs text-gray-400 ml-1">✏️</span>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search for flowers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-gray-700"
          />
          <button className="px-4 py-2.5 text-base bg-transparent border-none cursor-pointer hover:bg-gray-200 transition-colors">🔍</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {[
            { icon: '🗺️', label: 'Track Order' },
            { icon: '🛒', label: 'Cart', badge: '0' },
            { icon: '₹', label: 'INR' },
            { icon: '👤', label: 'Sign In' },
            { icon: '☰', label: 'More' },
          ].map(a => (
            <div key={a.label} className="flex flex-col items-center text-xs text-gray-600 cursor-pointer relative gap-0.5 hover:text-[#1a6b8a] transition-colors">
              <span className="text-xl">{a.icon}</span>
              {a.badge !== undefined && (
                <span className="absolute -top-1 -right-2.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {a.badge}
                </span>
              )}
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
