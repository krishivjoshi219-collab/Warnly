import React, { useEffect, useRef } from 'react';
import { LightningStrike, Shelter } from '../models/types';

interface Props {
  strikes: LightningStrike[];
  shelter: Shelter | null;
  onSelectStrike?: (strike: LightningStrike) => void;
}

export const GeodesicRadarCanvas: React.FC<Props> = ({ strikes, shelter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulseAngle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(cx, cy) - 20;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Radar background
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, maxRadius);
      grad.addColorStop(0, '#0F1722');
      grad.addColorStop(1, '#070A0E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Max range = 25 km
      const scale = maxRadius / 25.0;

      // 1. Concentric Range Rings
      const rings = [
        { km: 5, color: 'rgba(255, 255, 255, 0.08)', dash: [2, 4] },
        { km: 10, color: 'rgba(255, 23, 68, 0.7)', dash: [] }, // 10 km Critical Danger
        { km: 15, color: 'rgba(255, 179, 0, 0.7)', dash: [4, 4] }, // 15 km Advisory
        { km: 25, color: 'rgba(0, 229, 255, 0.3)', dash: [] }, // 25 km Outer Basin
      ];

      rings.forEach((r) => {
        ctx.beginPath();
        ctx.setLineDash(r.dash);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.km === 10 ? 2 : 1;
        ctx.arc(cx, cy, r.km * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = r.km === 10 ? '#FF5252' : r.km === 15 ? '#FFD54F' : 'rgba(255, 255, 255, 0.35)';
        ctx.font = '10px monospace';
        ctx.fillText(`${r.km}km`, cx + 6, cy - r.km * scale + 12);
      });

      // 2. Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.stroke();

      // Cardinal Letters
      ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N (0°)', cx, cy - maxRadius - 6);
      ctx.fillText('S (180°)', cx, cy + maxRadius + 14);
      ctx.fillText('E (90°)', cx + maxRadius + 14, cy + 4);
      ctx.fillText('W (270°)', cx - maxRadius - 14, cy + 4);

      // 3. Rotating Sweep Line
      pulseAngle += 0.025;
      const sweepX = cx + Math.cos(pulseAngle) * maxRadius;
      const sweepY = cy + Math.sin(pulseAngle) * maxRadius;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // 4. User Base Center Point
      ctx.beginPath();
      ctx.fillStyle = '#00E5FF';
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Target Shelter Icon
      if (shelter) {
        const shRad = (shelter.bearingDegrees - 90) * (Math.PI / 180);
        const shR = shelter.distanceKm * scale;
        const shX = cx + Math.cos(shRad) * shR;
        const shY = cy + Math.sin(shRad) * shR;

        ctx.fillStyle = '#00E676';
        ctx.fillRect(shX - 4, shY - 4, 8, 8);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#A7F3D0';
        ctx.textAlign = 'left';
        ctx.fillText(shelter.name.split(' ')[0], shX + 7, shY + 3);
      }

      // 6. Lightning Strikes
      strikes.forEach((s) => {
        const rad = (s.bearingDegrees - 90) * (Math.PI / 180);
        const r = s.distanceKm * scale;
        const sx = cx + Math.cos(rad) * r;
        const sy = cy + Math.sin(rad) * r;

        // Danger color if <= 10 km, else advisory
        const isCritical = s.distanceKm <= 10.0;
        const color = isCritical ? '#FF1744' : '#FFB300';

        // Outer pulse ring
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        const pulseR = 6 + (Math.sin(pulseAngle * 4) + 1) * 3;
        ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${s.distanceKm.toFixed(1)}km`, sx + 8, sy + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [strikes, shelter]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: 'auto',
          aspectRatio: '1 / 1',
          borderRadius: '16px',
          border: '1px solid #1E293B',
          background: '#070A0E',
        }}
      />
    </div>
  );
};
