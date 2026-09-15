export default function CityDelivery({ onCityClick }) {
  return (
    <button
      onClick={onCityClick}
      className="group w-full relative rounded-2xl overflow-hidden cursor-pointer border-0 p-0 text-left"
      style={{ height: '220px' }}
    >
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1487530811015-780780169993?w=1200&h=400&fit=crop"
        alt="City Delivery"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f4c5c]/85 via-[#1a6b8a]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-green-300 uppercase tracking-widest">Now Delivering in Your City</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white leading-tight mb-2">
          Flowers &amp; Gifts,<br />Right at Your Door 🌸
        </h2>
        <p className="text-sm text-white/70 mb-5 max-w-sm">
          Same-day &amp; midnight delivery across your city. Fresh blooms, cakes, combos &amp; more.
        </p>
        <span className="inline-flex items-center gap-2 bg-white text-[#1a6b8a] text-sm font-bold px-5 py-2.5 rounded-full w-fit group-hover:bg-[#1a6b8a] group-hover:text-white transition-colors duration-300 shadow-lg">
          📍 Explore City Collection
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </span>
      </div>

      {/* Right side floating badges */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2">
        {['⚡ Same-Day', '🌙 Midnight', '🎀 Free Wrap'].map(b => (
          <span key={b} className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
            {b}
          </span>
        ))}
      </div>
    </button>
  );
}
