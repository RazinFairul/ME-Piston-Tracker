import React, { useState } from 'react';

export default function DailyOutput({
  outputList = [],
  setOutputList,
  stockList = [],
  setStockList,
  issueList = [],
  setIssueList,
}) {
  const [editingKey, setEditingKey] = useState(null);

  const [outputDate, setOutputDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [outputShift, setOutputShift] = useState('Day Shift');
  const [outputStation, setOutputStation] = useState('STN2010-1M');
  const [outputTimeMode, setOutputTimeMode] = useState('hours');
  const [outputHours, setOutputHours] = useState('8.08');
  const [outputStart, setOutputStart] = useState('08:00');
  const [outputEnd, setOutputEnd] = useState('17:00');
  const [outputManpower, setOutputManpower] = useState('');
  const [outputDowntime, setOutputDowntime] = useState('0');
  const [outputRemarks, setOutputRemarks] = useState('');
  const [outputHasIssue, setOutputHasIssue] = useState(false);

  // Engine entries in the form
  const [productionEntries, setProductionEntries] = useState([
    { id: 'pe-' + Date.now(), variant: 'PFI A00', unit: 'engine', qty: '' },
  ]);

  const [onsiteIssues, setOnsiteIssues] = useState([
    { desc: '', category: 'Man', start: '', end: '' },
  ]);

  const handleAddEngineType = () => {
    setProductionEntries((prev) => [
      ...prev,
      { id: 'pe-' + Date.now() + Math.random(), variant: 'PFI A00', unit: 'engine', qty: '' },
    ]);
  };

  const handleRemoveEngineType = (index) => {
    if (productionEntries.length === 1) {
      alert('At least one engine type is required.');
      return;
    }
    setProductionEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddOnsiteIssue = () => {
    setOnsiteIssues((prev) => [
      ...prev,
      { desc: '', category: 'Man', start: '', end: '' },
    ]);
  };

  const resetForm = () => {
    setEditingKey(null);
    setOutputRemarks('');
    setOutputDowntime('0');
    setOutputManpower('');
    setOutputHasIssue(false);
    setProductionEntries([
      { id: 'pe-' + Date.now(), variant: 'PFI A00', unit: 'engine', qty: '' },
    ]);
    setOnsiteIssues([{ desc: '', category: 'Man', start: '', end: '' }]);
  };

  // Unique session key for grouping matching records
  const getSessionKey = (rec) =>
    `${rec.date}_${rec.shift}_${rec.station || 'STN2010-1M'}_${rec.hours}_${rec.downtime || '0'}`;

  // 1. Flatten all records (supports both legacy flat records and grouped batch entries)
  const flattenedList = outputList.flatMap((entry, idx) => {
    if (entry.items && Array.isArray(entry.items)) {
      return entry.items.map((item, itemIdx) => ({
        ...item,
        id: `${entry.groupId || idx}-${itemIdx}`,
        date: entry.date,
        shift: entry.shift,
        station: entry.station || 'STN2010-1M',
        hours: entry.hours,
        downtime: entry.downtime || '0',
        remarks: entry.remarks || '-',
        manpower: entry.manpower || '',
      }));
    }
    return [
      {
        ...entry,
        id: entry.id || `legacy-${idx}`,
        station: entry.station || 'STN2010-1M',
        downtime: entry.downtime || '0',
        remarks: entry.remarks || '-',
      },
    ];
  });

  // 2. Group records matching Date, Shift, Station, Working Hours, and Downtime
  const groupedSessions = flattenedList.reduce((acc, rec) => {
    const key = getSessionKey(rec);
    if (!acc[key]) {
      acc[key] = {
        sessionKey: key,
        date: rec.date,
        shift: rec.shift,
        station: rec.station,
        hours: rec.hours,
        downtime: rec.downtime,
        remarks: rec.remarks,
        manpower: rec.manpower,
        items: [],
      };
    }
    acc[key].items.push(rec);
    return acc;
  }, {});

  const groupedList = Object.values(groupedSessions);

  // Submit Form Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const hrs = parseFloat(outputHours) || 8.08;

    const validEntries = productionEntries.filter(
      (pe) => pe.qty && parseInt(pe.qty, 10) > 0
    );

    if (validEntries.length === 0) {
      alert('Please enter a valid quantity for at least one engine variant.');
      return;
    }

    const calculatedItems = validEntries.map((pe) => {
      const qtyNum = parseInt(pe.qty, 10);
      const pistons = pe.unit === 'engine' ? qtyNum * 4 : qtyNum;
      const engines = pe.unit === 'engine' ? qtyNum : (qtyNum / 4).toFixed(1);
      const jph = hrs > 0 ? (engines / hrs).toFixed(1) : '0.0';
      const ctPiston = pistons > 0 ? ((hrs * 3600) / pistons).toFixed(2) : '0.00';
      const ctEngine = engines > 0 ? ((hrs * 3600) / engines).toFixed(2) : '0.00';

      return {
        variant: pe.variant,
        unit: pe.unit,
        qty: qtyNum,
        pistons: Number(pistons),
        engines: Number(engines),
        jph,
        ctPiston,
        ctEngine,
      };
    });

    const newGroup = {
      groupId: 'grp-' + Date.now(),
      date: outputDate,
      shift: outputShift,
      station: outputStation,
      timeMode: outputTimeMode,
      hours: hrs,
      startTime: outputStart,
      endTime: outputEnd,
      manpower: outputManpower,
      downtime: outputDowntime,
      remarks: outputRemarks || '-',
      items: calculatedItems,
    };

    if (editingKey) {
      const remaining = flattenedList.filter((r) => getSessionKey(r) !== editingKey);
      setOutputList([newGroup, ...remaining]);
      alert('Output record successfully updated!');
    } else {
      setOutputList([newGroup, ...outputList]);
      alert('Output record successfully added!');
    }

    // Auto Stock-In Sync
    const newStockIns = calculatedItems.map((item) => ({
      id: Date.now() + Math.random(),
      date: outputDate,
      variant: item.variant,
      type: 'IN',
      source: 'Daily Output',
      pistons: item.pistons,
      engines: item.engines,
      remarks: `Auto stock-in from ${outputShift} (${outputStation})`,
    }));
    setStockList((prev) => [...newStockIns, ...prev]);

    resetForm();
  };

  const handleEditSession = (group) => {
    setEditingKey(group.sessionKey);
    setOutputDate(group.date);
    setOutputShift(group.shift);
    setOutputStation(group.station);
    setOutputHours(group.hours.toString());
    setOutputDowntime(group.downtime.toString().replace('m', ''));
    setOutputRemarks(group.remarks === '-' ? '' : group.remarks);
    setOutputManpower(group.manpower || '');

    setProductionEntries(
      group.items.map((it) => ({
        id: 'pe-' + Math.random(),
        variant: it.variant,
        unit: it.unit || 'engine',
        qty: it.engines || it.qty || (it.pistons ? it.pistons / 4 : ''),
      }))
    );

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDeleteSession = (sessionKey) => {
    if (window.confirm('Are you sure you want to delete all records in this session?')) {
      const remaining = flattenedList.filter((r) => getSessionKey(r) !== sessionKey);
      setOutputList(remaining);
      if (editingKey === sessionKey) resetForm();
    }
  };

  return (
    <section id="output" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Daily Output</h2>
          <p>Engine is the default input. 1 engine = 4 pistons. Output automatically enters stock.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <label>
          Date
          <input
            type="date"
            value={outputDate}
            onChange={(e) => setOutputDate(e.target.value)}
            required
          />
        </label>

        <label>
          Shift
          <select value={outputShift} onChange={(e) => setOutputShift(e.target.value)}>
            <option>Day Shift</option>
            <option>Night Shift</option>
          </select>
        </label>

        <label>
          Station
          <select value={outputStation} onChange={(e) => setOutputStation(e.target.value)}>
            <option>STN2010-1M</option>
            <option>STN2010-2M</option>
            <option>STN2010-3M</option>
            <option>STN2010-4M</option>
            <option>STN2010-5M</option>
          </select>
        </label>

        {/* Engine entries with delete button */}
        <div className="production-entry-box full-width">
          <div className="production-entry-head">
            <div>
              <strong>Production by Engine Type</strong>
              <span className="small-note">
                Record one or more engine types for this shift.
              </span>
            </div>
            <button
              className="btn secondary small"
              type="button"
              onClick={handleAddEngineType}
            >
              + Add Another Engine Type
            </button>
          </div>

          <div id="productionEntries">
            {productionEntries.map((entry, idx) => (
              <div key={entry.id || idx} className="production-entry">
                <div className="production-entry-title">
                  <strong>Engine Type {idx + 1}</strong>
                  {productionEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEngineType(idx)}
                      title="Remove this engine type"
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        lineHeight: '22px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="production-entry-fields">
                  <label>
                    Variant
                    <select
                      value={entry.variant}
                      onChange={(e) => {
                        const updated = [...productionEntries];
                        updated[idx].variant = e.target.value;
                        setProductionEntries(updated);
                      }}
                    >
                      <option>PFI A00</option>
                      <option>AFD</option>
                      <option>BFN &amp; DFN</option>
                      <option>MP</option>
                    </select>
                  </label>

                  <label>
                    Input Unit
                    <select
                      value={entry.unit}
                      onChange={(e) => {
                        const updated = [...productionEntries];
                        updated[idx].unit = e.target.value;
                        setProductionEntries(updated);
                      }}
                    >
                      <option value="engine">Engine</option>
                      <option value="piston">Piston</option>
                    </select>
                  </label>

                  <label>
                    Quantity
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={entry.qty}
                      onChange={(e) => {
                        const updated = [...productionEntries];
                        updated[idx].qty = e.target.value;
                        setProductionEntries(updated);
                      }}
                      required
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <label>
          Working Time
          <select value={outputTimeMode} onChange={(e) => setOutputTimeMode(e.target.value)}>
            <option value="hours">Working Hours</option>
            <option value="range">Time Range (From - To)</option>
          </select>
        </label>

        {outputTimeMode === 'hours' ? (
          <label>
            Working Hours
            <input
              type="number"
              min="0"
              step="0.01"
              value={outputHours}
              onChange={(e) => setOutputHours(e.target.value)}
            />
          </label>
        ) : (
          <>
            <label>
              From
              <input
                type="time"
                value={outputStart}
                onChange={(e) => setOutputStart(e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="time"
                value={outputEnd}
                onChange={(e) => setOutputEnd(e.target.value)}
              />
            </label>
          </>
        )}

        <label>
          Manpower
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={outputManpower}
            onChange={(e) => setOutputManpower(e.target.value)}
          />
        </label>

        <label>
          Downtime (min)
          <input
            type="number"
            min="0"
            step="1"
            value={outputDowntime}
            onChange={(e) => setOutputDowntime(e.target.value)}
          />
        </label>

        <label className="full-width">
          Remarks
          <textarea
            rows="2"
            placeholder="Production remarks..."
            value={outputRemarks}
            onChange={(e) => setOutputRemarks(e.target.value)}
          />
        </label>

        <div className="onsite-box full-width">
          <label className="check-row">
            <input
              type="checkbox"
              checked={outputHasIssue}
              onChange={(e) => setOutputHasIssue(e.target.checked)}
            />{' '}
            Issue Faced On Site
          </label>

          {outputHasIssue && (
            <div className="nested">
              {onsiteIssues.map((issue, idx) => (
                <div key={idx} className="onsite-issue-entry" style={{ marginTop: '8px' }}>
                  <div className="onsite-entry-head">
                    <strong>Issue {idx + 1}</strong>
                  </div>
                  <div className="form-grid">
                    <label>
                      Issue Description
                      <input
                        value={issue.desc}
                        onChange={(e) => {
                          const up = [...onsiteIssues];
                          up[idx].desc = e.target.value;
                          setOnsiteIssues(up);
                        }}
                      />
                    </label>
                    <label>
                      4M Category
                      <select
                        value={issue.category}
                        onChange={(e) => {
                          const up = [...onsiteIssues];
                          up[idx].category = e.target.value;
                          setOnsiteIssues(up);
                        }}
                      >
                        <option>Man</option>
                        <option>Machine</option>
                        <option>Material</option>
                        <option>Method</option>
                        <option>Quality Issue</option>
                      </select>
                    </label>
                    <label>
                      Issue Start
                      <input
                        type="time"
                        value={issue.start}
                        onChange={(e) => {
                          const up = [...onsiteIssues];
                          up[idx].start = e.target.value;
                          setOnsiteIssues(up);
                        }}
                      />
                    </label>
                    <label>
                      Issue End
                      <input
                        type="time"
                        value={issue.end}
                        onChange={(e) => {
                          const up = [...onsiteIssues];
                          up[idx].end = e.target.value;
                          setOnsiteIssues(up);
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button
                className="btn secondary small"
                type="button"
                style={{ marginTop: '8px' }}
                onClick={handleAddOnsiteIssue}
              >
                + Add Another Issue
              </button>
            </div>
          )}
        </div>

        <div className="form-actions full-width" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn primary" type="submit">
            {editingKey ? 'Update Output' : 'Add Output'}
          </button>
          {editingKey && (
            <button className="btn secondary" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* MERGED TABLE BY SESSION */}
      <div className="panel table-panel">
        <div className="table-head">
          <h3>Output Records ({flattenedList.length})</h3>
          <div className="table-tools">
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                if (window.confirm('Delete all output records?')) {
                  setOutputList([]);
                  setStockList((prev) => prev.filter((s) => s.source !== 'Daily Output'));
                }
              }}
            >
              Clear Output Data
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Station</th>
                <th>Variant</th>
                <th>Input</th>
                <th>Pistons</th>
                <th>Engines</th>
                <th>Working Hours</th>
                <th>JPH</th>
                <th>CT Piston</th>
                <th>CT Engine</th>
                <th>Downtime</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedList.length === 0 ? (
                <tr>
                  <td colSpan="14" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No output records saved in storage.
                  </td>
                </tr>
              ) : (
                groupedList.map((group) => {
                  const span = group.items.length;
                  return group.items.map((item, idx) => (
                    <tr key={`${group.sessionKey}-${item.id || idx}`}>
                      {idx === 0 && (
                        <>
                          <td rowSpan={span} style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                            {group.date}
                          </td>
                          <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                            {group.shift}
                          </td>
                          <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                            {group.station}
                          </td>
                        </>
                      )}

                      <td style={{ fontWeight: 600, color: '#1d4ed8' }}>{item.variant}</td>
                      <td>{item.unit || 'engine'}</td>
                      <td>{item.pistons}</td>
                      <td>{item.engines}</td>

                      {idx === 0 && (
                        <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                          {group.hours}h
                        </td>
                      )}

                      <td>{item.jph}</td>
                      <td style={{ fontWeight: 600 }}>{item.ctPiston}s</td>
                      <td>{item.ctEngine}s</td>

                      {idx === 0 && (
                        <>
                          <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                            {group.downtime}m
                          </td>
                          <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                            {group.remarks}
                          </td>
                          <td
                            rowSpan={span}
                            style={{
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                className="btn secondary small"
                                type="button"
                                title="Edit this session"
                                onClick={() => handleEditSession(group)}
                                style={{ padding: '4px 8px' }}
                              >
                                ✎
                              </button>
                              <button
                                className="btn danger small"
                                type="button"
                                title="Delete this session"
                                onClick={() => handleDeleteSession(group.sessionKey)}
                                style={{ padding: '4px 8px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}