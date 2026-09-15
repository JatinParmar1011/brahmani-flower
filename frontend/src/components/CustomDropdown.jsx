import { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  disabled = false,
  error = false,
  extraOption = null,   // { value, label } — pincode-filled value not in list
}) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const containerRef          = useRef(null);
  const searchRef             = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  // If pincode filled a value not in list, show it at top
  const showExtra = extraOption && !options.includes(extraOption.value) && extraOption.value;

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  const borderCls = error
    ? 'border-red-400'
    : open
    ? 'border-[#1a6b8a] ring-2 ring-[#1a6b8a]/20'
    : 'border-gray-200 hover:border-gray-300';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(v => !v); }}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm bg-white transition outline-none ${borderCls} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
        }`}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

          {/* Search box */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#1a6b8a] focus-within:ring-1 focus-within:ring-[#1a6b8a]/20 transition">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs leading-none">✕</button>
              )}
            </div>
          </div>

          {/* Options list with custom scrollbar */}
          <ul
            className="overflow-y-auto"
            style={{
              maxHeight: '220px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#1a6b8a40 transparent',
            }}
          >
            {/* Extra option from pincode auto-fill */}
            {showExtra && (
              <li
                onClick={() => handleSelect(extraOption.value)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  value === extraOption.value
                    ? 'bg-[#1a6b8a] text-white'
                    : 'text-gray-700 hover:bg-[#1a6b8a]/8 hover:text-[#1a6b8a]'
                }`}
              >
                <span>{extraOption.value}</span>
                {value === extraOption.value && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-sm text-gray-400 text-center">No results found</li>
            ) : (
              filtered.map(opt => (
                <li
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    value === opt
                      ? 'bg-[#1a6b8a] text-white font-medium'
                      : 'text-gray-700 hover:bg-[#1a6b8a]/8 hover:text-[#1a6b8a]'
                  }`}
                >
                  <span>{opt}</span>
                  {value === opt && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Count footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400">{filtered.length} option{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
