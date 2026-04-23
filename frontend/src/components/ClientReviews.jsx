import { useState } from 'react';

const reviews = [
  { name: 'Naveen Kumar',      initial: 'N', color: '#388e3c', rating: 5, text: 'This is a genuine review guys by a real person who ordered the products. I am writing this because now a days all the reviews are fake and paid ones which we...' },
  { name: 'Alina Kallarackal', initial: 'A', color: '#c2185b', rating: 5, text: 'I placed an order for my mother who is in hospital in Kerala from the UK and I received such incredible customer support. They were very friendly,...' },
  { name: 'Henry Gomes',       initial: 'H', color: '#e53935', rating: 5, text: 'I am impressed with the timely delivery and the quality of the products.' },
  { name: 'Priya Sharma',      initial: 'P', color: '#7b1fa2', rating: 5, text: 'Beautiful flowers, delivered on time. My wife was absolutely delighted. Will definitely order again for special occasions!' },
  { name: 'Rahul Mehta',       initial: 'R', color: '#1565c0', rating: 5, text: 'Excellent service! The bouquet was fresh and exactly as shown in the picture. Packaging was also very neat and professional.' },
  { name: 'Sunita Patel',      initial: 'S', color: '#e65100', rating: 5, text: 'Ordered a cake and flowers combo for my parents anniversary. They loved it! Great quality and super fast delivery.' },
];

const VISIBLE = 3;

export default function ClientReviews() {
  const [start, setStart] = useState(0);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mt-2.5 rounded" />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setStart(s => Math.max(0, s - 1))}
          disabled={start === 0}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors cursor-pointer"
        >‹</button>

        <div className="grid grid-cols-3 gap-5 flex-1">
          {reviews.slice(start, start + VISIBLE).map((r, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl px-6 pt-6 pb-5 relative flex flex-col items-center text-center">
              <span className="absolute top-3 left-4 text-5xl text-gray-200 font-serif leading-none">"</span>
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3"
                style={{ background: r.color, width: 52, height: 52 }}
              >
                {r.initial}
              </div>
              <div className="text-yellow-400 text-lg tracking-widest mb-3">{'★'.repeat(r.rating)}</div>
              <p className="text-sm text-gray-500 leading-relaxed mb-2">{r.text}</p>
              <a href="#" className="text-xs text-[#1a6b8a] mb-3">Read more</a>
              <p className="text-xs text-gray-700 font-semibold">Buyer Name : {r.name}</p>
              <span className="absolute bottom-3 right-4 text-5xl text-gray-200 font-serif leading-none">"</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStart(s => Math.min(reviews.length - VISIBLE, s + 1))}
          disabled={start >= reviews.length - VISIBLE}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors cursor-pointer"
        >›</button>
      </div>
    </div>
  );
}
