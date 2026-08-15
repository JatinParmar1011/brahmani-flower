const col1 = ['About Us','Sell With Us','Coupons & Deals','Cancellation & Refund','Terms and Conditions','Retails Stores','Career'];
const col2 = ['Media','Privacy Policy','Reviews','Blog','Sitemap','Quotes'];
const col3 = ['Corporate Gifts','Franchise','FAQ','Contact Us','Download App'];

const socials = [
  { label: 'Facebook',  color: '#1877f2', icon: 'f' },
  { label: 'X',         color: '#000',    icon: '𝕏' },
  { label: 'YouTube',   color: '#ff0000', icon: '▶' },
  { label: 'Pinterest', color: '#e60023', icon: 'P' },
  { label: 'Instagram', color: '#c13584', icon: '📷' },
  { label: 'LinkedIn',  color: '#0077b5', icon: 'in' },
];

const payments = ['VISA','Mastercard','RuPay','AMEX','PayPal','PayUmoney','Oxigen','Airtel','Mobikwik'];

export default function Footer() {
  return (
    <footer className="mt-10">
      {/* Links section */}
      <div className="bg-gray-100 py-12 px-6">
        <div className="max-w-[1300px] mx-auto grid grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            {col1.map(l => <a key={l} href="#" className="text-sm text-gray-600 hover:text-[#1a6b8a] transition-colors">{l}</a>)}
          </div>
          <div className="flex flex-col gap-4">
            {col2.map(l => <a key={l} href="#" className="text-sm text-gray-600 hover:text-[#1a6b8a] transition-colors">{l}</a>)}
          </div>
          <div className="flex flex-col gap-4">
            {col3.map(l => <a key={l} href="#" className="text-sm text-gray-600 hover:text-[#1a6b8a] transition-colors">{l}</a>)}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-800">Simplify your gifting experience with our app.</p>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-gray-300 border-2 border-gray-400 rounded-md flex items-center justify-center text-xs text-gray-500 flex-shrink-0">QR</div>
              <div className="flex flex-col gap-2">
                <a href="#" className="block bg-black text-white text-xs px-3 py-2 rounded-lg leading-snug hover:bg-gray-800 transition-colors">
                  ▶ GET IT ON<br/><strong className="text-sm">Google Play</strong>
                </a>
                <a href="#" className="block bg-black text-white text-xs px-3 py-2 rounded-lg leading-snug hover:bg-gray-800 transition-colors">
                  🍎 Download on the<br/><strong className="text-sm">App Store</strong>
                </a>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800">Spread The Love On Social Media</p>
            <div className="flex gap-2.5 flex-wrap">
              {socials.map(s => (
                <a key={s.label} href="#" title={s.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ background: s.color }}
                >{s.icon}</a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-[1300px] mx-auto flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 font-bold text-[#1a6b8a] text-sm flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <path d="M18 4C14 4 10 8 10 12c0 3 2 5.5 5 7-3 1.5-5 4-5 7h16c0-3-2-5.5-5-7 3-1.5 5-4 5-7 0-4-4-8-8-8z" fill="#1a6b8a" opacity="0.8"/>
              <circle cx="18" cy="18" r="3" fill="#1a6b8a"/>
            </svg>
            FLOWER AURA
          </div>
          <p className="text-xs text-gray-500 flex-1">Copyright. 2026. FA GIFTS PVT. LTD</p>
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
            <span className="font-medium">We Accept:</span>
            {payments.map(p => (
              <span key={p} className="bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-[11px] font-semibold text-gray-700">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
