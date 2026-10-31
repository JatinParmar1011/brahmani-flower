import { useState, useEffect, useCallback } from 'react';
import { fetchProductReviews, fetchReviewSummary } from '../../services/reviewService';

// ── Helpers ────────────────────────────────────────────────────────────────

function Stars({ value, size = 'text-base' }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`${size} ${s <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function VerifiedBadge() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" title="Verified Purchase">
      <path fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd" />
    </svg>
  );
}

// ── Review Modal — opens when user clicks a photo ──────────────────────────

function ReviewModal({ review, initialPhotoIndex = 0, onClose }) {
  const name     = review.customerName || 'Customer';
  const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const images   = review.images ?? [];
  const [photoIdx, setPhotoIdx] = useState(initialPhotoIndex);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  setPhotoIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setPhotoIdx(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, images.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-base font-bold text-gray-900">Review Details</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors">
            ×
          </button>
        </div>

        {/* Body — text left, photo slider right */}
        <div className={`p-6 flex gap-5 ${images.length > 0 ? 'flex-row' : 'flex-col'}`}>
          {/* Left: review content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  {review.verifiedPurchase && <VerifiedBadge />}
                </div>
                <p className="text-xs text-gray-400">
                  {formatDate(review.createdAt)}{review.deliveryCity ? `, ${review.deliveryCity}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <Stars value={review.rating} size="text-sm" />
                <span className="text-xs font-bold text-gray-700">{review.rating}/5</span>
              </div>
            </div>
            {review.title && <p className="text-base font-semibold text-gray-900 mb-2">{review.title}</p>}
            <p className="text-sm text-gray-700 leading-relaxed">{review.reviewText}</p>
          </div>

          {/* Right: photo slider */}
          {images.length > 0 && (
            <div className="w-56 flex-shrink-0 flex flex-col gap-2">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={images[photoIdx].mediaUrl} alt={`Photo ${photoIdx + 1}`} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-base transition-colors">‹</button>
                    <button onClick={() => setPhotoIdx(i => (i + 1) % images.length)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-base transition-colors">›</button>
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                      {photoIdx + 1}/{images.length}
                    </div>
                  </>
                )}
              </div>
              {/* Dot indicators only */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}
                      className={`rounded-full transition-all ${i === photoIdx ? 'w-4 h-2 bg-[#1a6b8a]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Individual review card — click photo opens modal ───────────────────────

function ReviewCard({ review, onPhotoClick }) {
  const name     = review.customerName || 'Customer';
  const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-gray-800 truncate">{name}</p>
            {review.verifiedPurchase && <VerifiedBadge />}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {formatDate(review.createdAt)}{review.deliveryCity ? `, ${review.deliveryCity}` : ''}
          </p>
        </div>
        <Stars value={review.rating} size="text-xs" />
      </div>
      {review.title && <p className="text-xs font-semibold text-gray-800 mb-1">{review.title}</p>}
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{review.reviewText}</p>
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.images.map((img, i) => (
            <button key={i} onClick={() => onPhotoClick(review, i)}
              className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 hover:opacity-90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#1a6b8a]/40"
              aria-label={`View photo ${i + 1}`}>
              <img src={img.mediaUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main DetailReviews ─────────────────────────────────────────────────────

export default function DetailReviews({ productId, rating: staticRating, reviews: staticCount, onViewAll }) {
  const [summary, setSummary]         = useState(null);
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState('');
  const [page, setPage]               = useState(0);
  const [hasMore, setHasMore]         = useState(false);

  // Modal: { review, photoIndex }
  const [modal, setModal] = useState(null);

  const loadSummary = useCallback(() => {
    if (!productId) return;
    fetchReviewSummary(productId).then(setSummary).catch(() => {});
  }, [productId]);

  const loadReviews = useCallback((p = 0, append = false) => {
    if (!productId) return;
    if (p === 0) setLoading(true); else setLoadingMore(true);
    fetchProductReviews(productId, p, 6)
      .then(data => {
        const items = data.content ?? [];
        setReviews(prev => append ? [...prev, ...items] : items);
        setPage(p);
        setHasMore(!data.last);
        setError('');
      })
      .catch(() => { if (p === 0) setError('Failed to load reviews.'); })
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, [productId]);

  useEffect(() => {
    loadSummary();
    loadReviews(0, false);
  }, [loadSummary, loadReviews]);

  const displayRating = summary?.averageRating ?? staticRating ?? 0;
  const displayCount  = summary?.totalReviews  ?? staticCount  ?? 0;
  const dist          = summary?.ratingDistribution ?? {};
  const barPct = (star) => displayCount > 0 ? Math.round(((dist[star] ?? 0) / displayCount) * 100) : 0;

  return (
    <>
      {/* Review modal */}
      {modal && (
        <ReviewModal
          review={modal.review}
          initialPhotoIndex={modal.photoIndex}
          onClose={() => setModal(null)}
        />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Customer Reviews</h3>
          {displayCount > 0 && onViewAll && (
            <button onClick={onViewAll} className="text-xs font-semibold text-[#1a6b8a] hover:underline flex items-center gap-1">
              View All {Number(displayCount).toLocaleString()} Reviews →
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="flex gap-8 mb-6 pb-6 border-b border-gray-100">
          <div className="flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-gray-900">
              {displayRating > 0 ? Number(displayRating).toFixed(1) : '—'}
            </span>
            <Stars value={displayRating} size="text-base" />
            <span className="text-xs text-gray-400 mt-1">{Number(displayCount).toLocaleString()} reviews</span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[5,4,3,2,1].map(star => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-4">{star}</span>
                <span className="text-yellow-400 text-xs">★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${barPct(star)}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-7">{barPct(star)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => loadReviews(0, false)} className="mt-2 text-xs text-[#1a6b8a] font-semibold hover:underline">
              Try again
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm font-medium text-gray-600">No reviews yet.</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onPhotoClick={(review, i) => setModal({ review, photoIndex: i })}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mt-5">
              {hasMore && (
                <button onClick={() => loadReviews(page + 1, true)} disabled={loadingMore}
                  className="text-sm text-[#1a6b8a] font-semibold border border-[#1a6b8a]/30 rounded-xl px-6 py-2.5 hover:bg-[#1a6b8a]/5 disabled:opacity-50 transition-colors">
                  {loadingMore ? 'Loading…' : 'Load More'}
                </button>
              )}
              {onViewAll && displayCount > 6 && (
                <button onClick={onViewAll}
                  className="text-sm text-white bg-[#1a6b8a] hover:bg-[#155a75] font-semibold rounded-xl px-6 py-2.5 transition-colors">
                  View All Reviews
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
