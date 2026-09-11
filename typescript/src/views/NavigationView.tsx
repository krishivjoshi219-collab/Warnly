import React, { useState } from 'react';
import { DisasterEngine } from '../service/disaster-engine';
import { TacticalCompassCanvas } from '../components/TacticalCompassCanvas';
import { GeoMath } from '../physics/geo-math';

interface Props {
  engine: DisasterEngine;
}

export const NavigationView: React.FC<Props> = ({ engine }) => {
  const shelter = engine.selectedShelter;
  const currentHeading = engine.sensorManager.compassHeading;
  const targetBearing = shelter
    ? GeoMath.calculateBearingDegrees(
        engine.userLatitude,
        engine.userLongitude,
        shelter.latitude,
        shelter.longitude
      )
    : 0.0;

  let delta = targetBearing - currentHeading;
  while (delta < -180) delta += 360;
  while (delta > 180) delta -= 360;
  const isAligned = Math.abs(delta) <= 8.0;

  // Steering ribbon
  const ribbonText = isAligned
    ? `▲ ON TARGET: PROCEED STRAIGHT (Bearing ${Math.round(targetBearing)}°)`
    : delta > 0
    ? `▶ TURN RIGHT ${Math.round(delta)}° (Align with ${Math.round(targetBearing)}°)`
    : `◀ TURN LEFT ${Math.round(Math.abs(delta))}° (Align with ${Math.round(targetBearing)}°)`;

  const ribbonBg = isAligned ? '#00C853' : Math.abs(delta) > 90 ? '#D50000' : '#FF9100';

  const [sonarActive, setSonarActive] = useState(engine.homingBeeper.isActive);

  const toggleSonar = () => {
    if (sonarActive) {
      engine.homingBeeper.stopHoming();
      setSonarActive(false);
    } else {
      engine.homingBeeper.startHoming();
      setSonarActive(true);
    }
  };

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          AUTONOMOUS DISASTER NAVIGATION HUD
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Zero cellular/satellite routing. Hardware magnetometer lock-on & sonar guidance.
        </p>
      </div>

      {/* Dynamic CDI Ribbon */}
      <div
        style={{
          background: ribbonBg,
          color: isAligned ? '#000000' : '#FFFFFF',
          fontWeight: 900,
          fontSize: '12px',
          textAlign: 'center',
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '14px',
          boxShadow: isAligned ? '0 0 15px rgba(0, 230, 118, 0.4)' : 'none',
        }}
      >
        {ribbonText}
      </div>

      {/* Aviation Compass Rose Canvas */}
      <div
        style={{
          background: '#0B0F15',
          border: '1px solid #1E293B',
          borderRadius: '20px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <TacticalCompassCanvas currentHeading={currentHeading} targetBearing={targetBearing} />
      </div>

      {/* Target Shelter Card */}
      {shelter && (
        <div
          style={{
            background: '#0F1722',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold' }}>ACTIVE DESTINATION</div>
              <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800, margin: '2px 0' }}>
                {shelter.name}
              </h4>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#00E676',
                background: 'rgba(0, 230, 118, 0.12)',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              {shelter.distanceKm.toFixed(1)} km away
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <div style={{ background: '#172230', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#94A3B8' }}>AZIMUTH</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#00E5FF' }}>
                {Math.round(shelter.bearingDegrees)}°
              </div>
            </div>
            <div style={{ background: '#172230', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#94A3B8' }}>ELEVATION GAIN</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFD54F' }}>
                +{shelter.requiredClimbMeters}m
              </div>
            </div>
            <div style={{ background: '#172230', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#94A3B8' }}>CAPACITY</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{shelter.capacity} pax</div>
            </div>
          </div>
        </div>
      )}

      {/* Sonar Homing Toggle */}
      <button
        onClick={toggleSonar}
        style={{
          width: '100%',
          padding: '14px',
          background: sonarActive ? '#D50000' : '#1E293B',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        {sonarActive
          ? '🔊 STOP 1200 Hz ACOUSTIC SONAR'
          : '📡 ACTIVATE BLIND 1200 Hz ACOUSTIC SONAR HOMING (EYES-FREE)'}
      </button>
    </div>
  );
};
