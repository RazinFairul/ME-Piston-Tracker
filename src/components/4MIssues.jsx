import React, { useState } from 'react';

export default function Issues({ issueList = [], setIssueList }) {
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

  const handleAddIssue = (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    const newIssue = {
      id: Date.now(),
      date: issueDate,
      shift: issueShift,
      category: issue4M,
      station: issueStation,
      variant: issueVariant,
      desc: issueDescription,
      rootCause: issueRootCause || '-',
      owner: issueOwner || '-',
      targetDate: issueTargetDate || '-',
      status: issueStatus,
      progressDate: issueProgressDate || '-',
      countermeasure: issueCountermeasure || '-',
    };

    setIssueList((prev) => [newIssue, ...prev]);
    setIssueDescription('');
    setIssueRootCause('');
    setIssueCountermeasure('');
    alert('4M issue ticket logged!');
  };

  return (
    <section id="issues" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>4M Issues</h2>
          <p>Edit progress after submission and filter by Man, Machine, Material or Method.</p>
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
            placeholder="STN2010"
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
            placeholder="Press Alt+Enter for a new line"
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
            <option value="1/4">1/4</option>
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4 Complete">4/4 Complete</option>
          </select>
        </label>

        <div className="form-actions full-width">
          <button className="btn primary" type="submit">
            Add 4M Issue
          </button>
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
                <th>Category</th>
                <th>Station</th>
                <th>Variant</th>
                <th>Issue</th>
                <th>Root Cause</th>
                <th>PIC</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {issueList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No 4M issues found in storage.
                  </td>
                </tr>
              ) : (
                issueList
                  .filter((i) => issueFilter === 'All' || i.category === issueFilter)
                  .map((iss) => (
                    <tr key={iss.id}>
                      <td>{iss.date}</td>
                      <td>{iss.category}</td>
                      <td>{iss.station || '-'}</td>
                      <td>{iss.variant || '-'}</td>
                      <td>{iss.desc}</td>
                      <td>{iss.rootCause || '-'}</td>
                      <td>{iss.owner || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: iss.status.includes('4/4') ? '#167a3f' : '#b42318' }}>
                        {iss.status}
                      </td>
                      <td>
                        <button
                          className="btn danger small"
                          type="button"
                          onClick={() => setIssueList(issueList.filter((x) => x.id !== iss.id))}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}