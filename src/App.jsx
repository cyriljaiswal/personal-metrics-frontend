import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Real-time Dashboard Analytics Component
function DashboardAnalytics({ logs = [] }) {
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
    <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 my-4">
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

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    category: 'Fitness',
    duration_minutes: '30',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const API_URL = "https://personal-metrics-api.onrender.com/api/logs";

  const fetchLogs = () => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (cat) => {
    setFormData({ ...formData, category: cat });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log_date: formData.log_date,
        category: formData.category,
        duration_minutes: Number(formData.duration_minutes),
        notes: formData.notes
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add log");
        return res.json();
      })
      .then(() => {
        setFormData(prev => ({ ...prev, notes: '' }));
        fetchLogs();
        setSubmitting(false);
      })
      .catch(err => {
        alert("Error: " + err.message);
        setSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this log?")) return;

    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.json();
      })
      .then(() => fetchLogs())
      .catch(err => alert("Error: " + err.message));
  };

  const categories = ['Fitness', 'Study', 'Coding', 'Gaming', 'Reading'];

  // Calculate total minutes per category for analytics summary
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = logs
      .filter(log => log.category === cat)
      .reduce((sum, log) => sum + Number(log.duration_minutes || 0), 0);
    return acc;
  }, {});

  const totalMinutesAll = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className={`min-h-screen p-4 font-sans flex justify-center transition-colors duration-200 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}>
      <div className="w-full max-w-md space-y-4">
        
        {/* Header with Theme Toggle */}
        <header className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition-colors duration-200 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}> <div> <h1 className="text-base font-bold">Life Metrics</h1> <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Effortless Daily Tracker</p>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-2