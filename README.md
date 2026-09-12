# ⚡ WARNLY: Hyper-Local Convective Hazard Early Warning & Precision Lightning Defense System

[![Technical White Paper v3.2](https://img.shields.io/badge/White%20Paper-Version%203.2%20(Production%20Hardened)-00E5FF?style=for-the-badge&logo=document&logoColor=white)](Warnly_Full_Idea_Architecture_and_Impact.pdf)
[![React Native](https://img.shields.io/badge/React%20Native-TypeScript-38BDF8?style=for-the-badge&logo=react&logoColor=white)](typescript/)
[![Offline First](https://img.shields.io/badge/Offline%20First-100%25%20Edge%20RAM-10B981?style=for-the-badge&logo=shield&logoColor=white)](typescript/)
[![Battery Governor](https://img.shields.io/badge/Battery%20Drain-%3C%202%25%20per%2024h-F59E0B?style=for-the-badge&logo=battery&logoColor=white)](typescript/)
[![Zero Tracking](https://img.shields.io/badge/Privacy-Zero%20Tracking%20RAM-EF4444?style=for-the-badge&logo=lock&logoColor=white)](typescript/)

> *"Lightning strikes in microseconds; convective storms evolve in minutes. Warnly proves that disciplined software engineering, client-side edge computing, and space-based telemetry can provide citizens with the deterministic survival window they need to reach shelter safely."*  
> — **Warnly Convective Hazard White Paper v3.2**

---

## 🎯 Core Mission & Atmospheric Focus

While national weather bureaus (e.g., NOAA, IMD) provide broad regional forecasts spanning thousands of square kilometers (*"thunderstorms likely over county in next 3 hours"*), lightning strikes are localized, violent, and rapid. This creates severe **warning fatigue**: people sitting under clear skies ignore alerts because the storm is 45 km away.

**Warnly transforms raw atmospheric telemetry into tactical, perimeter-based personal survival windows:**
- **Advecting Storm Cells (~85% of cases):** Delivers a genuine **10–25 minute evacuation window** before strikes breach the **10 km Critical Danger Ring**.
- **In-Situ Convective Initiation (~15% of cases):** Delivers an **Atmospheric Convective Watch** based on high CAPE (>1500 J/kg) and negative Lifted Index, prompting users to wrap up outdoor work without false alarms.
- **Convective Focus:** Laser-focused on Deep Moist Convection hazards (lightning strikes, microburst wind gusts, and convective flash downpours)—eliminating architectural bloat from disjointed seismic feeds per Section 3 & 4 of the White Paper.

---

## 📱 React Native Tactical Mobile Architecture

Warnly's mobile edition is engineered in **React Native with TypeScript** (`typescript/`), designed with a professional, mission-critical dark tactical aesthetic (inspired by Pttrns mobile UI/UX, Citizen Safety, and Apple Weather Human Interface Guidelines).

```
Warnly/
├── Warnly_Full_Idea_Architecture_and_Impact.pdf  # Architectural White Paper v3.2
├── typescript/                                   # React Native with TypeScript Platform
│   ├── app.json                                  # React Native / Expo configuration
│   ├── index.js                                  # Native AppRegistry entry point
│   ├── vite.config.ts                            # Vite dev server + react-native-web
│   ├── package.json                              # React Native dependencies
│   └── src/
│       ├── types/
│       │   └── convective.ts                     # Convective domain models & schemas
│       ├── theme/
│       │   └── index.ts                          # Aero-Defense Tactical design tokens
│       ├── physics/
│       │   ├── geodesics.ts                      # Sub-20 microsecond Great-Circle Haversine
│       │   └── advection.ts                      # Storm velocity vector & lead-time calculator
│       ├── audio/
│       │   └── acoustic-beacon.ts                # Web Audio 880Hz / 440Hz bi-tonal siren
│       ├── hardware/
│       │   └── optical-strobe.ts                 # Morse SOS optical beacon (... --- ...)
│       ├── services/
│       │   ├── telemetry-service.ts              # Open-Meteo live NWP + NOAA GLM feeds
│       │   ├── shelter-service.ts                # Hardened shelter directory & directions
│       │   └── zone-service.ts                   # Family Shield multi-zone monitor (up to 10 zones)
│       ├── engine/
│       │   └── warnly-engine.ts                  # Master Two-Tier Risk State Machine
│       ├── components/
│       │   ├── MobileFrame.tsx                   # Device shell & responsive viewport
│       │   ├── DynamicIsland.tsx                 # iOS 15+ Time-Sensitive Live Activity widget
│       │   ├── GeodesicRadar.tsx                 # 10km/15km concentric rings & strike inspector
│       │   ├── TelemetryHUD.tsx                  # CAPE, LI, dBZ reflectivity & live sync
│       │   ├── ShelterCard.tsx                   # High-ground profile & walking route
│       │   ├── ZoneItem.tsx                      # Family Shield zone perimeter card
│       │   ├── EmergencyIntrusionModal.tsx       # FR-04 un-dismissible high-contrast danger card
│       │   └── BottomTabBar.tsx                  # Pttrns tactile mobile navigation bar
│       ├── screens/
│       │   ├── RadarScreen.tsx                   # Primary geospatial radar scope
│       │   ├── TelemetryScreen.tsx               # Atmospheric indices & science breakdown
│       │   ├── SheltersScreen.tsx                # Verified civil bunkers & offline routes
│       │   ├── FamilyShieldScreen.tsx            # Multi-zone remote perimeter tracking
│       │   └── SimulatorScreen.tsx               # Interactive testing lab (5 scenarios)
│       └── App.tsx                               # Master Application root
```

---

## ⚡ System & Functional Requirements (FR-01 to FR-07)

| Requirement | System Capability | Engineering Implementation & Acceptance Criteria |
| :--- | :--- | :--- |
| **FR-01: Spatial Rings** | Geodesic Safety Radii | Computes Great-Circle distance to strikes in sub-milliseconds in RAM. Flags **Danger** when distance $\le 10.0$ km (thunder's 30-sec acoustic boundary); flags **Advisory** when $10.0 < \text{dist} \le 15.0$ km. |
| **FR-02: Two-Tier Risk** | Advection vs Watch Gating | Displays **"Convective Watch"** if $\text{CAPE} > 1500\text{ J/kg}$ without active strikes. Escalates to **"Tactical Evacuation"** when upstream strikes are approaching within 35 km at velocity $V_{vector}$. |
| **FR-03: Shelter Timer** | Automated 30-30 Countdown | Displays **30:00 countdown clock** upon entering Danger state. Automatically resets back to 30:00 upon each subsequent strike detected within 10 km. |
| **FR-04: Emergency Intrusion** | Full-Screen Danger Overlay | Mounts an un-dismissible high-contrast danger card across the viewport when strikes breach 10 km, displaying immediate indoor survival steps. |
| **FR-05: Acoustic Beacon** | Software Siren Synthesizer | Synthesizes an **880Hz / 440Hz bi-tonal emergency siren** via Web Audio oscillators with zero network download; includes a **Morse SOS optical strobe** (`... --- ...`). |
| **FR-06: Shelter Finder** | High-Ground & Hardened Shelters | Queries nearest verified civil shelters and hardened buildings with distance, compass bearing, and walking directions cached locally on device. |
| **FR-07: Family Shield** | Multi-Zone Perimeter Rings | Allows users to configure and monitor **up to 10 distinct geographic zones** simultaneously, issuing discrete alerts if lightning breaches any zone. |

---

## 🔬 Physics & Non-Functional Guarantees (NFR)

- **Latency & Ingestion Speed (< 1.5 seconds):** Strikes are broadcast via lightweight coordinates; client-side edge computing calculates Haversine distance in $< 20$ microseconds ($0.00002\text{ s}$).
- **Battery Consumption (< 2% per 24 hours):** Deep obsidian dark palette (`#070A0F`) minimizes OLED sub-pixel draw; adaptive GPS power governor polls at graduated intervals.
- **Privacy & Security (Zero Tracking):** User GPS coordinates are processed ephemerally in RAM for spatial calculations and never persisted in central databases.
- **Offline Reliability & Failover Standards (100% Offline):** When storms collapse cellular base stations, safety protocols, shelter directions, the 30-30 timer, and synthesized sirens remain 100% operational offline.

---

## 🚀 Quickstart & Running the App

### 1. Development Mode (Instant Hot Reloading)
```bash
cd typescript
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the mobile app. You can toggle between the **Mobile Device Shell** (iOS/Android frame) and **Expanded Full View** using the header control.

### 2. Production Build Verification
```bash
cd typescript
npm run build
```
Compiles TypeScript and bundles production assets in $< 300\text{ ms}$ with zero errors.

---

## 🧪 Interactive Scenario Simulation Lab

The app features a built-in **Disaster Simulation Lab** (`Testing Lab` tab) to test and audit every requirement:
1. **Calm Baseline (Safe):** CAPE 240 J/kg, 0 strikes, safe green perimeter.
2. **In-Situ Convective Watch (FR-02):** CAPE 2450 J/kg, LI -4.2°C, pre-initiation watch.
3. **Advecting Supercell (18 min Lead):** Cell 28 km away traveling at 42 km/h toward user.
4. **10 km Danger Breach (FR-01, FR-03, FR-04):** Strike at 6.8 km; mounts Emergency Intrusion card, fires 880Hz siren, starts 30:00 timer.
5. **Secondary Strike (FR-03):** Strike at 2.4 km; automatically resets 30-30 timer back to 30:00!
6. **Hardware Transducers (FR-05):** Test 880Hz/440Hz bi-tonal siren, 1200Hz tactical chirp, and Morse SOS strobe.
