import React, { useState } from 'react';

export default function DailyOutput({
  outputList = [],
  setOutputList,
  setStockList,
  setIssueList,
}) {
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
  const [productionEntries, setProductionEntries] = useState([
    { variant: 'PFI A00', unit: 'engine', qty: '' },
  ]);
  const [onsiteIssues, setOnsiteIssues] = useState([
    { desc: '', category: 'Man', start: '', end: '' },
  ]);

  const handleAddOutput = (e) => {
    e.preventDefault();
    const hrs = parseFloat(outputHours) || 8.08;

    const newRecords = productionEntries
      .filter((pe) => pe.qty && parseInt(pe.qty, 10) > 0)
      .map((pe) => {
        const qtyNum = parseInt(pe.qty, 10);
        const pistons = pe.unit === 'engine' ? qtyNum * 4 : qtyNum;
        const engines = pe.unit === 'engine' ? qtyNum : (qtyNum / 4).toFixed(1);
        const jph = hrs > 0 ? (engines / hrs).toFixed(1) : 0;
        const ctPiston = pistons > 0 ? ((hrs * 3600) / pistons).toFixed(2) : 0;
        const ctEngine = engines > 0 ? ((hrs * 3600) / engines).toFixed(2) : 0;

        return {
          id: Date.now() + Math.random(),
          date: outputDate,
          shift: outputShift,
          station: outputStation,
          variant: pe.variant,
          unit: pe.unit,
          pistons: Number(pistons),
          engines: Number(engines),
          hours: hrs,
          jph,
          ctPiston,
          ctEngine,
          downtime: outputDowntime,
          remarks: outputRemarks || '-',
        };
      });

    if (newRecords.length === 0) {
      alert('Please enter a valid quantity for production.');
      return;
    }

    setOutputList((prev) => [...newRecords, ...prev]);

    const autoStockIn = newRecords.map((r) => ({
      id: Date.now() + Math.random(),
      date: r.date,
      variant: r.variant,
      type: 'IN',
      source: 'Daily Output',
      pistons: r.pistons,
      engines: r.engines,
      remarks: `Auto stock-in from ${r.shift}`,
    }));
    setStockList((prev) => [...autoStockIn, ...prev]);

    if (outputHasIssue) {
      const issuesToAdd = onsiteIssues
        .filter((oi) => oi.desc.trim())
        .map((oi) => ({
          id: Date.now() + Math.random(),
          date: outputDate,
          shift: outputShift,
          category: oi.category,
          desc: oi.desc,
          start: oi.start || '-',
          end: oi.end || '-',
        }));
      setIssueList((prev) => [...issuesToAdd, ...prev]);
    }

    setProductionEntries([{ variant: 'PFI A00', unit: 'engine', qty: '' }]);
    setOutputRemarks('');
    setOutputHasIssue(false);
    alert('Daily output successfully recorded and stored!');
  };

  return (
    <section id="output" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Daily Output</h2>
          <p>Engine is the default input. 1 engine = 4 pistons. Output automatically enters stock.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleAddOutput}>
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
              onClick={() =>
                setProductionEntries([
                  ...productionEntries,
                  { variant: 'PFI A00', unit: 'engine', qty: '' },
                ])
              }
            >
              + Add Another Engine Type
            </button>
          </div>

          <div id="productionEntries">
            {productionEntries.map((entry, idx) => (
              <div key={idx} className="production-entry">
                <div className="production-entry-title">
                  <strong>Engine Type {idx + 1}</strong>
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
            </div>
          )}
        </div>

        <div className="form-actions full-width">
          <button className="btn primary" type="submit">
            Add Output
          </button>
        </div>
      </form>

      <div className="panel table-panel">
        <div className="table-head">
          <h3>Output Records ({outputList.length})</h3>
          <div className="table-tools">
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                if (window.confirm('Delete all stored output records?')) {
                  setOutputList([]);
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {outputList.length === 0 ? (
                <tr>
                  <td colSpan="14" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No output records saved in storage.
                  </td>
                </tr>
              ) : (
                outputList.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.date}</td>
                    <td>{rec.shift}</td>
                    <td>{rec.station || 'STN2010-1M'}</td>
                    <td>{rec.variant}</td>
                    <td>{rec.unit}</td>
                    <td>{rec.pistons}</td>
                    <td>{rec.engines}</td>
                    <td>{rec.hours}</td>
                    <td>{rec.jph}</td>
                    <td>{rec.ctPiston}s</td>
                    <td>{rec.ctEngine}s</td>
                    <td>{rec.downtime}m</td>
                    <td>{rec.remarks}</td>
                    <td>
                      <button
                        className="btn danger small"
                        type="button"
                        onClick={() => setOutputList(outputList.filter((o) => o.id !== rec.id))}
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