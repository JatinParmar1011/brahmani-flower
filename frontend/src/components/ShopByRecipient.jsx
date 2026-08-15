const recipients = [
  { label: 'Her',          emoji: '👩',   bg: 'linear-gradient(135deg,#fce4ec,#f8bbd0)' },
  { label: 'Him',          emoji: '👨',   bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
  { label: 'Mom',          emoji: '👩‍👧',  bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)' },
  { label: 'Dad',          emoji: '👨‍👦',  bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
  { label: 'Best Friends', emoji: '👯',   bg: 'linear-gradient(135deg,#fff8e1,#ffecb3)' },
  { label: 'Grandparents', emoji: '👴👵', bg: 'linear-gradient(135deg,#fbe9e7,#ffccbc)' },
  { label: 'Boss',         emoji: '🤝',   bg: 'linear-gradient(135deg,#e8eaf6,#c5cae9)' },
  { label: 'Colleagues',   emoji: '👥',   bg: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)' },
];

export default function ShopByRecipient() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Flowers By Recipient</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mb-3 rounded" />
        <p className="text-sm text-gray-500 leading-relaxed">
          Shop Flowers By Design offers curated floral arrangements tailored to your unique style and occasion.<br />
          Experience the art of floral design with every bouquet.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {recipients.map(r => (
          <div key={r.label} className="rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all bg-white border border-gray-100">
            <div className="h-44 flex items-center justify-center" style={{ background: r.bg }}>
              <span className="text-7xl">{r.emoji}</span>
            </div>
            <div className="text-center py-3 text-sm font-semibold text-gray-800 border-t border-gray-100">
              {r.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
