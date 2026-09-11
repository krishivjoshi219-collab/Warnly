import React, { useEffect, useRef } from 'react';

interface Props {
  userElevationMeters: number;
  targetShelterElevationMeters: number;
  targetBearingDegrees: number;
}

export const TopographicContourCanvas: React.FC<Props> = ({
  userElevationMeters,
  targetShelterElevationMeters,
  targetBearingDegrees,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Base background
    ctx.fillStyle = '#0A1017';
    ctx.fillRect(0, 0, w, h);

    // 1. River Channel Danger Wash (Bottom low-lying flood corridor)
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.bezierCurveTo(w * 0.3, h * 0.65, w * 0.6, h * 0.85, w, h * 0.7);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fillStyle = 'rgba(213, 0, 0, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#FF1744';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Topographic Elevation Contour Lines
    const contours = [
      { yRatio: 0.62, label: '+10m', color: 'rgba(255, 255, 255, 0.25)' },
      { yRatio: 0.48, label: '+25m', color: 'rgba(255, 255, 255, 0.35)' },
      { yRatio: 0.35, label: '+50m (Safe Inundation Crest)', color: '#00E5FF' },
      { yRatio: 0.22, label: '+75m', color: 'rgba(255, 255, 255, 0.45)' },
      { yRatio: 0.12, label: '+100m High Ridge Sanctuary', color: '#00E676' },
    ];

    contours.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(0, h * c.yRatio);
      ctx.bezierCurveTo(
        w * 0.35,
        h * (c.yRatio - 0.04),
        w * 0.65,
        h * (c.yRatio + 0.05),
        w,
        h * (c.yRatio - 0.02)
      );
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.label.includes('Safe') || c.label.includes('Ridge') ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = c.color;
      ctx.font = '10px monospace';
      ctx.fillText(c.label, 12, h * c.yRatio - 4);
    });

    // 3. User Location Marker (Low ground)
    const userX = w * 0.25;
    const userY = h * 0.68;
    ctx.beginPath();
    ctx.fillStyle = '#FF5252';
    ctx.arc(userX, userY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`YOU (${userElevationMeters}m)`, userX + 8, userY + 3);

    // 4. Ridge Haven Sanctuary Marker (High ground)
    const ridgeX = w * 0.78;
    const ridgeY = h * 0.16;
    ctx.beginPath();
    ctx.fillStyle = '#00E676';
    ctx.arc(ridgeX, ridgeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A7F3D0';
    ctx.fillText(`SHELTER (+${targetShelterElevationMeters}m)`, ridgeX - 85, ridgeY - 6);

    // 5. Safe Vertical Climb Ascent Vector (Dashed Green Path)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 2;
    ctx.moveTo(userX, userY);
    ctx.lineTo(ridgeX, ridgeY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [userElevationMeters, targetShelterElevationMeters, targetBearingDegrees]);

  return (
    <div style={{ width: '100%', marginTop: '6px' }}>
      <canvas
        ref={canvasRef}
        width={380}
        height={180}
        style={{
          width: '100%',
          height: '180px',
          borderRadius: '12px',
          border: '1px solid #1E293B',
          background: '#0A1017',
        }}
      />
    </div>
  );
};
