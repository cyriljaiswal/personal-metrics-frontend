import React, { useState, useEffect } from 'react';

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
        <header className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition-colors duration-200 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div>
            <h1 className="text-base font-bold">Life Metrics</h1>
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Effortless Daily Tracker</p>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'}`}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>

        {/* Analytics Summary Widget */}
        <div className={`border rounded-2xl p-4 shadow-sm space-y-3 transition-colors duration-200 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Overview</h2>
            <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>Total: {totalMinutesAll} mins</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div key={cat} className={`border rounded-xl p-2.5 text-center ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <span className={`text-[10px] font-semibold block uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{cat}</span>
                <span className={`text-sm font-extrabold mt-0.5 block ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{categoryTotals[cat]}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Entry Form */}
        <div className={`border rounded-2xl p-4 shadow-sm space-y-3 transition-colors duration-200 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Quick Add</h2>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Category Quick Select Pills */}
            <div>
              <label className={`block text-[11px] mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      formData.category === cat 
                        ? (isDarkMode ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold' : 'bg-zinc-900 text-zinc-100 border-zinc-900 font-semibold')
                        : (isDarkMode ? 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-[11px] mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Date</label>
                <input 
                  type="date" 
                  name="log_date" 
                  value={formData.log_date} 
                  onChange={handleChange} 
                  required
                  className={`w-full border rounded-xl p-2 text-xs focus:outline-none transition-colors ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-400'}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Duration (Mins)</label>
                <input 
                  type="number" 
                  name="duration_minutes" 
                  placeholder="30" 
                  value={formData.duration_minutes} 
                  onChange={handleChange} 
                  required
                  className={`w-full border rounded-xl p-2 text-xs focus:outline-none transition-colors ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-400'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Optional Notes</label>
              <input 
                type="text" 
                name="notes" 
                placeholder="What did you focus on?" 
                value={formData.notes} 
                onChange={handleChange} 
                className={`w-full border rounded-xl p-2 text-xs focus:outline-none transition-colors ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-400'}`}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full font-semibold py-2.5 rounded-xl transition-all text-xs cursor-pointer shadow-sm ${isDarkMode ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100'}`}
            >
              {submitting ? "Saving..." : "+ Save Entry"}
            </button>
          </form>
        </div>

        {/* Recent Logs List */}
        <div className={`border rounded-2xl p-4 shadow-sm space-y-3 transition-colors duration-200 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>History</h2>

          {loading ? (
            <p className={`text-center text-xs py-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Syncing logs...</p>
          ) : error ? (
            <p className="text-center text-red-500 text-xs py-6">Error: {error}</p>
          ) : logs.length === 0 ? (
            <p className={`text-center text-xs py-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>No entries recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`border rounded-xl p-3 flex justify-between items-center transition-colors ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'}`}
                >
                  <div className="space-y-1">
                    <span className={`border px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-200 border-zinc-300 text-zinc-700'}`}>
                      {log.category}
                    </span>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{log.notes || "Quick session"}</p>
                    <span className="text-[10px] text-zinc-500 block">{log.log_date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{log.duration_minutes}</span>
                      <span className="text-[9px] text-zinc-500 block font-semibold">MINS</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="text-zinc-500 hover:text-red-500 text-xs p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

App.displayName = "App";

export default App;