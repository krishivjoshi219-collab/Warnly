import React from 'react';
import { AtmosphericIndices } from '../models/types';

interface Props {
  indices: AtmosphericIndices;
}

export const RiskGaugeCard: React.FC<Props> = ({ indices }) => {
  const percent = indices.calculatedRiskPercent;
  const isDanger = percent >= 70;
  const isAdvisory = percent >= 30 && percent < 70;
  const color = isDanger ? '#FF1744' : isAdvisory ? '#FFB300' : '#00E5FF';

  return (
    <div
      style={{
        background: '#0F1621',
        border: `1px solid ${color}44`,
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '1px' }}>
          CALIBRATED CONVECTIVE RISK
        </span>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: color }}>
          {percent === 0 ? '0% Gated Safe (Clear Sky)' : `${percent}% Probability`}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: '#1E293B',
          borderRadius: '3px',
          margin: '12px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ background: '#17202E', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' }}>CAPE</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{indices.cape} J/kg</div>
        </div>
        <div style={{ background: '#17202E', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' }}>LIFTED INDEX</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{indices.liftedIndex}</div>
        </div>
        <div style={{ background: '#17202E', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' }}>PRECIP</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
            {indices.precipitationRateMmH.toFixed(1)} mm/h
          </div>
        </div>
      </div>
    </div>
  );
};
