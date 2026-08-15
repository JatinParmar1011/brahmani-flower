import { useState, useEffect } from 'react';

// ── FAQ ────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What are your delivery timings?', a: 'We deliver from 8 AM to 9 PM, 7 days a week including public holidays.' },
  { q: 'Do you offer same-day delivery?', a: 'Yes! Orders placed before 4 PM are eligible for same-day delivery in select cities.' },
  { q: 'Can I schedule a delivery for a specific time?', a: 'Absolutely. You can choose a preferred delivery slot during checkout.' },
  { q: 'What if my flowers arrive damaged?', a: "We have a 100% satisfaction guarantee. Contact us within 24 hours and we'll replace or refund your order." },
  { q: 'Do you deliver outside India?', a: 'Yes, we deliver to 50+ countries. International orders require 48 hours advance notice.' },
  { q: 'How do I track my order?', a: 'Use the "Track Order" feature in your account or enter your order ID on the Track Order page.' },
];

function FAQPage({ onNavigate }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl bg-[#1a6b8a]/10 flex items-center justify-center text-xl">❓</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-400">Everything you need to know</p>
        </div>
      </div>
      <div className="mt-7 flex flex-col gap-3">
        {FAQS.map((f, i) => (
          <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${open === i ? 'border-[#1a6b8a] shadow-sm' : 'border-gray-100'}`}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
              <span className="text-sm font-semibold text-gray-800 pr-4">{f.q}</span>
              <span className={`text-[#1a6b8a] text-lg flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 bg-[#1a6b8a]/3 border-t border-[#1a6b8a]/10">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 bg-gradient-to-r from-[#1a6b8a]/5 to-blue-50 rounded-2xl p-5 border border-[#1a6b8a]/10 flex items-center gap-4">
        <span className="text-3xl">💬</span>
        <div>
          <p className="text-sm font-bold text-gray-800">Still have questions?</p>
          <p className="text-xs text-gray-500 mt-0.5">Our support team is available 24/7 to help you.</p>
        </div>
        <button onClick={() => onNavigate('contact')}
          className="ml-auto bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
          Contact Us
        </button>
      </div>
    </div>
  );
}

// ── About Us ───────────────────────────────────────────────────────────────
const STATS = [
  { value: '5+', label: 'Years of Service' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '200+', label: 'Flower Varieties' },
  { value: '50+', label: 'Cities Covered' },
];
const TEAM = [
  { name: 'Priya Sharma', role: 'Founder & CEO', emoji: '👩‍💼' },
  { name: 'Rahul Mehta', role: 'Head of Operations', emoji: '👨‍💼' },
  { name: 'Anita Patel', role: 'Lead Florist', emoji: '👩‍🌾' },
];

function AboutPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl bg-[#1a6b8a]/10 flex items-center justify-center text-xl">🌸</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">About Bramhani Flower</h2>
          <p className="text-sm text-gray-400">Our story & mission</p>
        </div>
      </div>
      <div className="mt-7 bg-gradient-to-br from-[#1a6b8a] to-[#155a75] rounded-2xl p-7 text-white mb-6">
        <p className="text-2xl font-bold mb-2">🌺 Delivering Happiness</p>
        <p className="text-white/80 text-sm leading-relaxed max-w-lg">
          Founded in 2020, Bramhani Flower started with a simple mission — to make every special moment more beautiful with fresh, handcrafted floral arrangements delivered right to your door.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-[#1a6b8a]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: '🌱', title: 'Sustainability', desc: 'We source flowers from local farms to reduce carbon footprint and support Indian farmers.' },
          { icon: '💎', title: 'Quality First', desc: 'Every bouquet is handcrafted by expert florists using only the freshest blooms.' },
          { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day delivery available in 50+ cities across India with real-time tracking.' },
          { icon: '❤️', title: 'Customer Love', desc: '4.8★ rating from 50,000+ happy customers. Your satisfaction is our priority.' },
        ].map(v => (
          <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#1a6b8a]/30 hover:shadow-sm transition-all">
            <span className="text-2xl">{v.icon}</span>
            <p className="text-sm font-bold text-gray-800 mt-2">{v.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
      <h3 className="text-sm font-bold text-gray-700 mb-3">Meet Our Team</h3>
      <div className="grid grid-cols-3 gap-4">
        {TEAM.map(t => (
          <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-[#1a6b8a]/10 flex items-center justify-center text-3xl mx-auto mb-3">{t.emoji}</div>
            <p className="text-sm font-bold text-gray-800">{t.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contact Us ─────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl bg-[#1a6b8a]/10 flex items-center justify-center text-xl">📞</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-sm text-gray-400">We'd love to hear from you</p>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-3 gap-4 mb-7">
        {[
          { icon: '📞', title: 'Phone', val: '+91 98765 43210', sub: 'Mon–Sat, 9 AM – 7 PM' },
          { icon: '📧', title: 'Email', val: 'support@bramhaniflower.com', sub: 'Reply within 24 hours' },
          { icon: '📍', title: 'Address', val: 'Mumbai, Maharashtra', sub: 'India - 400001' },
        ].map(c => (
          <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-[#1a6b8a]/30 hover:shadow-sm transition-all">
            <span className="text-2xl">{c.icon}</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-2">{c.title}</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{c.val}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-lg font-bold text-green-700">Message Sent!</p>
          <p className="text-sm text-green-600 mt-1">We'll get back to you within 24 hours.</p>
          <button onClick={() => setSent(false)} className="mt-4 text-sm text-[#1a6b8a] font-semibold hover:underline">Send another message</button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Send us a message</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white">
                <option value="">Select a subject</option>
                {['Order Issue', 'Delivery Problem', 'Product Quality', 'Refund Request', 'General Inquiry'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Message</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={4} placeholder="Describe your issue or question..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 resize-none" />
            </div>
          </div>
          <button onClick={() => { if (form.name && form.email && form.message) setSent(true); }}
            className="bg-[#1a6b8a] hover:bg-[#155a75] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors">
            Send Message 📨
          </button>
        </div>
      )}
    </div>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'All',        label: 'All',          icon: '🇮🇳' },
  { key: 'Decoration', label: 'Decoration',   icon: '🌼' },
  { key: 'Garlands',   label: 'Garlands',     icon: '🌿' },
  { key: 'Pooja Decor',label: 'Pooja Decor',  icon: '🕯️' },
  { key: 'Arch',       label: 'Arch',         icon: '🌸' },
];

const ALL_GALLERY = [
  {
    src: '/gallery/gallery1.jpg',
    name: 'Marigold Backdrop',
    desc: 'Traditional marigold & sunflower backdrop with brass diyas for pooja & wedding ceremonies.',
    category: 'Decoration',
  },
  {
    src: '/gallery/gallery2.jpg',
    name: 'Sunflower Arch',
    desc: 'Elegant sunflower & white rose arch with fairy lights — perfect for haldi & engagement.',
    category: 'Decoration',
  },
  {
    src: '/gallery/gallery4.jpg',
    name: 'Jasmine Garland Setup',
    desc: 'Hanging jasmine garlands with pink buds & brass diyas for pooja mandap decoration.',
    category: 'Pooja Decor',
  },
  {
    src: '/gallery/gallery3.jpg',
    name: 'Pink & White Tassels',
    desc: 'Handcrafted pink rose & white mogra tassels — ideal for door hangings & event decor.',
    category: 'Garlands',
  },
];

function GalleryGrid({ items, onOpen }) {
  if (items.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-2">🌸</div>
      <p className="text-sm">No items in this category yet.</p>
    </div>
  );

  // Simple equal grid for 1–2 items
  if (items.length <= 2) {
    return (
      <div className={`grid gap-5 ${items.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-2'}`}>
        {items.map((item, i) => (
          <div key={i} className="group cursor-pointer" onClick={() => onOpen(item, i)}>
            <div className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300">
              <img src={item.src} alt={item.name}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={{ height: '260px' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute top-3 left-3 text-[11px] font-semibold bg-white/90 text-[#1a6b8a] px-2.5 py-1 rounded-full shadow-sm">{item.category}</span>
            </div>
            <div className="mt-3 px-1">
              <p className="text-sm font-bold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Bento grid for 3+ items: each cell is self-contained (image + text stacked)
  // Layout: col1=tall, col2=two short stacked, col3=tall
  const col1 = items.filter((_, i) => i % 4 === 0);
  const col2a = items.filter((_, i) => i % 4 === 1);
  const col2b = items.filter((_, i) => i % 4 === 2);
  const col3 = items.filter((_, i) => i % 4 === 3);

  const Card = ({ item, idx, imgHeight }) => (
    <div className="group cursor-pointer" onClick={() => onOpen(item, idx)}>
      <div
        className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300"
        style={{ height: imgHeight }}
      >
        <img src={item.src} alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3 text-[11px] font-semibold bg-white/90 text-[#1a6b8a] px-2.5 py-1 rounded-full shadow-sm">{item.category}</span>
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
      </div>
    </div>
  );

  // Find global index for each item
  const idxOf = (item) => items.indexOf(item);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
      {/* Col 1 — tall image */}
      <div className="flex flex-col gap-4">
        {col1.map(item => <Card key={item.src} item={item} idx={idxOf(item)} imgHeight="380px" />)}
      </div>
      {/* Col 2 — two short images stacked */}
      <div className="flex flex-col gap-4">
        {col2a.map(item => <Card key={item.src} item={item} idx={idxOf(item)} imgHeight="175px" />)}
        {col2b.map(item => <Card key={item.src} item={item} idx={idxOf(item)} imgHeight="175px" />)}
      </div>
      {/* Col 3 — tall image */}
      <div className="flex flex-col gap-4">
        {col3.map(item => <Card key={item.src} item={item} idx={idxOf(item)} imgHeight="380px" />)}
      </div>
    </div>
  );
}

function GalleryPage({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected]             = useState(null);
  const [lightboxIdx, setLightboxIdx]       = useState(0);

  const filtered = activeCategory === 'All'
    ? ALL_GALLERY
    : ALL_GALLERY.filter(g => g.category === activeCategory);

  const openLightbox = (item, i) => { setSelected(item); setLightboxIdx(i); };

  const goPrev = (e) => {
    e.stopPropagation();
    const ni = (lightboxIdx - 1 + filtered.length) % filtered.length;
    setLightboxIdx(ni);
    setSelected(filtered[ni]);
  };
  const goNext = (e) => {
    e.stopPropagation();
    const ni = (lightboxIdx + 1) % filtered.length;
    setLightboxIdx(ni);
    setSelected(filtered[ni]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl bg-[#1a6b8a]/10 flex items-center justify-center text-xl">🖼️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Our Gallery</h2>
          <p className="text-sm text-gray-400">Handcrafted floral creations by our expert florists</p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === cat.key
                ? 'bg-[#1a6b8a] text-white border-[#1a6b8a] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6b8a] hover:text-[#1a6b8a]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {cat.key === 'All' ? ALL_GALLERY.length : ALL_GALLERY.filter(g => g.category === cat.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <GalleryGrid items={filtered} onOpen={openLightbox} />

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
          onClick={() => setSelected(null)}
        >
          <button onClick={() => setSelected(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-xl transition-colors z-10">
            ✕
          </button>
          {filtered.length > 1 && (
            <button onClick={goPrev}
              className="absolute left-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-2xl transition-colors z-10">
              ‹
            </button>
          )}
          <div
            className="relative max-w-2xl w-full mx-20 rounded-3xl overflow-hidden shadow-2xl bg-black"
            onClick={e => e.stopPropagation()}
          >
            <img src={selected.src} alt={selected.name} className="w-full object-contain max-h-[72vh]" />
            {/* Caption */}
            <div className="bg-gray-950 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-base">{selected.name}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{selected.desc}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-[11px] font-semibold bg-[#1a6b8a]/30 text-[#7ecbe8] px-2.5 py-1 rounded-full">
                    {selected.category}
                  </span>
                  <p className="text-[11px] text-gray-600 mt-1.5">{lightboxIdx + 1} / {filtered.length}</p>
                </div>
              </div>
            </div>
          </div>
          {filtered.length > 1 && (
            <button onClick={goNext}
              className="absolute right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-2xl transition-colors z-10">
              ›
            </button>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-[#1a6b8a]/5 to-blue-50 rounded-2xl p-5 border border-[#1a6b8a]/10 flex items-center gap-4">
        <span className="text-3xl">🌺</span>
        <div>
          <p className="text-sm font-bold text-gray-800">Want a custom arrangement?</p>
          <p className="text-xs text-gray-500 mt-0.5">Contact us and our florists will create something just for you.</p>
        </div>
        <button onClick={() => onNavigate('contact')}
          className="ml-auto bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
          Contact Us
        </button>
      </div>
    </div>
  );
}

// ── Policy pages ───────────────────────────────────────────────────────────
const INFO_PAGES = {
  privacy: {
    icon: '🔒', title: 'Privacy Policy', sub: 'How we protect your data',
    content: (
      <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm space-y-5">
        {[
          ['📋 Information We Collect', 'We collect your name, email, mobile number, and delivery address to process your orders. We do not sell your personal data to third parties.'],
          ['🔐 How We Protect Your Data', 'All data is encrypted using industry-standard SSL/TLS protocols. Your payment information is processed securely through certified payment gateways.'],
          ['🍪 Cookies', 'We use cookies to improve your browsing experience and remember your preferences. You can disable cookies in your browser settings.'],
          ['📧 Marketing Communications', 'With your consent, we may send promotional emails and SMS. You can unsubscribe at any time from your account settings.'],
          ['📞 Contact for Privacy Concerns', 'For any privacy-related queries, contact us at privacy@bramhaniflower.com or call +91 98765 43210.'],
        ].map(([title, text]) => (
          <div key={title}>
            <p className="text-sm font-bold text-gray-800 mb-1.5">{title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Last updated: April 2025</p>
      </div>
    ),
  },
  terms: {
    icon: '📄', title: 'Terms of Service', sub: 'Our terms & conditions',
    content: (
      <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm space-y-5">
        {[
          ['1. Acceptance of Terms', 'By using Bramhani Flower, you agree to these terms. If you do not agree, please do not use our services.'],
          ['2. Orders & Payments', 'All orders are subject to availability. Prices are inclusive of applicable taxes. Payment must be completed at the time of order.'],
          ['3. Delivery Policy', 'We strive to deliver on time, but delays may occur due to unforeseen circumstances. We are not liable for delays caused by natural disasters or strikes.'],
          ['4. Cancellation & Refunds', 'Orders can be cancelled up to 4 hours before the scheduled delivery. Refunds are processed within 5–7 business days.'],
          ['5. Intellectual Property', 'All content on this website including images, logos, and text is the property of Bramhani Flower and may not be reproduced without permission.'],
        ].map(([title, text]) => (
          <div key={title}>
            <p className="text-sm font-bold text-gray-800 mb-1.5">{title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Last updated: April 2025</p>
      </div>
    ),
  },
};

// ── Main MorePage ──────────────────────────────────────────────────────────
export default function MorePage({ pageKey, onBack, onMoreClick }) {
  const [currentKey, setCurrentKey] = useState(pageKey);

  useEffect(() => { setCurrentKey(pageKey); }, [pageKey]);

  const info = INFO_PAGES[currentKey];

  const navigate = (key) => setCurrentKey(key);

  const mapped =
    currentKey === 'faq'     ? <FAQPage onNavigate={navigate} /> :
    currentKey === 'about'   ? <AboutPage /> :
    currentKey === 'contact' ? <ContactPage /> :
    currentKey === 'gallery' ? <GalleryPage onNavigate={navigate} /> :
    null;

  const content = mapped || (info ? (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <span className="w-10 h-10 rounded-xl bg-[#1a6b8a]/10 flex items-center justify-center text-xl">{info.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{info.title}</h2>
          <p className="text-sm text-gray-400">{info.sub}</p>
        </div>
      </div>
      {info.content}
    </div>
  ) : (
    <div className="text-center py-20 text-gray-400">
      <div className="text-5xl mb-3">🌸</div>
      <p className="font-medium">Page coming soon</p>
    </div>
  ));

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a6b8a] font-medium mb-6 transition-colors group">
        <span className="w-7 h-7 rounded-full border border-gray-200 group-hover:border-[#1a6b8a] flex items-center justify-center text-xs transition-colors">←</span>
        Back to Home
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
        {content}
      </div>
    </div>
  );
}
