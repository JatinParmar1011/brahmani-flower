import { useState, useRef } from 'react';
import { NAV_MENU } from '../data/productData';

const links = ['Flowers','Cakes','Combos','Birthday','Anniversary','Gifts','Personalised','Plants','Chocolates','Occasions','International'];

export default function NavLinks({ onCategoryClick, onSubcategoryClick, activeCategory }) {
  const [openMenu, setOpenMenu] = useState(null);
  const timeoutRef = useRef(null);

  const open  = (link) => { clearTimeout(timeoutRef.current); setOpenMenu(link); };
  const close = ()     => { timeoutRef.current = setTimeout(() => setOpenMenu(null), 150); };
  const keep  = ()     => clearTimeout(timeoutRef.current);

  // Flatten all column items into a single list
  const getItems = (link) =>
    (NAV_MENU[link] || []).flatMap(col => col.items);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[39] shadow-sm">
      <div className="max-w-[1300px] mx-auto flex items-center px-6">
        {links.map(link => {
          const items = getItems(link);
          return (
            <div
              key={link}
              className="relative"
              onMouseEnter={() => open(link)}
              onMouseLeave={close}
            >
              <button
                onClick={() => { onCategoryClick(link); setOpenMenu(null); }}
                className={`text-sm font-medium px-4 py-3.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer bg-transparent ${
                  activeCategory === link || openMenu === link
                    ? 'text-[#1a6b8a] border-[#1a6b8a] font-semibold'
                    : 'text-gray-700 border-transparent hover:text-[#1a6b8a] hover:border-[#1a6b8a]'
                }`}
              >
                {link}
              </button>

              {/* Single-column dropdown */}
              {openMenu === link && items.length > 0 && (
                <div
                  className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[200px] py-2"
                  onMouseEnter={keep}
                  onMouseLeave={close}
                >
                  {items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { onSubcategoryClick(link, item.sub); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#1a6b8a]/8 hover:text-[#1a6b8a] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { onCategoryClick(link); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1a6b8a] hover:bg-[#1a6b8a]/8 transition-colors"
                    >
                      View All {link} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
