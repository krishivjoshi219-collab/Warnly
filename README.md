# ⚡ Warnly: Autonomous Disaster Resilience & Evacuation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%207.0%2B%20%7C%20API%2024--36-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/Language-Kotlin%202.3-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" alt="Kotlin" />
  <img src="https://img.shields.io/badge/UI-Jetpack%20Compose-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white" alt="Jetpack Compose" />
  <img src="https://img.shields.io/badge/Offline%20First-100%25%20Edge%20Autonomous-00E676?style=for-the-badge" alt="Offline First" />
  <img src="https://img.shields.io/badge/Licence-Apache%202.0-blue?style=for-the-badge" alt="License" />
</p>

---

## 📌 Executive Mission Statement

> *"Transforming unpredictable atmospheric and geophysical threats into deterministic 10–25 minute survival windows."*  
> — **Warnly Disaster Resilience White Paper**

During extreme geophysical crises (severe convective lightning storms, glacial lake outburst floods [GLOF], flash floods, and destructive earthquakes), commercial cellular networks frequently collapse, internet routing fails, and public utilities black out. 

**Warnly** is an open-architecture, life-safety-grade Android disaster resilience platform engineered with **100% offline edge autonomy**, hardware-driven sensor intelligence, mathematical false-alarm gating, and acoustic/optical navigation beacons to keep citizens alive when all external infrastructure is severed.

---

## 📥 Instant APK Download

| Release Asset | Format | Architecture | Download Link |
| :--- | :--- | :--- | :--- |
| **Warnly Production Release v1.0 (Official GitHub Release)** | `.apk` (12 MB) | Universal (ARM64 / ARMv7 / x86_64) | [**⬇️ Download Warnly APK (Direct CDN)**](https://github.com/krishivjoshi219-collab/Warnly/releases/download/v1.0.0/Warnly-Disaster-Resilience-v1.0.apk) |
| **In-Repository Binary Mirror** | `.apk` (12 MB) | Universal (ARM64 / ARMv7 / x86_64) | [**📁 View In-Repo APK**](release/Warnly-Disaster-Resilience-v1.0.apk) |

```bash
# Direct ADB Installation via terminal
adb install -r release/Warnly-Disaster-Resilience-v1.0.apk
```

---

## 🌟 Key Platform Capabilities

```mermaid
graph TD
    A[Sensory & Telemetry Inputs] --> B[Warnly Real-Time Core]
    
    subgraph SENSORS ["Telemetry & Hardware Edge Sensors"]
        S1[Open-Meteo Convective NWP API]
        S2[USGS Real-Time Earthquake Feed]
        S3[Device Barometer Sensor]
        S4[3-Axis Accelerometer]
        S5[Magnetometer & Rotation Vector]
        S6[GNSS / GPS Satellites]
    end
    
    subgraph CORE ["Edge Intelligence & Mathematical Gating"]
        B1[FR-01: Geodesic Spatial Rings]
        B2[FR-02: Calibrated Zero-False Gating]
        B3[FR-03: Automated 30-30 Shelter Timer]
        B4[FR-07: Family Shield 10-Zone Perimeter]
        B5[Local Barometric Squall Classifier]
        B6[Seismic Peak Ground Acceleration Solver]
    end
    
    subgraph ACTIONS ["Life-Safety Tactical Outlets"]
        C1[FR-04: Emergency Intrusion Overlay]
        C2[FR-05: 880/440 Hz Acoustic Siren]
        C3[FR-05: Optical Morse SOS Strobe]
        C4[Tactical Compass & CDI Navigation HUD]
        C5[1200 Hz Blind Acoustic Homing Sonar]
        C6[FR-06: High-Ground Shelter Routing]
    end
    
    SENSORS --> CORE
    CORE --> ACTIONS
```

---

## ⚡ Complete Specification Implementations (`Warnly.pdf`)

### 1. FR-01: Geodesic Spatial Rings
* **10.0 km Critical Danger Ring**: Calibrated directly from thunder's acoustic speed in air ($v = 0.343\text{ km/s}$), representing the 30-second sound travel perimeter ($t = 10\text{ km} / 0.343\text{ km/s} \approx 29.1\text{ s}$). A strike inside 10 km mandates immediate indoor sheltering.
* **15.0 km Advisory Ring**: Early advisory buffer alerting citizens of convective cell approach.
* **25.0 km Regional Basin Monitoring**: Situational awareness ring tracking upstream cloudburst activity.

### 2. FR-02: Calibrated Risk Probability & Zero False Alarm Gating
* **Zero False Alarm Gating**: To eliminate alert fatigue and public complacency, Warnly gates risk to **strictly 0%** when 0 strikes exist within 15 km and atmospheric parameters are non-convective.
* **Multi-Parameter Grid Risk Integration**: Seamlessly incorporates Convective Available Potential Energy (**CAPE** > 1,500 J/kg) and **Lifted Index** (< -4) into predictive probability scores.

### 3. FR-03: Automated 30-30 Shelter Countdown Clock
* Automatically activates a digital **30:00 (1,800-second)** countdown clock upon danger ring intrusion.
* **Mission-Critical Strike Reset**: Automatically resets back to **30:00** whenever any subsequent lightning strike is detected within 10 km, enforcing the international standard that occupants must remain indoors for 30 full minutes after the last nearby discharge.

### 4. FR-04: Full-Screen Emergency Intrusion Overlay
* An un-dismissible, high-contrast OLED crimson alert card triggered immediately on danger breach.
* Presents immediate actionable evacuation instructions, direct hardware siren/strobe toggles, and a 1-tap **"EVACUATE NOW (OFFLINE HUD)"** launch button.

### 5. FR-05: Hardware Acoustic Siren & Optical Morse SOS Strobe
* **Acoustic Siren Synthesizer**: Generates bi-tonal **880 Hz / 440 Hz** sirens using raw PCM oscillators directly in RAM via `AudioTrack`. Operates with **zero media downloads and zero disk dependencies**, functioning 100% offline.
* **Optical SOS Strobe**: Drives the rear camera LED torch and device screen in international Morse code SOS (`... --- ...`) cadence (150ms dot, 450ms dash) for nighttime search and rescue signaling.

### 6. FR-06: High-Ground Shelter Finder
* Verified reinforced concrete bunkers, indoor sports arenas, and elevated ridgelines with:
  * Great-Circle Haversine distance.
  * Compass azimuth bearing.
  * Civilian capacity.
  * **Vertical Elevation Gain ($+15\text{m}$ to $+85\text{m}$)**.

### 7. FR-07: Family Shield (10-Zone Perimeter Monitoring)
* Concurrently monitors up to **10 distinct perimeters** (e.g. Home, Kids' School, Senior Parents' Residence, Agricultural Farm, Construction Worksite, Alpine Camp, Marina).
* Real-time danger/advisory classification with 1-tap emergency SMS broadcast capabilities.

---

## 🧠 Local On-Device Edge Intelligence (Zero Network / Blackout Mode)

When telecommunication towers fail, Warnly operates autonomously via device sensor fusion:

* **Barometric Pressure Tendency ($\Delta P / \Delta t$)**:
  * Continuously samples the onboard hardware barometer (`Sensor.TYPE_PRESSURE`).
  * If the barometric pressure drops faster than **$-2.0\text{ hPa/hr}$**, Warnly triggers an immediate squall line / supercell alert prior to local lightning initiation.
* **Seismic Peak Ground Acceleration (PGA)**:
  * 3-axis accelerometer (`Sensor.TYPE_ACCELEROMETER`) monitoring with static $1g$ gravitational bias removal:
    $$a_{\text{dynamic}} = \left|\sqrt{a_x^2 + a_y^2 + a_z^2} - 9.81\right|$$
  * Evaluates ground motion against Modified Mercalli Intensity (MMI) thresholds (>0.06g) to warn occupants before destructive S-waves hit.
* **Geodesic Storm Velocity Vector & CPA Engine**:
  * Calculates storm cluster centroid velocity $\vec{v} = (\Delta x / \Delta t, \Delta y / \Delta t)$ and solves for Closest Point of Approach (CPA) time:
    $$t_{\text{CPA}} = -\frac{\vec{r} \cdot \vec{v}}{|\vec{v}|^2}$$

---

## 🧭 Autonomous Tactical Disaster Evacuation Navigation

Commercial mapping applications (Google Maps, Apple Maps) fail during power and cellular blackouts. Warnly contains an onboard, zero-network evacuation guidance system:

1. **Tactical Compass Rose (`TacticalCompassCanvas.kt`)**:
   * Precision military aviation HUD dial rotating with the device's hardware magnetometer (`Sensor.TYPE_ROTATION_VECTOR`).
   * Illuminated **Neon Emerald Lock-on Glow** when aligned within $\pm 8^\circ$ of shelter heading.
2. **Course Deviation Indicator (CDI)**:
   * Real-time steering ribbons: `▲ ON TARGET: PROCEED STRAIGHT (Bearing 042°)`, `▶ TURN RIGHT 24°`, or `⚠️ REVERSE DIRECTION`.
3. **Vertical Flood Clearance Gauge**:
   * Telemetry showing required vertical ascent (e.g. `+45m High-Ground Ridge Climb Required`). Vital for Glacial Lake Outburst Floods (GLOF) and flash floods where climbing the valley ridge is the difference between life and death.
4. **Blind / Zero-Visibility Acoustic Homing Sonar (`AcousticHomingBeeper.kt`)**:
   * Synthesizes directional sonar pulses directly in RAM:
     * **Aligned ($\pm 10^\circ$)**: Rapid $1200\text{ Hz}$ high-pitch chirps (5 pings/sec) and subtle haptic vibration pulse.
     * **Misaligned**: Slow $440\text{ Hz}$ low-pitch pings (1 ping/sec).
     * Enables victims to navigate through dense smoke, blizzard whiteouts, darkness, and torrential downpours eyes-free.
5. **Hazard Corridor Threat Intersector**:
   * Cross-references the evacuation vector against active lightning strikes within 10 km, alerting evacuees if a severe cell sits directly on their evacuation bearing.
6. **Offline Maps Integration**:
   * Fallback `geo:` geo-intent launcher for offline mapping applications (OsmAnd, Organic Maps).

---

## 🌐 Free Global Public APIs Integrated

Warnly connects to free, open public telemetry streams without requiring proprietary API keys:

1. **Open-Meteo Convective NWP API** (Free, No API Key, Global Coverage):
   * `https://api.open-meteo.com/v1/forecast`
   * Ingests hourly CAPE, Lifted Index, convective inhibition, and precipitation rate.
2. **USGS Real-Time Earthquake GeoJSON Feed** (Free, No API Key, 60-second updates):
   * `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
   * Ingests real-time seismic events and computes the differential arrival of non-destructive P-waves ($v_p = 6.0\text{ km/s}$) and destructive S-waves ($v_s = 3.5\text{ km/s}$):
     $$\Delta t = d \cdot \left(\frac{1}{v_s} - \frac{1}{v_p}\right) \approx d \times 0.119\text{ s/km}$$

---

## 📋 Demographic Evacuation Protocols

Conforms to international life-safety standards (OSHA 1926, WMO, NOAA):

* **🏗️ Construction & Cranes**: Strict enforcement of OSHA 10-mile radius crane suspension. Boom lowering and hook securing protocols.
* **🚜 Agriculture & Open Fields**: Tractor egress procedures, lightning crouch guide (balls of feet together, head tucked, zero hand contact with ground), and wire fence avoidance.
* **🏫 Athletics & Schools**: Automatic 30-30 timer enforcement. Immediate indoor gymnasium evacuation; metal bleacher evacuation.
* **🏔️ Alpine & Glacial Outburst (GLOF)**: Immediate vertical climb (+30m to +50m) up valley ridges; strict prohibition against following river channels.
* **⛵ Mariners & Water Sports**: Immediate shoreline egress; below-deck enclosed cabin sheltering.

---

## 🧪 Interactive Test & Simulation Hub

Warnly includes a comprehensive simulation testing center to demonstrate life-safety protocols on demand:

1. **Scenario 1: Convective Thunderstorm Intrusion** (13.5 km advisory $\rightarrow$ 7.4 km critical danger breach).
2. **Scenario 2: Secondary Strike Timer Reset** (Demonstrates FR-03 auto-reset).
3. **Scenario 3: USGS Seismic Differential Alert** (M6.6 earthquake P/S countdown).
4. **Scenario 4: Glacial Lake Outburst Flood (GLOF)** (Moraine breach +45m vertical evacuation).
5. **Scenario 5: Flash Flood Canyon Surge** (Arroyo runoff warning).
6. **Scenario 6: 0% Gated Safe Baseline Reset** (Returns system to clear-sky safe state).
7. **Hardware Diagnostic Console**: Test siren (880/440 Hz), test optical SOS strobe, test 1200 Hz sonar homing, test haptic pulse, and test simulated barometric drops.

---

## 🛠️ Project Structure & Architecture

```
Warnly/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml          # Location, Audio, Torch, & Sensor permissions
│   │   └── java/com/example/warnly/
│   │       ├── MainActivity.kt          # Edge-to-edge Compose container
│   │       ├── audio/
│   │       │   ├── AcousticSirenSynthesizer.kt # 880/440 Hz AudioTrack PCM generator
│   │       │   └── AcousticHomingBeeper.kt     # 1200 Hz directional sonar pings
│   │       ├── hardware/
│   │       │   ├── LocalSensorManager.kt       # Barometer ΔP/Δt, Accelerometer PGA, Compass
│   │       │   └── OpticalBeaconManager.kt     # Morse code SOS torch & screen strobe
│   │       ├── model/
│   │       │   └── DisasterModels.kt           # Strikes, Indices, Shelters, Zones
│   │       ├── navigation/
│   │       │   └── DisasterNavigator.kt        # Great-Circle vectors, CDI, hazard corridor
│   │       ├── physics/
│   │       │   └── GeoMath.kt                  # Haversine, bearing, P/S wave lead times
│   │       ├── service/
│   │       │   └── DisasterEngine.kt           # API sync, 30-30 timer, simulation scenarios
│   │       └── ui/
│   │           ├── WarnlyApp.kt                # Root container & tactical bottom bar
│   │           ├── WarnlyViewModel.kt          # State & navigation controller
│   │           ├── components/
│   │           │   ├── GeodesicRadarCanvas.kt  # 10km/15km concentric ring canvas
│   │           │   ├── TacticalCompassCanvas.kt# Rotating aviation compass HUD
│   │           │   ├── ShelterTimerView.kt     # 30-30 countdown clock card
│   │           │   ├── RiskGaugeCard.kt        # 0-100% calibrated probability gauge
│   │           │   └── EmergencyOverlayDialog.kt# High-contrast intrusion overlay
│   │           └── tabs/
│   │               ├── RadarScreen.kt          # Spatial rings & strike monitoring
│   │               ├── NavigationScreen.kt     # Tactical offline evacuation compass HUD
│   │               ├── LocalEdgeScreen.kt      # On-device barometer & seismic physics
│   │               ├── HazardsScreen.kt        # Multi-hazard resilience hub
│   │               ├── SheltersScreen.kt       # High-ground shelter finder (+m elevation)
│   │               ├── FamilyShieldScreen.kt   # 10-zone multi-perimeter dashboard
│   │               ├── ProtocolsScreen.kt      # Demographic safety checklists
│   │               └── SimulatorScreen.kt      # Simulation test lab & diagnostics
└── release/
    └── Warnly-Disaster-Resilience-v1.0.apk      # Compiled production-grade Android APK
```

---

## 🔨 Building from Source

### Prerequisites
* JDK 17 or JDK 21
* Android SDK (API 36 build-tools)
* Gradle 9.1+

```bash
# Clone the repository
git clone https://github.com/krishivjoshi219-collab/Warnly.git
cd Warnly

# Compile debug APK
./gradlew assembleDebug

# Output APK path
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 📄 License & Attribution

Licensed under the **Apache License, Version 2.0**.  
Developed strictly in compliance with the **Warnly Disaster Resilience Platform White Paper**.
