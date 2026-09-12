# Warnly

A mobile emergency warning app that provides hyper-local alerts for lightning storms, earthquakes, flash floods, and glacial lake outburst floods (GLOF). Built with React Native and native Android.

Most weather apps give broad county-level forecasts hours in advance. Warnly focuses on immediate, local threats — calculating how close a hazard is to you in real-time, whether you need to take shelter, and how much time you have.

---

## Features

- **Hyper-Local Lightning Tracking:** Real-time distance and direction to nearby lightning strikes. Flags danger when strikes enter your 10 km safety perimeter.
- **30-30 Shelter Rule:** Automated 30-minute safety countdown that restarts whenever a new strike is detected nearby, helping ensure it's safe before heading back outdoors.
- **Earthquake P/S Wave Lead Time:** Estimates seconds of warning before damaging S-waves arrive based on live seismic feeds.
- **Flood & GLOF Warnings:** Monitors upstream river discharge and high-altitude glacial lake hazards with immediate elevation and evacuation advice.
- **Offline First:** Synthesized sirens, optical Morse strobe, shelter directions, and compact emergency SMS (under 100 bytes) work without cellular data or Wi-Fi.
- **Family Shield:** Monitor up to 10 custom perimeters (home, school, workplace) for remote hazard tracking.
- **Disaster Simulator:** Built-in testing mode to simulate storm scenarios, strikes, and emergency overlays without needing active weather outside.

---

## Tech Stack

- **Mobile:** React Native (0.74), TypeScript, Expo
- **Web Preview:** Vite, React Native Web
- **Native Android:** Kotlin, Gradle
- **Data Sources:** Open-Meteo (weather & flood telemetry), USGS (earthquakes)

---

## Project Structure

```
Warnly/
├── android/            # Native Android project (Gradle wrapper & native modules)
├── src/                # React Native / TypeScript source code
│   ├── audio/          # Acoustic siren synthesizer & emergency audio
│   ├── components/     # UI components, modals, and HUD overlays
│   ├── engine/         # Alert state machine and simulation scenarios
│   ├── hardware/       # Optical strobe & flashlight hardware triggers
│   ├── lib/warnly/     # Risk math, feeds, DND bypass, and state store
│   ├── screens/        # Home, Radar, Shield, Weather, Settings, Simulator
│   ├── services/       # Shelter, zone, and telemetry services
│   └── theme/          # Design system & dark mode tactical styling
├── package.json        # Project dependencies & build scripts
└── tsconfig.json       # TypeScript configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- JDK 17 & Android SDK (for native Android builds)

### Run Web Preview
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Typecheck & Web Build
```bash
npm run build
```

### Build Android APK
```bash
cd android
./gradlew assembleDebug --no-daemon
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## License

Apache-2.0
