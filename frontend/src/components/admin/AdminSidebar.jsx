const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'orders',    icon: '📦', label: 'Orders' },
  { key: 'products',  icon: '🌸', label: 'Products' },
  { key: 'customers', icon: '👥', label: 'Customers' },
  { key: 'profile',   icon: '👤', label: 'My Profile' },
];

export default function AdminSidebar({ active, onNav, onSignOut }) {
  return (
    <aside className="w-64 h-full bg-gradient-to-b from-[#0f2942] to-[#1a4a6b] flex flex-col shadow-2xl overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl shadow-lg">🌺</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Brahmani</p>
            <p className="text-blue-300 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ key, icon, label }) => (
          <button key={key} onClick={() => onNav(key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active === key
                ? 'bg-white/15 text-white shadow-inner border border-white/10'
                : 'text-blue-200 hover:bg-white/8 hover:text-white'
            }`}>
            <span className="text-base">{icon}</span>
            {label}
            {active === key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-400" />}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-all">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
