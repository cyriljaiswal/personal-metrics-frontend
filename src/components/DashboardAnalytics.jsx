import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardAnalytics({ logs = [] }) {
  // Real logs se date-wise total minutes calculate karna
  const dateMap = {};
  logs.forEach(log => {
    const date = log.log_date;
    const mins = Number(log.duration_minutes || 0);
    dateMap[date] = (dateMap[date] || 0) + mins;
  });

  // Date ke hisaab se sort karke last 7 entries lena
  const chartData = Object.keys(dateMap)
    .sort()
    .slice(-7)
    .map(date => ({
      date: date.slice(5), // MM-DD format
      minutes: dateMap[date]
    }));

  // Agar logs na ho toh fallback data
  const displayData = chartData.length > 0 ? chartData : [
    { date: 'Start', minutes: 0 }
  ];

  // Unique active days count for streak
  const uniqueDates = [...new Set(logs.map(log => log.log_date))];
  const streak = uniqueDates.length;

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 my-6">
      {/* Top Header & Streak Badge */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Performance Trend</h2>
          <p className="text-slate-400 text-sm">Real-time daily tracked minutes</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl text-indigo-400 font-semibold text-sm flex items-center gap-2">
          🔥 {streak} Active Days
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} 
            />
            <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}