import { useState } from 'react';

const TAG_COLORS = {
  Bestseller: 'bg-orange-500',
  Trending:   'bg-pink-500',
  New:        'bg-blue-500',
  Popular:    'bg-green-600',
  Premium:    'bg-purple-600',
  Luxury:     'bg-yellow-600',
};

const THUMB_COUNT = 5;

export default function DetailImagePanel({ product, inWishlist, onToggleWishlist }) {
  const { emoji, bg, tag } = product;
  const [active, setActive] = useState(0);

  const thumbs = Array(THUMB_COUNT).fill(emoji);

  return (
    <div className="flex gap-3">
      {/* Left — vertical thumbnail strip, no scroll */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        {thumbs.map((e, i) => (
          <button
            key={i}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`flex items-center justify-center text-2xl rounded-xl cursor-pointer border-2 transition-all flex-shrink-0 ${
              active === i
                ? 'border-[#1a6b8a] shadow-sm'
                : 'border-gray-200 hover:border-[#1a6b8a]/50'
            }`}
            style={{ background: bg, width: 80, height: 80 }}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Right — big image 432×432 */}
      <div>
        <div
          className="relative w-full rounded-2xl flex items-center justify-center overflow-hidden"
          style={{ background: bg, height: 400, width: 400 }}
        >
          {tag && (
            <span className={`absolute top-4 left-4 text-xs font-bold text-white px-3 py-1.5 rounded-full shadow-md z-10 ${TAG_COLORS[tag] || 'bg-gray-500'}`}>
              {tag}
            </span>
          )}

          <button
            onClick={onToggleWishlist}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all border-none cursor-pointer z-10 ${
              inWishlist ? 'bg-red-50 scale-110' : 'bg-white/90 hover:scale-110'
            }`}
          >
            {inWishlist ? '❤️' : '🤍'}
          </button>

          <span className="text-[120px] drop-shadow-2xl select-none transition-all duration-300">
            {thumbs[active]}
          </span>
        </div>
      </div>
    </div>
  );
}
