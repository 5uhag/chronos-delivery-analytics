import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const COLORS = {
  Low:    '#22c55e',
  Medium: '#f59e0b',
  High:   '#f97316',
  Jam:    '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-300 font-medium mb-1">Traffic: {label}</p>
      <p className="text-orange-400">Avg delay: <span className="font-bold text-white">{payload[0].value} min</span></p>
      <p className="text-gray-400">Orders: {payload[0].payload.count}</p>
    </div>
  );
};

export default function TrafficChart({ data = [], loading }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-lg h-80">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Avg Delay by Traffic Level (min)
      </h2>
      {loading ? (
        <div className="flex items-center justify-center h-56 text-gray-600">Loading…</div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="traffic" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avg_delay" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.traffic} fill={COLORS[d.traffic] ?? '#6366f1'} />
              ))}
              <LabelList dataKey="avg_delay" position="top" style={{ fill: '#d1d5db', fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
