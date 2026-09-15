import { useState, useEffect } from 'react';
import { fetchCategories } from '../services/categoryService';

const EMOJI_MAP = {
  'Birthday': '🎂', 'Anniversary': '💍', 'New Baby': '👶', 'Love': '💑',
  'I am Sorry': '🙏', 'Get Well Soon': '🌻', 'Corporate': '💼',
  'Sympathy': '🕊️', 'Congratulations': '🎉', 'Thank You': '🌷',
};
const BG_MAP = {
  'Birthday': '#fff3e0', 'Anniversary': '#fce4ec', 'New Baby': '#e8f5e9', 'Love': '#fce4ec',
  'I am Sorry': '#f3e5f5', 'Get Well Soon': '#fffde7', 'Corporate': '#e3f2fd',
  'Sympathy': '#f5f5f5', 'Congratulations': '#e8f5e9', 'Thank You': '#fce4ec',
};

export default function ShopByOccasion({ onItemClick }) {
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    fetchCategories('shop_by_occasion')
      .then(data => setOccasions(data.map(c => ({ label: c.categoryName, emoji: EMOJI_MAP[c.categoryName] || '🌸', bg: BG_MAP[c.categoryName] || '#fce4ec' }))))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop By Occasion</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mb-3 rounded" />
        <p className="text-sm text-gray-500">Find the Perfect Flowers for Every Special Moment</p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {occasions.map(o => (
          <div
            key={o.label}
            onClick={() => onItemClick?.({ label: o.label, emoji: o.emoji, bg: o.bg, parent: 'Shop By Occasion' })}
            className="flex flex-col items-center gap-3 cursor-pointer flex-shrink-0 hover:-translate-y-1 transition-transform group"
          >
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow" style={{ background: o.bg }}>
              <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{o.emoji}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 text-center">{o.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
