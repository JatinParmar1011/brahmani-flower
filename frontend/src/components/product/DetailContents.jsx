export default function DetailContents({ product }) {
  const { contains, description } = product;

  const containsList = contains
    ? contains.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  if (!containsList.length && !description) return null;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {containsList.length > 0 && (
        <>
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Product Contains</p>
          </div>
          <div className="px-5 py-4 border-b border-gray-200">
            <ul className="flex flex-col gap-2">
              {containsList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {description && (
        <>
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Description</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-[#1a6b8a] leading-relaxed">{description}</p>
          </div>
        </>
      )}
    </div>
  );
}
