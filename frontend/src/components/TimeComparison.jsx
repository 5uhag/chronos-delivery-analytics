import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const fmt = (h) => {
  if (h === undefined || h === null) return '';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${suffix}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-300 font-medium mb-1">{fmt(label)}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.stroke }}>
          {p.name}: <span className="font-bold text-white">{Number(p.value).toFixed(1)} min</span>
        </p>
      ))}
    </div>
  );
};

export default function TimeComparison({ data = [], loading }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-lg h-80">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Delay &amp; Delivery Time by Hour
      </h2>
      {loading ? (
        <div className="flex items-center justify-center h-56 text-gray-600">Loading…</div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="hour" tickFormatter={fmt} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <ReferenceLine x={19} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Peak', fill: '#f59e0b', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="avg_delay"
              name="Avg Delay"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="avg_time"
              name="Avg Delivery Time"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
