import { useState, useEffect, useCallback } from 'react';
import { fetchProductReviews, fetchReviewSummary } from '../services/reviewService';

// ── Helpers ────────────────────────────────────────────────────────────────

function Stars({ value, size = 'text-sm' }) {
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

          {/* Left: review text */}
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
              {/* Main photo */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={images[photoIdx].mediaUrl} alt={`Photo ${photoIdx + 1}`} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-base transition-colors">
                      ‹
                    </button>
                    <button onClick={() => setPhotoIdx(i => (i + 1) % images.length)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-base transition-colors">
                      ›
                    </button>
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

// ── Review card — click photo to open modal ────────────────────────────────

function ReviewCard({ review, onPhotoClick }) {
  const name     = review.customerName || 'Customer';
  const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#1a6b8a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
            {review.verifiedPurchase && <VerifiedBadge />}
          </div>
          <p className="text-[11px] text-gray-400">
            {formatDate(review.createdAt)}{review.deliveryCity ? `, ${review.deliveryCity}` : ''}
          </p>
        </div>
        <Stars value={review.rating} size="text-sm" />
      </div>
      {review.title && <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.reviewText}</p>
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.images.map((img, i) => (
            <button key={i} onClick={() => onPhotoClick(review, i)}
              className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 hover:scale-105 hover:border-[#1a6b8a]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#1a6b8a]/40"
              aria-label={`View photo ${i + 1}`}>
              <img src={img.mediaUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sort options ───────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'createdAt,asc',  label: 'Oldest First' },
  { value: 'rating,desc',    label: 'Highest Rating' },
  { value: 'rating,asc',     label: 'Lowest Rating' },
];

const PAGE_SIZE = 10;

// ── Main ReviewsPage ───────────────────────────────────────────────────────

export default function ReviewsPage({ product, categoryName, onBack }) {
  const productId   = product?.id;
  const productName = product?.name ?? 'Product';

  const [summary, setSummary]             = useState(null);
  const [reviews, setReviews]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [sort, setSort]                   = useState('createdAt,desc');
  const [filterStar, setFilterStar]       = useState(0);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal: { review, photoIndex }
  const [modal, setModal] = useState(null);

  // Summary
  useEffect(() => {
    if (!productId) return;
    fetchReviewSummary(productId).then(setSummary).catch(() => {});
  }, [productId]);

  // Load reviews
  const loadReviews = useCallback((p = 0, sortOverride) => {
    if (!productId) return;
    setLoading(true);
    setError('');
    const s = sortOverride ?? sort;
    fetchProductReviews(productId, p, PAGE_SIZE, s)
      .then(data => {
        setReviews(data.content ?? []);
        setPage(p);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      })
      .catch(() => setError('Failed to load reviews. Please try again.'))
      .finally(() => setLoading(false));
  }, [productId, sort]);

  useEffect(() => { loadReviews(0); }, [productId]); // eslint-disable-line

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setFilterStar(0);
    loadReviews(0, newSort);
  };

  const filtered = filterStar > 0 ? reviews.filter(r => r.rating === filterStar) : reviews;

  const avg   = summary?.averageRating ?? product?.rating ?? 0;
  const total = summary?.totalReviews  ?? product?.reviewCount ?? 0;
  const dist  = summary?.ratingDistribution ?? {};
  const barPct = (s) => total > 0 ? Math.round(((dist[s] ?? 0) / total) * 100) : 0;

  return (
    <>
      {/* Review detail modal */}
      {modal && (
        <ReviewModal
          review={modal.review}
          initialPhotoIndex={modal.photoIndex}
          onClose={() => setModal(null)}
        />
      )}

      <div className="max-w-[1300px] mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors font-medium cursor-pointer">Home</button>
          {categoryName && (
            <>
              <span>/</span>
              <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors font-medium cursor-pointer">{categoryName}</button>
            </>
          )}
          <span>/</span>
          <button onClick={onBack} className="hover:text-[#1a6b8a] transition-colors font-medium cursor-pointer truncate max-w-[200px]">{productName}</button>
          <span>/</span>
          <span className="text-gray-700 font-semibold">All Reviews</span>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="w-64 flex-shrink-0 sticky top-[120px] flex flex-col gap-4">

            {/* Product card — same style as home/category page */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Product image */}
              <div className="relative h-44 bg-gray-50 overflow-hidden">
                {product?.imageUrl ? (
                  <img src={product.imageUrl} alt={productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🌸</div>
                )}
                {product?.tag && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-[#1a6b8a] px-2 py-0.5 rounded-full">
                    {product.tag}
                  </span>
                )}
              </div>
              {/* Product info */}
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">{productName}</p>
                {product?.price && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                )}
                {(avg > 0 || total > 0) && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="bg-green-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      ⭐ {Number(avg).toFixed(1)}
                    </span>
                    <span className="text-xs text-[#1a6b8a]">({Number(total).toLocaleString()} Reviews)</span>
                  </div>
                )}
                <button
                  onClick={onBack}
                  className="w-full bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  View Product
                </button>
              </div>
            </div>

            {/* Rating breakdown + star filter */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Rating Breakdown</p>
              <div className="flex flex-col items-center mb-4">
                <span className="text-5xl font-extrabold text-gray-900 leading-none">
                  {avg > 0 ? Number(avg).toFixed(1) : '—'}
                </span>
                <Stars value={avg} size="text-lg" />
                <span className="text-xs text-gray-400 mt-1">{Number(total).toLocaleString()} reviews</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[5,4,3,2,1].map(s => (
                  <button key={s} onClick={() => setFilterStar(filterStar === s ? 0 : s)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors text-left w-full ${
                      filterStar === s ? 'bg-[#1a6b8a]/10 ring-1 ring-[#1a6b8a]/30' : 'hover:bg-gray-50'
                    }`}>
                    <span className="text-xs text-gray-500 w-3">{s}</span>
                    <span className="text-yellow-400 text-xs">★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${filterStar === s ? 'bg-[#1a6b8a]' : 'bg-yellow-400'}`}
                        style={{ width: `${barPct(s)}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-6 text-right">{dist[s] ?? 0}</span>
                  </button>
                ))}
              </div>
              {filterStar > 0 && (
                <button onClick={() => setFilterStar(0)}
                  className="mt-3 w-full text-xs text-red-500 font-semibold border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors">
                  ✕ Clear Filter
                </button>
              )}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Header + sort */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Customer Reviews</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {productName}
                  {filterStar > 0 && (
                    <span className="ml-2 text-[#1a6b8a] font-medium">· {filterStar}★ only ({filtered.length} shown)</span>
                  )}
                </p>
              </div>
              <select value={sort} onChange={e => handleSortChange(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 bg-white transition cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Reviews */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-sm text-red-500 mb-3">{error}</p>
                <button onClick={() => loadReviews(page)} className="text-sm text-[#1a6b8a] font-semibold hover:underline">Try again</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <div className="text-4xl mb-3">💬</div>
                {reviews.length === 0 ? (
                  <>
                    <p className="text-sm font-medium text-gray-700">No reviews yet</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to review this product!</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">No {filterStar}★ reviews on this page</p>
                    <button onClick={() => setFilterStar(0)} className="mt-3 text-xs text-[#1a6b8a] font-semibold hover:underline">Show all</button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {filtered.map(r => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      onPhotoClick={(review, i) => setModal({ review, photoIndex: i })}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button onClick={() => loadReviews(page - 1)} disabled={page === 0 || loading}
                      className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                      ← Prev
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let p;
                        if (totalPages <= 7) {
                          p = i;
                        } else {
                          const slots = [0, null, null, null, null, null, totalPages - 1];
                          if (page <= 3) { slots[1]=1; slots[2]=2; slots[3]=3; slots[4]=4; slots[5]=5; }
                          else if (page >= totalPages - 4) { slots[1]=totalPages-6; slots[2]=totalPages-5; slots[3]=totalPages-4; slots[4]=totalPages-3; slots[5]=totalPages-2; }
                          else { slots[1]=page-2; slots[2]=page-1; slots[3]=page; slots[4]=page+1; slots[5]=page+2; }
                          p = slots[i] ?? 0;
                        }
                        return (
                          <button key={i} onClick={() => loadReviews(p)}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                              p === page ? 'bg-[#1a6b8a] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#1a6b8a] hover:text-[#1a6b8a]'
                            }`}>
                            {p + 1}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => loadReviews(page + 1)} disabled={page >= totalPages - 1 || loading}
                      className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                      Next →
                    </button>
                  </div>
                )}
                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing {reviews.length} of {totalElements} reviews
                </p>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
