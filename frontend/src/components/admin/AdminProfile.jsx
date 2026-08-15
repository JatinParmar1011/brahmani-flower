import { useState } from 'react';

export default function AdminProfile({ onSignOut }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: 'Admin',
    email: 'admin@brahmaniflowers.com',
    mobile: '8888888888',
    role: 'Super Admin',
    store: 'Brahmani Flowers',
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#0f2942] via-[#1a4a6b] to-[#1a6b8a] relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Avatar sits inside the banner, bottom-aligned with padding */}
          <div className="absolute bottom-0 left-8 translate-y-1/2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a6b8a] to-teal-400 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white">
              A
            </div>
          </div>
        </div>

        <div className="px-8 pt-12 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{form.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gradient-to-r from-[#1a6b8a] to-teal-500 text-white px-2.5 py-0.5 rounded-full font-semibold">{form.role}</span>
                <span className="text-xs text-gray-400">• {form.store}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
                  ✅ Saved
                </span>
              )}
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)}
                    className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="text-xs px-4 py-2 rounded-lg bg-[#1a6b8a] text-white font-semibold hover:bg-[#155a75] transition-colors shadow-sm">
                    Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="text-xs px-4 py-2 rounded-lg border border-[#1a6b8a] text-[#1a6b8a] font-semibold hover:bg-[#1a6b8a]/5 transition-colors">
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information — full width */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-5">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name',     key: 'name',   type: 'text' },
            { label: 'Email Address', key: 'email',  type: 'email' },
            { label: 'Mobile Number', key: 'mobile', type: 'tel',  readonly: true },
            { label: 'Role',          key: 'role',   type: 'text', readonly: true },
          ].map(({ label, key, type, readonly }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                readOnly={!editing || readonly}
                onChange={e => set(key, e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                  !editing || readonly
                    ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-default'
                    : 'border-gray-300 focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 bg-white text-gray-800'
                }`}
              />
              {readonly && editing && (
                <p className="text-[10px] text-gray-400 mt-1">Cannot be changed</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <button onClick={onSignOut}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl border-2 border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-200 transition-all">
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
