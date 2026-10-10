/**
 * Centralised product tag colour map.
 * Used by every component that renders a tag badge — product cards,
 * detail page, admin panel, best-selling sections, etc.
 *
 * Pill variants  (bg + text, for light surfaces — admin tables, detail info)
 * Badge variants (solid bg + white text, for image overlays)
 */

export const TAG_PILL = {
  Bestseller: 'bg-orange-100 text-orange-600',
  Trending:   'bg-rose-100  text-rose-600',
  New:        'bg-blue-100  text-blue-600',
  Popular:    'bg-emerald-100 text-emerald-700',
  Premium:    'bg-violet-100 text-violet-700',
  Luxury:     'bg-yellow-100 text-yellow-700',
};

export const TAG_BADGE = {
  Bestseller: 'bg-orange-500',
  Trending:   'bg-rose-500',
  New:        'bg-blue-500',
  Popular:    'bg-emerald-600',
  Premium:    'bg-violet-600',
  Luxury:     'bg-yellow-600',
};

/** Hex colours for use in inline style props (e.g. filter buttons) */
export const TAG_HEX = {
  Bestseller: '#f97316', // orange-500
  Trending:   '#f43f5e', // rose-500
  New:        '#3b82f6', // blue-500
  Popular:    '#059669', // emerald-600
  Premium:    '#7c3aed', // violet-600
  Luxury:     '#ca8a04', // yellow-600
};
export const tagBadgeClass = (tag) =>
  `${TAG_BADGE[tag] || 'bg-gray-500'} text-white`;

/** Returns Tailwind classes for a soft pill (light bg, coloured text) */
export const tagPillClass = (tag) =>
  TAG_PILL[tag] || 'bg-gray-100 text-gray-500';
