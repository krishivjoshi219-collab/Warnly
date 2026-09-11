import React, { useState } from 'react';
import { DEMOGRAPHIC_PROTOCOLS } from '../models/types';

export const ProtocolsView: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = DEMOGRAPHIC_PROTOCOLS[selectedIdx];

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          DEMOGRAPHIC DISASTER PROTOCOLS
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Targeted life-safety evacuation procedures compliant with OSHA 1926, NOAA, and WMO standards.
        </p>
      </div>

      {/* Protocol Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {DEMOGRAPHIC_PROTOCOLS.map((p, idx) => {
          const isSel = idx === selectedIdx;
          return (
            <button
              key={p.demographic}
              onClick={() => setSelectedIdx(idx)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: isSel ? '1px solid #00E5FF' : '1px solid #1E293B',
                background: isSel ? 'rgba(0, 229, 255, 0.15)' : '#0F1722',
                color: isSel ? '#00E5FF' : '#94A3B8',
                fontWeight: isSel ? 800 : 500,
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {p.icon} {p.demographic.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Selected Protocol Card */}
      {current && (
        <div style={{ background: '#0F1722', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>{current.icon}</span>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 800 }}>{current.demographic}</h4>
              <div style={{ fontSize: '11px', color: '#00E5FF' }}>Category: {current.category}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {current.criticalRules.map((rule, rIdx) => (
              <div
                key={rIdx}
                style={{
                  background: '#172230',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#E2E8F0',
                  borderLeft: '3px solid #00E5FF',
                }}
              >
                <strong style={{ color: '#FFD54F', marginRight: '6px' }}>Rule {rIdx + 1}:</strong>
                {rule}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
