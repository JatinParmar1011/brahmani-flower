export default function PromoBanner() {
  return (
    <div
      className="rounded-2xl px-14 py-10 flex items-center justify-between relative overflow-hidden shadow-sm"
      style={{ background: 'linear-gradient(120deg,#b3e5fc 0%,#e1f5fe 60%,#b3e5fc 100%)' }}
    >
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold text-[#1a3a5c] tracking-widest">REFER &amp; EARN</p>
        <h2 className="text-6xl font-black text-[#1a3a5c] leading-none">20% OFF*</h2>
        <p className="text-2xl font-bold text-[#1a3a5c]">
          FOR <span className="text-red-500">YOU</span>, FOR <span className="text-red-500">THEM</span>!
        </p>
        <button className="mt-3 w-fit bg-[#1a6b8a] hover:bg-[#155a75] text-white font-semibold px-7 py-2.5 rounded-lg text-sm transition-colors cursor-pointer">
          Refer Now
        </button>
      </div>
      <span className="text-[130px] leading-none drop-shadow-lg">🎁</span>
      <span className="absolute right-3 bottom-3 text-[11px] text-gray-400" style={{ writingMode: 'vertical-rl' }}>
        *T&amp;C Apply
      </span>
    </div>
  );
}
