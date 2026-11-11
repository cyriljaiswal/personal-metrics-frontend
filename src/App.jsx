import React, { useState, useEffect } from 'react';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    category: 'Fitness',
    duration_minutes: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // Live Render Backend API URL
  const API_URL = "https://personal-metrics-api.onrender.com/api/logs";

  // Fetch Logs function
  const fetchLogs = () => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch logs from backend");
        return res.json();
      })
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Form Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit (POST Request)
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
        // Reset form & reload logs
        setFormData({
          log_date: new Date().toISOString().split('T')[0],
          category: 'Fitness',
          duration_minutes: '',
          notes: ''
        });
        fetchLogs();
        setSubmitting(false);
      })
      .catch(err => {
        alert("Error: " + err.message);
        setSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-8 text-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold tracking-wider text-teal-400">
            PERSONAL METRICS DASHBOARD
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Live Production Dashboard • Flask + SQLite Backend on Render
          </p>
        </header>

        {/* Add Log Form Section */}
        <div className="bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-800 mb-8">
          <h2 className="text-lg font-semibold text-teal-300 mb-4">Add New Activity Log</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                <input 
                  type="date" 
                  name="log_date" 
                  value={formData.log_date} 
                  onChange={handleChange} 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="Fitness">Fitness</option>
                  <option value="Study">Study</option>
                  <option value="Coding">Coding</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Minutes)</label>
                <input 
                  type="number" 
                  name="duration_minutes" 
                  placeholder="e.g. 45" 
                  value={formData.duration_minutes} 
                  onChange={handleChange} 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Description</label>
                <input 
                  type="text" 
                  name="notes" 
                  placeholder="e.g. Upper body workout" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              {submitting ? "Adding Log..." : "Save Activity Log"}
            </button>
          </form>
        </div>

        {/* Activity Logs History Section */}
        <div className="bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-teal-300">Activity Logs History</h2>
            <span className="bg-teal-500/10 text-teal-400 text-xs px-2.5 py-1 rounded-full border border-teal-500/20 font-medium">
              Live API Connected
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 animate-pulse text-sm">
              Fetching records from cloud server...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400 bg-red-950/20 rounded-lg border border-red-900/50 text-sm">
              Error: {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No activity logs found. Add one above!
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-teal-500/50 transition-all flex justify-between items-center shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                        {log.category}
                      </span>
                      <span className="text-slate-200 text-sm font-medium">
                        {log.notes || "No notes provided"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-1">
                      Date: <span className="text-slate-400">{log.log_date}</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-lg font-bold text-teal-400">{log.duration_minutes}</span>
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Mins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="text-center mt-6 text-xs text-slate-600">
          Cyril Jaiswal • Full-Stack Personal Portfolio Project
        </footer>

      </div>
    </div>
  );
}

export default App;