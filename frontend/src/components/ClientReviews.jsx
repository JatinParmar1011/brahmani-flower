import { useState, useEffect } from 'react';
import { fetchFeaturedReviews } from '../services/adminReviewService';

const VISIBLE = 3;

function Stars({ count }) {
  return (
    <div className="text-yellow-400 text-lg tracking-widest mb-3">
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </div>
  );
}

function ReviewCard({ review }) {
  const name     = review.customerName || 'Customer';
  const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();

  // Pick a consistent colour from name hash
  const COLORS = ['#388e3c', '#c2185b', '#e53935', '#7b1fa2', '#1565c0', '#e65100', '#00838f', '#6a1b9a'];
  const color  = COLORS[name.charCodeAt(0) % COLORS.length];

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 pt-6 pb-5 relative flex flex-col items-center text-center">
      <span className="absolute top-3 left-4 text-5xl text-gray-200 font-serif leading-none">"</span>

      {/* Avatar */}
      <div
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 flex-shrink-0"
        style={{ background: color }}
      >
        {initials}
      </div>

      <Stars count={review.rating} />

      {/* Review title */}
      {review.title && (
        <p className="text-xs font-semibold text-gray-800 mb-1">{review.title}</p>
      )}

      {/* Review text — truncated to 2 lines */}
      <p className="text-sm text-gray-500 leading-relaxed mb-2 line-clamp-3">{review.reviewText}</p>

      {/* Product name */}
      <p className="text-[11px] text-[#1a6b8a] font-medium mb-2">📦 {review.productName}</p>

      {/* Review images */}
      {review.images?.length > 0 && (
        <div className="flex gap-1.5 justify-center mb-2 flex-wrap">
          {review.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img.mediaUrl}
              alt={`Review photo ${i + 1}`}
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-0.5 mt-auto">
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-xs text-gray-700 font-semibold">{name}</p>
          {review.verifiedPurchase && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className="w-3.5 h-3.5 text-blue-500" title="Verified Purchase">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd" />
            </svg>
          )}
        </div>
        {(review.createdAt || review.deliveryCity) && (
          <p className="text-[10px] text-gray-400">
            {review.createdAt
              ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : ''}
            {review.deliveryCity ? `, ${review.deliveryCity}` : ''}
          </p>
        )}
      </div>

      <span className="absolute bottom-3 right-4 text-5xl text-gray-200 font-serif leading-none">"</span>
    </div>
  );
}

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [start, setStart]     = useState(0);

  useEffect(() => {
    fetchFeaturedReviews()
      .then(data => { setReviews(data ?? []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mt-2.5 rounded" />
      </div>
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (error || reviews.length === 0) return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mt-2.5 rounded" />
      </div>
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-2">💬</div>
        <p className="text-sm font-medium text-gray-600">
          {error ? 'Reviews temporarily unavailable.' : 'No featured reviews yet.'}
        </p>
      </div>
    </div>
  );

  const canPrev = start > 0;
  const canNext = start < reviews.length - VISIBLE;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        <div className="w-14 h-0.5 bg-[#d4a96a] mx-auto mt-2.5 rounded" />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setStart(s => Math.max(0, s - 1))}
          disabled={!canPrev}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors cursor-pointer"
        >‹</button>

        <div className="grid grid-cols-3 gap-5 flex-1">
          {reviews.slice(start, start + VISIBLE).map(r => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>

        <button
          onClick={() => setStart(s => Math.min(reviews.length - VISIBLE, s + 1))}
          disabled={!canNext}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors cursor-pointer"
        >›</button>
      </div>

      {/* Dot indicators */}
      {reviews.length > VISIBLE && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: reviews.length - VISIBLE + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setStart(i)}
              className={`rounded-full transition-all ${i === start ? 'w-5 h-2 bg-[#d4a96a]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
