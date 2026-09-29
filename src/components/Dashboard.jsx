import React from 'react';

export default function Dashboard({
  outputList = [],
  stockList = [],
  issueList = [],
  manpowerList = [],
  cycleTarget = '24.5',
}) {
  const totalOutputEngines = outputList.reduce((acc, curr) => acc + Number(curr.engines || 0), 0);
  const totalOutputPistons = outputList.reduce((acc, curr) => acc + Number(curr.pistons || 0), 0);

  const getStockBalance = (variant) => {
    return stockList.reduce((acc, curr) => {
      if (curr.variant === variant) {
        return curr.type === 'OUT' ? acc - Number(curr.engines || 0) : acc + Number(curr.engines || 0);
      }
      return acc;
    }, 0);
  };

  const totalCurrentStockEngines = ['PFI A00', 'AFD', 'BFN & DFN', 'MP'].reduce(
    (acc, v) => acc + Math.max(0, getStockBalance(v)),
    0
  );

  const openIssuesCount = issueList.filter(
    (i) => i.status !== '4/4 Complete' && i.status !== '4/4'
  ).length;
  const onSiteIssuesCount = issueList.filter((i) => i.start && i.start !== '-').length;

  return (
    <section id="dashboard" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Dashboard</h2>
          <p>Production, stock, cycle time and issue status in one view.</p>
        </div>
      </div>

      <div className="cards dashboard-kpis">
        <div className="card">
          <span>Output</span>
          <strong id="kpiOutputEngine">{totalOutputEngines}</strong>
          <small>engines</small>
          <em id="kpiOutput">{totalOutputPistons} pistons</em>
        </div>
        <div className="card">
          <span>Current Stock</span>
          <strong id="kpiStockEngine">{totalCurrentStockEngines}</strong>
          <small>engines</small>
          <em id="kpiStock">{totalCurrentStockEngines * 4} pistons</em>
        </div>
        <div className="card">
          <span>Open 4M Issues</span>
          <strong id="kpiIssues">{openIssuesCount}</strong>
          <small>issues</small>
        </div>
        <div className="card">
          <span>On-Site Issues</span>
          <strong id="kpiOnsite">{onSiteIssuesCount}</strong>
          <small>issues</small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel dashboard-panel">
          <div className="dashboard-title">
            <h3>Production by Variant</h3>
            <span className="small-note">Total Recorded</span>
          </div>
          <div className="bar-summary">
            {['PFI A00', 'AFD', 'BFN & DFN', 'MP'].map((v) => {
              const count = outputList
                .filter((o) => o.variant === v)
                .reduce((acc, curr) => acc + Number(curr.engines || 0), 0);
              const pct = totalOutputEngines > 0 ? (count / totalOutputEngines) * 100 : 0;
              return (
                <div key={v} className="bar-row">
                  <div>
                    <span>{v}</span>
                    <b>{count} eng</b>
                  </div>
                  <div className="bar-track">
                    <i style={{ width: `${pct}%` }}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel dashboard-panel">
          <div className="dashboard-title">
            <h3>Shift Output</h3>
            <span className="small-note">Total Recorded</span>
          </div>
          <div className="bar-summary">
            {['Day Shift', 'Night Shift'].map((sh) => {
              const count = outputList
                .filter((o) => o.shift === sh)
                .reduce((acc, curr) => acc + Number(curr.engines || 0), 0);
              const pct = totalOutputEngines > 0 ? (count / totalOutputEngines) * 100 : 0;
              return (
                <div key={sh} className="bar-row">
                  <div>
                    <span>{sh}</span>
                    <b>{count} eng</b>
                  </div>
                  <div className="bar-track">
                    <i style={{ width: `${pct}%` }}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel dashboard-panel">
          <div className="dashboard-title">
            <h3>Stock by Variant</h3>
            <span className="small-note">Current balance</span>
          </div>
          <div className="bar-summary">
            {['PFI A00', 'AFD', 'BFN & DFN', 'MP'].map((v) => {
              const bal = Math.max(0, getStockBalance(v));
              return (
                <div key={v} className="bar-row">
                  <div>
                    <span>{v}</span>
                    <b>{bal} eng</b>
                  </div>
                  <div className="bar-track stock">
                    <i style={{ width: bal > 0 ? '100%' : '0%' }}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel dashboard-panel">
          <div className="dashboard-title">
            <h3>Issue Status</h3>
            <span className="small-note">Current</span>
          </div>
          <div className="status-summary">
            <div className="status-chip open">
              <span>Open 4M</span>
              <b>{openIssuesCount}</b>
            </div>
            <div className="status-chip done">
              <span>Resolved</span>
              <b>{issueList.length - openIssuesCount}</b>
            </div>
            <div className="status-chip onsite">
              <span>On-Site</span>
              <b>{onSiteIssuesCount}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="dashboard-title">
          <h3>Daily KPI Snapshot</h3>
          <span className="small-note">Live Summary from LocalStorage</span>
        </div>
        <div className="mini-metrics">
          <div className="mini-metric">
            <span>Target CT Piston</span>
            <b>{cycleTarget} s</b>
          </div>
          <div className="mini-metric">
            <span>Output Records</span>
            <b>{outputList.length}</b>
          </div>
          <div className="mini-metric">
            <span>Manpower Present</span>
            <b>{manpowerList.filter((m) => m.status === 'Present').length}</b>
          </div>
          <div className="mini-metric">
            <span>Active Stock Items</span>
            <b>{stockList.length}</b>
          </div>
        </div>
      </div>
    </section>
  );
}