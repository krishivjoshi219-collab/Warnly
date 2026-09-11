import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';

interface Props {
  engine: DisasterEngine;
}

export const BlackoutSurvivalView: React.FC<Props> = ({ engine }) => {
  const blackout = engine.blackoutManager;
  const shelter = engine.selectedShelter;
  const heading = engine.sensorManager.compassHeading;

  return (
    <div
      style={{
        minHeight: '80vh',
        background: '#000000',
        color: '#FFFFFF',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Header Ticker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, color: '#00E676', letterSpacing: '2px' }}>
            72-HOUR BLACKOUT SURVIVAL HUD
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#000000',
              background: '#00E676',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {blackout.isBlackoutModeActive ? 'OLED 0mW ACTIVE' : 'STANDBY'}
          </div>
        </div>

        {/* Big Runtime Metric */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <div style={{ fontSize: '11px', color: '#666666', fontWeight: 'bold' }}>
            ESTIMATED SURVIVAL RUNTIME REMAINING
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: '#FFFFFF',
              margin: '4px 0',
            }}
          >
            {blackout.estimatedHoursRemaining}h
          </div>
          <div style={{ fontSize: '13px', color: '#00E676', fontWeight: 'bold' }}>
            Battery: {blackout.batteryPercent}% • {blackout.isCharging ? '⚡ Charging' : 'Low-Power Duty Cycle'}
          </div>
        </div>

        {/* Minimalist Waypoint Telemetry */}
        {shelter && (
          <div
            style={{
              border: '1px solid #222222',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#666666', fontWeight: 'bold' }}>
              HIGH-GROUND WAYPOINT
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '2px 0' }}>
              {shelter.name}
            </div>
            <div style={{ fontSize: '13px', color: '#00E676', fontFamily: 'monospace' }}>
              Distance: {shelter.distanceKm.toFixed(1)} km • Compass: {Math.round(heading)}° (Target {Math.round(shelter.bearingDegrees)}°)
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() =>
            engine.opticalBeacon.isStrobeActive
              ? engine.opticalBeacon.stopSosStrobe()
              : engine.opticalBeacon.startSosStrobe()
          }
          style={{
            width: '100%',
            padding: '14px',
            background: engine.opticalBeacon.isStrobeActive ? '#D50000' : '#222222',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {engine.opticalBeacon.isStrobeActive
            ? '💡 STOP OPTICAL SOS STROBE'
            : '🔦 PULSE MORSE SOS FLASHLIGHT'}
        </button>

        <button
          onClick={() =>
            blackout.isBlackoutModeActive
              ? blackout.disableBlackoutMode()
              : blackout.enableBlackoutMode()
          }
          style={{
            width: '100%',
            padding: '14px',
            background: blackout.isBlackoutModeActive ? '#00897B' : '#1B5E20',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {blackout.isBlackoutModeActive
            ? 'EXIT BLACKOUT SURVIVAL (RESTORE NORMAL UI)'
            : 'ENGAGE 72-HOUR PURE OLED SURVIVAL MODE'}
        </button>
      </div>
    </div>
  );
};
