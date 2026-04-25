import { useState, useRef, useEffect } from 'react';

// Get initials from full name — first letter of first + last word
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// User menu items
const MENU_ITEMS = [
  { icon: '👤', label: 'Profile',       key: 'profile' },
  { icon: '📋', label: 'Order History', key: 'orders' },
  { icon: '📍', label: 'Address Book',  key: 'address' },
  { icon: '🚚', label: 'Track Order',   key: 'track' },
];

// More menu sections
const MORE_SECTIONS = [
  {
    title: 'Help & Support',
    items: [
      { icon: '❓', label: 'FAQ',        sub: 'Frequently asked questions', key: 'faq' },
      { icon: '📞', label: 'Contact Us', sub: "We're here to help",         key: 'contact' },
    ],
  },
  {
    title: 'Company',
    items: [
      { icon: '🌸', label: 'About Us', sub: 'Our story & mission',          key: 'about' },
      { icon: '🖼️', label: 'Gallery',  sub: 'Our floral creations',         key: 'gallery' },
    ],
  },
  {
    title: 'Policies',
    items: [
      { icon: '🔒', label: 'Privacy Policy',  sub: 'How we protect your data', key: 'privacy' },
      { icon: '📄', label: 'Terms of Service', sub: 'Our terms & conditions',   key: 'terms' },
    ],
  },
];

// Reusable hook: close on outside click
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
}

export default function Navbar({ onSignIn, user, onSignOut, onMenuClick, onMoreClick }) {
  const [search, setSearch]     = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef(null);
  const moreRef = useRef(null);

  useOutsideClick(menuRef, () => setMenuOpen(false));
  useOutsideClick(moreRef, () => setMoreOpen(false));

  const initials    = user ? getInitials(user.name) : '';
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || (user?.mobile ? `+91 ${user.mobile}` : '');

  const anyOpen = menuOpen || moreOpen;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {anyOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => { setMenuOpen(false); setMoreOpen(false); }} />}

      <div className="max-w-[1300px] mx-auto flex items-center gap-4 px-6 py-3">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
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
        <div className="flex items-center gap-5 flex-shrink-0">

          {/* Track Order */}
          <div className="flex flex-col items-center text-xs text-gray-600 cursor-pointer gap-0.5 hover:text-[#1a6b8a] transition-colors">
            <span className="text-xl">🗺️</span>
            <span>Track Order</span>
          </div>

          {/* Cart */}
          <div className="flex flex-col items-center text-xs text-gray-600 cursor-pointer relative gap-0.5 hover:text-[#1a6b8a] transition-colors">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-1 -right-2.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
            <span>Cart</span>
          </div>

          {/* INR */}
          <div className="flex flex-col items-center text-xs text-gray-600 cursor-pointer gap-0.5 hover:text-[#1a6b8a] transition-colors">
            <span className="text-xl">₹</span>
            <span>INR</span>
          </div>

          {/* Sign In / User Avatar */}
          {!user ? (
            <div onClick={onSignIn} className="flex flex-col items-center text-xs text-gray-600 cursor-pointer gap-0.5 hover:text-[#1a6b8a] transition-colors">
              <span className="text-xl">👤</span>
              <span>Sign In</span>
            </div>
          ) : (
            <div className="relative z-[60]" ref={menuRef}>
              <button onClick={() => { setMenuOpen(o => !o); setMoreOpen(false); }}
                className="flex flex-col items-center gap-0.5 cursor-pointer group">
                <div className="w-9 h-9 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:bg-[#155a75] transition-colors ring-2 ring-[#1a6b8a]/20">
                  {initials}
                </div>
                <span className="text-[11px] text-gray-600 group-hover:text-[#1a6b8a] transition-colors max-w-[60px] truncate">
                  {displayName.split(' ')[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />
                  <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#1a6b8a]/5 to-[#1a6b8a]/10 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    {MENU_ITEMS.map(item => (
                      <button key={item.key} onClick={() => { setMenuOpen(false); onMenuClick?.(item.key); }}
                        className="w-full flex items-center gap-3.5 px-5 py-3 text-sm text-gray-700 hover:bg-[#1a6b8a]/5 hover:text-[#1a6b8a] transition-colors group">
                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#1a6b8a]/10 flex items-center justify-center text-base transition-colors flex-shrink-0">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                        <span className="ml-auto text-gray-300 group-hover:text-[#1a6b8a] text-xs">›</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-5 border-t border-gray-100" />
                  <div className="py-2">
                    <button onClick={() => { setMenuOpen(false); onSignOut(); }}
                      className="w-full flex items-center gap-3.5 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors group">
                      <span className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-base transition-colors flex-shrink-0">🔴</span>
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── More ── */}
          <div className="relative z-[60]" ref={moreRef}>
            <button
              onClick={() => { setMoreOpen(o => !o); setMenuOpen(false); }}
              className={`flex flex-col items-center gap-0.5 cursor-pointer group transition-colors ${
                moreOpen ? 'text-[#1a6b8a]' : 'text-gray-600 hover:text-[#1a6b8a]'
              }`}
            >
              <span className="text-xl">☰</span>
              <span className="text-xs">More</span>
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                {/* Arrow */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-[#1a6b8a]/5 to-[#1a6b8a]/10 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1a6b8a] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-base">🌸</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Bramhani Flower</p>
                      <p className="text-[11px] text-gray-500">Delivering happiness since 2020</p>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="py-2 max-h-[420px] overflow-y-auto">
                  {MORE_SECTIONS.map((section, si) => (
                    <div key={section.title}>
                      {si !== 0 && <div className="mx-5 border-t border-gray-100 my-1" />}
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 pt-2 pb-1">
                        {section.title}
                      </p>
                      {section.items.map(item => (
                        <button
                          key={item.key}
                          onClick={() => { setMoreOpen(false); onMoreClick?.(item.key); }}
                          className="w-full flex items-center gap-3.5 px-5 py-2.5 hover:bg-[#1a6b8a]/5 hover:text-[#1a6b8a] transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#1a6b8a]/10 flex items-center justify-center text-base transition-colors flex-shrink-0">
                            {item.icon}
                          </span>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-[#1a6b8a] transition-colors">{item.label}</p>
                            <p className="text-[11px] text-gray-400 truncate">{item.sub}</p>
                          </div>
                          <span className="ml-auto text-gray-300 group-hover:text-[#1a6b8a] text-xs flex-shrink-0">›</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                  <p className="text-[11px] text-gray-400">© 2025 Bramhani Flower</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
