const badge = (delay) => {
  if (delay > 15) return 'bg-red-900 text-red-300';
  if (delay > 8)  return 'bg-amber-900 text-amber-300';
  return 'bg-green-900 text-green-300';
};

export default function ZonesLeaderboard({ data = [], loading }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-lg h-80 overflow-auto">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Zone Leaderboard
      </h2>
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-600">Loading…</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="text-left pb-2">#</th>
              <th className="text-left pb-2">Area</th>
              <th className="text-left pb-2">Zone</th>
              <th className="text-right pb-2">Avg Delay</th>
              <th className="text-right pb-2">Peak Hour</th>
              <th className="text-right pb-2">Top Factor</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.name} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-2 text-gray-600 font-mono">{i + 1}</td>
                <td className="py-2 font-medium text-gray-200">{row.name}</td>
                <td className="py-2 text-gray-400">{row.zone}</td>
                <td className="py-2 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge(row.avg_delay_mins)}`}>
                    {Number(row.avg_delay_mins).toFixed(1)} min
                  </span>
                </td>
                <td className="py-2 text-right text-gray-400">
                  {row.peak_hour != null ? `${row.peak_hour}:00` : '—'}
                </td>
                <td className="py-2 text-right text-gray-400">{row.top_weather_factor ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
