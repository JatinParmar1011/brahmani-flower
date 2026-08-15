function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-5">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, plain }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className={`text-sm text-gray-700 font-medium ${plain ? '' : 'capitalize'}`}>{value || '—'}</span>
    </div>
  );
}

function VerifiedRow({ label, value, verified }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 font-medium">{value || '—'}</span>
        {value && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${verified === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {verified === 1 ? '✓ Verified' : 'Not Verified'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CustomerDetail({ customer, onBack }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm text-lg"
        >
          ←
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Customer Details</h2>
          <p className="text-xs text-gray-400">Viewing profile for {customer.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — avatar + order summary */}
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-[#0f2942] to-[#1a6b8a] rounded-2xl p-6 text-white flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              {(customer.name || '?')[0].toUpperCase()}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg leading-tight">{customer.name || '—'}</p>
              <p className="text-blue-200 text-xs mt-0.5">{customer.mobile || customer.email || '—'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.status === 'ACTIVE' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-gray-400/20 text-gray-200'}`}>
              {customer.status === 'ACTIVE' ? '● Active' : '● Inactive'}
            </span>
          </div>

          <Section title="📦 Order Summary">
            <Row label="Total Orders" value={customer.orders > 0 ? customer.orders : '—'} />
            <Row label="Total Spent"  value={customer.orders > 0 ? customer.totalSpent : '—'} />
          </Section>
        </div>

        {/* Right — details */}
        <div className="xl:col-span-2 space-y-5">
          <Section title="👤 Personal Information">
            <Row label="Customer ID"   value={`#${customer.id}`} />
            <Row label="Full Name"     value={customer.name} />
            <Row label="Gender"        value={customer.gender} />
            <Row label="Date of Birth" value={customer.dateOfBirth} />
          </Section>

          <Section title="📞 Contact Information">
            <VerifiedRow label="Mobile Number" value={customer.mobile} verified={customer.mobileVerified} />
            <VerifiedRow label="Email Address" value={customer.email}  verified={customer.emailVerified}  />
          </Section>

          <Section title="⚙️ Account Information">
            <Row label="Status"        value={customer.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
            <Row label="Member Since"  value={customer.joined} />
          </Section>
        </div>
      </div>
    </div>
  );
}
