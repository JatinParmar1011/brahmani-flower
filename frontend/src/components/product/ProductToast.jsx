import { useEffect } from 'react';

export default function ProductToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce-once">
      <span>🛒</span> {message}
    </div>
  );
}
