import { useState, useEffect, useCallback } from 'react';
import {
  adminFetchApprovedReviews,
  adminFetchAllReviews,
  adminFetchFeaturedReviews,
  adminToggleFeatured,
  adminUpdateFeaturedOrder,
  adminModerateReview,
} from '../../services/adminReviewService';

// ── Shared helpers ─────────────────────────────────────────────────────────

function Stars({ value }) {
  return <span className="text-yellow-400 text-sm">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>;
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const cls = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700';
  return (
    <div className={`fixed bottom-6 right-6 z-50 border rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${cls}`}>
      {type === 'error' ? '❌' : '✅'} {msg}
    </div>
  );
}

const STATUS_STYLES = {
  APPROVED: 'text-green-700 bg-green-50 border-green-200',
  REJECTED: 'text-red-700 bg-red-50 border-red-200',
  HIDDEN:   'text-gray-600 bg-gray-100 border-gray-200',
  PENDING:  'text-amber-700 bg-amber-50 border-amber-200',
};
const STATUS_ICONS = { APPROVED: '✅', REJECTED: '❌', HIDDEN: '🙈', PENDING: '⏳' };

// ── Confirmation / Reason dialog ───────────────────────────────────────────

function ConfirmDialog({ action, reviewName, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const needsReason = action === 'REJECT' || action === 'HIDE';
  const config = {
    REJECT:  { title: 'Reject Review',         color: 'bg-red-600 hover:bg-red-700',     label: 'Reject' },
    HIDE:    { title: 'Hide Review',            color: 'bg-gray-600 hover:bg-gray-700',   label: 'Hide' },
    APPROVE: { title: 'Restore Review',         color: 'bg-green-600 hover:bg-green-700', label: 'Restore to Approved' },
  }[action];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-1">{config.title}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {action === 'APPROVE'
            ? `Restore "${reviewName}" to APPROVED? It will be publicly visible again.`
            : `${action === 'REJECT' ? 'Reject' : 'Hide'} "${reviewName}"? It will be removed from public view.`}
        </p>

        {needsReason && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Reason <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={`Reason for ${action.toLowerCase()}ing this review…`}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 resize-none transition"
            />
            <p className="text-[11px] text-gray-400 mt-1">{reason.length}/500</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            className={`flex-1 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors ${config.color}`}
          >
            {config.label}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Featured review card ───────────────────────────────────────────────────

function FeaturedCard({ review, index, total, onMoveUp, onMoveDown, onRemove, saving }) {
  return (
    <div className="bg-white border border-[#1a6b8a]/20 rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
      {/* Order + move controls */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#1a6b8a] text-white flex items-center justify-center text-xs font-bold">
          {review.featuredOrder ?? index + 1}
        </div>
        <button onClick={onMoveUp} disabled={index === 0 || saving}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs disabled:opacity-30 transition-colors" title="Move up">↑</button>
        <button onClick={onMoveDown} disabled={index === total - 1 || saving}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs disabled:opacity-30 transition-colors" title="Move down">↓</button>
      </div>

      {/* Product image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
        {review.productImageUrl
          ? <img src={review.productImageUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + blue verified tick */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-bold text-gray-900 truncate">{review.customerName}</p>
          {review.verifiedPurchase && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" title="Verified Purchase">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd" />
            </svg>
          )}
        </div>
        {/* Row 2: product · date · city */}
        <p className="text-[11px] text-gray-400 mb-1.5 truncate">
          {review.productName}
          {review.createdAt ? ` · ${formatDate(review.createdAt)}` : ''}
          {review.deliveryCity ? ` · ${review.deliveryCity}` : ''}
        </p>
        {/* Title + review text */}
        {review.title && <p className="text-xs font-semibold text-gray-700 mb-0.5">{review.title}</p>}
        <p className="text-xs text-gray-500 line-clamp-2">{review.reviewText}</p>
        {/* Review images */}
        {review.images?.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {review.images.slice(0, 3).map((img, i) => (
              <img key={i} src={img.mediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
            ))}
            {review.images.length > 3 && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-200">+{review.images.length - 3}</div>
            )}
          </div>
        )}
      </div>

      {/* Right side: stars + remove button stacked */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <Stars value={review.rating} />
        <button onClick={() => onRemove(review.id)} disabled={saving}
          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center text-sm transition-colors disabled:opacity-40" title="Remove from featured">
          ×
        </button>
      </div>
    </div>
  );
}

// ── All-reviews row with moderation actions ────────────────────────────────

function ReviewRow({ review, onFeature, onModerate, saving }) {
  const statusStyle = STATUS_STYLES[review.status] || 'text-gray-600 bg-gray-100 border-gray-200';
  const statusIcon  = STATUS_ICONS[review.status] || '?';

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
      {/* Product image (no avatar initials) */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 mt-0.5">
        {review.productImageUrl
          ? <img src={review.productImageUrl} alt="" className="w-full h-full object-cover" />
          : <span className="text-lg flex items-center justify-center h-full">🌸</span>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-semibold text-gray-800 truncate">{review.customerName}</p>
          {/* Blue verified tick inline (SVG, no pill badge) */}
          {review.verifiedPurchase && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" title="Verified Purchase">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd" />
            </svg>
          )}
          <Stars value={review.rating} />
          {review.featured && (
            <span className="text-[9px] text-[#1a6b8a] bg-[#1a6b8a]/10 px-1.5 py-0.5 rounded-full border border-[#1a6b8a]/20 font-semibold">⭐ Featured</span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{review.productName} · {formatDate(review.createdAt)}{review.deliveryCity ? ` · ${review.deliveryCity}` : ''}</p>
        {review.title && <p className="text-xs font-medium text-gray-700 truncate">{review.title}</p>}
        <p className="text-xs text-gray-500 line-clamp-1">{review.reviewText}</p>
        {/* Moderation info — only for HIDDEN/REJECTED */}
        {(review.status === 'REJECTED' || review.status === 'HIDDEN') && (
          <div className="mt-1 space-y-0.5">
            {review.moderationReason && (
              <p className="text-[10px] text-gray-400 italic">Reason: {review.moderationReason}</p>
            )}
            {review.moderatedAt && (
              <p className="text-[10px] text-gray-400">
                Moderated: {formatDate(review.moderatedAt)}
                {review.moderatedByName ? ` by ${review.moderatedByName}` : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
          {statusIcon} {review.status}
        </span>

        <div className="flex gap-1.5 flex-wrap justify-end">
          {/* Feature / unfeature — only for APPROVED */}
          {review.status === 'APPROVED' && (
            review.featured ? (
              <button onClick={() => onFeature(review.id, false)} disabled={saving}
                className="text-[10px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                Unfeature
              </button>
            ) : (
              <button onClick={() => onFeature(review.id, true)} disabled={saving}
                className="text-[10px] font-semibold text-[#1a6b8a] bg-[#1a6b8a]/10 hover:bg-[#1a6b8a]/20 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                + Feature
              </button>
            )
          )}

          {/* Moderation actions */}
          {review.status === 'APPROVED' && (
            <>
              <button onClick={() => onModerate(review, 'HIDE')} disabled={saving}
                className="text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                🙈 Hide
              </button>
              <button onClick={() => onModerate(review, 'REJECT')} disabled={saving}
                className="text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
                ❌ Reject
              </button>
            </>
          )}
          {review.status === 'HIDDEN' && (
            <button onClick={() => onModerate(review, 'APPROVE')} disabled={saving}
              className="text-[10px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-40">
              ✅ Restore
            </button>
          )}
          {review.status === 'REJECTED' && (
            <span className="text-[10px] text-red-400 font-medium italic">Permanently rejected</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── STATUS TAB COUNTS ──────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'ALL',      label: 'All',      icon: '📋' },
  { key: 'APPROVED', label: 'Approved', icon: '✅' },
  { key: 'HIDDEN',   label: 'Hidden',   icon: '🙈' },
  { key: 'REJECTED', label: 'Rejected', icon: '❌' },
];

// ── Main AdminReviews ──────────────────────────────────────────────────────

export default function AdminReviews() {
  const [activeTab, setActiveTab]   = useState('APPROVED');
  const [featured, setFeatured]     = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [loadingFeat, setLoadingFeat] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState({ msg: '', type: 'success' });
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [orderDirty, setOrderDirty] = useState(false);
  const [starFilter, setStarFilter] = useState(0); // 0 = all stars

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState(null); // { review, action }

  const PAGE_SIZE = 20;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const loadFeatured = useCallback(() => {
    setLoadingFeat(true);
    adminFetchFeaturedReviews()
      .then(setFeatured)
      .catch(() => showToast('Failed to load featured reviews', 'error'))
      .finally(() => setLoadingFeat(false));
  }, []);

  const loadReviews = useCallback((p = 0, tab = activeTab) => {
    setLoadingReviews(true);
    const fetch = tab === 'ALL'
      ? adminFetchAllReviews(p, PAGE_SIZE)
      : adminFetchApprovedReviews(p, PAGE_SIZE, tab);
    fetch
      .then(data => {
        setReviews(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setPage(p);
      })
      .catch(() => showToast('Failed to load reviews', 'error'))
      .finally(() => setLoadingReviews(false));
  }, [activeTab]);

  useEffect(() => {
    loadFeatured();
    loadReviews(0, activeTab);
  }, []); // eslint-disable-line

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStarFilter(0);
    loadReviews(0, tab);
  };

  // Feature / unfeature
  const handleFeature = async (reviewId, feature) => {
    setSaving(true);
    try {
      await adminToggleFeatured(reviewId, feature);
      showToast(feature ? 'Review added to featured.' : 'Review removed from featured.');
      loadFeatured();
      loadReviews(page, activeTab);
    } catch (e) {
      showToast(e.message || 'Failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Show confirmation dialog
  const handleModerate = (review, action) => {
    setConfirmState({ review, action });
  };

  // Execute moderation after confirmation
  const executeModerate = async (reason) => {
    const { review, action } = confirmState;
    setConfirmState(null);
    setSaving(true);
    try {
      await adminModerateReview(review.id, action, reason);
      const msgs = { REJECT: 'Review rejected.', HIDE: 'Review hidden.', APPROVE: 'Review restored to approved.' };
      showToast(msgs[action]);
      loadFeatured();
      loadReviews(page, activeTab);
    } catch (e) {
      showToast(e.message || 'Moderation failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Move featured order
  const moveOrder = (index, direction) => {
    const newList = [...featured];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[index], newList[swapIdx]] = [newList[swapIdx], newList[index]];
    setFeatured(newList.map((r, i) => ({ ...r, featuredOrder: i + 1 })));
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const orders = featured.map((r, i) => ({ reviewId: r.id, featuredOrder: i + 1 }));
      await adminUpdateFeaturedOrder(orders);
      showToast('Featured order saved.');
      setOrderDirty(false);
      loadFeatured();
    } catch (e) {
      showToast(e.message || 'Failed to save order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFeatured = async (reviewId) => {
    setSaving(true);
    try {
      await adminToggleFeatured(reviewId, false);
      showToast('Review removed from featured.');
      setOrderDirty(false);
      loadFeatured();
      loadReviews(page, activeTab);
    } catch (e) {
      showToast(e.message || 'Failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toast msg={toast.msg} type={toast.type} />

      {confirmState && (
        <ConfirmDialog
          action={confirmState.action}
          reviewName={confirmState.review.customerName + '\'s review'}
          onConfirm={executeModerate}
          onCancel={() => setConfirmState(null)}
        />
      )}

      <div className="flex flex-col gap-6">

        {/* ── Featured Reviews panel ───────────────────────────────────────── */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">⭐ Featured Reviews</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Shown in "What Our Customers Say" on the homepage.
                {featured.length > 0 && <span className="ml-1 font-semibold text-[#1a6b8a]">{featured.length} featured</span>}
              </p>
            </div>
            {orderDirty && (
              <button onClick={handleSaveOrder} disabled={saving}
                className="bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                {saving ? 'Saving…' : '💾 Save Order'}
              </button>
            )}
          </div>
          <div className="p-6">
            {loadingFeat ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : featured.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">⭐</div>
                <p className="text-sm font-medium text-gray-600">No featured reviews yet</p>
                <p className="text-xs mt-1">Feature approved reviews from the list below.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {featured.map((r, idx) => (
                  <FeaturedCard key={r.id} review={r} index={idx} total={featured.length}
                    onMoveUp={() => moveOrder(idx, -1)} onMoveDown={() => moveOrder(idx, 1)}
                    onRemove={handleRemoveFeatured} saving={saving} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── All Reviews panel with moderation ───────────────────────────── */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-gray-800">All Reviews</h2>
                <p className="text-xs text-gray-400 mt-0.5">Moderate reviews: reject, hide, or restore.</p>
              </div>
              {/* Filters — Rating + Status dropdowns, AdminProducts style */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                  <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2 whitespace-nowrap">Rating</span>
                  <select
                    value={starFilter}
                    onChange={e => setStarFilter(Number(e.target.value))}
                    className="px-3 py-2 text-sm outline-none bg-white cursor-pointer"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={5}>5 ★★★★★</option>
                    <option value={4}>4 ★★★★☆</option>
                    <option value={3}>3 ★★★☆☆</option>
                    <option value={2}>2 ★★☆☆☆</option>
                    <option value={1}>1 ★☆☆☆☆</option>
                  </select>
                </div>
                <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                  <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2 whitespace-nowrap">Status</span>
                  <select
                    value={activeTab}
                    onChange={e => handleTabChange(e.target.value)}
                    className="px-3 py-2 text-sm outline-none bg-white cursor-pointer"
                  >
                    <option value="ALL">All</option>
                    <option value="APPROVED">Approved</option>
                    <option value="HIDDEN">Hidden</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            {loadingReviews ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No {activeTab === 'ALL' ? '' : activeTab.toLowerCase() + ' '}reviews found.</p>
              </div>
            ) : (() => {
              const filteredReviews = starFilter > 0 ? reviews.filter(r => r.rating === starFilter) : reviews;
              return (
                <>
                  {filteredReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No {starFilter}★ reviews on this page.</p>
                      <button onClick={() => setStarFilter(0)} className="mt-2 text-xs text-[#1a6b8a] font-semibold hover:underline">Show all</button>
                    </div>
                  ) : (
                    <div>
                      {filteredReviews.map(r => (
                        <ReviewRow key={r.id} review={r}
                          onFeature={(id, feat) => handleFeature(id, feat)}
                          onModerate={handleModerate}
                          saving={saving} />
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-5">
                      <button onClick={() => loadReviews(page - 1, activeTab)} disabled={page === 0 || loadingReviews}
                        className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                        ← Prev
                      </button>
                      <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                      <button onClick={() => loadReviews(page + 1, activeTab)} disabled={page >= totalPages - 1 || loadingReviews}
                        className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                        Next →
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>

      </div>
    </>
  );
}
