import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-300 font-medium mb-1">{label}</p>
      <p className="text-blue-400">Avg delay: <span className="font-bold text-white">{Number(payload[0].value).toFixed(1)} min</span></p>
      <p className="text-gray-400">Orders: {payload[0].payload.order_count}</p>
    </div>
  );
};

export default function DelayChart({ data = [], loading }) {
  const chartData = data.map((d) => ({
    name:        d.name,
    delay:       +Number(d.avg_delay_mins).toFixed(1),
    order_count: d.order_count,
  }));

  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-lg h-80">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Avg Delay by Area (min)
      </h2>
      {loading ? (
        <div className="flex items-center justify-center h-56 text-gray-600">Loading…</div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={55}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="delay" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList dataKey="delay" position="top" style={{ fill: '#d1d5db', fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
