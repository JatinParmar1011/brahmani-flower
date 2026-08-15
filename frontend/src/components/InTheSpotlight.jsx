import { useState, useRef } from 'react';

const videos = [
  { id: 1, title: 'Interflora At Design One',        color: '#f8bbd0', emoji: '🌸' },
  { id: 2, title: 'Say it Beautifully with Flowers',  color: '#fce4ec', emoji: '💐' },
  { id: 3, title: 'And Romantic Blooms',              color: '#ffcdd2', emoji: '🌹' },
  { id: 4, title: 'The iconic Udaipur Wedding',       color: '#e8f5e9', emoji: '💒' },
  { id: 5, title: 'Designing Love in Petals',         color: '#f3e5f5', emoji: '🌺' },
  { id: 6, title: 'Blooms & Beyond',                  color: '#fff8e1', emoji: '🌼' },
];

export default function InTheSpotlight() {
  const scrollRef = useRef(null);
  const [playing, setPlaying] = useState(null);

  const scroll = (dir) => scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">In The Spotlight</h2>
        <p className="text-sm text-gray-400 mt-1">Classic modern bouquets</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => scroll(-1)}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
        >‹</button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          {videos.map(v => (
            <div
              key={v.id}
              className="flex-shrink-0 w-56 rounded-xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
              style={{ background: v.color }}
            >
              <div className="h-72 flex items-center justify-center relative">
                <span className="text-[90px] opacity-60">{v.emoji}</span>
                <button
                  onClick={() => setPlaying(playing === v.id ? null : v.id)}
                  className="absolute w-14 h-14 rounded-full bg-black/65 hover:bg-black/85 text-white text-xl flex items-center justify-center border-none cursor-pointer transition-colors"
                >
                  {playing === v.id ? '⏸' : '▶'}
                </button>
              </div>
              <div className="bg-black/55 text-white text-sm font-semibold px-4 py-3 leading-snug">
                {v.title}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
        >›</button>
      </div>
    </div>
  );
}
