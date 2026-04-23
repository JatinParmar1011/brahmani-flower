const links = ['Flowers','Cakes','Combos','Birthday','Anniversary','Gifts','Personalised','Plants','Chocolates','Occasions','International'];

export default function NavLinks() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1300px] mx-auto flex items-center px-6 overflow-x-auto">
        {links.map(link => (
          <a
            key={link}
            href="#"
            className="text-sm font-medium text-gray-700 px-4 py-3.5 whitespace-nowrap border-b-2 border-transparent hover:text-[#1a6b8a] hover:border-[#1a6b8a] transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  );
}
