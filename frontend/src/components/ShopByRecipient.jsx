import { useState, useEffect } from 'react';
import { fetchCategories } from '../services/categoryService';

const EMOJI_MAP = {
  'Her': '👩', 'Him': '👨', 'Mom': '👩‍👧', 'Dad': '👨‍👦',
  'Best Friends': '👯', 'Bestest Friends': '👯', 'Grandparents': '👴👵', 'Boss': '🤝', 'Colleagues': '👥',
};
const BG_MAP = {
  'Her':          'linear-gradient(135deg,#fce4ec,#f8bbd0)',
  'Him':          'linear-gradient(135deg,#e3f2fd,#bbdefb)',
  'Mom':          'linear-gradient(135deg,#f3e5f5,#e1bee7)',
  'Dad':          'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
  'Best Friends':   'linear-gradient(135deg,#fff8e1,#ffecb3)',
  'Bestest Friends':'linear-gradient(135deg,#fff8e1,#ffecb3)',
  'Grandparents': 'linear-gradient(135deg,#fbe9e7,#ffccbc)',
  'Boss':         'linear-gradient(135deg,#e8eaf6,#c5cae9)',
  'Colleagues':   'linear-gradient(135deg,#e0f7fa,#b2ebf2)',
};

export default function ShopByRecipient({ onItemClick }) {
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    fetchCategories('shop_by_recipient')
      .then(data => setRecipients(data.map(c => ({ label: c.categoryName, emoji: EMOJI_MAP[c.categoryName] || '🌸', bg: BG_MAP[c.categoryName] || '#fce4ec' }))))
      .catch(() => {});
  }, []);

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
          <div
            key={r.label}
            onClick={() => onItemClick?.({ label: r.label, emoji: r.emoji, bg: r.bg, parent: 'Shop By Recipient' })}
            className="group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-white border border-gray-100"
          >
            <div className="h-44 flex items-center justify-center" style={{ background: r.bg }}>
              <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{r.emoji}</span>
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
