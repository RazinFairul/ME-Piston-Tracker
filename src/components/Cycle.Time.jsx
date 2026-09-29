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

  // Ratakan data agar mendukung format lama dan format baru (items)
  const flattenedList = outputList.flatMap((entry, idx) => {
    if (entry.items && Array.isArray(entry.items)) {
      return entry.items.map((item, itemIdx) => ({
        ...item,
        uniqueId: `${entry.groupId || idx}-${itemIdx}`,
        date: entry.date,
        shift: entry.shift,
        station: entry.station || 'STN2010-1M',
        hours: entry.hours,
      }));
    }
    return [
      {
        ...entry,
        uniqueId: entry.id || `legacy-${idx}`,
        station: entry.station || 'STN2010-1M',
      },
    ];
  });

  // Filter berdasarkan Stasiun dan Varian
  const filteredData = flattenedList.filter((o) => {
    const matchVariant = cycleVariantFilter === 'all' || o.variant === cycleVariantFilter;
    const matchStation = cycleStationFilter === 'all' || (o.station || 'STN2010-1M') === cycleStationFilter;
    return matchVariant && matchStation;
  });

  const targetNum = parseFloat(cycleTarget) || 24.5;

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

    const yMax = 29;
    const yMin = 0;
    const getYPixel = (val) => padTop + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

    ctx.clearRect(0, 0, width, height);

    // Garis grid horizontal dan angka sumbu Y
    const yTicks = [0, 6, 12, 18, 24, 29];
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

    // Judul sumbu Y
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

    // Judul sumbu X
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Date', padLeft + plotW / 2, height - 10);

    // Garis putus-putus merah (Target)
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

    // Gambar titik data & garis grafik jika data tersedia
    if (filteredData.length > 0) {
      const getXPixel = (index) => {
        if (filteredData.length === 1) return padLeft + plotW / 2;
        return padLeft + (index / (filteredData.length - 1)) * plotW;
      };

      // Garis penghubung biru
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      filteredData.forEach((pt, i) => {
        const x = getXPixel(i);
        const val = parseFloat(pt.ctPiston) || 0;
        const y = getYPixel(Math.min(val, yMax));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Lingkaran titik (dots)
      filteredData.forEach((pt, i) => {
        const x = getXPixel(i);
        const val = parseFloat(pt.ctPiston) || 0;
        const y = getYPixel(Math.min(val, yMax));

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
  }, [filteredData, targetNum]);

  // Handler kursor hover tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padLeft = 55;
    const padRight = 50;
    const padTop = 35;
    const plotW = rect.width - padLeft - padRight;
    const plotH = 330 - padTop - 45;
    const yMax = 29;

    let found = null;
    filteredData.forEach((pt, i) => {
      const x = filteredData.length === 1 ? padLeft + plotW / 2 : padLeft + (i / (filteredData.length - 1)) * plotW;
      const val = parseFloat(pt.ctPiston) || 0;
      const y = padTop + plotH - (Math.min(val, yMax) / yMax) * plotH;

      if (Math.hypot(mouseX - x, mouseY - y) < 12) {
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
            style={{ width: '100%', height: '330px', display: 'block', cursor: filteredData.length > 0 ? 'crosshair' : 'default' }}
          />

          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${mousePos.x + 12}px`,
                top: `${mousePos.y - 45}px`,
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
              <div><strong>Station:</strong> {hoveredPoint.station || 'STN2010-1M'}</div>
              <div><strong>Variant:</strong> {hoveredPoint.variant}</div>
              <div><strong>Output:</strong> {hoveredPoint.pistons} pistons ({hoveredPoint.engines} eng)</div>
              <div><strong>CT Piston:</strong> {hoveredPoint.ctPiston} sec</div>
              <div><strong>CT Engine:</strong> {hoveredPoint.ctEngine} sec</div>
            </div>
          )}
        </div>
        <div className="point-info">
          Hover over a point to see Output, CT Piston and CT Engine.
        </div>
      </div>

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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No output cycle time data available.
                  </td>
                </tr>
              ) : (
                filteredData.map((rec) => {
                  const meets = Number(rec.ctPiston) <= targetNum;
                  return (
                    <tr key={rec.uniqueId}>
                      <td>{rec.date}</td>
                      <td>{rec.shift}</td>
                      <td>{rec.station || 'STN2010-1M'}</td>
                      <td>{rec.variant}</td>
                      <td>{rec.pistons}</td>
                      <td>{rec.hours}h</td>
                      <td>{rec.jph}</td>
                      <td style={{ fontWeight: 'bold' }}>{rec.ctPiston}s</td>
                      <td>{rec.ctEngine}s</td>
                      <td style={{ color: meets ? '#167a3f' : '#b42318', fontWeight: 'bold' }}>
                        {meets ? 'PASS' : 'SLOW'}
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