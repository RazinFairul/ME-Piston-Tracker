import React, { useState } from 'react';

export default function BufferSimulation() {
  const [simTargetEngines, setSimTargetEngines] = useState('');
  const [simJph, setSimJph] = useState('');
  const [simOee, setSimOee] = useState('85');
  const [simCycle, setSimCycle] = useState('');
  const [simHours, setSimHours] = useState('8.08');
  const [simShifts, setSimShifts] = useState('2');
  const [simDays, setSimDays] = useState('26');
  const [simStartingBuffer, setSimStartingBuffer] = useState('0');
  const [simResult, setSimResult] = useState(null);

  const handleSimulate = (e) => {
    e.preventDefault();
    const cap = Math.round(
      (parseFloat(simJph) || 0) *
        (parseFloat(simHours) || 8.08) *
        (parseInt(simShifts, 10) || 2) *
        (parseInt(simDays, 10) || 26) *
        ((parseFloat(simOee) || 85) / 100)
    );
    setSimResult({ cap });
  };

  return (
    <section id="simulation" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Buffer Simulation</h2>
          <p>Use this as a scenario checker. It does not save or become the monthly target.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleSimulate}>
        <label>
          Target Output (engines)
          <input
            type="number"
            min="1"
            value={simTargetEngines}
            onChange={(e) => setSimTargetEngines(e.target.value)}
            required
          />
        </label>

        <label>
          Target JPH (engines/hour)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={simJph}
            onChange={(e) => setSimJph(e.target.value)}
            required
          />
        </label>

        <label>
          OEE (%)
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={simOee}
            onChange={(e) => setSimOee(e.target.value)}
            required
          />
        </label>

        <label>
          CT Piston (sec)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={simCycle}
            onChange={(e) => setSimCycle(e.target.value)}
            required
          />
        </label>

        <label>
          Working Hours / Shift
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={simHours}
            onChange={(e) => setSimHours(e.target.value)}
            required
          />
        </label>

        <label>
          Shifts / Day
          <select value={simShifts} onChange={(e) => setSimShifts(e.target.value)}>
            <option value="1">1 Shift</option>
            <option value="2">2 Shifts</option>
          </select>
        </label>

        <label>
          Working Days
          <input
            type="number"
            min="1"
            value={simDays}
            onChange={(e) => setSimDays(e.target.value)}
            required
          />
        </label>

        <label>
          Starting Buffer (engines)
          <input
            type="number"
            min="0"
            value={simStartingBuffer}
            onChange={(e) => setSimStartingBuffer(e.target.value)}
          />
        </label>

        <div className="full-width">
          <button className="btn primary" type="submit">
            Run Simulation
          </button>
        </div>
      </form>

      {simResult && (
        <div className="simulation-grid">
          <div className="sim-card">
            <span>Calculated Capacity</span>
            <strong>{simResult.cap} eng</strong>
          </div>
        </div>
      )}
    </section>
  );
}