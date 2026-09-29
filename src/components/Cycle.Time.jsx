import React, { useRef, useEffect, useState } from 'react';

export default function CycleTime({
  outputList = [],
  cycleTarget = '24.5',
  setCycleTarget,
}) {
  const [cyclePeriod, setCyclePeriod] = useState('all');
  const [cycleStationFilter, setCycleStationFilter] = useState('all');
  const [cycleVariantFilter, setCycleVariantFilter] = useState('all');

  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const targetNum = parseFloat(cycleTarget) || 24.5;

  // 1. Kunci unik sesi (Date + Shift + Station + Hours + Downtime)
  const getSessionKey = (rec) =>
    `${rec.date}_${rec.shift}_${rec.station || 'STN2010-1M'}_${rec.hours}_${rec.downtime || '0'}`;

  // 2. Ratakan semua rekod (menyokong format lama dan format baharu kumpulan)
  const flattenedList = outputList.flatMap((entry, idx) => {
    if (entry.items && Array.isArray(entry.items)) {
      return entry.items.map((item, itemIdx) => ({
        ...item,
        uniqueId: `${entry.groupId || idx}-${itemIdx}`,
        date: entry.date,
        shift: entry.shift,
        station: entry.station || 'STN2010-1M',
        hours: parseFloat(entry.hours) || 8.08,
        downtime: entry.downtime || '0',
      }));
    }
    return [
      {
        ...entry,
        uniqueId: entry.id || `legacy-${idx}`,
        station: entry.station || 'STN2010-1M',
        hours: parseFloat(entry.hours) || 8.08,
        downtime: entry.downtime || '0',
      },
    ];
  });

  // 3. Kumpulkan sesi dan hitung metrik perkongsian masa yang tepat (sama seperti Daily Output)
  const groupedSessions = flattenedList.reduce((acc, rec) => {
    const key = getSessionKey(rec);
    if (!acc[key]) {
      acc[key] = {
        sessionKey: key,
        date: rec.date,
        shift: rec.shift,
        station: rec.station,
        hours: rec.hours,
        items: [],
      };
    }
    acc[key].items.push(rec);
    return acc;
  }, {});

  const calculatedGroups = Object.values(groupedSessions).map((group) => {
    const totalEngines = group.items.reduce((sum, it) => sum + Number(it.engines || 0), 0);
    const totalPistons = group.items.reduce((sum, it) => sum + Number(it.pistons || 0), 0);
    const hrs = group.hours > 0 ? group.hours : 8.08;

    const sessionJph = hrs > 0 ? (totalEngines / hrs).toFixed(1) : '0.0';
    const sessionCtPiston = totalPistons > 0 ? ((hrs * 3600) / totalPistons).toFixed(2) : '0.00';
    const sessionCtEngine = totalEngines > 0 ? ((hrs * 3600) / totalEngines).toFixed(2) : '0.00';

    return {
      ...group,
      totalEngines,
      totalPistons,
      sessionJph,
      sessionCtPiston,
      sessionCtEngine,
    };
  });

  // 4. Tapis sesi dan item mengikut Stesen & Varian
  const filteredGroups = calculatedGroups
    .filter((g) => cycleStationFilter === 'all' || g.station === cycleStationFilter)
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => cycleVariantFilter === 'all' || it.variant === cycleVariantFilter),
    }))
    .filter((g) => g.items.length > 0);

  // Senarai titik untuk dilukis pada graf
  const graphPoints = filteredGroups.map((g) => ({
    date: g.date,
    shift: g.shift,
    station: g.station,
    ctPiston: parseFloat(g.sessionCtPiston) || 0,
    ctEngine: parseFloat(g.sessionCtEngine) || 0,
    jph: g.sessionJph,
    pistons: g.totalPistons,
    engines: g.totalEngines,
    variants: g.items.map((it) => it.variant).join(', '),
  }));

  // 5. Lukis Graf HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 330 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 330;

    const padLeft = 55;
    const padRight = 50;
    const padTop = 35;
    const padBottom = 45;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Skala Y dinamik (maksimum sekurang-kurangnya 30 atau nilai CT tertinggi)
    const maxValFound = Math.max(...graphPoints.map((p) => p.ctPiston), targetNum);
    const yMax = Math.ceil(maxValFound * 1.25);
    const yMin = 0;
    const getYPixel = (val) => padTop + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

    ctx.clearRect(0, 0, width, height);

    // Garisan grid & nombor paksi Y
    const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];
    ctx.lineWidth = 1;
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yTicks.forEach((tick) => {
      const y = getYPixel(tick);
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(tick.toString(), padLeft - 10, y);
    });

    // Tajuk Unit Paksi Y
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Cycle Time (sec/piston)', padLeft - 20, 18);
    ctx.restore();

    // Sumbu X & Y
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(width - padRight, padTop + plotH);
    ctx.stroke();

    // Label Paksi X (Date)
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Date', padLeft + plotW / 2, height - 10);

    // Garis Sasaran Merah Putus-putus
    const targetY = getYPixel(targetNum);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, targetY);
    ctx.lineTo(width - padRight, targetY);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Target ${targetNum.toFixed(2)} sec`, width - padRight, targetY - 6);
    ctx.restore();

    // Lukis Titik & Garisan Tren Data
    if (graphPoints.length > 0) {
      const getXPixel = (index) => {
        if (graphPoints.length === 1) return padLeft + plotW / 2;
        return padLeft + (index / (graphPoints.length - 1)) * plotW;
      };

      // Garisan biru
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      graphPoints.forEach((pt, i) => {
        const x = getXPixel(i);
        const y = getYPixel(pt.ctPiston);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Titik bulatan (dots)
      graphPoints.forEach((pt, i) => {
        const x = getXPixel(i);
        const y = getYPixel(pt.ctPiston);

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pt.date ? pt.date.slice(5) : '', x, padTop + plotH + 16);
      });
    }
  }, [graphPoints, targetNum]);

  // Handler Tooltip Tetikus
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || graphPoints.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padLeft = 55;
    const padRight = 50;
    const padTop = 35;
    const plotW = rect.width - padLeft - padRight;
    const plotH = 330 - padTop - 45;

    const maxValFound = Math.max(...graphPoints.map((p) => p.ctPiston), targetNum);
    const yMax = Math.ceil(maxValFound * 1.25);

    let found = null;
    graphPoints.forEach((pt, i) => {
      const x = graphPoints.length === 1 ? padLeft + plotW / 2 : padLeft + (i / (graphPoints.length - 1)) * plotW;
      const y = padTop + plotH - (pt.ctPiston / yMax) * plotH;

      if (Math.hypot(mouseX - x, mouseY - y) < 14) {
        found = pt;
        setMousePos({ x, y });
      }
    });

    setHoveredPoint(found);
  };

  return (
    <section id="cycle" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Cycle Time</h2>
          <p>Automatically generated from Daily Output. Hover over a graph point to inspect that record.</p>
        </div>
        <div className="target-box">
          <label>
            Target Cycle (sec/piston)
            <input
              type="number"
              value={cycleTarget}
              min="0.01"
              step="0.01"
              onChange={(e) => setCycleTarget && setCycleTarget(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="panel filter-panel">
        <label>
          <span>View</span>
          <select value={cyclePeriod} onChange={(e) => setCyclePeriod(e.target.value)}>
            <option value="all">All Records</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
            <option value="year">By Year</option>
            <option value="range">Date Range</option>
          </select>
        </label>

        <label>
          <span>Station</span>
          <select value={cycleStationFilter} onChange={(e) => setCycleStationFilter(e.target.value)}>
            <option value="all">All Stations</option>
            <option value="STN2010-1M">STN2010-1M</option>
            <option value="STN2010-2M">STN2010-2M</option>
            <option value="STN2010-3M">STN2010-3M</option>
            <option value="STN2010-4M">STN2010-4M</option>
            <option value="STN2010-5M">STN2010-5M</option>
          </select>
        </label>

        <label>
          <span>Variant</span>
          <select value={cycleVariantFilter} onChange={(e) => setCycleVariantFilter(e.target.value)}>
            <option value="all">All Variants</option>
            <option value="PFI A00">PFI A00</option>
            <option value="AFD">AFD</option>
            <option value="BFN &amp; DFN">BFN &amp; DFN</option>
            <option value="MP">MP</option>
          </select>
        </label>
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: '14px' }}>Cycle Time Graph</h3>
        <div className="chart-wrap" style={{ position: 'relative', width: '100%', minHeight: '330px' }}>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
            style={{ width: '100%', height: '330px', display: 'block', cursor: graphPoints.length > 0 ? 'crosshair' : 'default' }}
          />

          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${mousePos.x + 12}px`,
                top: `${mousePos.y - 50}px`,
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff',
                padding: '7px 11px',
                borderRadius: '6px',
                fontSize: '11px',
                lineHeight: '1.4',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div><strong>Date:</strong> {hoveredPoint.date} ({hoveredPoint.shift})</div>
              <div><strong>Station:</strong> {hoveredPoint.station}</div>
              <div><strong>Variants:</strong> {hoveredPoint.variants}</div>
              <div><strong>Total Output:</strong> {hoveredPoint.pistons} pistons ({hoveredPoint.engines} eng)</div>
              <div><strong>Shift JPH:</strong> {hoveredPoint.jph}</div>
              <div><strong>Shift CT Piston:</strong> {hoveredPoint.ctPiston.toFixed(2)} sec</div>
              <div><strong>Shift CT Engine:</strong> {hoveredPoint.ctEngine.toFixed(2)} sec</div>
            </div>
          )}
        </div>
        <div className="point-info">
          Hover over a point to see Output, CT Piston and CT Engine.
        </div>
      </div>

      {/* JADUAL CYCLE TIME BERCANTUM MENGIKUT SESI (SELARI DENGAN DAILY OUTPUT) */}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Station</th>
                <th>Variant</th>
                <th>Output (Pistons)</th>
                <th>Working Hours</th>
                <th>JPH</th>
                <th>CT Piston</th>
                <th>CT Engine</th>
                <th>Target Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan="10" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No output cycle time data available.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const span = group.items.length;
                  const meets = Number(group.sessionCtPiston) <= targetNum;

                  return group.items.map((item, idx) => (
                    <tr key={`${group.sessionKey}-${item.uniqueId || idx}`}>
                      {/* Sel-sel yang dicantumkan (rowSpan) */}
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

                      {/* Baris per varian */}
                      <td style={{ fontWeight: 600, color: '#1d4ed8' }}>{item.variant}</td>
                      <td>{item.pistons}</td>

                      {/* Metrik masa dan kelajuan bercantum mengikut tempoh masa berkongsi */}
                      {idx === 0 && (
                        <>
                          <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                            {group.hours}h
                          </td>
                          <td rowSpan={span} style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                            {group.sessionJph}
                          </td>
                          <td rowSpan={span} style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                            {group.sessionCtPiston}s
                          </td>
                          <td rowSpan={span} style={{ verticalAlign: 'middle' }}>
                            {group.sessionCtEngine}s
                          </td>
                          <td
                            rowSpan={span}
                            style={{
                              verticalAlign: 'middle',
                              color: meets ? '#167a3f' : '#b42318',
                              fontWeight: 'bold',
                            }}
                          >
                            {meets ? 'PASS' : 'SLOW'}
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