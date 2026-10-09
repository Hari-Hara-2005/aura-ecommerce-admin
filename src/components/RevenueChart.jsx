import React, { useRef, useEffect, useState } from 'react';

export default function RevenueChart() {
  const canvasRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  const data = [
    { month: 'Apr', value: 12400 }, { month: 'May', value: 18200 },
    { month: 'Jun', value: 14800 }, { month: 'Jul', value: 22100 },
    { month: 'Aug', value: 28400 }, { month: 'Sep', value: 32100 },
    { month: 'Oct', value: 48672 },
  ];
  const maxVal = Math.max(...data.map(d => d.value)) * 1.15;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const padLeft = 55, padRight = 20, padTop = 20, padBottom = 45;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i <= 4; i++) {
      const y = padTop + (chartH / 4) * i;
      ctx.strokeStyle = 'rgba(100,116,139,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(W - padRight, y); ctx.stroke();
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${(val / 1000).toFixed(0)}k`, padLeft - 10, y + 4);
    }

    const points = data.map((d, i) => ({
      x: padLeft + (chartW / (data.length - 1)) * i,
      y: padTop + chartH - (d.value / maxVal) * chartH,
    }));

    const grad = ctx.createLinearGradient(0, padTop, 0, H - padBottom);
    grad.addColorStop(0, 'rgba(139,92,246,0.25)');
    grad.addColorStop(1, 'rgba(139,92,246,0.0)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, H - padBottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H - padBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1], curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
      ctx.bezierCurveTo(cpx1, prev.y, cpx2, curr.y, curr.x, curr.y);
    }
    const lineGrad = ctx.createLinearGradient(padLeft, 0, W - padRight, 0);
    lineGrad.addColorStop(0, '#8b5cf6');
    lineGrad.addColorStop(1, '#d946ef');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, hoveredIdx === i ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = hoveredIdx === i ? '#d946ef' : '#8b5cf6';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    data.forEach((d, i) => {
      ctx.fillStyle = hoveredIdx === i ? '#e2e8f0' : '#64748b';
      ctx.font = `${hoveredIdx === i ? '600' : '400'} 12px Plus Jakarta Sans, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(d.month, points[i].x, H - padBottom + 22);
    });

    if (hoveredIdx >= 0 && hoveredIdx < data.length) {
      const p = points[hoveredIdx];
      const text = `$${data[hoveredIdx].value.toLocaleString()}`;
      ctx.fillStyle = 'rgba(30,41,59,0.95)';
      const tw = ctx.measureText(text).width + 20;
      const th = 28;
      const tx = p.x - tw / 2;
      const ty = p.y - th - 14;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 8);
      ctx.fill();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, p.x, ty + 18);
    }
  }, [hoveredIdx]);

  const handleMouse = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const W = rect.width, padLeft = 55, padRight = 20;
    const chartW = W - padLeft - padRight;
    const step = chartW / (data.length - 1);
    let closest = -1, minDist = Infinity;
    data.forEach((_, i) => {
      const px = padLeft + step * i;
      const dist = Math.abs(mx - px);
      if (dist < minDist && dist < 30) { minDist = dist; closest = i; }
    });
    setHoveredIdx(closest);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Revenue Overview</h3>
        <span className="text-xs text-slate-500">Last 7 months</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-60 cursor-crosshair"
        onMouseMove={handleMouse}
        onMouseLeave={() => setHoveredIdx(-1)}
      />
    </div>
  );
}
