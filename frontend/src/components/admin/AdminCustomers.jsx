import { useState, useEffect } from 'react';
import { getAuthHeader } from '../../services/authService';
import CustomerDetail from './CustomerDetail';

const BASE_URL = 'http://localhost:8080/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchKey, setSearchKey] = useState('name');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/customers`, { headers: getAuthHeader() })
      .then(r => r.json())
      .then(d => { if (d.success) setCustomers(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (selected) return <CustomerDetail customer={selected} onBack={() => setSelected(null)} />;

  const filtered = customers.filter(c => {
    if (!search.trim()) return true;
    const val = search.trim().toLowerCase();
    if (searchKey === 'id')     return String(c.id).includes(val);
    if (searchKey === 'name')   return (c.name   || '').toLowerCase().includes(val);
    if (searchKey === 'mobile') return (c.mobile || '').includes(search.trim());
    if (searchKey === 'email')  return (c.email  || '').toLowerCase().includes(val);
    return true;
  });

  const active   = customers.filter(c => c.status === 'ACTIVE').length;
  const inactive = customers.filter(c => c.status !== 'ACTIVE').length;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: '👥', color: 'from-violet-400 to-purple-500' },
          { label: 'Active',          value: active,           icon: '✅', color: 'from-emerald-400 to-teal-500' },
          { label: 'Inactive',        value: inactive,         icon: '💤', color: 'from-gray-400 to-slate-500' },
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
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
            <select
              value={searchKey}
              onChange={e => { setSearchKey(e.target.value); setSearch(''); }}
              className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2 outline-none cursor-pointer"
            >
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="mobile">Mobile</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search by ${searchKey}…`}
              className="px-3 py-2 text-sm outline-none w-52 bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  {['ID', 'Name', 'Gender', 'Date of Birth', 'Mobile', 'Email', 'Orders', 'Total Spent', 'Joined', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => setSelected(c)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold">#{c.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a6b8a]/20 to-teal-100 flex items-center justify-center text-xs font-bold text-[#1a6b8a]">
                          {(c.name || '?')[0].toUpperCase()}
                        </div>
                        {c.name || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs capitalize">{c.gender || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{c.dateOfBirth || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.mobile || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.email || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.orders > 0 ? c.orders : '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.orders > 0 ? c.totalSpent : '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{c.joined || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-sm text-gray-400 py-10">No customers found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
