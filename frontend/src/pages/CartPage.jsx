import { useState } from 'react';

const ADDONS = [
  { id: 101, emoji: '🍫', name: '5 Dairy Milk Chocolates', price: 149 },
  { id: 102, emoji: '🕯️', name: 'Magic Relighting Candles', price: 59 },
  { id: 103, emoji: '🎂', name: 'Glam Bday Cake Topper', price: 99 },
  { id: 104, emoji: '🌿', name: 'Handmade Almond Rocks', price: 219 },
  { id: 105, emoji: '🎀', name: 'Satin Ribbon Gift Wrap', price: 49 },
];

export default function CartPage({ onBack, cartItems, setCartItems }) {
  const [removed, setRemoved]   = useState(null);
  const [addedOns, setAddedOns] = useState([]);

  const updateQty = (id, delta) =>
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const removeItem = (id) => {
    const item = cartItems.find(i => i.id === id);
    setRemoved(item);
    setCartItems(prev => prev.filter(i => i.id !== id));
    setTimeout(() => setRemoved(null), 3000);
  };

  const undoRemove = () => {
    if (removed) setCartItems(prev => [...prev, removed]);
    setRemoved(null);
  };

  const toggleAddon = (addon) => {
    setAddedOns(prev =>
      prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]
    );
  };

  const totalQty     = cartItems.reduce((s, i) => s + i.qty, 0);
  const originalTotal = cartItems.reduce((s, i) => s + i.originalPrice * i.qty, 0);
  const subtotal      = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const addonTotal  = ADDONS.filter(a => addedOns.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const saved       = originalTotal - subtotal;
  const delivery    = (subtotal + addonTotal) > 999 ? 0 : 79;
  const grandTotal  = subtotal + addonTotal + delivery;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1300px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all shadow-sm">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
            <p className="text-sm text-gray-400">{totalQty} item{totalQty !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        {/* Undo toast */}
        {removed && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <span>"{removed.name}" removed</span>
            <button onClick={undoRemove} className="text-[#4dd0e1] font-bold hover:underline">Undo</button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-28 h-28 rounded-full bg-[#1a6b8a]/10 flex items-center justify-center text-6xl mb-6">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mb-6">Looks like you haven't added any flowers yet.</p>
            <button onClick={onBack}
              className="bg-[#1a6b8a] hover:bg-[#155a75] text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: Items + Add-ons ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Delivery banner */}
              {delivery > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <span className="text-xl">🚚</span>
                  <p className="text-sm text-amber-700">
                    Add <span className="font-bold">₹{1000 - subtotal - addonTotal}</span> more for <span className="font-bold">FREE delivery!</span>
                  </p>
                  <div className="ml-auto w-32 h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((subtotal + addonTotal) / 1000) * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <p className="text-sm text-green-700 font-semibold">You've unlocked FREE delivery!</p>
                </div>
              )}

              {/* Items box */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {cartItems.map((item, idx) => {
                  const discountPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
                  return (
                    <div key={item.id}
                      className={`flex items-center gap-5 px-6 py-5 ${idx !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>

                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#1a6b8a]/10 to-[#1a6b8a]/5 flex items-center justify-center text-4xl flex-shrink-0">
                        {item.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-[#1a6b8a]/10 text-[#1a6b8a] px-2 py-0.5 rounded-full">{item.tag}</span>
                          <span className="text-[10px] text-gray-400">{item.category}</span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-gray-900">₹{item.price}</span>
                          <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">{discountPct}% OFF</span>
                        </div>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all font-bold text-lg leading-none">
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all font-bold text-lg leading-none">
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right flex-shrink-0 w-20">
                        <p className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">₹{item.price} × {item.qty}</p>
                      </div>

                      {/* Remove */}
                      <button onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0">
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ── Last Minute Add-ons ── */}
              <div className="bg-[#fff8f0] border border-orange-100 rounded-2xl p-5">
                <h3 className="text-base font-bold text-gray-800 mb-4">🛍️ Your last minute add-ons</h3>
                <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                  {ADDONS.map(addon => {
                    const added = addedOns.includes(addon.id);
                    return (
                      <div key={addon.id}
                        className="flex-shrink-0 w-36 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-24 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-5xl">
                          {addon.emoji}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-gray-800 leading-tight mb-1 line-clamp-2">{addon.name}</p>
                          <p className="text-sm font-bold text-[#1a6b8a] mb-2">₹{addon.price}</p>
                          <button
                            onClick={() => toggleAddon(addon)}
                            className={`w-full text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                              added
                                ? 'bg-[#1a6b8a] text-white border-[#1a6b8a]'
                                : 'bg-white text-[#1a6b8a] border-[#1a6b8a] hover:bg-[#1a6b8a] hover:text-white'
                            }`}>
                            {added ? '✓ Added' : '+ Add to Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="sticky top-24">
              {/* "You have saved" badge on top border */}
              <div className="relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    🎉 You have saved ₹{saved}!
                  </span>
                </div>

                <div className="bg-white rounded-2xl border-2 border-green-400 shadow-sm pt-7 pb-6 px-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
                    <span className="text-xs text-gray-400 font-medium">{totalQty} Items</span>
                  </div>

                  <div className="flex flex-col gap-3 text-sm">
                    {/* Order total with strike */}
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Order Total</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-xs">₹{originalTotal}</span>
                        <span className="font-semibold text-gray-800">₹{subtotal}</span>
                      </div>
                    </div>

                    {addonTotal > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Add-ons</span>
                        <span className="font-semibold text-gray-800">₹{addonTotal}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className={`font-semibold ${delivery === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                        {delivery === 0 ? 'FREE' : `₹${delivery}`}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-base">Grand Total</span>
                      <span className="font-bold text-[#1a6b8a] text-xl">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button className="mt-5 w-full bg-gradient-to-r from-[#1a6b8a] to-[#155a75] hover:from-[#155a75] hover:to-[#0f4a62] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm tracking-wide">
                    Proceed to Checkout →
                  </button>

                  <button onClick={onBack}
                    className="mt-3 w-full border border-[#1a6b8a] text-[#1a6b8a] hover:bg-[#1a6b8a] hover:text-white font-semibold py-3 rounded-xl transition-all text-sm">
                    Continue Shopping
                  </button>

                  {/* Trust badges */}
                  <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: '🔒', label: 'Secure\nPayment' },
                      { icon: '🔄', label: 'Easy\nReturns' },
                      { icon: '⭐', label: '4.8★\nRating' },
                    ].map(b => (
                      <div key={b.label} className="flex flex-col items-center gap-1">
                        <span className="text-lg">{b.icon}</span>
                        <span className="text-[10px] text-gray-400 font-medium leading-tight whitespace-pre-line">{b.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-center text-[11px] text-gray-400 leading-relaxed">
                    Have a Coupon Code? You can apply the discount coupon in the Checkout Process.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
