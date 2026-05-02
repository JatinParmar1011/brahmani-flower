const PRODUCTS = [
  { id: 1, name: 'Red Rose Bouquet',    category: 'Bouquets',  price: '₹599',  stock: 42, status: 'Active',   emoji: '🌹' },
  { id: 2, name: 'Sunflower Delight',   category: 'Seasonal',  price: '₹449',  stock: 18, status: 'Active',   emoji: '🌻' },
  { id: 3, name: 'Lavender Dreams',     category: 'Aromatics', price: '₹749',  stock: 7,  status: 'Low Stock', emoji: '💜' },
  { id: 4, name: 'White Lily Bunch',    category: 'Bouquets',  price: '₹349',  stock: 0,  status: 'Out',      emoji: '🤍' },
  { id: 5, name: 'Orchid Elegance',     category: 'Premium',   price: '₹799',  stock: 25, status: 'Active',   emoji: '🌸' },
  { id: 6, name: 'Mixed Seasonal Pack', category: 'Seasonal',  price: '₹899',  stock: 11, status: 'Active',   emoji: '💐' },
];

const STATUS_STYLE = {
  Active:     'bg-emerald-100 text-emerald-700',
  'Low Stock':'bg-amber-100 text-amber-700',
  Out:        'bg-red-100 text-red-600',
};

export default function AdminProducts() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">{PRODUCTS.length} products</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
          <span>+</span> Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {PRODUCTS.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="font-medium text-gray-700">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{p.category}</td>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{p.price}</td>
                <td className="px-5 py-3.5 text-gray-600">{p.stock}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-3">
                    <button className="text-xs text-[#1a6b8a] hover:underline font-medium">Edit</button>
                    <button className="text-xs text-red-400 hover:underline font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
