import React, { useState } from 'react';

export default function MonthlyTarget({ targetList = [], setTargetList }) {
  const [targetMonth, setTargetMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [targetPFI, setTargetPFI] = useState('0');
  const [targetAFD, setTargetAFD] = useState('0');
  const [targetBFNDFN, setTargetBFNDFN] = useState('0');
  const [targetMP, setTargetMP] = useState('0');
  const [monthlyJph, setMonthlyJph] = useState('');
  const [monthlyCycle, setMonthlyCycle] = useState('24.5');
  const [monthlyOee, setMonthlyOee] = useState('85');
  const [workingDays, setWorkingDays] = useState('26');
  const [monthlyHours, setMonthlyHours] = useState('8.08');
  const [monthlyShifts, setMonthlyShifts] = useState('1');

  const [calcResult, setCalcResult] = useState({
    totalTarget: 0,
    ctBasedJph: '0.00',
    plannedJph: '0.00',
    estimatedCapacity: 0,
    margin: 0,
  });

  const [expandedRowId, setExpandedRowId] = useState(null);

  const currentTotalTarget =
    (parseInt(targetPFI, 10) || 0) +
    (parseInt(targetAFD, 10) || 0) +
    (parseInt(targetBFNDFN, 10) || 0) +
    (parseInt(targetMP, 10) || 0);

  const handleCalculate = () => {
    const ctSec = parseFloat(monthlyCycle) || 24.5;
    const oeeVal = (parseFloat(monthlyOee) || 85) / 100;
    const plannedJphVal = parseFloat(monthlyJph) || 0;
    const days = parseInt(workingDays, 10) || 26;
    const hours = parseFloat(monthlyHours) || 8.08;
    const shifts = parseInt(monthlyShifts, 10) || 1;

    // CT-based JPH = (3600 / (CT piston * 4)) * OEE
    const ctBasedJph = ctSec > 0 ? ((3600 / (ctSec * 4)) * oeeVal).toFixed(2) : '0.00';
    const activeJph = plannedJphVal > 0 ? plannedJphVal : parseFloat(ctBasedJph);
    const estimatedCapacity = Math.round(activeJph * hours * shifts * days);
    const margin = estimatedCapacity - currentTotalTarget;

    setCalcResult({
      totalTarget: currentTotalTarget,
      ctBasedJph: ctBasedJph,
      plannedJph: plannedJphVal.toFixed(2),
      estimatedCapacity: estimatedCapacity,
      margin: margin,
    });
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();

    if (currentTotalTarget <= 0) {
      alert('Please enter a target engine quantity for variants.');
      return;
    }

    const days = parseInt(workingDays, 10) || 26;
    const shifts = parseInt(monthlyShifts, 10) || 1;
    const reqPerDay = (currentTotalTarget / days).toFixed(1);
    const reqPerShift = (currentTotalTarget / (days * shifts)).toFixed(1);

    const ctSec = parseFloat(monthlyCycle) || 24.5;
    const oeeVal = (parseFloat(monthlyOee) || 85) / 100;
    const plannedJphVal = parseFloat(monthlyJph) || 0;
    const activeJph = plannedJphVal > 0 ? plannedJphVal : (3600 / (ctSec * 4)) * oeeVal;
    const capacity = Math.round(activeJph * (parseFloat(monthlyHours) || 8.08) * shifts * days);

    const newTarget = {
      id: Date.now(),
      month: targetMonth,
      total: currentTotalTarget,
      pfi: parseInt(targetPFI, 10) || 0,
      afd: parseInt(targetAFD, 10) || 0,
      bfndfn: parseInt(targetBFNDFN, 10) || 0,
      mp: parseInt(targetMP, 10) || 0,
      reqPerDay: reqPerDay,
      reqPerShift: reqPerShift,
      plannedJph: plannedJphVal > 0 ? plannedJphVal.toFixed(2) : activeJph.toFixed(2),
      ctPiston: ctSec.toFixed(2),
      oee: monthlyOee,
      capacity: capacity,
      days: days,
      shifts: shifts,
    };

    setTargetList((prev) => [newTarget, ...prev]);
    handleCalculate();
    alert('Monthly target successfully saved!');
  };

  const toggleRowDetails = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="target" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Monthly Target</h2>
          <p>Save management targets by month and variant. Use the saved target as your monthly reference.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleSaveTarget}>
        <label>
          Month
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            required
          />
        </label>

        <div className="variant-target full-width">
          <div className="variant-target-head">
            <strong>Management Target by Variant (engines)</strong>
            <span className="small-note">Enter all 4 variants. Total is calculated automatically.</span>
          </div>
          <div className="variant-target-grid">
            <label>
              PFI A00
              <input
                type="number"
                min="0"
                step="1"
                value={targetPFI}
                onChange={(e) => setTargetPFI(e.target.value)}
                required
              />
            </label>
            <label>
              AFD
              <input
                type="number"
                min="0"
                step="1"
                value={targetAFD}
                onChange={(e) => setTargetAFD(e.target.value)}
                required
              />
            </label>
            <label>
              BFN &amp; DFN
              <input
                type="number"
                min="0"
                step="1"
                value={targetBFNDFN}
                onChange={(e) => setTargetBFNDFN(e.target.value)}
                required
              />
            </label>
            <label>
              MP
              <input
                type="number"
                min="0"
                step="1"
                value={targetMP}
                onChange={(e) => setTargetMP(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="target-total">
            Total Monthly Target: <strong>{currentTotalTarget} engines</strong>
          </div>
        </div>

        <label>
          Planned JPH
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 15.00"
            value={monthlyJph}
            onChange={(e) => setMonthlyJph(e.target.value)}
          />
        </label>

        <label>
          Planned CT Piston (sec)
          <input
            type="number"
            step="0.01"
            value={monthlyCycle}
            onChange={(e) => setMonthlyCycle(e.target.value)}
            required
          />
        </label>

        <label>
          Planned OEE (%)
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={monthlyOee}
            onChange={(e) => setMonthlyOee(e.target.value)}
            required
          />
        </label>

        <label>
          Working Days
          <input
            type="number"
            min="1"
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
            required
          />
        </label>

        <label>
          Hours / Shift
          <input
            type="number"
            step="0.01"
            value={monthlyHours}
            onChange={(e) => setMonthlyHours(e.target.value)}
            required
          />
        </label>

        <label>
          Shifts / Day
          <select value={monthlyShifts} onChange={(e) => setMonthlyShifts(e.target.value)}>
            <option value="1">1 Shift</option>
            <option value="2">2 Shifts</option>
          </select>
        </label>

        <div className="form-actions full-width" style={{ marginTop: '6px' }}>
          <button className="btn secondary" type="button" onClick={handleCalculate}>
            Calculate
          </button>
          <button className="btn primary" type="submit">
            Save Target
          </button>
        </div>
      </form>

      {/* 5 Metric Calculation Cards */}
      <div className="commitment-cards" style={{ margin: '18px 0' }}>
        <div className="commit-card" style={{ borderTop: '4px solid #2563eb' }}>
          <span>Total Target</span>
          <strong>{calcResult.totalTarget} engines</strong>
        </div>
        <div className="commit-card" style={{ borderTop: '4px solid #0ea5e9' }}>
          <span>CT-based JPH</span>
          <strong>{calcResult.ctBasedJph}</strong>
        </div>
        <div className="commit-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <span>Planned JPH</span>
          <strong>{calcResult.plannedJph}</strong>
        </div>
        <div className="commit-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <span>Estimated Capacity</span>
          <strong>{calcResult.estimatedCapacity} engines</strong>
        </div>
        <div className="commit-card" style={{ borderTop: '4px solid #10b981' }}>
          <span>Margin</span>
          <strong style={{ color: calcResult.margin >= 0 ? '#167a3f' : '#b42318' }}>
            {calcResult.margin} engines
          </strong>
        </div>
      </div>

      {/* Saved Management Targets Table */}
      <div className="panel target-list-panel">
        <div className="table-head">
          <h3>Saved Management Targets</h3>
          <span className="small-note">Required / Day = Monthly Target ÷ Working Days</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month / Variant</th>
                <th>Target (engines)</th>
                <th>Required / Day</th>
                <th>Required / Shift</th>
                <th>Planned JPH</th>
                <th>CT Piston</th>
                <th>OEE</th>
                <th>Capacity</th>
                <th>Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {targetList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="small-note" style={{ textAlign: 'center', padding: '18px' }}>
                    No saved targets.
                  </td>
                </tr>
              ) : (
                targetList.map((t) => (
                  <React.Fragment key={t.id}>
                    <tr className="target-month-row">
                      <td>
                        <strong>{t.month}</strong>
                      </td>
                      <td>
                        <b>{t.total} eng</b>
                      </td>
                      <td>{t.reqPerDay} eng</td>
                      <td>{t.reqPerShift} eng</td>
                      <td>{t.plannedJph}</td>
                      <td>{t.ctPiston}s</td>
                      <td>{t.oee}%</td>
                      <td>{t.capacity} eng</td>
                      <td>
                        <button
                          className="btn secondary small"
                          type="button"
                          onClick={() => toggleRowDetails(t.id)}
                        >
                          {expandedRowId === t.id ? 'Hide ▲' : 'Details ▼'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn danger small"
                          type="button"
                          onClick={() => setTargetList(targetList.filter((x) => x.id !== t.id))}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>

                    {expandedRowId === t.id && (
                      <tr className="target-detail-row">
                        <td colSpan="10" style={{ padding: '12px 18px', background: '#f8fafc' }}>
                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px' }}>
                            <div><strong>PFI A00:</strong> {t.pfi} eng</div>
                            <div><strong>AFD:</strong> {t.afd} eng</div>
                            <div><strong>BFN &amp; DFN:</strong> {t.bfndfn} eng</div>
                            <div><strong>MP:</strong> {t.mp} eng</div>
                            <div><strong>Working Days:</strong> {t.days} days</div>
                            <div><strong>Shifts:</strong> {t.shifts} shift(s)</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Target Timeline */}
      <div className="panel" style={{ marginTop: '14px' }}>
        <div className="table-head">
          <h3>Monthly Target Timeline</h3>
          <span className="small-note">Weekly view based on the saved monthly management target and planning inputs.</span>
        </div>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <span className="small-note">
            {targetList.length === 0 ? 'No saved monthly targets.' : 'Timeline generated from saved targets.'}
          </span>
        </div>
      </div>
    </section>
  );
}