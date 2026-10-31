import { useState, useRef, useEffect } from 'react';
import { submitReview, updateReview } from '../services/reviewService';

const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * WriteReviewForm — handles both creating a new review and editing an existing one.
 *
 * Props:
 *   productId       — required
 *   productName     — display only
 *   productImageUrl — display only
 *   orderItemId     — used on create to link the purchase
 *   existingReview  — if set, form starts pre-populated for edit mode
 *   onSuccess(data) — called with the saved review after success
 *   onCancel        — cancel button handler
 */
export default function WriteReviewForm({
  productId,
  productName,
  productImageUrl,
  orderItemId,
  existingReview,
  onSuccess,
  onCancel,
}) {
  const isEdit = !!existingReview;

  const [rating, setRating]       = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered]     = useState(0);
  const [title, setTitle]         = useState(existingReview?.title ?? '');
  const [text, setText]           = useState(existingReview?.reviewText ?? '');

  // Existing saved images shown in edit mode (from server)
  const [keptImages, setKeptImages]   = useState(existingReview?.images ?? []);
  // New local files the user picks
  const [newFiles, setNewFiles]       = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const fileInputRef                = useRef(null);

  const effectiveRating = hovered || rating;
  const totalImageCount = keptImages.length + newFiles.length;

  // Keep form in sync if existingReview changes (e.g. re-open after save)
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating ?? 0);
      setTitle(existingReview.title ?? '');
      setText(existingReview.reviewText ?? '');
      setKeptImages(existingReview.images ?? []);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [existingReview?.id]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - totalImageCount;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const toAdd = selected.slice(0, remaining);
    if (toAdd.some(f => !ALLOWED_TYPES.includes(f.type))) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (toAdd.some(f => f.size > 5 * 1024 * 1024)) {
      setError('Each image must be under 5 MB.');
      return;
    }
    setError('');
    setNewFiles(prev => [...prev, ...toAdd]);
    setNewPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeKept = (index) => setKeptImages(arr => arr.filter((_, i) => i !== index));

  const removeNew = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(arr => arr.filter((_, i) => i !== index));
    setNewPreviews(arr => arr.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (rating === 0) return 'Please select a star rating.';
    if (text.trim().length < 10) return 'Review must be at least 10 characters.';
    if (text.trim().length > 2000) return 'Review must not exceed 2000 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setSubmitting(true);

    const reviewData = {
      rating,
      title: title.trim() || undefined,
      reviewText: text.trim(),
      orderItemId: isEdit ? undefined : orderItemId,
    };

    // In edit mode the backend replaces ALL images with whatever we send.
    // We send only newFiles — kept images are re-uploaded would be wrong;
    // instead we don't send them and let the backend keep existing images if no new ones.
    // DESIGN: on edit, send newFiles only. Backend deletes old images and saves newFiles.
    // If user removed some kept images and added nothing, pass empty array → all images cleared.
    const filesToSend = newFiles;

    try {
      let data;
      if (isEdit) {
        data = await updateReview(productId, reviewData, filesToSend);
      } else {
        data = await submitReview(productId, reviewData, filesToSend);
      }
      setSuccess(true);
      setTimeout(() => onSuccess(data), 1600);
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-base font-bold text-gray-900 mb-1">
          {isEdit ? 'Review updated!' : 'Review published!'}
        </p>
        <p className="text-sm text-gray-500">
          {isEdit
            ? 'Your changes are now live on the product page.'
            : 'Your review is now live on the product page. Thank you!'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Product info */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
        {productImageUrl
          ? <img src={productImageUrl} alt={productName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
          : <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-2xl flex-shrink-0">🌸</div>
        }
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            {isEdit ? 'Editing review for' : 'Reviewing'}
          </p>
          <p className="text-sm font-bold text-gray-900">{productName}</p>
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${star} star`}
            >
              <span className={effectiveRating >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-gray-500 self-center ml-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Review Title <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={255}
          placeholder="Summarize your experience"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition"
        />
      </div>

      {/* Review text */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Share your experience with this product (min. 10 characters)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition resize-none"
        />
        <p className="text-[11px] text-gray-400 mt-1">{text.length}/2000</p>
      </div>

      {/* Images */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Photos <span className="text-gray-400 font-normal">(optional, max {MAX_IMAGES})</span>
        </label>

        {/* Existing saved images (edit mode) */}
        {keptImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {keptImages.map((img, i) => (
              <div key={img.id ?? i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#1a6b8a]/30 flex-shrink-0">
                <img src={img.mediaUrl} alt={`saved-${i}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[8px] text-white text-center py-0.5">saved</div>
                <button
                  type="button"
                  onClick={() => removeKept(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-red-600"
                  aria-label="Remove saved image"
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* New locally-picked images */}
        {newPreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-red-600"
                  aria-label="Remove image"
                >×</button>
              </div>
            ))}
          </div>
        )}

        {totalImageCount < MAX_IMAGES && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFiles}
              className="hidden"
              id="review-image-upload"
            />
            <label
              htmlFor="review-image-upload"
              className="inline-flex items-center gap-2 text-xs text-[#1a6b8a] font-semibold border border-[#1a6b8a]/30 rounded-xl px-4 py-2 cursor-pointer hover:bg-[#1a6b8a]/5 transition-colors"
            >
              📷 Add Photos ({totalImageCount}/{MAX_IMAGES})
            </label>
          </>
        )}

        {isEdit && (
          <p className="text-[11px] text-gray-400 mt-1.5">
            Note: saving will replace all existing photos with the ones you upload now. Remove saved photos above before saving if you want to clear them.
          </p>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#1a6b8a] hover:bg-[#155a75] disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {submitting
            ? (isEdit ? 'Saving…' : 'Submitting…')
            : (isEdit ? 'Save Changes' : 'Submit Review')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 border border-gray-200 text-gray-600 hover:border-gray-300 font-semibold rounded-xl text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
