import { useState, useEffect } from 'react';
import { fetchGallery } from '../services/galleryService';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/authService';
import { submitContactEnquiry } from '../services/contactEnquiryService';

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

const ENQUIRY_CATEGORIES = [
  { value: 'GENERAL_ENQUIRY',       label: 'General Enquiry' },
  { value: 'ORDER_ISSUE',           label: 'Order Issue' },
  { value: 'DELIVERY_PROBLEM',      label: 'Delivery Problem' },
  { value: 'PRODUCT_QUALITY',       label: 'Product Quality' },
  { value: 'PAYMENT_RELATED',       label: 'Payment Related' },
  { value: 'RETURN_REFUND_REQUEST', label: 'Return / Refund Request' },
  { value: 'COMPLAINT',             label: 'Complaint' },
  { value: 'OTHER',                 label: 'Other' },
];

const EMPTY_FORM = {
  fullName: '', email: '', phone: '',
  subject: '', category: '', message: '',
};

const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition-colors';
const ERR_CLS   = 'text-[11px] text-red-500 mt-1';

function ContactPage() {
  const { user } = useAuth();

  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(null); // holds response DTO on success
  const [apiError, setApiError] = useState('');

  // Auto-populate for logged-in customer
  useEffect(() => {
    if (!user) return;
    getProfile()
      .then(p => setForm(f => ({
        ...f,
        fullName: p.name         || f.fullName,
        email:    p.email        || f.email,
        phone:    p.mobileNumber || f.phone,
      })))
      .catch(() => {
        // Fallback to auth context values
        setForm(f => ({
          ...f,
          fullName: user.name         || f.fullName,
          phone:    user.mobileNumber || f.phone,
        }));
      });
  }, [user]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};

    // Full Name: required, 2–30 chars, letters/spaces/dots/hyphens only
    const name = form.fullName.trim();
    if (!name)
      errs.fullName = 'Full name is required';
    else if (name.length < 2)
      errs.fullName = 'Name must be at least 2 characters';
    else if (name.length > 30)
      errs.fullName = 'Name must not exceed 30 characters';
    else if (!/^[A-Za-z\s.\-']+$/.test(name))
      errs.fullName = 'Name can only contain letters, spaces, dots, and hyphens';

    // Email: required, valid format, max 255 chars
    const email = form.email.trim();
    if (!email)
      errs.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      errs.email = 'Please enter a valid email address (e.g. name@example.com)';
    else if (email.length > 255)
      errs.email = 'Email must not exceed 255 characters';

    // Phone: required, exactly 10 digits, no +91 prefix, must not start with 0
    const phone = form.phone?.trim();
    if (!phone) {
      errs.phone = 'Phone number is required';
    } else {
      const digits = phone.replace(/\D/g, '');
      if (!/^\d{10}$/.test(phone))
        errs.phone = 'Enter a 10-digit mobile number (e.g. 9876543210)';
      else if (phone.startsWith('+91') || phone.startsWith('91') || phone.startsWith('0'))
        errs.phone = 'Do not include country code or leading 0 — enter 10 digits only';
      else if (!['6','7','8','9'].includes(phone[0]))
        errs.phone = 'Enter a valid Indian mobile number starting with 6, 7, 8, or 9';
    }

    // Subject: required, 5–50 chars
    const subject = form.subject.trim();
    if (!subject)
      errs.subject = 'Subject is required';
    else if (subject.length < 5)
      errs.subject = 'Subject must be at least 5 characters';
    else if (subject.length > 50)
      errs.subject = 'Subject must not exceed 50 characters';

    // Category
    if (!form.category)
      errs.category = 'Please select an enquiry category';

    // Message: required, 10–5000 chars
    const msg = form.message.trim();
    if (!msg)
      errs.message = 'Message is required';
    else if (msg.length < 10)
      errs.message = 'Message must be at least 10 characters';
    else if (msg.length > 5000)
      errs.message = 'Message must not exceed 5000 characters';

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await submitContactEnquiry({
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        phone:    form.phone?.trim() || null,
        subject:  form.subject.trim(),
        category: form.category,
        message:  form.message.trim(),
      });
      setSubmitted(res.data);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setApiError('');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl bg-[#1a6b8a]/10 flex items-center justify-center text-xl">📞</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
          <p className="text-sm text-gray-400">We'd love to hear from you</p>
        </div>
      </div>

      {/* Contact info cards */}
      <div className="mt-7 grid grid-cols-3 gap-4 mb-7">
        {[
          { icon: '📞', title: 'Phone',   val: '+91 98765 43210',           sub: 'Mon–Sat, 9 AM – 7 PM' },
          { icon: '📧', title: 'Email',   val: 'support@bramhaniflower.com', sub: 'Reply within 24 hours' },
          { icon: '📍', title: 'Address', val: 'Mumbai, Maharashtra',        sub: 'India - 400001' },
        ].map(c => (
          <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-[#1a6b8a]/30 hover:shadow-sm transition-all">
            <span className="text-2xl">{c.icon}</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-2">{c.title}</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{c.val}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Success state */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-lg font-bold text-green-700">Enquiry Submitted Successfully!</p>
          <p className="text-sm text-green-600 mt-1">Your reference number is:</p>
          <p className="text-base font-bold text-[#1a6b8a] mt-2 tracking-wide">{submitted.enquiryNumber}</p>
          <p className="text-sm text-green-600 mt-3">
            We have sent an acknowledgement to <strong>{submitted.email}</strong>.<br />
            Our team will get back to you within 24 hours.
          </p>
          <button
            onClick={handleReset}
            className="mt-5 text-sm text-[#1a6b8a] font-semibold hover:underline"
          >
            Send another enquiry
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-700">Send us a message</h3>
            {user && (
              <span className="text-[11px] text-[#1a6b8a] bg-[#1a6b8a]/8 border border-[#1a6b8a]/20 rounded-full px-3 py-1 font-medium">
                ✓ Logged in — details pre-filled
              </span>
            )}
          </div>

          {apiError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ❌ {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                placeholder="Your full name"
                maxLength={30}
                className={`${INPUT_CLS} ${errors.fullName ? 'border-red-400' : ''}`}
              />
              {errors.fullName && <p className={ERR_CLS}>{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="name@example.com"
                maxLength={255}
                className={`${INPUT_CLS} ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className={ERR_CLS}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`${INPUT_CLS} ${errors.phone ? 'border-red-400' : ''}`}
              />
              {errors.phone
                ? <p className={ERR_CLS}>{errors.phone}</p>
                : <p className="text-[11px] text-gray-400 mt-1">Enter 10 digits without country code</p>
              }
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Enquiry Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className={`${INPUT_CLS} bg-white ${errors.category ? 'border-red-400' : ''}`}
              >
                <option value="">Select a category</option>
                {ENQUIRY_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className={ERR_CLS}>{errors.category}</p>}
            </div>

            {/* Subject — full width */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                placeholder="Brief subject of your enquiry"
                maxLength={50}
                className={`${INPUT_CLS} ${errors.subject ? 'border-red-400' : ''}`}
              />
              {errors.subject && <p className={ERR_CLS}>{errors.subject}</p>}
            </div>

            {/* Message */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                rows={5}
                placeholder="Please describe your issue or question in detail..."
                className={`${INPUT_CLS} resize-none ${errors.message ? 'border-red-400' : ''}`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.message
                  ? <p className={ERR_CLS}>{errors.message}</p>
                  : <span />
                }
                <span className={`text-[11px] ${form.message.length > 4900 ? 'text-red-400' : 'text-gray-400'}`}>
                  {form.message.length}/5000
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#1a6b8a] hover:bg-[#155a75] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                'Send Message 📨'
              )}
            </button>
            <p className="text-[11px] text-gray-400">
              <span className="text-red-400">*</span> Required fields
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────

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
  const [allGallery, setAllGallery]         = useState([]);

  useEffect(() => {
    fetchGallery()
      .then(photos => setAllGallery(photos.map(p => ({
        src: p.imageUrl,
        name: p.name,
        desc: p.description,
        category: p.category,
      }))))
      .catch(err => console.error('Failed to load gallery:', err));
  }, []);

  const categories = [
    { key: 'All', label: 'All', icon: '🌺' },
    ...[...new Set(allGallery.map(g => g.category))].map(c => ({ key: c, label: c, icon: '🌸' })),
  ];

  const filtered = activeCategory === 'All'
    ? allGallery
    : allGallery.filter(g => g.category === activeCategory);

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
        {categories.map(cat => (
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
              {cat.key === 'All' ? allGallery.length : allGallery.filter(g => g.category === cat.key).length}
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
