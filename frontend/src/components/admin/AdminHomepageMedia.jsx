import { useState, useEffect, useRef } from 'react';
import {
  HOMEPAGE_SECTIONS,
  adminFetchHomepageMedia,
  adminCreateHomepageMedia,
  adminUpdateHomepageMedia,
  adminDeleteHomepageMedia,
} from '../../services/homepageMediaService';

const SLIDER_SLOTS = 5;
const SPOTLIGHT_SLOTS = 8;

// ── A single media slot: shows the current image/video (or an empty dropzone),
//    lets the admin pick/replace the file, edit the title, save, or delete.
//    mediaType: 'image' (default) or 'video'. ──
function MediaSlot({ section, slotLabel, existing, displayOrder, onChanged, mediaType = 'image' }) {
  const isVideo = mediaType === 'video';
  const [title, setTitle] = useState(existing?.title || '');
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(existing?.mediaUrl || null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  // Re-sync when the backing record changes (after reload).
  useEffect(() => {
    setTitle(existing?.title || '');
    setPreview(existing?.mediaUrl || null);
    setMediaFile(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }, [existing?.id, existing?.mediaUrl, existing?.title]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError('');
    if (!existing && !mediaFile) { setError(`Please choose a ${isVideo ? 'video' : 'image'} first.`); return; }
    setSaving(true);
    try {
      const payload = { section, title, displayOrder, status: 'ACTIVE', mediaFile };
      if (existing) {
        await adminUpdateHomepageMedia(existing.id, payload);
      } else {
        await adminCreateHomepageMedia(payload);
      }
      await onChanged();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!window.confirm(`Remove this ${isVideo ? 'video' : 'image'}?`)) return;
    setDeleting(true);
    try {
      await adminDeleteHomepageMedia(existing.id);
      await onChanged();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const dirty = !!mediaFile
    || title !== (existing?.title || '');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-600">{slotLabel}</span>
        {existing
          ? <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Saved</span>
          : <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Empty</span>}
      </div>

      {/* Dropzone / preview */}
      <div
        className="relative w-full h-32 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1a6b8a] transition-colors flex items-center justify-center bg-gray-50"
        onClick={() => fileRef.current.click()}
      >
        {preview ? (
          isVideo ? (
            <video src={preview} className="w-full h-full object-cover" muted playsInline />
          ) : (
            <img src={preview} alt={slotLabel} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-1">{isVideo ? '🎬' : '📷'}</div>
            <p className="text-[11px]">Click to upload</p>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Change {isVideo ? 'Video' : 'Image'}</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept={isVideo ? 'video/*' : 'image/*'} className="hidden" onChange={handleFile} />

      {/* Optional text fields */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20"
      />

      {error && <p className="text-[11px] text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || (!existing && !mediaFile) || (existing && !dirty)}
          className="flex-1 bg-[#1a6b8a] hover:bg-[#155a75] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : existing ? 'Update' : 'Save'}
        </button>
        {existing && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            {deleting ? '…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function AdminHomepageMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    adminFetchHomepageMedia()
      .then(setMedia)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { setLoading(true); load(); }, []);

  const bySection = (section) =>
    media
      .filter(i => i.section === section)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id);

  const sliderImages = bySection(HOMEPAGE_SECTIONS.SLIDER);
  const cityImage = bySection(HOMEPAGE_SECTIONS.CITY_DELIVERY)[0] || null;
  const advertiseImage = bySection(HOMEPAGE_SECTIONS.ADVERTISE)[0] || null;
  const spotlightVideos = bySection(HOMEPAGE_SECTIONS.SPOTLIGHT);

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      {/* ── Section 1: Slider Bar (5 boxes) ──────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">Slider Bar</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Upload up to {SLIDER_SLOTS} hero slider images. These replace the homepage hero slides.
          </p>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: SLIDER_SLOTS }).map((_, idx) => (
            <MediaSlot
              key={sliderImages[idx]?.id ?? `slider-empty-${idx}`}
              section={HOMEPAGE_SECTIONS.SLIDER}
              slotLabel={`Slide ${idx + 1}`}
              existing={sliderImages[idx] || null}
              displayOrder={idx + 1}
              onChanged={load}
            />
          ))}
        </div>
      </section>

      {/* ── Section 2: City Delivery (1 box) ─────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">City Delivery</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            One image for the “Now Delivering in Your City” banner.
          </p>
        </div>
        <div className="px-6 py-5 max-w-xs">
          <MediaSlot
            key={cityImage?.id ?? 'city-empty'}
            section={HOMEPAGE_SECTIONS.CITY_DELIVERY}
            slotLabel="City Delivery Image"
            existing={cityImage}
            displayOrder={1}
            onChanged={load}
          />
        </div>
      </section>

      {/* ── Section 3: Advertise (1 box) ─────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">Advertise</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            One image for the promo / advertise banner (replaces the “20% OFF*” block).
          </p>
        </div>
        <div className="px-6 py-5 max-w-xs">
          <MediaSlot
            key={advertiseImage?.id ?? 'advertise-empty'}
            section={HOMEPAGE_SECTIONS.ADVERTISE}
            slotLabel="Advertise Image"
            existing={advertiseImage}
            displayOrder={1}
            onChanged={load}
          />
        </div>
      </section>

      {/* ── Section 4: Spotlight Videos (8 boxes) ────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">Spotlight Videos</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Upload up to {SPOTLIGHT_SLOTS} videos with a title. These appear in the homepage “In The Spotlight” section.
          </p>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: SPOTLIGHT_SLOTS }).map((_, idx) => (
            <MediaSlot
              key={spotlightVideos[idx]?.id ?? `spotlight-empty-${idx}`}
              section={HOMEPAGE_SECTIONS.SPOTLIGHT}
              slotLabel={`Video ${idx + 1}`}
              existing={spotlightVideos[idx] || null}
              displayOrder={idx + 1}
              mediaType="video"
              onChanged={load}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
