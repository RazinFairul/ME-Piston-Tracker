import React, { useState } from 'react';

export default function Manpower({ manpowerList = [], setManpowerList }) {
  const [mpDate, setMpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mpShift, setMpShift] = useState('Day Shift');
  const [mpEmployee, setMpEmployee] = useState('');
  const [mpStation, setMpStation] = useState('STN2010');
  const [mpRole, setMpRole] = useState('Operator');
  const [mpStatus, setMpStatus] = useState('Present');

  const handleAddManpower = (e) => {
    e.preventDefault();
    if (!mpEmployee.trim()) return;

    const newMp = {
      id: Date.now(),
      date: mpDate,
      shift: mpShift,
      employee: mpEmployee,
      station: mpStation,
      role: mpRole,
      status: mpStatus,
    };

    setManpowerList((prev) => [newMp, ...prev]);
    setMpEmployee('');
    alert('Manpower record saved!');
  };

  return (
    <section id="manpower" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Manpower</h2>
          <p>Day Shift and Night Shift allocation.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleAddManpower}>
        <label>
          Date
          <input
            type="date"
            value={mpDate}
            onChange={(e) => setMpDate(e.target.value)}
            required
          />
        </label>

        <label>
          Shift
          <select value={mpShift} onChange={(e) => setMpShift(e.target.value)}>
            <option>Day Shift</option>
            <option>Night Shift</option>
          </select>
        </label>

        <label>
          Employee / ID
          <input
            value={mpEmployee}
            onChange={(e) => setMpEmployee(e.target.value)}
            placeholder="e.g. OP-1042"
            required
          />
        </label>

        <label>
          Station
          <input
            value={mpStation}
            onChange={(e) => setMpStation(e.target.value)}
            placeholder="STN2010"
            required
          />
        </label>

        <label>
          Role
          <select value={mpRole} onChange={(e) => setMpRole(e.target.value)}>
            <option>Operator</option>
            <option>Technician</option>
            <option>Leader</option>
            <option>Engineer</option>
          </select>
        </label>

        <label>
          Status
          <select value={mpStatus} onChange={(e) => setMpStatus(e.target.value)}>
            <option>Present</option>
            <option>Absent</option>
            <option>Support</option>
          </select>
        </label>

        <button className="btn primary" type="submit">
          Add Manpower
        </button>
      </form>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Employee</th>
                <th>Station</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {manpowerList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No manpower records logged.
                  </td>
                </tr>
              ) : (
                manpowerList.map((m) => (
                  <tr key={m.id}>
                    <td>{m.date}</td>
                    <td>{m.shift}</td>
                    <td>{m.employee}</td>
                    <td>{m.station}</td>
                    <td>{m.role}</td>
                    <td style={{ fontWeight: 'bold', color: m.status === 'Present' ? '#167a3f' : '#b42318' }}>
                      {m.status}
                    </td>
                    <td>
                      <button
                        className="btn danger small"
                        type="button"
                        onClick={() => setManpowerList(manpowerList.filter((x) => x.id !== m.id))}
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