import { useState, useEffect } from 'react';
import { fetchAllOrders, fetchRecentOrders } from '../../services/orderService';
import { fetchProducts } from '../../services/productService';
import { getAuthHeader } from '../../services/authService';

const BASE_URL = 'http://localhost:8080/api';

const STATUS_STYLE = {
  CONFIRMED:       'bg-blue-100 text-blue-700',
  PROCESSING:      'bg-indigo-100 text-indigo-700',
  SHIPPED:         'bg-cyan-100 text-cyan-700',
  DELIVERED:       'bg-emerald-100 text-emerald-700',
  CANCELLED:       'bg-red-100 text-red-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
};

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const fmtCurrency = (n) =>
  Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function StatCard({ icon, color, value, label, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md mb-4`}>
        {icon}
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminStats({ onViewAllOrders }) {
  const [stats,         setStats]         = useState(null);
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersPage, productsPage, customersRes, recentPage] = await Promise.allSettled([
          fetchAllOrders(0, 1),
          fetchProducts(0, 1),
          fetch(`${BASE_URL}/admin/customers`, { headers: getAuthHeader() }).then(r => r.json()),
          fetchRecentOrders(5),
        ]);

        const totalOrders    = ordersPage.status    === 'fulfilled' ? (ordersPage.value?.totalElements    ?? 0) : 0;
        const totalProducts  = productsPage.status  === 'fulfilled' ? (productsPage.value?.totalElements  ?? 0) : 0;
        const totalCustomers = customersRes.status  === 'fulfilled' ? (customersRes.value?.data?.length   ?? 0) : 0;

        // Fetch all orders (up to 200) to compute revenue + status breakdown
        const allOrdersPage = await fetchAllOrders(0, 200).catch(() => ({ content: [] }));
        const allOrders = allOrdersPage.content ?? [];

        const totalRevenue = allOrders
          .filter(o => o.status !== 'CANCELLED')
          .reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);

        setStats({ totalOrders, totalProducts, totalCustomers, totalRevenue });
        const recent = recentPage.status === 'fulfilled' ? (recentPage.value?.content ?? []) : [];
        // Sort descending by createdAt — newest first
        recent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(recent);
      } catch {
        // silently fail — show zeros
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const s = stats;

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon="💰" color="from-emerald-400 to-teal-500"
          value={s ? `₹${fmtCurrency(s.totalRevenue)}` : '—'}
          label="Total Revenue" loading={loading} />
        <StatCard icon="📦" color="from-blue-400 to-indigo-500"
          value={s ? s.totalOrders.toLocaleString('en-IN') : '—'}
          label="Total Orders" loading={loading} />
        <StatCard icon="🌸" color="from-pink-400 to-rose-500"
          value={s ? s.totalProducts.toLocaleString('en-IN') : '—'}
          label="Total Products" loading={loading} />
        <StatCard icon="👥" color="from-violet-400 to-purple-500"
          value={s ? s.totalCustomers.toLocaleString('en-IN') : '—'}
          label="Customers" loading={loading} />
      </div>

      {/* ── Recent orders ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest {recentOrders.length} orders</p>
          </div>
          <button onClick={onViewAllOrders}
            className="text-xs text-[#1a6b8a] font-semibold hover:underline">
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-gray-400 text-sm">
              <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
              Loading…
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  {['Order #', 'Customer', 'Mobile', 'City', 'Items', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold">{o.orderNumber}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a6b8a]/20 to-teal-100 flex items-center justify-center text-xs font-bold text-[#1a6b8a] flex-shrink-0">
                          {(o.userName || '?')[0].toUpperCase()}
                        </div>
                        {o.userName}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs whitespace-nowrap">{o.address?.mobileNumber ? `+91 ${o.address.mobileNumber}` : '—'}</td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs whitespace-nowrap">{o.address?.city || '—'}</td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs">{o.items?.length} item(s)</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-800">₹{fmtCurrency(o.totalAmount)}</td>
                    <td className="px-6 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
