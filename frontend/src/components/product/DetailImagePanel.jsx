import { useState } from 'react';

export default function DetailImagePanel({ product }) {
  const { imageUrl, imageUrl2, imageUrl3, imageUrl4, imageUrl5 } = product;
  const [active, setActive] = useState(0);

  const images = [imageUrl, imageUrl2, imageUrl3, imageUrl4, imageUrl5].filter(Boolean);
  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: 400 }}>
        {hasImages ? (
          <img src={images[active]} alt={product.name}
            className="w-full h-full object-cover transition-all duration-300"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="text-[120px] drop-shadow-2xl select-none">🌸</span>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}
              style={{ aspectRatio: '1 / 1' }}
              className={`flex-1 min-w-0 rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${active === i ? 'border-[#1a6b8a] shadow-sm' : 'border-gray-200 hover:border-[#1a6b8a]/50'}`}>
              <img src={img} alt="" className="w-full h-full object-cover"
                onError={e => e.target.style.display = 'none'} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
