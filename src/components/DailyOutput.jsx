import React, { useState } from 'react';

export default function DailyOutput({
  outputList = [],
  setOutputList,
  stockList = [],
  setStockList,
  issueList = [],
  setIssueList,
}) {
  // --- Form State ---
  const [editingGroupId, setEditingGroupId] = useState(null);

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

  // Senarai jenis enjin dalam borang
  const [productionEntries, setProductionEntries] = useState([
    { id: 'pe-' + Date.now(), variant: 'PFI A00', unit: 'engine', qty: '' },
  ]);

  // Senarai isu on-site
  const [onsiteIssues, setOnsiteIssues] = useState([
    { desc: '', category: 'Man', start: '', end: '' },
  ]);

  // Tambah baris enjin baharu
  const handleAddEngineType = () => {
    setProductionEntries((prev) => [
      ...prev,
      { id: 'pe-' + Date.now() + Math.random(), variant: 'PFI A00', unit: 'engine', qty: '' },
    ]);
  };

  // Padam baris enjin tertentu (butang pangkah ✕)
  const handleRemoveEngineType = (index) => {
    if (productionEntries.length === 1) {
      alert('Sekurang-kurangnya satu jenis enjin diperlukan.');
      return;
    }
    setProductionEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Tambah baris isu on-site
  const handleAddOnsiteIssue = () => {
    setOnsiteIssues((prev) => [
      ...prev,
      { desc: '', category: 'Man', start: '', end: '' },
    ]);
  };

  // Reset borang ke asal
  const resetForm = () => {
    setEditingGroupId(null);
    setOutputRemarks('');
    setOutputDowntime('0');
    setOutputManpower('');
    setOutputHasIssue(false);
    setProductionEntries([
      { id: 'pe-' + Date.now(), variant: 'PFI A00', unit: 'engine', qty: '' },
    ]);
    setOnsiteIssues([{ desc: '', category: 'Man', start: '', end: '' }]);
  };

  // Submit Borang (Simpan Baharu atau Kemas Kini)
  const handleSubmit = (e) => {
    e.preventDefault();
    const hrs = parseFloat(outputHours) || 8.08;

    const validEntries = productionEntries.filter(
      (pe) => pe.qty && parseInt(pe.qty, 10) > 0
    );

    if (validEntries.length === 0) {
      alert('Sila masukkan kuantiti yang sah untuk sekurang-kurangnya satu enjin.');
      return;
    }

    const groupId = editingGroupId || 'grp-' + Date.now();

    // Hitung item-item enjin di bawah kumpulan ini
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

    const groupRecord = {
      groupId,
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

    if (editingGroupId) {
      // Mod Kemaskini (Update)
      setOutputList((prev) =>
        prev.map((g) => (g.groupId === editingGroupId ? groupRecord : g))
      );

      // Kemas kini stok berkaitan
      setStockList((prev) => {
        const withoutOld = prev.filter((s) => s.sourceGroupId !== editingGroupId);
        const newStockIns = calculatedItems.map((item) => ({
          id: Date.now() + Math.random(),
          sourceGroupId: groupId,
          date: outputDate,
          variant: item.variant,
          type: 'IN',
          source: 'Daily Output',
          pistons: item.pistons,
          engines: item.engines,
          remarks: `Auto stock-in from ${outputShift} (${outputStation})`,
        }));
        return [...newStockIns, ...withoutOld];
      });

      alert('Rekod berjaya dikemaskini!');
    } else {
      // Mod Tambah Baharu
      setOutputList((prev) => [groupRecord, ...prev]);

      // Masuk ke Stock secara automatik
      const newStockIns = calculatedItems.map((item) => ({
        id: Date.now() + Math.random(),
        sourceGroupId: groupId,
        date: outputDate,
        variant: item.variant,
        type: 'IN',
        source: 'Daily Output',
        pistons: item.pistons,
        engines: item.engines,
        remarks: `Auto stock-in from ${outputShift} (${outputStation})`,
      }));
      setStockList((prev) => [...newStockIns, ...prev]);

      // Simpan isu on-site jika ada
      if (outputHasIssue) {
        const issuesToAdd = onsiteIssues
          .filter((oi) => oi.desc.trim())
          .map((oi) => ({
            id: Date.now() + Math.random(),
            sourceGroupId: groupId,
            date: outputDate,
            shift: outputShift,
            category: oi.category,
            desc: oi.desc,
            start: oi.start || '-',
            end: oi.end || '-',
          }));
        setIssueList((prev) => [...issuesToAdd, ...prev]);
      }

      alert('Rekod Daily Output berjaya ditambah!');
    }

    resetForm();
  };

  // Muat data ke dalam borang untuk disunting (Edit)
  const handleEditGroup = (group) => {
    setEditingGroupId(group.groupId);
    setOutputDate(group.date);
    setOutputShift(group.shift);
    setOutputStation(group.station);
    setOutputTimeMode(group.timeMode || 'hours');
    setOutputHours(group.hours.toString());
    setOutputStart(group.startTime || '08:00');
    setOutputEnd(group.endTime || '17:00');
    setOutputManpower(group.manpower || '');
    setOutputDowntime(group.downtime || '0');
    setOutputRemarks(group.remarks === '-' ? '' : group.remarks);

    if (group.items && group.items.length > 0) {
      setProductionEntries(
        group.items.map((it) => ({
          id: 'pe-' + Math.random(),
          variant: it.variant,
          unit: it.unit,
          qty: it.qty,
        }))
      );
    }

    // Skrol ke bahagian borang
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Padam rekod kumpulan (Delete)
  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Adakah anda pasti ingin memadam rekod ini?')) {
      setOutputList((prev) => prev.filter((g) => g.groupId !== groupId));
      // Padam stok berkaitan
      setStockList((prev) => prev.filter((s) => s.sourceGroupId !== groupId));
      if (editingGroupId === groupId) {
        resetForm();
      }
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

      {/* BORANG INPUT / EDIT */}
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

        {/* Bahagian Jenis Enjin dengan Butang Pangkah (✕) */}
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
                  {/* Butang Pangkah (✕) - hanya muncul jika ada lebih dari 1 enjin */}
                  {productionEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEngineType(idx)}
                      title="Padam engine type ini"
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
            {editingGroupId ? 'Update Output' : 'Add Output'}
          </button>
          {editingGroupId && (
            <button className="btn secondary" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* JADUAL OUTPUT DENGAN PENYATUAN KUMPULAN (ROWSPAN), EDIT & DELETE */}
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
                  setStockList((prev) => prev.filter((s) => !s.sourceGroupId));
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
              {outputList.length === 0 ? (
                <tr>
                  <td colSpan="14" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No output records saved in storage.
                  </td>
                </tr>
              ) : (
                outputList.map((group) => {
                  const items = group.items || [
                    {
                      variant: group.variant,
                      unit: group.unit || 'engine',
                      pistons: group.pistons,
                      engines: group.engines,
                      jph: group.jph,
                      ctPiston: group.ctPiston,
                      ctEngine: group.ctEngine,
                    },
                  ];

                  return items.map((item, itemIdx) => (
                    <tr key={`${group.groupId || group.id}-${itemIdx}`}>
                      {/* Sel-sel kongsi hanya dirender sekali dengan rowSpan */}
                      {itemIdx === 0 && (
                        <>
                          <td rowSpan={items.length} style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                            {group.date}
                          </td>
                          <td rowSpan={items.length} style={{ verticalAlign: 'middle' }}>
                            {group.shift}
                          </td>
                          <td rowSpan={items.length} style={{ verticalAlign: 'middle' }}>
                            {group.station || 'STN2010-1M'}
                          </td>
                        </>
                      )}

                      {/* Sel khusus untuk jenis enjin ini */}
                      <td style={{ fontWeight: 600, color: '#1d4ed8' }}>{item.variant}</td>
                      <td>{item.unit}</td>
                      <td>{item.pistons}</td>
                      <td>{item.engines}</td>

                      {/* Maklumat masa dan operasi yang kongsi */}
                      {itemIdx === 0 && (
                        <>
                          <td rowSpan={items.length} style={{ verticalAlign: 'middle' }}>
                            {group.hours}h
                          </td>
                        </>
                      )}

                      <td>{item.jph}</td>
                      <td style={{ fontWeight: 600 }}>{item.ctPiston}s</td>
                      <td>{item.ctEngine}s</td>

                      {/* Sel kongsi downtime, remarks, dan butang tindakan */}
                      {itemIdx === 0 && (
                        <>
                          <td rowSpan={items.length} style={{ verticalAlign: 'middle' }}>
                            {group.downtime}m
                          </td>
                          <td rowSpan={items.length} style={{ verticalAlign: 'middle' }}>
                            {group.remarks}
                          </td>
                          <td
                            rowSpan={items.length}
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
                                title="Edit rekod ini"
                                onClick={() => handleEditGroup(group)}
                                style={{ padding: '4px 8px' }}
                              >
                                ✎
                              </button>
                              <button
                                className="btn danger small"
                                type="button"
                                title="Padam rekod ini"
                                onClick={() => handleDeleteGroup(group.groupId || group.id)}
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