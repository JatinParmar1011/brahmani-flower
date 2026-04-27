const links = ['Flowers','Cakes','Combos','Birthday','Anniversary','Gifts','Personalised','Plants','Chocolates','Occasions','International'];

export default function NavLinks({ onCategoryClick, activeCategory }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1300px] mx-auto flex items-center px-6 overflow-x-auto">
        {links.map(link => (
          <button
            key={link}
            onClick={() => onCategoryClick(link)}
            className={`text-sm font-medium px-4 py-3.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer bg-transparent ${
              activeCategory === link
                ? 'text-[#1a6b8a] border-[#1a6b8a] font-semibold'
                : 'text-gray-700 border-transparent hover:text-[#1a6b8a] hover:border-[#1a6b8a]'
            }`}
          >
            {link}
          </button>
        ))}
      </div>
    </nav>
  );
}
