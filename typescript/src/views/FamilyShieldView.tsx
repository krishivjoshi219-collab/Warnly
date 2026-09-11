import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';
import { CompressedSmsBeacon } from '../telephony/compressed-sms';

interface Props {
  engine: DisasterEngine;
}

export const FamilyShieldView: React.FC<Props> = ({ engine }) => {
  const zones = engine.familyShieldZones;

  const handleAlertFamily = (zoneName: string) => {
    const msg = `WARNLY EMERGENCY ALERT: Critical convective danger detected near ${zoneName}. Take hardened indoor shelter now!`;
    CompressedSmsBeacon.dispatchSms('', msg);
  };

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          👨‍👩‍👧 FAMILY SHIELD (10-ZONE PERIMETER)
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Simultaneous multi-perimeter perimeter telemetry across family locations, schools, and job sites.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {zones.map((z) => (
          <div
            key={z.id}
            style={{
              background: '#0F1722',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800 }}>{z.name}</h4>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  Monitoring Radius: {z.radiusKm} km • {z.status}
                </div>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#00E676',
                  background: 'rgba(0, 230, 118, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {z.alertLevel}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => handleAlertFamily(z.name)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#1E293B',
                  color: '#FFD54F',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                📱 Dispatch Emergency SMS to Family
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
