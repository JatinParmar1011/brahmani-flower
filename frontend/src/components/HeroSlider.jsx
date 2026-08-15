import { useState, useEffect } from 'react';

const slides = [
  { bg: 'linear-gradient(135deg,#b3e5fc,#e1f5fe)', title: 'Flower of the month :', highlight: 'Sunflower', sub: 'Because subtle is overrated this month', emoji: '🌻' },
  { bg: 'linear-gradient(135deg,#fce4ec,#f8bbd0)', title: 'Fresh Arrivals :', highlight: 'Roses', sub: 'Express love with every petal', emoji: '🌹' },
  { bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', title: 'Season Special :', highlight: 'Orchids', sub: 'Elegance in every bloom', emoji: '🌸' },
  { bg: 'linear-gradient(135deg,#fff8e1,#ffecb3)', title: 'Gift Combo :', highlight: 'Tulips & Cake', sub: 'Make every occasion memorable', emoji: '🌷' },
  { bg: 'linear-gradient(135deg,#ede7f6,#d1c4e9)', title: 'Anniversary Special :', highlight: 'Lilies', sub: 'Celebrate love in full bloom', emoji: '💐' },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <div>
      <div
        className="rounded-2xl h-[340px] flex items-center justify-between px-14 overflow-hidden"
        style={{ background: slide.bg }}
      >
        <div className="max-w-[500px]">
          <p className="text-xl font-medium text-[#5d3a1a] mb-2">{slide.title}</p>
          <h2 className="text-7xl font-bold text-[#c47a00] leading-none mb-3">{slide.highlight}</h2>
          <p className="text-lg text-[#5d3a1a]">{slide.sub}</p>
        </div>
        <span className="text-[160px] leading-none drop-shadow-lg animate-bounce">{slide.emoji}</span>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full border-none cursor-pointer transition-all ${i === current ? 'w-3 h-3 bg-[#1a6b8a]' : 'w-2.5 h-2.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
