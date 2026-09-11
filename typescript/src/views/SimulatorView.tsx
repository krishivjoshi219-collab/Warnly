import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';

interface Props {
  engine: DisasterEngine;
}

export const SimulatorView: React.FC<Props> = ({ engine }) => {
  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          DISASTER SIMULATION & TEST HUB
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Test and validate all White Paper requirements, sirens, alarms, and timers on demand.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Scenario 1 */}
        <SimCard
          title="1. Convective Thunderstorm Intrusion"
          description="Simulates atmospheric charge build-up (CAPE 2450 J/kg, LI -5.8), followed by strikes breaching 15 km Advisory and 10 km Critical Danger Rings. Starts 30-30 timer and triggers siren."
          buttonText="Trigger Convective Intrusion"
          buttonColor="#D50000"
          onClick={() => engine.simulateConvectiveIntrusion()}
        />

        {/* Scenario 2 */}
        <SimCard
          title="2. Subsequent Strike 30-30 Timer Reset (FR-03)"
          description="Simulates a secondary strike at 4.2 km. Automatically resets the 30-30 countdown clock back to 30:00 to prevent premature resumption of outdoor activities."
          buttonText="Trigger Strike Reset (4.2 km)"
          buttonColor="#FF6D00"
          onClick={() => engine.simulateSecondaryStrikeReset()}
        />

        {/* Scenario 3 */}
        <SimCard
          title="3. Seismic P/S Differential Arrival Countdown"
          description="Simulates USGS P-wave detection for M6.4 earthquake 85 km away. Displays live countdown to destructive S-wave arrival (P: 6 km/s vs S: 3.5 km/s)."
          buttonText="Trigger Seismic Countdown"
          buttonColor="#C2185B"
          onClick={() => engine.simulateSeismicEvent()}
        />

        {/* Scenario 4 */}
        <SimCard
          title="4. Glacial Lake Outburst Flood (GLOF)"
          description="Simulates high-altitude moraine dam burst. 28 min crest lead-time with mandatory vertical evacuation (+45m upward climb)."
          buttonText="Trigger GLOF Valley Surge"
          buttonColor="#0091EA"
          onClick={() => engine.simulateGlofOutburst()}
        />

        {/* Scenario 5 */}
        <SimCard
          title="5. Flash Flood Canyon Runoff Surge"
          description="Simulates 65 mm/hr upstream cloudburst triggering sudden canyon runoff surge."
          buttonText="Trigger Flash Flood Surge"
          buttonColor="#2979FF"
          onClick={() => engine.simulateFlashFlood()}
        />

        {/* Scenario 6 */}
        <SimCard
          title="6. M7.9 Submarine Rupture & Tsunami Inundation Wave"
          description="Simulates shallow-water gravity wave physics (v = √(g·d)), deep ocean velocity (712 km/h), coastal ETA countdown, and mandatory vertical climb (+35m)."
          buttonText="Trigger Tsunami Wave Incursion"
          buttonColor="#00838F"
          onClick={() => engine.simulateTsunamiEvent()}
        />

        {/* Scenario 7 */}
        <SimCard
          title="7. Off-Grid P2P Mesh SOS Distress Broadcast"
          description="Dispatches ad-hoc encrypted SOS distress packet through multi-hop neighbor relays with zero cellular/internet dependence."
          buttonText="Broadcast P2P Mesh SOS Beacon"
          buttonColor="#E91E63"
          onClick={() =>
            engine.meshNetwork.broadcastSosBeacon(
              engine.userLatitude,
              engine.userLongitude,
              'IMMEDIATE_ASSISTANCE_REQUIRED',
              4
            )
          }
        />

        {/* Scenario 8 */}
        <SimCard
          title="8. 72-Hour Grid Blackout Ultra-Low-Power Mode"
          description="Powers down non-critical subpixel drivers to 100% OLED true black (0 mW subpixel draw), duty-cycling sensors to achieve 72+ hours runtime."
          buttonText="Engage 72h Survival Gating"
          buttonColor="#37474F"
          onClick={() => engine.blackoutManager.enter72HourSurvivalMode()}
        />

        {/* Scenario 9 */}
        <SimCard
          title="9. Calibrated Zero False Alarm Verification (FR-02)"
          description="Resets all sensors to clear, stable skies. Enforces strict 0% risk probability gating rule to eliminate warning fatigue."
          buttonText="Reset to 0% Safe State"
          buttonColor="#00C853"
          onClick={() => engine.resetToSafeState()}
        />

        {/* Live Telemetry Ingestion */}
        <div style={{ background: '#0F1A26', border: '1px solid #1E88E5', borderRadius: '16px', padding: '14px' }}>
          <div style={{ color: '#64B5F6', fontWeight: 'bold', fontSize: '13px' }}>
            🌐 LIVE NWP & SEISMIC TELEMETRY INGESTION
          </div>
          <p style={{ color: '#94A3B8', fontSize: '11px', margin: '4px 0 10px 0' }}>
            Pulls real-time live meteorological data from Open-Meteo & USGS for your coordinates.
          </p>
          <button
            onClick={() => engine.syncAllLiveFeeds()}
            style={{
              width: '100%',
              padding: '10px',
              background: '#1976D2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Sync Live Open-Meteo & USGS APIs
          </button>
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  onClick: () => void;
}

const SimCard: React.FC<CardProps> = ({
  title,
  description,
  buttonText,
  buttonColor,
  onClick,
}) => (
  <div style={{ background: '#0F1722', borderRadius: '14px', padding: '14px', border: '1px solid #1E293B' }}>
    <h4 style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 800 }}>{title}</h4>
    <p style={{ color: '#94A3B8', fontSize: '11px', margin: '4px 0 10px 0' }}>{description}</p>
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '10px',
        background: buttonColor,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      {buttonText}
    </button>
  </div>
);
