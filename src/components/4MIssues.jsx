import React, { useState } from 'react';

export default function Issues({ issueList = [], setIssueList }) {
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [issueShift, setIssueShift] = useState('Day Shift');
  const [issue4M, setIssue4M] = useState('Man');
  const [issueStation, setIssueStation] = useState('');
  const [issueVariant, setIssueVariant] = useState('PFI A00');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueRootCause, setIssueRootCause] = useState('');
  const [issueOwner, setIssueOwner] = useState('');
  const [issueTargetDate, setIssueTargetDate] = useState('');
  const [issueStatus, setIssueStatus] = useState('1/4');
  const [issueProgressDate, setIssueProgressDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [issueCountermeasure, setIssueCountermeasure] = useState('');

  // Filter state
  const [issueFilter, setIssueFilter] = useState('All');

  const resetForm = () => {
    setEditingId(null);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setIssueShift('Day Shift');
    setIssue4M('Man');
    setIssueStation('');
    setIssueVariant('PFI A00');
    setIssueDescription('');
    setIssueRootCause('');
    setIssueOwner('');
    setIssueTargetDate('');
    setIssueStatus('1/4');
    setIssueProgressDate(new Date().toISOString().slice(0, 10));
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
                variant: issueVariant || 'PFI A00',
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
        variant: issueVariant || 'PFI A00',
        desc: issueDescription,
        rootCause: issueRootCause || '-',
        owner: issueOwner || '-',
        targetDate: issueTargetDate || '-',
        status: issueStatus || '1/4',
        progressDate: issueProgressDate || '-',
        countermeasure: issueCountermeasure || '-',
      };

      setIssueList((prev) => [newIssue, ...prev]);
      alert('4M issue ticket added!');
    }

    resetForm();
  };

  const handleEditIssue = (issue) => {
    setEditingId(issue.id);
    setIssueDate(issue.date || new Date().toISOString().slice(0, 10));
    setIssueShift(issue.shift || 'Day Shift');
    setIssue4M(issue.category || 'Man');
    setIssueStation(issue.station && issue.station !== '-' ? issue.station : '');
    setIssueVariant(issue.variant || 'PFI A00');
    setIssueDescription(issue.desc || '');
    setIssueRootCause(issue.rootCause && issue.rootCause !== '-' ? issue.rootCause : '');
    setIssueOwner(issue.owner && issue.owner !== '-' ? issue.owner : '');
    setIssueTargetDate(issue.targetDate && issue.targetDate !== '-' ? issue.targetDate : '');
    setIssueStatus(issue.status || '1/4');
    setIssueProgressDate(issue.progressDate && issue.progressDate !== '-' ? issue.progressDate : new Date().toISOString().slice(0, 10));
    setIssueCountermeasure(issue.countermeasure && issue.countermeasure !== '-' ? issue.countermeasure : '');

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDeleteIssue = (id) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      setIssueList((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    }
  };

  // Safe category filtering
  const filteredList = issueList.filter((i) => {
    if (issueFilter === 'All') return true;
    const cat = (i.category || '').toLowerCase();
    return cat === issueFilter.toLowerCase();
  });

  // Kiraan mengikut kategori 4M
  const manCount = issueList.filter((i) => (i.category || '').toLowerCase() === 'man').length;
  const machineCount = issueList.filter((i) => (i.category || '').toLowerCase() === 'machine').length;
  const materialCount = issueList.filter((i) => (i.category || '').toLowerCase() === 'material').length;
  const methodCount = issueList.filter((i) => (i.category || '').toLowerCase() === 'method').length;

  return (
    <section id="issues" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>4M Issues</h2>
          <p>Edit progress after submission and filter by Man, Machine, Material or Method.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleAddIssue}>
        {/* Baris 1 */}
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

        {/* Baris 2 */}
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

        <label>
          Issue Description
          <textarea
            rows="2"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Press Alt+Enter for a new line"
            required
          />
        </label>

        {/* Baris 3 */}
        <label>
          Root Cause
          <textarea
            rows="2"
            value={issueRootCause}
            onChange={(e) => setIssueRootCause(e.target.value)}
            placeholder="Press Alt+Enter for a new line"
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

        {/* Baris 4 */}
        <label>
          Status
          <select value={issueStatus} onChange={(e) => setIssueStatus(e.target.value)}>
            <option value="1/4">1/4</option>
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4 Complete">4/4 Complete</option>
          </select>
        </label>

        <label>
          Progress Update Date
          <input
            type="date"
            value={issueProgressDate}
            onChange={(e) => setIssueProgressDate(e.target.value)}
          />
        </label>

        <label>
          Countermeasure / Progress
          <textarea
            rows="2"
            value={issueCountermeasure}
            onChange={(e) => setIssueCountermeasure(e.target.value)}
            placeholder="What was updated / completed today? Press Alt+Enter for a new line."
          />
        </label>

        {/* Butang Tindakan Borang */}
        <div className="form-actions full-width" style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
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

      {/* Bar Penapis Khas dengan Jalur Ungu Sebelah Kiri */}
      <div
        className="panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '4px solid #7c3aed',
          padding: '12px 18px',
          marginBottom: '14px',
          borderRadius: '8px',
          background: '#ffffff',
        }}
      >
        <strong style={{ fontSize: '13px', color: '#1f2937' }}>Filter:</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Man', 'Machine', 'Material', 'Method'].map((f) => {
            const isActive = issueFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setIssueFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #7c3aed' : '1px solid #d1d5db',
                  background: isActive ? '#7c3aed' : '#ffffff',
                  color: isActive ? '#ffffff' : '#374151',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lencana Kiraan Ringkasan 4M Mengikut Reka Bentuk Gambar Asal */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#1e293b',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          Man: {manCount}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#1e293b',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          Machine: {machineCount}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#1e293b',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          Material: {materialCount}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#1e293b',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          Method: {methodCount}
        </div>
      </div>

      {/* Jadual Rekod 4M Issues */}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Issue Date</th>
                <th>4M</th>
                <th>Station</th>
                <th>Variant</th>
                <th>Issue</th>
                <th>PIC</th>
                <th>Target</th>
                <th>Status</th>
                <th>Latest Progress</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="small-note" style={{ textAlign: 'center', padding: '22px' }}>
                    No Issues.
                  </td>
                </tr>
              ) : (
                filteredList.map((iss) => {
                  const statusStr = String(iss.status || '1/4');
                  const isDone = statusStr.includes('4/4');

                  return (
                    <tr key={iss.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{iss.date || '-'}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{iss.category || 'Man'}</span>
                      </td>
                      <td>{iss.station || '-'}</td>
                      <td>{iss.variant || 'All'}</td>
                      <td style={{ maxWidth: '220px', whiteSpace: 'pre-wrap' }}>{iss.desc || '-'}</td>
                      <td>{iss.owner || '-'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{iss.targetDate || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: isDone ? '#167a3f' : '#b42318', whiteSpace: 'nowrap' }}>
                        {statusStr}
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'pre-wrap' }}>
                        {iss.countermeasure && iss.countermeasure !== '-' ? iss.countermeasure : '-'}
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