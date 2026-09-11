import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';
import { GeodesicRadarCanvas } from '../components/GeodesicRadarCanvas';
import { ShelterTimerView } from '../components/ShelterTimerView';
import { RiskGaugeCard } from '../components/RiskGaugeCard';
import { AlertLevel } from '../models/types';

interface Props {
  engine: DisasterEngine;
  onNavigateToNav: () => void;
}

export const RadarView: React.FC<Props> = ({ engine, onNavigateToNav }) => {
  const isDanger = engine.alertLevel === AlertLevel.DANGER;
  const isAdvisory = engine.alertLevel === AlertLevel.ADVISORY;
  const statusColor = isDanger ? '#FF1744' : isAdvisory ? '#FFB300' : '#00E5FF';

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Dynamic Status Card */}
      <div
        style={{
          background: isDanger ? '#1F0609' : '#0F1621',
          border: `1px solid ${statusColor}`,
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: statusColor, letterSpacing: '1px' }}>
            {isDanger ? '⚠️ CRITICAL PERIMETER BREACH' : isAdvisory ? '⚡ ADVISORY PERIMETER APPROACH' : '🛡️ SAFE PERIMETER'}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: statusColor,
              background: `${statusColor}22`,
              padding: '2px 8px',
              borderRadius: '4px',
              border: `1px solid ${statusColor}66`,
            }}
          >
            {engine.alertLevel}
          </span>
        </div>

        <p style={{ color: '#E2E8F0', fontSize: '13px', margin: '8px 0 0 0' }}>
          {engine.nearestStrikeDistanceKm !== null
            ? `Nearest Strike: ${engine.nearestStrikeDistanceKm.toFixed(1)} km (${Math.round(
                engine.nearestStrikeBearing
              )}°) • Incursion Inside 30s Thunder Ring!`
            : 'No active strikes detected within 15 km perimeter.'}
        </p>

        {isDanger && (
          <button
            onClick={onNavigateToNav}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '10px',
              background: '#00E676',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🧭 Route to High-Ground Shelter (Offline HUD)
          </button>
        )}
      </div>

      {/* 30-30 Timer */}
      <ShelterTimerView
        remainingSeconds={engine.timerRemainingSeconds}
        resetCount={engine.timerResetCount}
        isActive={engine.isTimerActive}
        onStop={() => engine.stop30_30Timer()}
      />

      {/* Geodesic Spatial Radar Canvas */}
      <div
        style={{
          background: '#0B0F15',
          border: '1px solid #1E293B',
          borderRadius: '20px',
          padding: '14px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#00E5FF' }}>
            GEODESIC SPATIAL RINGS (10km / 15km / 25km)
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            {engine.strikes.length} Active Discharge(s)
          </span>
        </div>
        <GeodesicRadarCanvas strikes={engine.strikes} shelter={engine.selectedShelter} />
      </div>

      {/* Calibrated Risk Probability Card */}
      <RiskGaugeCard indices={engine.atmosphericIndices} />
    </div>
  );
};
