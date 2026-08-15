import { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStats from '../components/admin/AdminStats';
import AdminOrders from '../components/admin/AdminOrders';
import AdminProducts from '../components/admin/AdminProducts';
import AdminProfile from '../components/admin/AdminProfile';
import AdminCustomers from '../components/admin/AdminCustomers';

const PAGE_TITLE = {
  dashboard: { title: 'Dashboard Overview',  sub: 'Welcome back, Admin 👋' },
  orders:    { title: 'Orders Management',   sub: 'Track and manage all orders' },
  products:  { title: 'Products',            sub: 'Manage your flower inventory' },
  customers: { title: 'Customers',           sub: 'View registered customers' },
  profile:   { title: 'My Profile',          sub: 'Manage your admin account' },
};

export default function AdminDashboard({ onSignOut }) {
  const [tab, setTab] = useState('dashboard');
  const { title, sub } = PAGE_TITLE[tab] || PAGE_TITLE.dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — fixed height, no scroll */}
      <div className="flex-shrink-0 h-screen sticky top-0">
        <AdminSidebar active={tab} onNav={setTab} onSignOut={onSignOut} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
          <button
            onClick={() => setTab('profile')}
            className="flex items-center gap-2.5 bg-gradient-to-r from-[#1a6b8a]/10 to-pink-50 border border-[#1a6b8a]/20 rounded-xl px-3 py-2 hover:border-[#1a6b8a]/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a6b8a] to-teal-500 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-700 leading-tight">Admin</p>
              <p className="text-[10px] text-gray-400">8888888888</p>
            </div>
          </button>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {tab === 'dashboard' && <AdminStats onViewAllOrders={() => setTab('orders')} />}
          {tab === 'orders'    && <AdminOrders />}
          {tab === 'products'  && <AdminProducts />}
          {tab === 'customers' && <AdminCustomers />}
          {tab === 'profile'   && <AdminProfile onSignOut={onSignOut} />}
        </main>
      </div>
    </div>
  );
}
