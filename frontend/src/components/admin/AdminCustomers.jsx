import { useState } from 'react';

const CUSTOMERS = [
  { id: 'C001', name: 'Priya Sharma',  mobile: '9876543210', email: 'priya@gmail.com',   orders: 5, spent: '₹4,210', joined: '10 Jan 2025', status: 'Active' },
  { id: 'C002', name: 'Rahul Mehta',   mobile: '9123456780', email: 'rahul@gmail.com',   orders: 2, spent: '₹898',   joined: '15 Feb 2025', status: 'Active' },
  { id: 'C003', name: 'Anita Verma',   mobile: '9988776655', email: 'anita@gmail.com',   orders: 3, spent: '₹2,247', joined: '02 Mar 2025', status: 'Active' },
  { id: 'C004', name: 'Suresh Kumar',  mobile: '9001122334', email: 'suresh@gmail.com',  orders: 8, spent: '₹7,192', joined: '20 Dec 2024', status: 'Active' },
  { id: 'C005', name: 'Meena Pillai',  mobile: '9445566778', email: 'meena@gmail.com',   orders: 1, spent: '₹349',   joined: '05 Apr 2025', status: 'Inactive' },
  { id: 'C006', name: 'Kiran Nair',    mobile: '9334455667', email: 'kiran@gmail.com',   orders: 4, spent: '₹3,196', joined: '18 Mar 2025', status: 'Active' },
  { id: 'C007', name: 'Deepa Iyer',    mobile: '9667788990', email: 'deepa@gmail.com',   orders: 6, spent: '₹5,400', joined: '01 Nov 2024', status: 'Active' },
  { id: 'C008', name: 'Arjun Reddy',   mobile: '9112233445', email: 'arjun@gmail.com',   orders: 0, spent: '₹0',     joined: '30 Jun 2025', status: 'Inactive' },
];

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: CUSTOMERS.length,                                    icon: '👥', color: 'from-violet-400 to-purple-500' },
            { label: 'Active',          value: CUSTOMERS.filter(c => c.status === 'Active').length,  icon: '✅', color: 'from-emerald-400 to-teal-500' },
            { label: 'Inactive',        value: CUSTOMERS.filter(c => c.status === 'Inactive').length,icon: '💤', color: 'from-gray-400 to-slate-500' },
            { label: 'Total Spent',     value: '₹23,492',                                            icon: '💰', color: 'from-amber-400 to-orange-500' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md mb-4`}>{icon}</div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Customers</h3>
              <p className="text-xs text-gray-400 mt-0.5">{filtered.length} results</p>
            </div>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, mobile, email…"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 w-64 transition-all"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  {['ID', 'Name', 'Mobile', 'Email', 'Orders', 'Total Spent', 'Joined', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold">{c.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a6b8a]/20 to-teal-100 flex items-center justify-center text-xs font-bold text-[#1a6b8a]">
                          {c.name[0]}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.mobile}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.email}</td>
                    <td className="px-5 py-3.5 text-center text-gray-600 font-medium">{c.orders}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{c.spent}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{c.joined}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1a6b8a] px-6 py-4 flex items-center justify-between">
              <p className="text-white font-bold">Customer Details</p>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors">×</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6b8a] to-teal-400 flex items-center justify-center text-xl font-bold text-white">{selected.name[0]}</div>
                <div>
                  <p className="font-bold text-gray-800">{selected.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${selected.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{selected.status}</span>
                </div>
              </div>
              {[['Customer ID', selected.id], ['Mobile', selected.mobile], ['Email', selected.email], ['Total Orders', selected.orders], ['Total Spent', selected.spent], ['Joined', selected.joined]].map(([l, v]) => (
                <div key={l} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-xs text-gray-400">{l}</span>
                  <span className="text-sm font-medium text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
