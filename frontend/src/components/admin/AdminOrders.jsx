import { useState, useEffect, useCallback } from 'react';
import { fetchAllOrders } from '../../services/orderService';
import OrderDetailPanel from './OrderDetailPanel';

const STATUS_STYLE = {
  CONFIRMED:       'bg-blue-100 text-blue-700',
  PROCESSING:      'bg-indigo-100 text-indigo-700',
  SHIPPED:         'bg-cyan-100 text-cyan-700',
  DELIVERED:       'bg-emerald-100 text-emerald-700',
  CANCELLED:       'bg-red-100 text-red-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
};

const FILTERS = ['All', 'PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function AdminOrders() {
  const [view,       setView]       = useState('list');
  const [selected,   setSelected]   = useState(null); // order id
  const [filter,     setFilter]     = useState('All');
  const [orders,     setOrders]     = useState([]);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');

  const load = useCallback((p = 0, f = filter) => {
    setLoading(true);
    fetchAllOrders(p, 20, f)
      .then(data => {
        setOrders(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setTotal(data.totalElements ?? 0);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]); // eslint-disable-line

  useEffect(() => { load(0, filter); }, [filter]); // eslint-disable-line

  const handleStatusChanged = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, status: updated.status } : o));
  };

  const count = (s) => s === 'All' ? total : orders.filter(o => o.status === s).length;

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.userName?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  // ── Detail view ────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <OrderDetailPanel
        orderId={selected}
        onBack={() => { setSelected(null); setView('list'); }}
        onStatusChanged={handleStatusChanged}
      />
    );
  }

  // ── List view ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'PENDING_PAYMENT', color: 'from-amber-400 to-orange-400',  icon: '⏳', display: 'Pending'   },
          { label: 'CONFIRMED',       color: 'from-blue-400 to-indigo-400',   icon: '✅', display: 'Confirmed' },
          { label: 'SHIPPED',         color: 'from-cyan-400 to-teal-400',     icon: '🚚', display: 'Shipped'   },
          { label: 'DELIVERED',       color: 'from-emerald-400 to-teal-400',  icon: '📦', display: 'Delivered' },
        ].map(({ label, color, icon, display }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md mb-4`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{count(label)}</p>
            <p className="text-sm text-gray-400 mt-0.5">{display}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">All Orders</h3>
              <p className="text-xs text-gray-400 mt-0.5">{total} total orders</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search order / customer…"
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 w-52 transition-all" />
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      filter === f
                        ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]'
                        : 'border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a]'
                    }`}>
                    {f === 'All' ? 'All' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-400 text-sm">
              <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
              Loading orders…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  {['Order #', 'Customer', 'Mobile', 'City', 'Items', 'Total', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-300 text-sm">
                      No orders found
                    </td>
                  </tr>
                ) : filtered.map(o => (
                  <tr key={o.id}
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => { setSelected(o.id); setView('detail'); }}>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold">{o.orderNumber}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">{o.userName}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{o.address?.mobileNumber ? `+91 ${o.address.mobileNumber}` : '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{o.address?.city || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{o.items?.length} item(s)</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">₹{o.totalAmount}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setSelected(o.id); setView('detail'); }}
                        className="text-xs text-[#1a6b8a] hover:underline font-medium">
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
