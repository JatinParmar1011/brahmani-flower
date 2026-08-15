const occasions = [
  { label: 'Birthday',        emoji: '🎂', bg: '#fff3e0' },
  { label: 'Anniversary',     emoji: '💍', bg: '#fce4ec' },
  { label: 'New Baby',        emoji: '👶', bg: '#e8f5e9' },
  { label: 'Love',            emoji: '💑', bg: '#fce4ec' },
  { label: 'I am Sorry',      emoji: '🙏', bg: '#f3e5f5' },
  { label: 'Get Well Soon',   emoji: '🌻', bg: '#fffde7' },
  { label: 'Corporate',       emoji: '💼', bg: '#e3f2fd' },
  { label: 'Sympathy',        emoji: '🕊️', bg: '#f5f5f5' },
  { label: 'Congratulations', emoji: '🎉', bg: '#e8f5e9' },
  { label: 'Thank You',       emoji: '🌷', bg: '#fce4ec' },
];

export default function ShopByOccasion() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop By Occasion</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mb-3 rounded" />
        <p className="text-sm text-gray-500">Find the Perfect Flowers for Every Special Moment</p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {occasions.map(o => (
          <div key={o.label} className="flex flex-col items-center gap-3 cursor-pointer flex-shrink-0 hover:-translate-y-1 transition-transform">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-md" style={{ background: o.bg }}>
              <span className="text-6xl">{o.emoji}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 text-center">{o.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
