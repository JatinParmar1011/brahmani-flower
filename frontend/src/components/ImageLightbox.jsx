import { useEffect, useCallback } from 'react';

/**
 * ImageLightbox — full-screen image viewer with prev/next navigation.
 *
 * Props:
 *   images   — array of { mediaUrl, alt? }
 *   index    — currently visible index
 *   onClose  — close handler
 *   onChange — (newIndex) => void
 */
export default function ImageLightbox({ images, index, onClose, onChange }) {
  const total = images?.length ?? 0;

  const prev = useCallback(() => onChange((index - 1 + total) % total), [index, total, onChange]);
  const next = useCallback(() => onChange((index + 1) % total), [index, total, onChange]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!images || total === 0) return null;

  const current = images[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
        aria-label="Close"
      >
        ×
      </button>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
          {index + 1} / {total}
        </div>
      )}

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-2xl transition-colors z-10"
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.mediaUrl}
          alt={current.alt ?? `Review image ${index + 1}`}
          className="max-w-full max-h-[85vh] rounded-xl object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-2xl transition-colors z-10"
          aria-label="Next image"
        >
          ›
        </button>
      )}

      {/* Thumbnail strip (if multiple images) */}
      {total > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                i === index ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-90'
              }`}
              aria-label={`Go to image ${i + 1}`}
            >
              <img src={img.mediaUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
