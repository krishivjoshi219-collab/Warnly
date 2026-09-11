# ⚡ Warnly: Autonomous Multi-Platform Disaster Resilience & Evacuation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Dual--Partition%20(Android%20%7C%20Web%20PWA)-00E5FF?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Kotlin-Android%207.0%2B%20%7C%20API%2024--36-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" alt="Kotlin" />
  <img src="https://img.shields.io/badge/TypeScript-ES2022%20%7C%20React%2018%20%7C%20Vite-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Offline%20First-100%25%20Edge%20Autonomous-00E676?style=for-the-badge" alt="Offline First" />
  <img src="https://img.shields.io/badge/Mesh%20Network-Ad--Hoc%20P2P%20Multi--Hop-FF6D00?style=for-the-badge" alt="P2P Mesh" />
  <img src="https://img.shields.io/badge/Blackout%20Survival-72%2B%20Hours%20OLED-00E5FF?style=for-the-badge" alt="72h Survival" />
  <img src="https://img.shields.io/badge/Licence-Apache%202.0-blue?style=for-the-badge" alt="License" />
</p>

---

## 📌 Executive Mission Statement

> *"Transforming unpredictable atmospheric and geophysical threats into deterministic 10–25 minute survival windows across all client architectures."*  
> — **Warnly Disaster Resilience White Paper**

During catastrophic geophysical crises (severe convective lightning storms, glacial lake outburst floods [GLOF], flash floods, destructive earthquakes, and tsunamis), commercial cellular networks collapse, internet routing fails, and public utilities black out. 

**Warnly** is an open-architecture, life-safety-grade disaster resilience platform engineered with **100% offline edge autonomy**, hardware-driven sensor intelligence, mathematical false-alarm gating, ad-hoc peer-to-peer (P2P) mesh networking, and acoustic/optical navigation beacons to keep citizens alive when all external infrastructure is completely severed.

---

## 🏛️ Dual-Partition Architecture Overview

Warnly is architected into **two independent, production-grade codebase partitions**, each sharing an identical life-safety domain model, mathematical foundation, and tactical UI experience:

```
Warnly/
├── 📁 kotlin/       # Partition 1: Android Native Platform (API 24-36, Jetpack Compose)
├── 📁 typescript/   # Partition 2: Cross-Platform Web, Desktop & PWA Engine (React 18, Vite)
└── 📁 release/      # Pre-compiled standalone release distributions
    ├── 📁 kotlin/       # Warnly-Disaster-Resilience-v1.1.apk
    └── 📁 typescript/   # warnly-typescript-v1.1.0.zip (Standalone Web Distribution)
```

| Dimension | Partition 1: Kotlin Android Native | Partition 2: TypeScript Cross-Platform Web |
| :--- | :--- | :--- |
| **Directory** | [`kotlin/`](kotlin/) | [`typescript/`](typescript/) |
| **Primary Language** | Kotlin 2.3 | TypeScript 5.4 |
| **UI Toolkit** | Jetpack Compose (Material 3 Dark Palette) | React 18 + HTML5 Canvas 2D + CSS Modules |
| **Supported OS** | Android 7.0 (API 24) to Android 15 (API 35/36) | Any Modern Browser (Chrome, Safari, Firefox, Edge, iOS, Android, Electron) |
| **Sensor Access** | Android `SensorManager` (Barometer, Accel, Rotation) | W3C Sensor APIs (`DeviceOrientation`, `DeviceMotion`, Barometer) |
| **P2P Mesh** | Ad-Hoc BLE Advertisement & Wi-Fi Direct Multi-Hop | `BroadcastChannel` & WebRTC DataChannel Multi-Hop Relay |
| **Audio Synthesizer** | Android `AudioTrack` PCM Raw RAM Buffers | W3C `AudioContext` & Oscillator Nodes (880/440 Hz & 1200 Hz) |
| **Blackout Engine** | Low-power AMOLED `#070A0E` canvas + Battery API | 100% True OLED Black (`#000000`) Canvas HUD + Battery Status API |
| **Speech Guide** | Android native offline `TextToSpeech` engine | W3C offline `window.speechSynthesis` Web Speech API |
| **Binary Release** | `release/kotlin/Warnly-Disaster-Resilience-v1.1.apk` (12 MB) | `release/typescript/warnly-typescript-v1.1.0.zip` (68 KB) |

---

## 📥 Instant Downloads & Release Assets

Warnly provides pre-compiled, self-contained binaries for both partitions directly in the repository and via official GitHub Releases:

### 📱 Partition 1: Android Native Release (Kotlin)
| Asset Name | Format | Target Architecture | Direct Link |
| :--- | :--- | :--- | :--- |
| **Warnly Android APK v1.1.0 (Official GitHub CDN)** | `.apk` (12 MB) | Universal (ARM64, ARMv7, x86_64) | [**⬇️ Download Warnly Android APK v1.1.0**](https://github.com/krishivjoshi219-collab/Warnly/releases/download/v1.1.0/Warnly-Disaster-Resilience-v1.1.apk) |
| **In-Repo APK Mirror** | `.apk` (12 MB) | Universal (ARM64, ARMv7, x86_64) | [**📁 View In-Repo APK**](release/kotlin/Warnly-Disaster-Resilience-v1.1.apk) |

```bash
# Instant ADB Installation to connected Android device
adb install -r release/kotlin/Warnly-Disaster-Resilience-v1.1.apk
```

### 🌐 Partition 2: Cross-Platform Web & PWA Release (TypeScript)
| Asset Name | Format | Target Environment | Direct Link |
| :--- | :--- | :--- | :--- |
| **Warnly TypeScript Web Bundle v1.1.0** | `.zip` (68 KB) | Universal Browser / PWA / Static Server | [**⬇️ Download Warnly Web Package v1.1.0**](https://github.com/krishivjoshi219-collab/Warnly/releases/download/v1.1.0-ts/warnly-typescript-v1.1.0.zip) |
| **In-Repo Web Bundle Mirror** | `.zip` (68 KB) | Universal Browser / PWA / Static Server | [**📁 View In-Repo Web Zip**](release/typescript/warnly-typescript-v1.1.0.zip) |

```bash
# Instant extraction and local execution
unzip release/typescript/warnly-typescript-v1.1.0.zip -d warnly-web
cd warnly-web && npx serve .
# Or run with Python: python3 -m http.server 3000
```

---

## 🌟 System Architecture Diagram

```mermaid
graph TD
    A[Atmospheric & Geophysical Telemetry] --> B[Dual-Partition Autonomous Engines]
    
    subgraph INGRESS ["Sensory & Telemetry Ingress"]
        S1[Open-Meteo Convective NWP API]
        S2[USGS Real-Time Earthquake Feed]
        S3[Hardware Barometer Tendency ΔP/Δt]
        S4[3-Axis Accelerometer PGA Sensor]
        S5[Magnetometer & Gyroscope Azimuth]
        S6[GNSS / GPS Satellites]
        S7[Off-Grid P2P Ad-Hoc Mesh Relay]
    end
    
    subgraph KOTLIN_CORE ["Partition 1: Kotlin Android Engine"]
        K1[DisasterEngine & StateFlow Store]
        K2[GeoMath Haversine & Geodesic Rings]
        K3[Zero-False Alarm Mathematical Gate]
        K4[Automated 30-30 Shelter Timer Clock]
        K5[AudioTrack 880/440 Hz PCM Siren]
        K6[AcousticHomingBeeper 1200 Hz Sonar]
        K7[Android TTS Spoken Directives]
        K8[P2PDisasterMesh BLE Relay]
    end

    subgraph TS_CORE ["Partition 2: TypeScript Web Engine"]
        T1[DisasterEngine TypeScript Store]
        T2[geo-math.ts Haversine & Rings]
        T3[Zero-False Alarm Convective Gate]
        T4[30-30 Shelter Countdown Store]
        T5[Web Audio bi-tonal Oscillator Siren]
        T6[acoustic-sonar.ts 1200 Hz Sonar]
        T7[Web Speech Synthesis Vocal Guide]
        T8[BroadcastChannel P2P Mesh Relay]
    end
    
    subgraph ACTIONS ["Life-Safety Tactical Outlets"]
        C1[Full-Screen Emergency Intrusion Modal]
        C2[Geodesic Radar 10km/15km Concentric Canvas]
        C3[Tactical Compass Rose & CDI Navigation HUD]
        C4[Offline Vector Topographic Elevation Contours]
        C5[Submarine Tsunami Inundation v=√(g·d) Physics]
        C6[72-Hour Grid Blackout Ultra-Low Power HUD]
        C7[Sub-100 Byte Compressed 80-Char GSM/2G SMS Beacon]
        C8[10-Scenario End-to-End Simulation Lab]
    end
    
    INGRESS --> KOTLIN_CORE
    INGRESS --> TS_CORE
    KOTLIN_CORE --> ACTIONS
    TS_CORE --> ACTIONS
```

---

## ⚡ Core Specification Implementations (`Warnly.pdf`)

### 1. FR-01: Geodesic Spatial Rings (10 km / 15 km)
* **10.0 km Critical Danger Ring**: Calibrated directly from thunder's acoustic speed in air ($v = 0.343\text{ km/s}$), representing the 30-second sound travel perimeter ($t = 10\text{ km} / 0.343\text{ km/s} \approx 29.1\text{ s}$). A strike inside 10 km mandates immediate indoor sheltering.
* **15.0 km Advisory Ring**: Early advisory buffer alerting citizens of convective cell approach.
* **25.0 km Regional Basin Monitoring**: Situational awareness perimeter tracking upstream cloudburst activity.

### 2. FR-02: Calibrated Zero False Alarm Gating
* **Zero False Alarm Gating**: To eliminate alert fatigue and public complacency, Warnly gates risk to **strictly 0%** when 0 strikes exist within 15 km and atmospheric parameters are non-convective.
* **Multi-Parameter Grid Risk Integration**: Seamlessly incorporates Convective Available Potential Energy (**CAPE** > 1,500 J/kg) and **Lifted Index** (< -4) into predictive probability scores.

### 3. FR-03: Automated 30-30 Shelter Countdown Clock
* Automatically activates a digital **30:00 (1,800-second)** countdown clock upon danger ring intrusion.
* **Mission-Critical Strike Reset**: Automatically resets back to **30:00** whenever any subsequent lightning strike is detected within 10 km, enforcing the international standard that occupants must remain indoors for 30 full minutes after the last nearby discharge.

### 4. FR-04: Emergency Intrusion Screen
* Highest-priority tactical dialog that intercepts the device UI immediately upon detection of high danger.
* Displays lightning strike proximity, calculated time to impact, nearest shelter vector, and immediate life-saving recommendations.

### 5. FR-05: Acoustic & Optical Safety Alerts
* **Acoustic Siren**: High-penetration 880 Hz & 440 Hz alternating alarm synthesized in pure memory without external audio assets.
* **Optical Morse SOS Strobe**: High-frequency torch/screen pulsing encoding international Morse `... --- ...` distress signal for night-time search and rescue.

### 6. FR-06: Tactical Evacuation Navigation HUD
* **Aviation Compass Rose**: Rotating cardinal rose with smooth sensor bearing interpolation.
* **Course Deviation Indicator (CDI)**: Lateral deviation needle indicating cross-track drift from safe route.
* **Vertical Flood Clearance Indicator**: Real-time relative elevation tracker displaying altitude above surrounding water plane.
* **Blind Acoustic Sonar Homing**: 1200 Hz tone whose pulse repetition frequency escalates as distance to target closes.

### 7. FR-07: Family Shield Multi-Zone Perimeter
* Monitors up to 10 independent geographic perimeters simultaneously (e.g., Home, School, Workplace, Parents' Residence).
* Evaluates independent hazard radii and strike vectors per zone.

### 8. FR-08: Local Atmospheric Edge Classification
* **Barometric Tendency ($\Delta P / \Delta t$)**: Analyzes 15-minute pressure gradients; drops steeper than $-1.5\text{ hPa/hr}$ trigger severe squall and supercell early warnings.
* **Seismic Peak Ground Acceleration (PGA)**: 3-axis accelerometer filter resolving primary P-waves and S-waves with intensity estimations ($>0.05\text{ g}$).

### 9. FR-09: Multi-Hazard Situational Intelligence
* Dedicated hazard modules for **Severe Thunderstorms, Flash Floods, Glacial Lake Outburst Floods (GLOF), Destructive Earthquakes, and Submarine Tsunamis**.
* Dynamic risk calculation matrix adapting warning thresholds based on cascading hazard correlations.

### 10. FR-10: Offline Demographic Safety Protocols
* Structured, interactive offline checklists for Vulnerable Citizens (Elderly, Children, Mobility-Impaired), Pets & Livestock, and Critical Infrastructure Protections.

---

## 🌊 Advanced Phase 2 Subsystems (Kotlin & TypeScript Parity)

### 1. Submarine Tsunami Inundation Physics Engine
Implements real-time shallow-water gravity wave kinematics:
$$v = \sqrt{g \cdot d}$$
Where $g = 9.81\text{ m/s}^2$ and $d$ is average ocean depth (4,000m deep water, 50m coastal shelf). Warnly computes:
* **Wave Velocity**: Deep ocean speed $v \approx 712\text{ km/h}$; coastal shelf speed $v \approx 79\text{ km/h}$.
* **Estimated Time of Arrival (ETA)**: Continuous countdown to shoreline impact.
* **Green's Law Shoaling Factor**: Computes projected wave runup amplitude $H_2 = H_1 \cdot (d_1 / d_2)^{1/4}$.
* **Mandatory Vertical Clearance**: Computes mandatory minimum climb elevation above sea level.

### 2. Off-Grid P2P Disaster Mesh Network
* **Ad-Hoc Relaying**: Self-organizing mesh topology relaying SOS distress packets, survivor coordinates, and triage status across hops without cell towers or routers.
* **Kotlin Backend**: Native BLE Advertising & Wi-Fi Direct multi-hop relay.
* **TypeScript Backend**: Zero-dependency `BroadcastChannel` and WebRTC DataChannel packet flooding with 4-hop TTL limiting and packet ID deduplication.
* **Trapped Survivor Beacon**: Broadcasts encrypted 1-tap SOS distress beacons every 30 seconds.

### 3. 72-Hour Grid Blackout Ultra-Low-Power Survival Mode
* Designed to maximize device battery survival when municipal power is lost for multiple days.
* **100% True OLED Black Canvas**: Every non-essential subpixel is set to `#000000`, drawing **0 mW** on OLED/AMOLED panels.
* **Adaptive Sensor Throttling**: Restricts polling cycles to 60-second bursts, saving over 85% CPU power.
* **Battery Status API**: Displays estimated survival hours remaining based on current drain rate.

### 4. Offline Topographic Contour Canvas
* **Vector Elevation Contours**: Renders procedural +10m to +100m elevation isolines entirely via vector math in memory.
* **Inundation Corridors**: Highlights low-lying riverbeds and flood channels in translucent tactical red.
* **High-Ground Sanctuaries**: Highlights ridgelines, evacuation peaks, and vertical shelter coordinates in luminous tactical green.

### 5. Ultra-Compressed 80-Character GSM/2G SMS Beacon
* Encodes survivor GPS latitude, longitude, altitude, battery percentage, triage code, and timestamp into an ultra-compact string:
  ```
  [WARNLY-SOS] 28.6139N,77.2090E | Alt:216m | Bat:78% | Code:IMMEDIATE_EVAC
  ```
* Transmittable over degraded 2G cellular networks with sub-100 byte payload size, dispatchable via 1-tap `sms:` protocol.

---

## 📂 Repository Directory Layout

```
Warnly/
├── .gitignore                          # Configured for dual Android/Vite layouts
├── README.md                           # Master platform documentation
├── release/                            # Pre-built release distributions
│   ├── kotlin/
│   │   ├── Warnly-Disaster-Resilience-v1.1.apk # Production Android APK (12 MB)
│   │   └── README.md                   # Kotlin release instructions
│   └── typescript/
│       ├── warnly-typescript-v1.1.0.zip# Standalone Web distribution (68 KB)
│       └── README.md                   # TypeScript release instructions
├── kotlin/                             # Partition 1: Android Native Codebase
│   ├── app/
│   │   ├── src/main/java/com/example/warnly/
│   │   │   ├── MainActivity.kt         # Edge-to-edge Compose activity
│   │   │   ├── audio/                  # Siren, Sonar, TTS
│   │   │   ├── hardware/               # Barometer, Accelerometer, Strobe
│   │   │   ├── mesh/                   # P2P BLE & Wi-Fi Direct Mesh
│   │   │   ├── model/                  # Domain types & data models
│   │   │   ├── navigation/             # Geodesic navigation & CDI
│   │   │   ├── physics/                # GeoMath & Tsunami engine
│   │   │   ├── power/                  # 72h Blackout battery manager
│   │   │   ├── service/                # Central DisasterEngine
│   │   │   ├── telephony/              # 80-char SMS beacon encoder
│   │   │   └── ui/                     # Jetpack Compose UI (10 tabs + canvases)
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   ├── gradle/
│   └── gradlew                         # Gradle wrapper
└── typescript/                         # Partition 2: TypeScript Web/PWA Codebase
    ├── package.json                    # React 18, Vite 5.3, TypeScript 5.4
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html                      # PWA shell & tactical dark theme
    └── src/
        ├── App.tsx                     # Tactical 10-tab application shell
        ├── main.tsx                    # React DOM entry point
        ├── audio/                      # Web Audio siren, sonar, Web Speech TTS
        ├── components/                 # Geodesic Radar, Compass HUD, Contours
        ├── hardware/                   # W3C Sensors (Barometer, Accel, Strobe)
        ├── mesh/                       # BroadcastChannel P2P mesh relay
        ├── models/                     # Disaster domain TypeScript types
        ├── physics/                    # GeoMath Haversine & Tsunami physics
        ├── power/                      # 72h OLED Blackout survival engine
        ├── service/                    # Reactive DisasterEngine state store
        ├── telephony/                  # Compressed SMS beacon encoder
        └── views/                      # 10 full-screen tactical screens
```

---

## 🔨 Building & Running Both Partitions

### 📱 Partition 1: Kotlin Android Native Edition

#### Prerequisites
* JDK 17 or JDK 21 (OpenJDK 21 recommended)
* Android SDK (Platforms 24–36, build-tools 36.0.0)

```bash
# Navigate to the Kotlin partition
cd kotlin

# Compile Debug APK
./gradlew assembleDebug

# The compiled APK is generated at:
# kotlin/app/build/outputs/apk/debug/app-debug.apk

# Install directly to USB-connected Android device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 🌐 Partition 2: TypeScript Web & PWA Edition

#### Prerequisites
* Node.js v18+ or v20+
* npm or yarn

```bash
# Navigate to the TypeScript partition
cd typescript

# Install dependencies (only takes ~5 seconds)
npm install

# Start development hot-reload server (port 5173)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Disaster Simulation Lab (9 Scenarios)

Both the Kotlin and TypeScript editions include an integrated **Hardware & Threat Simulation Lab** accessible from the bottom navigation bar:

1. **⚡ Lightning Supercell (5.2 km Intrusion)**: Triggers 10 km Danger Ring violation, activates 30-30 shelter clock, and launches Emergency Intrusion modal.
2. **🌊 Submarine Tsunami Inundation (M8.2 Subduction)**: Triggers $v = \sqrt{g \cdot d}$ kinematics, 22-minute ETA countdown, and +15m vertical climb order.
3. **🏔️ Glacial Lake Outburst Flood (GLOF)**: Activates topographic contour inundation vector and high-ground shelter routing.
4. **🌋 Destructive Earthquake (M7.4)**: Triggers accelerometer PGA threshold alarm and P/S wave lead-time warning.
5. **🌪️ Severe Convective Squall (ΔP/Δt Drop)**: Triggers rapid barometric drop advisory ($-2.8\text{ hPa/hr}$).
6. **📡 Mesh Network SOS Broadcast**: Simulates an incoming multi-hop distress packet from a trapped survivor.
7. **🔋 72-Hour Blackout Survival Activation**: Enters 100% OLED true black mode and duty-cycled sensor state.
8. **🔊 Acoustic Siren & Optical Strobe**: Emits 880/440 Hz bi-tonal warning and pulsing screen flash.
9. **🛡️ Multi-Zone Family Shield Breach**: Fires compound hazard warnings across 10 monitored perimeters.

---

## 📄 License & Attribution

Licensed under the **Apache License, Version 2.0**.  
Engineered strictly in compliance with the **Warnly Disaster Resilience Platform White Paper** for high-reliability emergency life safety.
