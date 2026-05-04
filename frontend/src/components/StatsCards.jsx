export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      label: 'Total Orders',
      value: loading ? '—' : Number(stats?.total_orders ?? 0).toLocaleString(),
      icon: '📦',
      color: 'from-blue-600 to-blue-800',
    },
    {
      label: 'Avg Delay',
      value: loading ? '—' : `${stats?.avg_delay_mins ?? 0} min`,
      icon: '⏱',
      color: 'from-amber-500 to-amber-700',
    },
    {
      label: 'Worst Area',
      value: loading ? '—' : (stats?.worst_area ?? 'N/A'),
      icon: '📍',
      color: 'from-red-500 to-red-700',
    },
    {
      label: 'Worst Weather',
      value: loading ? '—' : (stats?.worst_weather ?? 'N/A'),
      icon: '🌧',
      color: 'from-purple-600 to-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 flex flex-col gap-1 shadow-lg`}
        >
          <span className="text-2xl">{c.icon}</span>
          <p className="text-xs text-white/70 uppercase tracking-widest">{c.label}</p>
          <p className="text-2xl font-bold text-white">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
