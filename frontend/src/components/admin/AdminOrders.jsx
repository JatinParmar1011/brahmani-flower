import { useState, useEffect, useCallback } from 'react';
import { fetchAllOrders } from '../../services/orderService';
import OrderDetailPanel from './OrderDetailPanel';

const STATUS_STYLE = {
  CONFIRMED:        'bg-blue-100 text-blue-700',
  PROCESSING:       'bg-indigo-100 text-indigo-700',
  SHIPPED:          'bg-cyan-100 text-cyan-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED:        'bg-emerald-100 text-emerald-700',
  CANCELLED:        'bg-red-100 text-red-700',
  PENDING_PAYMENT:  'bg-amber-100 text-amber-700',
};

const FILTERS = ['All', 'PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

// All order statuses with card display metadata (one card per status).
const STATUS_CARDS = [
  { label: 'PENDING_PAYMENT',  color: 'from-amber-400 to-orange-400',   icon: '⏳', display: 'Pending'          },
  { label: 'CONFIRMED',        color: 'from-blue-400 to-indigo-400',    icon: '✅', display: 'Confirmed'        },
  { label: 'PROCESSING',       color: 'from-indigo-400 to-violet-400',  icon: '⚙️', display: 'Processing'       },
  { label: 'SHIPPED',          color: 'from-cyan-400 to-teal-400',      icon: '🚚', display: 'Shipped'          },
  { label: 'OUT_FOR_DELIVERY', color: 'from-purple-400 to-fuchsia-400', icon: '🛵', display: 'Out for Delivery' },
  { label: 'DELIVERED',        color: 'from-emerald-400 to-teal-400',   icon: '📦', display: 'Delivered'        },
  { label: 'CANCELLED',        color: 'from-red-400 to-rose-500',       icon: '❌', display: 'Cancelled'        },
];

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
  const [searchKey,  setSearchKey]  = useState('order'); // 'order' | 'customer' | 'city'
  // Stable per-status counts for the summary cards — loaded unfiltered so they
  // do NOT change when the status filter is applied.
  const [statusCounts, setStatusCounts] = useState({}); // { STATUS: n }
  const [grandTotal,   setGrandTotal]   = useState(0);

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

  // Load per-status counts once (unfiltered), so cards stay stable regardless of filter.
  const loadCounts = useCallback(() => {
    fetchAllOrders(0, 1000, 'All')
      .then(data => {
        const all = data.content ?? [];
        const counts = all.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts(counts);
        setGrandTotal(data.totalElements ?? all.length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const handleStatusChanged = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, status: updated.status } : o));
    // A status change affects the stable counts — refresh them.
    loadCounts();
  };

  const count = (s) => s === 'All' ? grandTotal : (statusCounts[s] || 0);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o => {
      if (searchKey === 'order')    return o.orderNumber?.toLowerCase().includes(q);
      if (searchKey === 'customer') return o.userName?.toLowerCase().includes(q);
      if (searchKey === 'city')     return (o.address?.city || '').toLowerCase().includes(q);
      return true;
    });
  })();

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

      {/* Stat cards — one per status */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
        {STATUS_CARDS.map(({ label, color, icon, display }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg shadow-md mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{count(label)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{display}</p>
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
              {/* Filter 1 — field selector + value */}
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <select value={searchKey} onChange={e => { setSearchKey(e.target.value); setSearch(''); }}
                  className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2 outline-none cursor-pointer">
                  <option value="order">Order #</option>
                  <option value="customer">Customer</option>
                  <option value="city">City</option>
                </select>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search by ${searchKey === 'order' ? 'order #' : searchKey}…`}
                  className="px-3 py-2 text-sm outline-none w-52 bg-white" />
              </div>

              {/* Filter 2 — Status: fixed label + all-status dropdown */}
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2">Status</span>
                <select value={filter} onChange={e => setFilter(e.target.value)}
                  className="px-3 py-2 text-sm outline-none bg-white cursor-pointer">
                  {FILTERS.map(f => (
                    <option key={f} value={f}>{f === 'All' ? 'All Status' : f.replaceAll('_', ' ')}</option>
                  ))}
                </select>
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
                    <td colSpan={9} className="px-5 py-12 text-center text-gray-300 text-sm">
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
                        {o.status?.replaceAll('_', ' ')}
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
