import React, { useState } from 'react';

export default function Issues({ issueList = [], setIssueList }) {
  const [editingId, setEditingId] = useState(null);

  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [issueShift, setIssueShift] = useState('Day Shift');
  const [issue4M, setIssue4M] = useState('Man');
  const [issueStation, setIssueStation] = useState('');
  const [issueVariant, setIssueVariant] = useState('All');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueRootCause, setIssueRootCause] = useState('');
  const [issueOwner, setIssueOwner] = useState('');
  const [issueTargetDate, setIssueTargetDate] = useState('');
  const [issueStatus, setIssueStatus] = useState('1/4');
  const [issueProgressDate, setIssueProgressDate] = useState('');
  const [issueCountermeasure, setIssueCountermeasure] = useState('');
  const [issueFilter, setIssueFilter] = useState('All');

  const resetForm = () => {
    setEditingId(null);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setIssueShift('Day Shift');
    setIssue4M('Man');
    setIssueStation('');
    setIssueVariant('All');
    setIssueDescription('');
    setIssueRootCause('');
    setIssueOwner('');
    setIssueTargetDate('');
    setIssueStatus('1/4');
    setIssueProgressDate('');
    setIssueCountermeasure('');
  };

  const handleAddIssue = (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    if (editingId) {
      setIssueList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                date: issueDate,
                shift: issueShift,
                category: issue4M,
                station: issueStation || '-',
                variant: issueVariant || 'All',
                desc: issueDescription,
                rootCause: issueRootCause || '-',
                owner: issueOwner || '-',
                targetDate: issueTargetDate || '-',
                status: issueStatus || '1/4',
                progressDate: issueProgressDate || '-',
                countermeasure: issueCountermeasure || '-',
              }
            : item
        )
      );
      alert('Issue ticket successfully updated!');
    } else {
      const newIssue = {
        id: Date.now() + Math.random(),
        date: issueDate,
        shift: issueShift,
        category: issue4M,
        station: issueStation || '-',
        variant: issueVariant || 'All',
        desc: issueDescription,
        rootCause: issueRootCause || '-',
        owner: issueOwner || '-',
        targetDate: issueTargetDate || '-',
        status: issueStatus || '1/4',
        progressDate: issueProgressDate || '-',
        countermeasure: issueCountermeasure || '-',
      };

      setIssueList((prev) => [newIssue, ...prev]);
      alert('4M issue ticket logged!');
    }

    resetForm();
  };

  const handleEditIssue = (issue) => {
    setEditingId(issue.id);
    setIssueDate(issue.date || new Date().toISOString().slice(0, 10));
    setIssueShift(issue.shift || 'Day Shift');
    setIssue4M(issue.category || 'Man');
    setIssueStation(issue.station && issue.station !== '-' ? issue.station : '');
    setIssueVariant(issue.variant || 'All');
    setIssueDescription(issue.desc || '');
    setIssueRootCause(issue.rootCause && issue.rootCause !== '-' ? issue.rootCause : '');
    setIssueOwner(issue.owner && issue.owner !== '-' ? issue.owner : '');
    setIssueTargetDate(issue.targetDate && issue.targetDate !== '-' ? issue.targetDate : '');
    setIssueStatus(issue.status || '1/4');
    setIssueProgressDate(issue.progressDate && issue.progressDate !== '-' ? issue.progressDate : '');
    setIssueCountermeasure(issue.countermeasure && issue.countermeasure !== '-' ? issue.countermeasure : '');

    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleDeleteIssue = (id) => {
    if (window.confirm('Are you sure you want to delete this issue ticket?')) {
      setIssueList((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    }
  };

  // Penapisan selamat (Defensive Filtering)
  const filteredList = issueList.filter((i) => {
    if (issueFilter === 'All') return true;
    const cat = (i.category || '').toLowerCase();
    return cat === issueFilter.toLowerCase();
  });

  return (
    <section id="issues" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>4M Issues</h2>
          <p>Edit progress after submission and filter by Man, Machine, Material, or Method.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleAddIssue}>
        <label>
          Date
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </label>

        <label>
          Shift
          <select value={issueShift} onChange={(e) => setIssueShift(e.target.value)}>
            <option>Day Shift</option>
            <option>Night Shift</option>
          </select>
        </label>

        <label>
          4M Category
          <select value={issue4M} onChange={(e) => setIssue4M(e.target.value)}>
            <option>Man</option>
            <option>Machine</option>
            <option>Material</option>
            <option>Method</option>
          </select>
        </label>

        <label>
          Station
          <input
            value={issueStation}
            onChange={(e) => setIssueStation(e.target.value)}
            placeholder="e.g. STN2010"
            required
          />
        </label>

        <label>
          Variant
          <select value={issueVariant} onChange={(e) => setIssueVariant(e.target.value)}>
            <option>PFI A00</option>
            <option>AFD</option>
            <option>BFN &amp; DFN</option>
            <option>MP</option>
            <option>All</option>
          </select>
        </label>

        <label className="full-width">
          Issue Description
          <textarea
            rows="2"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe the issue observed..."
            required
          />
        </label>

        <label className="full-width">
          Root Cause
          <textarea
            rows="2"
            value={issueRootCause}
            onChange={(e) => setIssueRootCause(e.target.value)}
            placeholder="Root cause findings..."
          />
        </label>

        <label className="full-width">
          Countermeasure
          <textarea
            rows="2"
            value={issueCountermeasure}
            onChange={(e) => setIssueCountermeasure(e.target.value)}
            placeholder="Corrective actions taken..."
          />
        </label>

        <label>
          Owner / PIC
          <input
            value={issueOwner}
            onChange={(e) => setIssueOwner(e.target.value)}
            placeholder="PIC Name"
          />
        </label>

        <label>
          Target Completion Date
          <input
            type="date"
            value={issueTargetDate}
            onChange={(e) => setIssueTargetDate(e.target.value)}
          />
        </label>

        <label>
          Status
          <select value={issueStatus} onChange={(e) => setIssueStatus(e.target.value)}>
            <option value="1/4">1/4 (Identified)</option>
            <option value="2/4">2/4 (Root Cause Analyzed)</option>
            <option value="3/4">3/4 (Countermeasure Executed)</option>
            <option value="4/4 Complete">4/4 Complete (Verified)</option>
          </select>
        </label>

        <div className="form-actions full-width" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn primary" type="submit">
            {editingId ? 'Update Issue' : 'Add 4M Issue'}
          </button>
          {editingId && (
            <button className="btn secondary" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="issue-filters panel">
        <strong>Filter:</strong>
        {['All', 'Man', 'Machine', 'Material', 'Method'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${issueFilter === f ? 'active' : ''}`}
            type="button"
            onClick={() => setIssueFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Category</th>
                <th>Station</th>
                <th>Variant</th>
                <th>Issue</th>
                <th>Root Cause</th>
                <th>Countermeasure</th>
                <th>PIC</th>
                <th>Target Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="12" className="small-note" style={{ textAlign: 'center', padding: '18px' }}>
                    No 4M issues found in storage.
                  </td>
                </tr>
              ) : (
                filteredList.map((iss) => {
                  const statusStr = String(iss.status || '1/4');
                  const isDone = statusStr.includes('4/4');

                  return (
                    <tr key={iss.id}>
                      <td>{iss.date || '-'}</td>
                      <td>{iss.shift || '-'}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{iss.category || 'General'}</span>
                      </td>
                      <td>{iss.station || '-'}</td>
                      <td>{iss.variant || 'All'}</td>
                      <td>{iss.desc || '-'}</td>
                      <td>{iss.rootCause || '-'}</td>
                      <td>{iss.countermeasure || '-'}</td>
                      <td>{iss.owner || '-'}</td>
                      <td>{iss.targetDate || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: isDone ? '#167a3f' : '#b42318' }}>
                        {statusStr}
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            className="btn secondary small"
                            type="button"
                            title="Edit this ticket"
                            onClick={() => handleEditIssue(iss)}
                            style={{ padding: '4px 8px' }}
                          >
                            ✎
                          </button>
                          <button
                            className="btn danger small"
                            type="button"
                            title="Delete this ticket"
                            onClick={() => handleDeleteIssue(iss.id)}
                            style={{ padding: '4px 8px' }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}