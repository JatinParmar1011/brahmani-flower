const SAMPLE_REVIEWS = [
  { name: 'Priya S.',    rating: 5, date: '2 days ago',   text: 'Absolutely beautiful! The flowers were fresh and the arrangement was stunning. Delivered on time.',         avatar: 'P' },
  { name: 'Rahul M.',   rating: 5, date: '1 week ago',   text: 'Ordered for my wife\'s birthday. She loved it! Great quality and the packaging was very premium.',           avatar: 'R' },
  { name: 'Anita K.',   rating: 4, date: '2 weeks ago',  text: 'Very fresh flowers, lasted more than a week. Delivery was prompt. Will definitely order again.',             avatar: 'A' },
  { name: 'Vikram D.',  rating: 5, date: '3 weeks ago',  text: 'Exceeded expectations! The bouquet looked even better than the photo. Highly recommend.',                    avatar: 'V' },
];

const BARS = [
  { stars: 5, pct: 72 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 6  },
  { stars: 2, pct: 2  },
  { stars: 1, pct: 2  },
];

export default function DetailReviews({ rating, reviews }) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-5">Customer Reviews</h3>

      {/* Summary */}
      <div className="flex gap-8 mb-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-gray-900">{rating}</span>
          <div className="flex gap-0.5 my-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-base ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-gray-400">{reviews.toLocaleString()} reviews</span>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          {BARS.map(b => (
            <div key={b.stars} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4">{b.stars}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-7">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_REVIEWS.map(r => (
          <div key={r.name} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{r.name}</p>
                <p className="text-[10px] text-gray-400">{r.date}</p>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-xs ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
