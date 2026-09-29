import React, { useState, useEffect } from 'react';
import './index.css';

// Import komponen-komponen mengikut nama fail tepat dalam gambar
import Dashboard from './components/Dashboard.jsx';
import DailyOutput from './components/DailyOutput.jsx';
import Stock from './components/Stock.jsx';
import CycleTime from './components/Cycle.Time.jsx';
import Manpower from './components/Manpower.jsx';
import Issues from './components/4MIssues.jsx';
import BufferSimulation from './components/BufferSimulation.jsx';
import MonthlyTarget from './components/MonthlyTarget.jsx';
import PartOrdering from './components/PartOrdering.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('stp_theme') || 'light');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [cycleTarget, setCycleTarget] = useState('24.5');

  // Sinkronkan tema ke data-theme dan simpan di localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stp_theme', theme);
  }, [theme]);

  // Jam dan Tarikh
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      setDateStr(`${d}/${m}/${y}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Shared state dengan simpanan automatik localStorage
  const [outputList, setOutputList] = useState(() => {
    const s = localStorage.getItem('stp_outputs');
    return s ? JSON.parse(s) : [];
  });
  const [stockList, setStockList] = useState(() => {
    const s = localStorage.getItem('stp_stock');
    return s ? JSON.parse(s) : [];
  });
  const [issueList, setIssueList] = useState(() => {
    const s = localStorage.getItem('stp_issues');
    return s ? JSON.parse(s) : [];
  });
  const [manpowerList, setManpowerList] = useState(() => {
    const s = localStorage.getItem('stp_manpower');
    return s ? JSON.parse(s) : [];
  });
  const [targetList, setTargetList] = useState(() => {
    const s = localStorage.getItem('stp_targets');
    return s ? JSON.parse(s) : [];
  });
  const [orderList, setOrderList] = useState(() => {
    const s = localStorage.getItem('stp_orders');
    return s ? JSON.parse(s) : [];
  });
  const [spareList, setSpareList] = useState(() => {
    const s = localStorage.getItem('stp_spares');
    return s ? JSON.parse(s) : [];
  });

  useEffect(() => { localStorage.setItem('stp_outputs', JSON.stringify(outputList)); }, [outputList]);
  useEffect(() => { localStorage.setItem('stp_stock', JSON.stringify(stockList)); }, [stockList]);
  useEffect(() => { localStorage.setItem('stp_issues', JSON.stringify(issueList)); }, [issueList]);
  useEffect(() => { localStorage.setItem('stp_manpower', JSON.stringify(manpowerList)); }, [manpowerList]);
  useEffect(() => { localStorage.setItem('stp_targets', JSON.stringify(targetList)); }, [targetList]);
  useEffect(() => { localStorage.setItem('stp_orders', JSON.stringify(orderList)); }, [orderList]);
  useEffect(() => { localStorage.setItem('stp_spares', JSON.stringify(spareList)); }, [spareList]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'output', label: 'Daily Output' },
    { id: 'stock', label: 'Stock' },
    { id: 'cycle', label: 'Cycle Time' },
    { id: 'manpower', label: 'Manpower' },
    { id: 'issues', label: '4M Issues' },
    { id: 'simulation', label: 'Buffer Simulation' },
    { id: 'target', label: 'Monthly Target' },
    { id: 'ordering', label: 'Part Ordering' },
  ];

  return (
    <>
      <header className="topbar">
        <div className="brand-block">
          <h1 className="brand-title">
            <img className="brand-logo" src="/piston_logo_white.png" alt="Piston logo" />
            <span>Smart Tracking Piston</span>
          </h1>
          <p>Output • Stock • Cycle Time • 4M Issues • Targets • Ordering</p>
        </div>
        <div className="topbar-right">
          <div id="liveClock">
            <span className="clock-time">{timeStr || '12:00:00'}</span>
            <span className="clock-date">{dateStr || '29/09/2026'}</span>
          </div>
          <label className="theme-control">
            <span>Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} aria-label="Theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard
            outputList={outputList}
            stockList={stockList}
            issueList={issueList}
            manpowerList={manpowerList}
            cycleTarget={cycleTarget}
          />
        )}

        {activeTab === 'output' && (
          <DailyOutput
            outputList={outputList}
            setOutputList={setOutputList}
            setStockList={setStockList}
            setIssueList={setIssueList}
          />
        )}

        {activeTab === 'stock' && (
          <Stock stockList={stockList} setStockList={setStockList} />
        )}

        {activeTab === 'cycle' && (
          <CycleTime
            outputList={outputList}
            cycleTarget={cycleTarget}
            setCycleTarget={setCycleTarget}
          />
        )}

        {activeTab === 'manpower' && (
          <Manpower
            manpowerList={manpowerList}
            setManpowerList={setManpowerList}
          />
        )}

        {activeTab === 'issues' && (
          <Issues issueList={issueList} setIssueList={setIssueList} />
        )}

        {activeTab === 'simulation' && <BufferSimulation />}

        {activeTab === 'target' && (
          <MonthlyTarget
            targetList={targetList}
            setTargetList={setTargetList}
          />
        )}

        {activeTab === 'ordering' && (
          <PartOrdering
            orderList={orderList}
            setOrderList={setOrderList}
            spareList={spareList}
            setSpareList={setSpareList}
            outputList={outputList}
          />
        )}
      </main>

      <footer>
        Smart Tracking Piston • 1 Engine = 4 Pistons • Day Shift / Night Shift • BFN &amp; DFN combined
      </footer>
    </>
  );
}