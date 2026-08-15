const STATS = [
  { label: 'Total Revenue',   value: '₹1,24,580', icon: '💰', color: 'from-emerald-400 to-teal-500' },
  { label: 'Total Orders',    value: '1,284',      icon: '📦', color: 'from-blue-400 to-indigo-500' },
  { label: 'Active Products', value: '342',        icon: '🌸', color: 'from-pink-400 to-rose-500' },
  { label: 'Customers',       value: '5,891',      icon: '👥', color: 'from-violet-400 to-purple-500' },
];

const RECENT = [
  { id: '#ORD-1021', customer: 'Priya Sharma',  item: 'Red Rose Bouquet',    amount: '₹599', status: 'Delivered', statusColor: 'bg-emerald-100 text-emerald-700' },
  { id: '#ORD-1020', customer: 'Rahul Mehta',   item: 'Sunflower Delight',   amount: '₹449', status: 'Pending',   statusColor: 'bg-amber-100 text-amber-700' },
  { id: '#ORD-1019', customer: 'Anita Verma',   item: 'Lavender Dreams',     amount: '₹749', status: 'Shipped',   statusColor: 'bg-blue-100 text-blue-700' },
  { id: '#ORD-1018', customer: 'Suresh Kumar',  item: 'Mixed Seasonal Pack', amount: '₹899', status: 'Delivered', statusColor: 'bg-emerald-100 text-emerald-700' },
  { id: '#ORD-1017', customer: 'Meena Pillai',  item: 'White Lily Bunch',    amount: '₹349', status: 'Cancelled', statusColor: 'bg-red-100 text-red-700' },
];

export default function AdminStats({ onViewAllOrders }) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md mb-4`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Orders</h3>
          <button onClick={onViewAllOrders} className="text-xs text-[#1a6b8a] font-semibold hover:underline">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Item</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold">{r.id}</td>
                  <td className="px-6 py-3.5 font-medium text-gray-700">{r.customer}</td>
                  <td className="px-6 py-3.5 text-gray-500">{r.item}</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-800">{r.amount}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.statusColor}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
