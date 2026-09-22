import { useState, useEffect } from 'react';

// Placeholder shown when no image has been uploaded for a section.
function NoImage({ height = '340px', label = 'No image found' }) {
  return (
    <div
      className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400"
      style={{ height }}
    >
      <div className="text-4xl mb-2">🖼️</div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export default function HeroSlider({ images = [] }) {
  const [current, setCurrent] = useState(0);

  const count = images?.length || 0;

  useEffect(() => {
    setCurrent(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % count), 3500);
    return () => clearInterval(t);
  }, [count]);

  // No images uploaded — show a blank "no image found" area.
  if (count === 0) return <NoImage height="340px" />;

  const safeIndex = current % count;

  return (
    <div>
      <div className="relative rounded-2xl h-[340px] overflow-hidden">
        {images.map((img, i) => (
          <div
            key={img.id ?? i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === safeIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={img.mediaUrl}
              alt={img.title || `Slide ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full border-none cursor-pointer transition-all ${i === safeIndex ? 'w-3 h-3 bg-[#1a6b8a]' : 'w-2.5 h-2.5 bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
