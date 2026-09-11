import React, { useEffect, useRef } from 'react';

interface Props {
  currentHeading: number;
  targetBearing: number;
}

export const TacticalCompassCanvas: React.FC<Props> = ({
  currentHeading,
  targetBearing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, w, h);

    // Lock-on calculation
    let delta = targetBearing - currentHeading;
    while (delta < -180) delta += 360;
    while (delta > 180) delta -= 360;
    const isLockedOn = Math.abs(delta) <= 8.0;

    // Background circle
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
    grad.addColorStop(0, isLockedOn ? '#062B1C' : '#0B131D');
    grad.addColorStop(1, '#070A0E');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = isLockedOn ? '#00E676' : '#1E293B';
    ctx.lineWidth = isLockedOn ? 3 : 1.5;
    ctx.stroke();

    // Rotating dial
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-currentHeading * Math.PI) / 180);

    // Degree tick marks
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const isCardinal = deg % 90 === 0;

      const innerR = radius - (isCardinal ? 14 : isMajor ? 9 : 5);
      const outerR = radius - 2;

      ctx.beginPath();
      ctx.strokeStyle = isCardinal ? '#00E5FF' : isMajor ? '#94A3B8' : '#334155';
      ctx.lineWidth = isCardinal ? 2 : isMajor ? 1.5 : 1;
      ctx.moveTo(Math.sin(rad) * innerR, -Math.cos(rad) * innerR);
      ctx.lineTo(Math.sin(rad) * outerR, -Math.cos(rad) * outerR);
      ctx.stroke();

      if (isCardinal) {
        ctx.fillStyle = deg === 0 ? '#FF1744' : '#00E5FF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W';
        const textR = radius - 26;
        ctx.fillText(label, Math.sin(rad) * textR, -Math.cos(rad) * textR);
      }
    }

    // Target Shelter Needle / Arrow (Points to Target Bearing)
    const tbRad = (targetBearing * Math.PI) / 180;
    const arrowLen = radius - 15;
    ctx.save();
    ctx.rotate(tbRad);

    ctx.beginPath();
    ctx.fillStyle = isLockedOn ? '#00E676' : '#00E5FF';
    ctx.moveTo(0, -arrowLen);
    ctx.lineTo(-8, -arrowLen + 20);
    ctx.lineTo(8, -arrowLen + 20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();

    // Center Display
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(currentHeading)}°`, cx, cy - 8);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = isLockedOn ? '#00E676' : '#94A3B8';
    ctx.fillText(isLockedOn ? 'LOCK-ON ACTIVE' : `TARGET: ${Math.round(targetBearing)}°`, cx, cy + 14);
  }, [currentHeading, targetBearing]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{
          width: '100%',
          maxWidth: '300px',
          height: 'auto',
          aspectRatio: '1 / 1',
        }}
      />
    </div>
  );
};
