import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Shield, Download, Activity, LayoutGrid, Calendar, Terminal } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

const HIGH_COURTS = [
  { id: "9", name: "Allahabad High Court" },
  { id: "28", name: "Andhra Pradesh High Court" },
  { id: "13", name: "Bombay High Court" },
  { id: "12", name: "Calcutta High Court" },
  { id: "18", name: "Chhattisgarh High Court" },
  { id: "7", name: "Delhi High Court" },
  { id: "10", name: "Gauhati High Court" },
  { id: "17", name: "Gujarat High Court" },
  { id: "5", name: "Himachal Pradesh High Court" },
  { id: "6", name: "Jammu and Kashmir High Court" },
  { id: "19", name: "Jharkhand High Court" },
  { id: "3", name: "Karnataka High Court" },
  { id: "2", name: "Kerala High Court" },
  { id: "4", name: "Madhya Pradesh High Court" },
  { id: "1", name: "Madras High Court" },
  { id: "25", name: "Manipur High Court" },
  { id: "27", name: "Meghalaya High Court" },
  { id: "11", name: "Orissa High Court" },
  { id: "14", name: "Patna High Court" },
  { id: "8", name: "Punjab and Haryana High Court" },
  { id: "14", name: "Rajasthan High Court" },
  { id: "16", name: "Sikkim High Court" },
  { id: "29", name: "Telangana High Court" },
  { id: "26", name: "Tripura High Court" },
  { id: "20", name: "Uttarakhand High Court" }
];

function App() {
  const [status, setStatus] = useState({ status: 'idle', progress: 0, current_court: null, total_found: 0, total_downloaded: 0 });
  const [loading, setLoading] = useState(false);
  const [courtId, setCourtId] = useState("9");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadPdfs, setDownloadPdfs] = useState(true);
  const [logs, setLogs] = useState(["[SYSTEM] Ready for operation."]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status`);
        setStatus(res.data);
        
        // Sync backend logs to frontend display
        if (res.data.logs && res.data.logs.length > 0) {
          setLogs(prev => {
            const backendLogs = [...res.data.logs].reverse();
            // Simple merge: if backend has more logs, or different last log, update
            if (backendLogs[0] !== prev[0]) return backendLogs;
            return prev;
          });
        }

        if (res.data.status === 'ready' && loading) setLoading(false);
      } catch (e) {
        console.error("Status check failed", e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const addLog = (msg) => {
    // Manually added logs (like initial clicks) are prepended
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  // Server expects YYYY-MM-DD (ISO format)
  const formatDate = (dateStr) => dateStr || "";

  const startSession = async () => {
    setLoading(true);
    addLog("[AUTH] Initializing Session Grabber...");
    try {
      await axios.post(`${API_BASE}/start-session`);
      addLog("[AUTH] Captcha window opened. Awaiting user...");
    } catch (e) {
      addLog("[ERR] Failed to initiate session.");
      setLoading(false);
    }
  };

  const startScrape = async () => {
    const court = HIGH_COURTS.find(c => c.id === courtId);
    addLog(`[NET] Starting scrape for ${court.name}...`);
    try {
      await axios.post(`${API_BASE}/scrape`, {
        court_name: court.name,
        court_id: courtId,
        keyword: keyword,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        metadata_only: !downloadPdfs
      });
    } catch (e) {
      addLog("[ERR] Failed to start scrape task.");
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-section">
          <h1>JUDGMENT PRO <span>v1.0</span></h1>
        </div>
        <div className={`status-badge status-${status.status}`}>
          {status.status.replace('_', ' ').toUpperCase()}
        </div>
      </header>

      <div className="main-grid">
        <div className="sidebar">
          <div className="card">
            <h2><Shield size={18} /> Authentication</h2>
            <button 
              className="btn-primary" 
              onClick={startSession} 
              disabled={loading || status.status === 'ready'}
            >
              {loading ? "Waiting for Captcha..." : (status.status === 'ready' ? "Session Active" : "Start Session Grabber")}
            </button>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2><Activity size={18} /> Configuration</h2>
            <div className="form-group">
              <label>Target High Court</label>
              <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
                {HIGH_COURTS.map(hc => <option key={`${hc.id}-${hc.name}`} value={hc.id}>{hc.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label><Calendar size={14} /> Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label><Calendar size={14} /> End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Keyword</label>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. Environmental" />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="toggle" 
                checked={downloadPdfs} 
                onChange={(e) => setDownloadPdfs(e.target.checked)}
                style={{ width: '20px' }}
              />
              <label htmlFor="toggle" style={{ margin: 0, fontSize: '0.9rem' }}>Download PDF judgments</label>
            </div>

            <button 
              className="btn-outline" 
              onClick={startScrape} 
              disabled={status.status !== 'ready' && status.status !== 'error'}
            >
              <Play size={16} /> Start Scraper
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="card">
            <h2><LayoutGrid size={18} /> Live Monitor</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{status.total_found}</span>
                <span className="stat-label">RESULTS FOUND</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: 'var(--accent)' }}>{status.total_downloaded}</span>
                <span className="stat-label">{downloadPdfs ? "PDFS SAVED" : "RECORDS SAVED"}</span>
              </div>
            </div>

            <div className="progress-section" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{status.current_court || "Standing by for task..."}</span>
                <span style={{ fontWeight: 'bold' }}>{status.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${status.progress}%` }}></div>
              </div>
            </div>

            <div className="log-display" style={{ marginTop: '2rem' }}>
              <div className="log-header"><Terminal size={14} /> System Logs</div>
              <div className="log-container">
                {logs.map((log, i) => (
                  <div key={i} className="log-entry">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
