export default function ProductHero({ category, imageUrl }) {
  if (!imageUrl) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 mb-8"
        style={{ height: '220px' }}
      >
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-sm font-medium">No image found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm mb-8" style={{ height: '220px' }}>
      <img
        src={imageUrl}
        alt={category}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
