import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';
import { HazardType } from '../models/types';
import { TopographicContourCanvas } from '../components/TopographicContourCanvas';

interface Props {
  engine: DisasterEngine;
}

export const HazardsView: React.FC<Props> = ({ engine }) => {
  const selected = engine.selectedHazard;

  const hazards = [
    { type: HazardType.LIGHTNING, label: '⚡ Lightning' },
    { type: HazardType.SEISMIC, label: '🌋 Seismic' },
    { type: HazardType.GLOF, label: '🏔️ GLOF' },
    { type: HazardType.FLASH_FLOOD, label: '🌧️ Flash Flood' },
    { type: HazardType.TSUNAMI, label: '🌊 Tsunami' },
  ];

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          MULTI-HAZARD RESILIENCE ECOSYSTEM
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Unified telemetry across atmospheric and geophysical threats.
        </p>
      </div>

      {/* Hazard Selector Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {hazards.map((h) => {
          const isSel = h.type === selected;
          return (
            <button
              key={h.type}
              onClick={() => engine.setHazard(h.type)}
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
              {h.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Hazard Panels */}
      {selected === HazardType.SEISMIC && (
        <div style={{ background: '#161A22', borderRadius: '16px', padding: '16px' }}>
          <div style={{ color: '#FF5252', fontWeight: 'bold', fontSize: '14px' }}>
            🌋 USGS SEISMIC P/S WAVE DIFFERENTIAL
          </div>
          <p style={{ color: '#B0BEC5', fontSize: '11px', margin: '4px 0 14px 0' }}>
            Primary P-wave (6.0 km/s) detected before destructive shear S-wave (3.5 km/s).
          </p>

          {engine.seismicAlert && engine.seismicAlert.sWaveCountdownSeconds > 0 ? (
            <div
              style={{
                background: '#B71C1C',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '14px',
              }}
            >
              <div style={{ color: '#FFCDD2', fontSize: '12px', fontWeight: 'bold' }}>
                DESTRUCTIVE S-WAVE ARRIVAL IN
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace' }}>
                {engine.seismicAlert.sWaveCountdownSeconds}s
              </div>
              <div style={{ color: '#FFEBEE', fontSize: '12px' }}>
                DROP, COVER & HOLD ON! (Magnitude {engine.seismicAlert.magnitude} •{' '}
                {engine.seismicAlert.epicenterDistanceKm} km away)
              </div>
            </div>
          ) : (
            <div style={{ color: '#00E676', fontSize: '13px', margin: '14px 0' }}>
              No active seismic P-wave events detected in immediate fault sectors.
            </div>
          )}

          <button
            onClick={() => engine.simulateSeismicEvent()}
            style={{
              width: '100%',
              padding: '10px',
              background: '#C62828',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Simulate M6.4 Earthquake P/S Differential
          </button>
        </div>
      )}

      {selected === HazardType.GLOF && (
        <div style={{ background: '#101923', borderRadius: '16px', padding: '16px' }}>
          <div style={{ color: '#40C4FF', fontWeight: 'bold', fontSize: '14px' }}>
            🏔️ GLACIAL LAKE OUTBURST FLOOD (GLOF)
          </div>
          <p style={{ color: '#B0BEC5', fontSize: '11px', margin: '4px 0 14px 0' }}>
            High-altitude moraine lake collapse monitoring with mandatory vertical escape (+30-50m).
          </p>

          {engine.floodAlert && engine.floodAlert.floodType.includes('GLOF') ? (
            <div style={{ background: '#0D2538', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ color: '#80D8FF', fontWeight: 'bold' }}>
                Crest Lead-Time: {engine.floodAlert.crestLeadTimeMinutes} min
              </div>
              <div style={{ color: '#FFD54F', fontWeight: 'bold' }}>
                Required Vertical Climb: +{engine.floodAlert.verticalEvacuationMeters}m uphill
              </div>
              <div style={{ color: '#FF8A80', fontSize: '12px' }}>
                Discharge Surge: {engine.floodAlert.dischargeSurgeRateM3s} m³/s
              </div>
              <p style={{ color: '#FFFFFF', fontSize: '12px', marginTop: '6px' }}>
                {engine.floodAlert.statusSummary}
              </p>

              <div style={{ color: '#80D8FF', fontWeight: 'bold', fontSize: '11px', marginTop: '12px' }}>
                OFFLINE TOPOGRAPHIC INUNDATION & ESCAPE ASCENT
              </div>
              <TopographicContourCanvas
                userElevationMeters={10}
                targetShelterElevationMeters={10 + engine.floodAlert.verticalEvacuationMeters}
                targetBearingDegrees={38.0}
              />
            </div>
          ) : (
            <div style={{ color: '#00E676', fontSize: '13px', margin: '14px 0' }}>
              All monitored alpine glacial basins stable. Normal hydrograph.
            </div>
          )}

          <button
            onClick={() => engine.simulateGlofOutburst()}
            style={{
              width: '100%',
              padding: '10px',
              background: '#0277BD',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Simulate GLOF Moraine Burst (+45m Vertical Escape)
          </button>
        </div>
      )}

      {selected === HazardType.FLASH_FLOOD && (
        <div style={{ background: '#151D24', borderRadius: '16px', padding: '16px' }}>
          <div style={{ color: '#64B5F6', fontWeight: 'bold', fontSize: '14px' }}>
            🌧️ FLASH FLOOD RUNOFF SURGE
          </div>
          <p style={{ color: '#B0BEC5', fontSize: '11px', margin: '4px 0 14px 0' }}>
            Upstream arroyo cloudburst telemetry. Wall-of-water warning with zero cellular reliance.
          </p>

          {engine.floodAlert && engine.floodAlert.floodType.includes('Canyon') ? (
            <div style={{ background: '#0F2636', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ color: '#80D8FF', fontWeight: 'bold' }}>
                Crest Arrival ETA: {engine.floodAlert.crestLeadTimeMinutes} min
              </div>
              <div style={{ color: '#FFD54F', fontWeight: 'bold' }}>
                Required Vertical Ascent: +{engine.floodAlert.verticalEvacuationMeters}m upward
              </div>
              <p style={{ color: '#FFFFFF', fontSize: '12px', marginTop: '6px' }}>
                {engine.floodAlert.statusSummary}
              </p>
            </div>
          ) : (
            <div style={{ color: '#00E676', fontSize: '13px', margin: '14px 0' }}>
              No active flash flood runoff surges in local drainage sectors.
            </div>
          )}

          <button
            onClick={() => engine.simulateFlashFlood()}
            style={{
              width: '100%',
              padding: '10px',
              background: '#1976D2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Simulate Flash Flood Canyon Wash Surge
          </button>
        </div>
      )}

      {selected === HazardType.TSUNAMI && (
        <div style={{ background: '#0F1A24', borderRadius: '16px', padding: '16px' }}>
          <div style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '14px' }}>
            🌊 SUBMARINE TSUNAMI INUNDATION PHYSICS
          </div>
          <p style={{ color: '#B0BEC5', fontSize: '11px', margin: '4px 0 14px 0' }}>
            Shallow-water gravity wave kinematics: v = √(g·d). Coastal wave shoaling & runup analysis.
          </p>

          {engine.tsunamiAlert ? (
            <div style={{ background: '#1E0A12', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FF5252', fontSize: '12px', fontWeight: 'bold' }}>
                  COASTAL ETA COUNTDOWN
                </span>
                <span
                  style={{
                    color: '#FF1744',
                    fontSize: '28px',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                  }}
                >
                  {engine.tsunamiAlert.estimatedArrivalMinutes} min
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#80D8FF', marginTop: '6px' }}>
                Deep Ocean Speed: {engine.tsunamiAlert.deepOceanSpeedKmh} km/h (Bathymetry 4,000m)
              </div>
              <div style={{ fontSize: '12px', color: '#FF8A80', fontWeight: 'bold' }}>
                Projected Runup Height: {engine.tsunamiAlert.projectedRunupHeightMeters}m Surge
              </div>
              <div style={{ fontSize: '12px', color: '#FFD54F', fontWeight: 'bold' }}>
                Mandatory Vertical Ascent: +{engine.tsunamiAlert.verticalAscentRequiredMeters}m above sea level
              </div>
              <p style={{ color: '#FFFFFF', fontSize: '12px', marginTop: '6px' }}>
                {engine.tsunamiAlert.evacuationDirective}
              </p>

              <div style={{ color: '#80D8FF', fontWeight: 'bold', fontSize: '11px', marginTop: '12px' }}>
                OFFLINE TOPOGRAPHIC INUNDATION & ESCAPE ASCENT
              </div>
              <TopographicContourCanvas
                userElevationMeters={4}
                targetShelterElevationMeters={engine.tsunamiAlert.verticalAscentRequiredMeters}
                targetBearingDegrees={65.0}
              />
            </div>
          ) : (
            <div style={{ color: '#00E676', fontSize: '13px', margin: '14px 0' }}>
              Submarine seismic fault monitors nominal. No ocean-basin tsunami warnings active.
            </div>
          )}

          <button
            onClick={() => engine.simulateTsunamiEvent()}
            style={{
              width: '100%',
              padding: '10px',
              background: '#00838F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Simulate M7.9 Submarine Rupture & Inundation Wave
          </button>
        </div>
      )}

      {selected === HazardType.LIGHTNING && (
        <div style={{ background: '#1A1813', borderRadius: '16px', padding: '16px' }}>
          <div style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '14px' }}>
            ⚡ LIGHTNING STRIKE TELEMETRY & TOA ACCURACY
          </div>
          <p style={{ color: '#B0BEC5', fontSize: '11px', margin: '4px 0 14px 0' }}>
            Ground discharges with sub-kilometer accuracy & peak current (kA).
          </p>

          {engine.strikes.length === 0 ? (
            <div style={{ color: '#00E676', fontSize: '13px', margin: '14px 0' }}>
              Zero strike discharges detected in local 15 km perimeter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {engine.strikes.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: '#23201B',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: s.distanceKm <= 10.0 ? '#FF1744' : '#FFB300',
                      }}
                    >
                      {s.distanceKm.toFixed(1)} km ({Math.round(s.bearingDegrees)}°)
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Peak Current: {s.intensityKa.toFixed(1)} kA
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: s.distanceKm <= 10.0 ? '#FF5252' : '#FFD54F',
                    }}
                  >
                    {s.distanceKm <= 10.0 ? 'CRITICAL RING' : 'ADVISORY RING'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => engine.simulateConvectiveIntrusion()}
            style={{
              width: '100%',
              padding: '10px',
              background: '#F57F17',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Simulate Approaching Lightning Cell
          </button>
        </div>
      )}
    </div>
  );
};
