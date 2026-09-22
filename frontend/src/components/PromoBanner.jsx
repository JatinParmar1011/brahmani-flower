export default function PromoBanner({ image }) {
  // No image uploaded — show a blank "no image found" area.
  if (!image?.mediaUrl) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400"
        style={{ height: '220px' }}
      >
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-sm font-medium">No image found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ height: '220px' }}>
      <img
        src={image.mediaUrl}
        alt="Advertisement"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
