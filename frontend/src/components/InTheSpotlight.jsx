import { useRef, useState } from 'react';

// A single spotlight video card with a real play/pause toggle.
function SpotlightCard({ video }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-56 rounded-xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-transform bg-black">
      <div className="h-72 relative" onClick={toggle}>
        <video
          ref={videoRef}
          src={video.mediaUrl}
          className="w-full h-full object-cover"
          playsInline
          loop
          onEnded={() => setPlaying(false)}
        />
      </div>
      {video.title && (
        <div className="bg-black/55 text-white text-sm font-semibold px-4 py-3 leading-snug">
          {video.title}
        </div>
      )}
    </div>
  );
}

export default function InTheSpotlight({ videos = [] }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });

  const hasVideos = videos && videos.length > 0;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">In The Spotlight</h2>
        <p className="text-sm text-gray-400 mt-1">Classic modern bouquets</p>
      </div>

      {hasVideos ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll(-1)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >‹</button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {videos.map(v => (
              <SpotlightCard key={v.id} video={v} />
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 shadow text-2xl flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >›</button>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 h-72">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-sm font-medium">No videos found</p>
        </div>
      )}
    </div>
  );
}
