import React from 'react';

interface Props {
  remainingSeconds: number;
  resetCount: number;
  isActive: boolean;
  onStop: () => void;
}

export const ShelterTimerView: React.FC<Props> = ({
  remainingSeconds,
  resetCount,
  isActive,
  onStop,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  if (!isActive && remainingSeconds === 0) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1C0A0D 0%, #0E0204 100%)',
        border: '2px solid #FF1744',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '14px',
        boxShadow: '0 4px 20px rgba(255, 23, 68, 0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF8A80', letterSpacing: '1px' }}>
            ⏱️ 30-30 SHELTER COUNTDOWN CLOCK
          </span>
          <p style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
            Remain indoors until clock reaches zero (OSHA / NOAA Standard)
          </p>
        </div>
        {resetCount > 0 && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#FFD54F',
              background: 'rgba(255, 213, 79, 0.15)',
              border: '1px solid rgba(255, 213, 79, 0.4)',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            Auto-Reset: {resetCount}x
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          margin: '14px 0',
        }}
      >
        <span
          style={{
            fontSize: '52px',
            fontWeight: 900,
            fontFamily: 'monospace',
            color: '#FFFFFF',
            letterSpacing: '2px',
            textShadow: '0 0 15px rgba(255, 23, 68, 0.6)',
          }}
        >
          {timeFormatted}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onStop}
          style={{
            flex: 1,
            padding: '8px',
            background: '#334155',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Cancel Clock
        </button>
      </div>
    </div>
  );
};
