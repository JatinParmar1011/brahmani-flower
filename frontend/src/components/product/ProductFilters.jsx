import { TAG_HEX } from '../../utils/tagColors';

const SORT_OPTIONS = [
  { value: 'popular',   label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc','label': 'Price: High to Low' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'newest',    label: 'Newest First' },
];

const TAGS = ['All', 'Bestseller', 'Trending', 'New', 'Popular', 'Premium', 'Luxury'];

export default function ProductFilters({ sort, setSort, activeTag, setActiveTag, total, accent }) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      {/* Tag pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {TAGS.map(tag => {
          const isActive = activeTag === tag;
          // "All" uses the page accent; each tag uses its own colour
          const activeColor = tag === 'All' ? accent : (TAG_HEX[tag] || accent);
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                isActive
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
              style={isActive ? { background: activeColor, borderColor: activeColor } : {}}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Right: count + sort */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium">{total} products</span>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b8a]/30 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
