import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';

interface Props {
  engine: DisasterEngine;
}

export const LocalEdgeView: React.FC<Props> = ({ engine }) => {
  const sensors = engine.sensorManager;

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          LOCAL ON-DEVICE EDGE SENSORY INTELLIGENCE
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          100% offline physical sensor fusion. Evaluates barometric squall tendency and seismic ground tremor.
        </p>
      </div>

      {/* 1. Barometer Tendency Card */}
      <div
        style={{
          background: '#0F1722',
          border: `1px solid ${sensors.isSquallAlarm ? '#FF1744' : '#1E293B'}`,
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64B5F6' }}>
            🌡️ BAROMETRIC PRESSURE TENDENCY (ΔP/Δt)
          </span>
          {sensors.isSquallAlarm && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#FF5252',
                background: 'rgba(255, 23, 68, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              SQUALL ALARM
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0' }}>
          <div style={{ background: '#172230', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>CURRENT PRESSURE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
              {sensors.currentPressureHpa.toFixed(1)} hPa
            </div>
          </div>
          <div style={{ background: '#172230', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>RATE OF DROP</div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: sensors.isSquallAlarm ? '#FF1744' : '#00E676',
              }}
            >
              -{sensors.pressureDropRateHpaPerHr.toFixed(1)} hPa/hr
            </div>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: '#94A3B8' }}>
          Threshold: Drops &gt; 2.0 hPa/hr indicate severe convective squall line or cold front intrusion.
        </p>

        <button
          onClick={() => sensors.simulateSquallDrop(2.8)}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '8px',
            background: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Test Simulated -2.8 hPa/hr Severe Squall Drop
        </button>
      </div>

      {/* 2. Seismic Ground Motion Card */}
      <div
        style={{
          background: '#0F1722',
          border: `1px solid ${sensors.isSeismicAlarm ? '#FF1744' : '#1E293B'}`,
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFB74D' }}>
            🌋 SEISMIC GROUND ACCELERATION (3-AXIS PGA)
          </span>
          {sensors.isSeismicAlarm && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#FF5252',
                background: 'rgba(255, 23, 68, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              TREMOR DETECTED
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0' }}>
          <div style={{ background: '#172230', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>CURRENT PGA</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
              {sensors.currentPgaG.toFixed(2)} g
            </div>
          </div>
          <div style={{ background: '#172230', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>PEAK SHOCK</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FF9100' }}>
              {sensors.peakPgaG.toFixed(2)} g
            </div>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: '#94A3B8' }}>
          Continuous 3-axis accelerometer monitoring removes 1g static gravity to isolate dynamic ground tremor.
        </p>

        <button
          onClick={() => sensors.simulateSeismicShock(0.18)}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '8px',
            background: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Test Simulated 0.18g Earthquake Shock
        </button>
      </div>
    </div>
  );
};
