const AREAS = ['All', 'Koramangala', 'Bommanahalli', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar'];

export default function AreaFilter({ selected, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-400 mr-1">Filter by area:</span>
      {AREAS.map((a) => (
        <button
          key={a}
          onClick={() => onChange(a === 'All' ? '' : a)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            (selected === '' && a === 'All') || selected === a
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
