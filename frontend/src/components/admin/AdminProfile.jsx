import { useEffect, useState } from 'react';
import { getAdminProfile } from '../../services/authService';

export default function AdminProfile({ onSignOut }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminProfile()
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-40 text-gray-400">Loading profile…</div>;
  if (error)   return <div className="text-red-500 p-6">{error}</div>;

  const initials = profile.name?.charAt(0)?.toUpperCase() ?? 'A';

  const fields = [
    { label: 'Full Name',      value: profile.name },
    { label: 'Gender',         value: profile.gender },
    { label: 'Date of Birth',  value: profile.dateOfBirth },
    { label: 'Mobile Number',  value: profile.mobileNumber },
    { label: 'Email Address',  value: profile.email },
    { label: 'Role',           value: profile.role },
  ];

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#0f2942] via-[#1a4a6b] to-[#1a6b8a] relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute bottom-0 left-8 translate-y-1/2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a6b8a] to-teal-400 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white">
              {initials}
            </div>
          </div>
        </div>

        <div className="px-8 pt-12 pb-6">
          <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-gradient-to-r from-[#1a6b8a] to-teal-500 text-white px-2.5 py-0.5 rounded-full font-semibold">
              {profile.role}
            </span>
            <span className="text-xs text-gray-400">• Brahmani Flowers</span>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-5">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
              <div className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-700">
                {value || <span className="text-gray-400 italic">Not provided</span>}
              </div>
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
