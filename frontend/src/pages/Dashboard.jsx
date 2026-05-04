import { useEffect, useState, useCallback } from 'react';
import StatsCards      from '../components/StatsCards';
import AreaFilter      from '../components/AreaFilter';
import DelayChart      from '../components/DelayChart';
import WeatherHeatmap  from '../components/WeatherHeatmap';
import TimeComparison  from '../components/TimeComparison';
import ZonesLeaderboard from '../components/ZonesLeaderboard';
import {
  fetchStats, fetchAreas, fetchWeatherImpact, fetchTimeAnalysis,
} from '../api';

export default function Dashboard() {
  const [area,         setArea]         = useState('');
  const [stats,        setStats]        = useState(null);
  const [areas,        setAreas]        = useState([]);
  const [weatherData,  setWeatherData]  = useState([]);
  const [timeData,     setTimeData]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, w, t] = await Promise.all([
        fetchStats(),
        fetchAreas(),
        fetchWeatherImpact(area),
        fetchTimeAnalysis(area),
      ]);
      setStats(s);
      setAreas(a);
      setWeatherData(w);
      setTimeData(t);
    } catch (e) {
      setError('Could not reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [area]);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏱</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Chronos</h1>
            <p className="text-xs text-gray-500">Bengaluru Urban Delivery Analytics</p>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          BCA 6th Sem · BES Degree College · BCU
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Stat cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Area filter */}
        <AreaFilter selected={area} onChange={setArea} />

        {/* Row 1: Delay chart + Weather heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DelayChart     data={areas}       loading={loading} />
          <WeatherHeatmap data={weatherData} loading={loading} />
        </div>

        {/* Row 2: Time comparison + Zones leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TimeComparison    data={timeData} loading={loading} />
          <ZonesLeaderboard  data={areas}    loading={loading} />
        </div>

        <footer className="text-center text-xs text-gray-700 pb-4">
          Data source: Kaggle — Food Delivery Time Prediction dataset &nbsp;·&nbsp;
          Team: Lakshmi &amp; Vinodhini R &nbsp;·&nbsp; Guide: Prof. Jyothi MN
        </footer>
      </main>
    </div>
  );
}
