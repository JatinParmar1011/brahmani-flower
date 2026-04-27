export default function ProductHero({ category, meta }) {
  return (
    <div className={`bg-gradient-to-r ${meta.gradient} rounded-2xl px-10 py-10 flex items-center justify-between mb-8 overflow-hidden relative`}>
      <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10"
        style={{ background: meta.accent, transform: 'translate(30%, -30%)' }} />
      <div className="z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: meta.accent }}>
            Free Delivery on orders above ₹999
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mt-2">{category}</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md">{meta.desc}</p>
        <div className="flex items-center gap-6 mt-5">
          {[['🚚','Same Day Delivery'],['✅','100% Fresh'],['↩️','Easy Returns']].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <span className="text-[120px] leading-none drop-shadow-lg z-10 select-none">{meta.emoji}</span>
    </div>
  );
}
