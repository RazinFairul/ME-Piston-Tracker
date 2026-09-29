import React, { useRef, useEffect, useState } from 'react';

export default function CycleTimeChart({ data = [], target = 24.5 }) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resolusi tinggi untuk paparan retina/skrin tajam
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 330 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 330;

    // Margin plotting
    const padLeft = 55;
    const padRight = 50;
    const padTop = 35;
    const padBottom = 45;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Skala Y: 0 hingga 29 saat (seperti gambar rujukan)
    const yMax = 29;
    const yMin = 0;

    const getYPixel = (val) => padTop + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

    // 1. Bersihkan latar
    ctx.clearRect(0, 0, width, height);

    // 2. Garisan Grid Mendatar & Label Paksi Y
    const yTicks = [0, 6, 12, 18, 24, 29];
    ctx.lineWidth = 1;
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yTicks.forEach((tick) => {
      const y = getYPixel(tick);

      // Garisan grid kelabu lembut
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      // Nombor paksi Y
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(tick.toString(), padLeft - 10, y);
    });

    // Label Unit Paksi Y ("Cycle Time (sec/piston)")
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Cycle Time (sec/piston)', padLeft - 20, 18);
    ctx.restore();

    // 3. Garisan Paksi X & Y Asas
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(width - padRight, padTop + plotH);
    ctx.stroke();

    // Label Paksi X ("Date") di bahagian bawah tengah
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Date', padLeft + plotW / 2, height - 10);

    // 4. Garisan Putus-putus Merah: Target 24.50 sec
    const targetY = getYPixel(target);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, targetY);
    ctx.lineTo(width - padRight, targetY);
    ctx.stroke();

    // Label teks target merah di atas garisan sebelah kanan
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Target ${Number(target).toFixed(2)} sec`, width - padRight, targetY - 6);
    ctx.restore();

    // 5. Lukis Data Points & Garisan Tren (jika ada data output)
    if (data && data.length > 0) {
      const getXPixel = (index) => {
        if (data.length === 1) return padLeft + plotW / 2;
        return padLeft + (index / (data.length - 1)) * plotW;
      };

      // Garisan sambungan titik data
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((pt, i) => {
        const x = getXPixel(i);
        const val = parseFloat(pt.ctPiston) || 0;
        const y = getYPixel(Math.min(val, yMax));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Bulatan titik data (dots)
      data.forEach((pt, i) => {
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

        // Label tarikh di bawah titik
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pt.date ? pt.date.slice(5) : '', x, padTop + plotH + 16);
      });
    }
  }, [data, target]);

  // Pengesanan kursor tetikus untuk tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

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
    data.forEach((pt, i) => {
      const x = data.length === 1 ? padLeft + plotW / 2 : padLeft + (i / (data.length - 1)) * plotW;
      const val = parseFloat(pt.ctPiston) || 0;
      const y = padTop + plotH - (Math.min(val, yMax) / yMax) * plotH;

      // Jejari sasaran klik/hover 12px
      if (Math.hypot(mouseX - x, mouseY - y) < 12) {
        found = pt;
        setMousePos({ x, y });
      }
    });

    setHoveredPoint(found);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '330px' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '330px',
          display: 'block',
          cursor: data.length > 0 ? 'crosshair' : 'default',
        }}
      />

      {/* Tooltip Terapung Semasa Hover Point */}
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
          <div><strong>Variant:</strong> {hoveredPoint.variant}</div>
          <div><strong>Output:</strong> {hoveredPoint.pistons} pistons ({hoveredPoint.engines} eng)</div>
          <div><strong>CT Piston:</strong> {hoveredPoint.ctPiston} sec</div>
          <div><strong>CT Engine:</strong> {hoveredPoint.ctEngine} sec</div>
        </div>
      )}
    </div>
  );
}