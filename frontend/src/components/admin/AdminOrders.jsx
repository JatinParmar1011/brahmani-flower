import { useState } from 'react';

const ORDERS = [
  { id: '#ORD-1021', customer: 'Priya Sharma',  mobile: '9876543210', item: 'Red Rose Bouquet',    qty: 2, amount: '₹1,198', date: '12 Jul 2025', status: 'Delivered' },
  { id: '#ORD-1020', customer: 'Rahul Mehta',   mobile: '9123456780', item: 'Sunflower Delight',   qty: 1, amount: '₹449',   date: '11 Jul 2025', status: 'Pending' },
  { id: '#ORD-1019', customer: 'Anita Verma',   mobile: '9988776655', item: 'Lavender Dreams',     qty: 1, amount: '₹749',   date: '10 Jul 2025', status: 'Shipped' },
  { id: '#ORD-1018', customer: 'Suresh Kumar',  mobile: '9001122334', item: 'Mixed Seasonal Pack', qty: 3, amount: '₹2,697', date: '09 Jul 2025', status: 'Delivered' },
  { id: '#ORD-1017', customer: 'Meena Pillai',  mobile: '9445566778', item: 'White Lily Bunch',    qty: 1, amount: '₹349',   date: '08 Jul 2025', status: 'Cancelled' },
  { id: '#ORD-1016', customer: 'Kiran Nair',    mobile: '9334455667', item: 'Orchid Elegance',     qty: 2, amount: '₹1,598', date: '07 Jul 2025', status: 'Shipped' },
];

const STATUS_STYLE = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Pending:   'bg-amber-100 text-amber-700',
  Shipped:   'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS = {
  Pending:   'Shipped',
  Shipped:   'Delivered',
  Delivered: null,
  Cancelled: null,
};

const FILTERS = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

// ── Order Detail Modal ─────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }) {
  if (!order) return null;
  const next = NEXT_STATUS[order.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f2942] to-[#1a6b8a] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">{order.id}</p>
            <p className="text-blue-200 text-xs mt-0.5">{order.date}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Current Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="border-t border-gray-100" />

          {/* Details */}
          {[
            { label: 'Customer',  value: order.customer },
            { label: 'Mobile',    value: order.mobile },
            { label: 'Item',      value: order.item },
            { label: 'Quantity',  value: order.qty },
            { label: 'Amount',    value: order.amount },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-700">{value}</span>
            </div>
          ))}

          <div className="border-t border-gray-100" />

          {/* Actions */}
          <div className="space-y-2 pt-1">
            {next && (
              <button
                onClick={() => { onStatusChange(order.id, next); onClose(); }}
                className="w-full py-2.5 rounded-xl bg-[#1a6b8a] hover:bg-[#155a75] text-white text-sm font-semibold transition-colors shadow-sm">
                Mark as {next}
              </button>
            )}
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button
                onClick={() => { onStatusChange(order.id, 'Cancelled'); onClose(); }}
                className="w-full py-2.5 rounded-xl border-2 border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
                Cancel Order
              </button>
            )}
            {(order.status === 'Delivered' || order.status === 'Cancelled') && (
              <p className="text-center text-xs text-gray-400 py-1">No further actions available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [filter, setFilter]     = useState('All');
  const [orders, setOrders]     = useState(ORDERS);
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const count = (s) => orders.filter(o => o.status === s).length;

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending',   color: 'from-amber-400 to-orange-400',  icon: '⏳', text: 'text-amber-600' },
          { label: 'Shipped',   color: 'from-blue-400 to-indigo-400',   icon: '🚚', text: 'text-blue-600' },
          { label: 'Delivered', color: 'from-emerald-400 to-teal-400',  icon: '✅', text: 'text-emerald-600' },
          { label: 'Cancelled', color: 'from-red-400 to-rose-400',      icon: '❌', text: 'text-red-500' },
        ].map(({ label, color, icon, text }) => (
          <div key={label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md mb-4`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{count(label)}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">All Orders</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {orders.length} orders</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  filter === f
                    ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]'
                    : 'border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a]'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                {['Order ID', 'Customer', 'Mobile', 'Item', 'Qty', 'Amount', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-300 text-sm">
                    No {filter} orders found
                  </td>
                </tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold">{o.id}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">{o.customer}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{o.mobile}</td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{o.item}</td>
                  <td className="px-5 py-3.5 text-center text-gray-600">{o.qty}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{o.amount}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{o.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(o)}
                      className="text-xs text-[#1a6b8a] hover:underline font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal
        order={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
