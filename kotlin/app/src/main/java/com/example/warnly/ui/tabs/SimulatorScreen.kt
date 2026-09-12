package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * Disaster Simulation & Test Hub Screen
 * Allows validating all 9 threat scenarios and live API integrations.
 */
@Composable
fun SimulatorScreen(engine: DisasterEngine) {
    val autoSiren by engine.autoSirenOnDanger.collectAsState()
    val isTorchActive by engine.opticalBeacon.isStrobeActive.collectAsState()
    val isSirenOn = engine.siren.isSirenActive()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(VoidBlack)
            .verticalScroll(rememberScrollState())
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Header
        TacticalPanel(
            borderColor = BorderBright,
            contentPadding = PaddingValues(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PulsingLed(color = NeonCyan, size = 9.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "DISASTER SIMULATION LAB",
                            color = NeonCyan,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "9 WHITE PAPER SCENARIOS & HARDWARE VALIDATION",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                TacticalBadge(
                    text = "LAB ARMED",
                    accentColor = HighGroundTeal
                )
            }
        }

        // 2. Scenario Cards
        SimCardItem(
            index = "01",
            title = "Convective Thunderstorm Intrusion",
            description = "Simulates atmospheric charge build-up (CAPE 2450 J/kg, LI -5.8), followed by strikes breaching 15 km Advisory and 10 km Critical Danger Rings. Starts 30-30 timer and triggers siren.",
            buttonText = "TRIGGER CONVECTIVE INTRUSION",
            buttonColor = CriticalCrimson,
            icon = "⚡",
            onClick = { engine.simulateConvectiveIntrusion() }
        )

        SimCardItem(
            index = "02",
            title = "Subsequent Strike 30-30 Reset (FR-03)",
            description = "Simulates a secondary strike at 4.2 km. Automatically resets the 30-30 countdown clock back to 30:00 to prevent premature outdoor resumption.",
            buttonText = "TRIGGER STRIKE RESET (4.2 KM)",
            buttonColor = HazardAmber,
            icon = "🔄",
            onClick = { engine.simulateSecondaryStrikeReset() }
        )

        SimCardItem(
            index = "03",
            title = "Seismic P/S Differential Arrival",
            description = "Simulates USGS P-wave detection for M6.4 earthquake 85 km away. Displays live countdown to destructive S-wave arrival (P: 6 km/s vs S: 3.5 km/s).",
            buttonText = "TRIGGER SEISMIC COUNTDOWN",
            buttonColor = CriticalCrimson,
            icon = "🌋",
            onClick = { engine.simulateSeismicEvent() }
        )

        SimCardItem(
            index = "04",
            title = "Glacial Lake Outburst Flood (GLOF)",
            description = "Simulates high-altitude moraine dam burst. 28 min crest lead-time with mandatory vertical evacuation (+45m upward climb).",
            buttonText = "TRIGGER GLOF VALLEY SURGE",
            buttonColor = ElectricBlue,
            icon = "🌊",
            onClick = { engine.simulateGlofOutburst() }
        )

        SimCardItem(
            index = "05",
            title = "Flash Flood Canyon Runoff Surge",
            description = "Simulates 65 mm/hr upstream cloudburst triggering sudden canyon runoff surge.",
            buttonText = "TRIGGER FLASH FLOOD SURGE",
            buttonColor = ElectricBlue,
            icon = "🌧️",
            onClick = { engine.simulateFlashFlood() }
        )

        SimCardItem(
            index = "06",
            title = "M7.9 Submarine Tsunami Wave Inundation",
            description = "Simulates shallow-water gravity wave physics (v = √(g·d)), deep ocean velocity (712 km/h), coastal ETA countdown, and mandatory vertical climb (+35m).",
            buttonText = "TRIGGER TSUNAMI WAVE INCURSION",
            buttonColor = TacticalPurple,
            icon = "🌊",
            onClick = { engine.simulateTsunamiEvent() }
        )

        SimCardItem(
            index = "07",
            title = "Off-Grid P2P Mesh SOS Distress Broadcast",
            description = "Dispatches ad-hoc Bluetooth/Wi-Fi Direct encrypted SOS distress packet through multi-hop neighbor relays with zero cellular/internet dependence.",
            buttonText = "BROADCAST P2P MESH SOS BEACON",
            buttonColor = HazardAmber,
            icon = "📶",
            onClick = {
                engine.meshNetwork.broadcastSosBeacon(
                    latitude = engine.userLatitude.value,
                    longitude = engine.userLongitude.value,
                    medicalTriage = "IMMEDIATE_EXTRACTION",
                    survivorCount = 4
                )
            }
        )

        SimCardItem(
            index = "08",
            title = "72-Hour Grid Blackout Ultra-Low-Power Mode",
            description = "Powers down non-critical subpixel drivers to 100% OLED true black (0 mW subpixel draw), duty-cycling sensors to achieve 72+ hours runtime.",
            buttonText = "ENGAGE 72H SURVIVAL GATING",
            buttonColor = HighGroundTeal,
            icon = "🔋",
            onClick = { engine.blackoutManager.enter72HourSurvivalMode() }
        )

        SimCardItem(
            index = "09",
            title = "Calibrated Zero False Alarm Verification (FR-02)",
            description = "Resets all sensors to clear, stable skies. Enforces strict 0% risk probability gating rule to eliminate warning fatigue.",
            buttonText = "RESET TO 0% GATED SAFE STATE",
            buttonColor = CyberEmerald,
            icon = "🛡️",
            onClick = { engine.resetToSafeState() }
        )

        // 3. Live Telemetry Network Ingestion Card
        TacticalPanel(borderColor = BorderBright) {
            TacticalSectionHeader(
                tag = "API-SYNC",
                title = "Live Satellite & Seismic Feeds",
                trailingBadge = "LIVE INGESTION",
                badgeColor = NeonCyan,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Text(
                text = "Connects to Open-Meteo Convective NWP API and USGS Earthquake Catalog API to refresh live background telemetry.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            TacticalButton(
                text = "SYNC LIVE METEOROLOGY & SEISMIC FEEDS",
                onClick = { engine.syncAllLiveFeeds() },
                accentColor = NeonCyan,
                leadingIcon = "🔄",
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun SimCardItem(
    index: String,
    title: String,
    description: String,
    buttonText: String,
    buttonColor: Color,
    icon: String,
    onClick: () -> Unit
) {
    TacticalPanel(borderColor = BorderGlass) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "[$index]",
                    color = buttonColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title.uppercase(),
                    color = TextHighlight,
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
            Text(text = icon, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = description,
            color = TextSecondary,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            lineHeight = 15.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        TacticalButton(
            text = buttonText,
            onClick = onClick,
            accentColor = buttonColor,
            modifier = Modifier.fillMaxWidth(),
            height = 40.dp
        )
    }
}
