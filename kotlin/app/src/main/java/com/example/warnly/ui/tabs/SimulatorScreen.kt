package com.example.warnly.ui.tabs

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.service.DisasterEngine

@Composable
fun SimulatorScreen(engine: DisasterEngine) {
    val autoSiren by engine.autoSirenOnDanger.collectAsState()
    val isTorchActive by engine.opticalBeacon.isStrobeActive.collectAsState()
    val isSirenOn = engine.siren.isSirenActive()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Column {
            Text(
                text = "DISASTER SIMULATION & TEST HUB",
                color = Color(0xFF00E5FF),
                fontWeight = FontWeight.Black,
                fontSize = 15.sp,
                letterSpacing = 1.sp
            )
            Text(
                text = "Test and validate all White Paper requirements, sirens, alarms, and timers.",
                color = Color(0xFF90A4AE),
                fontSize = 12.sp
            )
        }

        // Scenario 1
        SimCard(
            title = "1. Convective Thunderstorm Intrusion",
            description = "Simulates atmospheric charge build-up (CAPE 2450 J/kg, LI -5.8), followed by strikes breaching 15 km Advisory and 10 km Critical Danger Rings. Starts 30-30 timer and triggers siren.",
            buttonText = "Trigger Convective Intrusion",
            buttonColor = Color(0xFFD50000),
            onClick = { engine.simulateConvectiveIntrusion() }
        )

        // Scenario 2
        SimCard(
            title = "2. Subsequent Strike 30-30 Timer Reset (FR-03)",
            description = "Simulates a secondary strike at 4.2 km. Automatically resets the 30-30 countdown clock back to 30:00 to prevent premature resumption of outdoor activities.",
            buttonText = "Trigger Strike Reset (4.2 km)",
            buttonColor = Color(0xFFFF6D00),
            onClick = { engine.simulateSecondaryStrikeReset() }
        )

        // Scenario 3
        SimCard(
            title = "3. Seismic P/S Differential Arrival Countdown",
            description = "Simulates USGS P-wave detection for M6.4 earthquake 85 km away. Displays live countdown to destructive S-wave arrival (P: 6 km/s vs S: 3.5 km/s).",
            buttonText = "Trigger Seismic Countdown",
            buttonColor = Color(0xFFC2185B),
            onClick = { engine.simulateSeismicEvent() }
        )

        // Scenario 4
        SimCard(
            title = "4. Glacial Lake Outburst Flood (GLOF)",
            description = "Simulates high-altitude moraine dam burst. 28 min crest lead-time with mandatory vertical evacuation (+45m upward climb).",
            buttonText = "Trigger GLOF Valley Surge",
            buttonColor = Color(0xFF0091EA),
            onClick = { engine.simulateGlofOutburst() }
        )

        // Scenario 5
        SimCard(
            title = "5. Flash Flood Canyon Runoff Surge",
            description = "Simulates 65 mm/hr upstream cloudburst triggering sudden canyon runoff surge.",
            buttonText = "Trigger Flash Flood Surge",
            buttonColor = Color(0xFF2979FF),
            onClick = { engine.simulateFlashFlood() }
        )

        // Scenario 6: Tsunami
        SimCard(
            title = "6. M7.9 Submarine Rupture & Tsunami Inundation Wave",
            description = "Simulates shallow-water gravity wave physics (v = √(g·d)), deep ocean velocity (712 km/h), coastal ETA countdown, and mandatory vertical climb (+35m).",
            buttonText = "Trigger Tsunami Wave Incursion",
            buttonColor = Color(0xFF00838F),
            onClick = { engine.simulateTsunamiEvent() }
        )

        // Scenario 7: P2P Disaster Mesh Relay
        SimCard(
            title = "7. Off-Grid P2P Mesh SOS Distress Broadcast",
            description = "Dispatches ad-hoc Bluetooth/Wi-Fi Direct encrypted SOS distress packet through multi-hop neighbor relays with zero cellular/internet dependence.",
            buttonText = "Broadcast P2P Mesh SOS Beacon",
            buttonColor = Color(0xFFE91E63),
            onClick = {
                engine.meshNetwork.broadcastSosBeacon(
                    latitude = engine.userLatitude.value,
                    longitude = engine.userLongitude.value,
                    medicalTriage = "IMMEDIATE_ASSISTANCE_REQUIRED",
                    survivorCount = 4
                )
            }
        )

        // Scenario 8: 72-Hour Blackout Mode
        SimCard(
            title = "8. 72-Hour Grid Blackout Ultra-Low-Power Mode",
            description = "Powers down non-critical subpixel drivers to 100% OLED true black (0 mW subpixel draw), duty-cycling sensors to achieve 72+ hours runtime.",
            buttonText = "Engage 72h Survival Gating",
            buttonColor = Color(0xFF37474F),
            onClick = { engine.blackoutManager.enter72HourSurvivalMode() }
        )

        // Scenario 9: Calibrated Zero False Alarm Verification
        SimCard(
            title = "9. Calibrated Zero False Alarm Verification (FR-02)",
            description = "Resets all sensors to clear, stable skies. Enforces strict 0% risk probability gating rule to eliminate warning fatigue.",
            buttonText = "Reset to 0% Safe State",
            buttonColor = Color(0xFF00C853),
            onClick = { engine.resetToSafeState() }
        )

        // Live Telemetry Network Ingestion
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF1E88E5), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F1A26))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "🌐 LIVE NWP TELEMETRY INGESTION",
                    color = Color(0xFF64B5F6),
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
                Text(
                    text = "Pulls real-time live meteorological data from Open-Meteo for your coordinates.",
                    color = Color(0xFF90A4AE),
                    fontSize = 11.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { engine.syncAllLiveFeeds() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Sync Live Open-Meteo & USGS APIs", fontSize = 12.sp)
                }
            }
        }

        // Hardware Controls
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF151922))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "🛠️ HARDWARE BEACON DIAGNOSTICS",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            if (isSirenOn) engine.siren.stopSiren() else engine.siren.startSiren()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSirenOn) Color(0xFFD50000) else Color(0xFF37474F)
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(if (isSirenOn) "Stop Siren" else "Start 880Hz Siren", fontSize = 11.sp)
                    }

                    Button(
                        onClick = {
                            if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isTorchActive) Color(0xFFFF9100) else Color(0xFF37474F)
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(if (isTorchActive) "Stop SOS" else "Morse SOS Torch", fontSize = 11.sp)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = { engine.showEmergencyOverlay() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB71C1C)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Display Full-Screen Danger Overlay (FR-04)", fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
private fun SimCard(
    title: String,
    description: String,
    buttonText: String,
    buttonColor: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF263238), RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131821))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = description, color = Color(0xFFB0BEC5), fontSize = 11.sp, lineHeight = 15.sp)
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(containerColor = buttonColor),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = buttonText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
