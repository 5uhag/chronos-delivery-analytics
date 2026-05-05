import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const WEATHER_COLORS = {
  Clear:   '#facc15',
  Cloudy:  '#94a3b8',
  Rain:    '#60a5fa',
  Fog:     '#a78bfa',
  Windy:   '#34d399',
  Stormy:  '#f87171',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="font-medium text-gray-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: <span className="font-bold text-white">{Number(p.value).toFixed(1)} min</span>
        </p>
      ))}
    </div>
  );
};

export default function WeatherHeatmap({ data = [], loading }) {
  // data is [{weather, area, avg_delay, count}]
  // pivot: rows = area, cols = weather condition
  const areas    = [...new Set(data.map((d) => d.area))];
  const weathers = [...new Set(data.map((d) => d.weather))];

  const pivoted = areas.map((area) => {
    const row = { area };
    weathers.forEach((w) => {
      const match = data.find((d) => d.area === area && d.weather === w);
      row[w] = match ? +Number(match.avg_delay).toFixed(1) : 0;
    });
    return row;
  });

  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-lg h-80">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Delay by Weather × Area (min)
      </h2>
      {loading ? (
        <div className="flex items-center justify-center h-56 text-gray-600">Loading…</div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={pivoted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="area" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            {weathers.map((w) => (
              <Bar key={w} dataKey={w} fill={WEATHER_COLORS[w] ?? '#6366f1'} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
