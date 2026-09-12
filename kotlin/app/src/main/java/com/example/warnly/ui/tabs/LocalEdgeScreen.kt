package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * Local Edge Disaster Intelligence Dashboard
 * Analyzes real-time physics on the mobile hardware with ZERO cloud reliance:
 *  - Barometric pressure tendency (ΔP / Δt) for squall lines / supercells
 *  - 3-axis accelerometer Peak Ground Acceleration (PGA) for seismic tremor detection
 *  - Geodesic storm motion vector & closest point of approach (CPA)
 *  - Zero-false-alarm mathematical gating engine
 */
@Composable
fun LocalEdgeScreen(engine: DisasterEngine) {
    val sensorManager = engine.sensorManager
    val currentPressure by sensorManager.currentPressureHpa.collectAsState()
    val pressureTendency by sensorManager.pressureTendencyHpaPerHour.collectAsState()
    val baroStatus by sensorManager.barometricStatus.collectAsState()
    val hasHardwareBaro by sensorManager.hasHardwareBarometer.collectAsState()
    val pgaG by sensorManager.currentPgaG.collectAsState()
    val maxPga by sensorManager.maxPgaRecorded.collectAsState()
    val isTremor by sensorManager.isSeismicTremorDetected.collectAsState()
    val compassHeading by sensorManager.compassAzimuthDegrees.collectAsState()
    val atmos by engine.atmosphericIndices.collectAsState()
    val strikes by engine.strikes.collectAsState()
    val nearestStrikeKm by engine.nearestStrikeDistanceKm.collectAsState()

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
                            text = "LOCAL EDGE INTELLIGENCE",
                            color = NeonCyan,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "AUTONOMOUS ON-DEVICE PHYSICS • ZERO CLOUD OR TOWER RELIANCE",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                TacticalBadge(
                    text = "EDGE AI: 100%",
                    accentColor = CyberEmerald
                )
            }
        }

        // 2. Hardware Sensor Telemetry Trio
        TacticalPanel(borderColor = BorderSubtle) {
            TacticalSectionHeader(
                tag = "SENSORS-01",
                title = "Device Hardware Sensor Fusion",
                trailingBadge = if (hasHardwareBaro) "HW BARO DETECTED" else "MEMS FUSION",
                badgeColor = if (hasHardwareBaro) CyberEmerald else NeonCyan,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalMetricBox(
                    label = "BAROMETER",
                    value = "$currentPressure",
                    unit = "hPa",
                    statusColor = if (pressureTendency < -2.0f) CriticalCrimson else TextPrimary,
                    modifier = Modifier.weight(1f)
                )

                TacticalMetricBox(
                    label = "SEISMIC PGA",
                    value = "${pgaG}g",
                    unit = "PEAK: ${maxPga}g",
                    statusColor = if (isTremor) CriticalCrimson else CyberEmerald,
                    modifier = Modifier.weight(1f)
                )

                TacticalMetricBox(
                    label = "MAGNETOMETER",
                    value = "${compassHeading.toInt()}°",
                    unit = "AZIMUTH",
                    statusColor = NeonCyan,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 3. Barometric Tendency & Squall Line Front Analysis
        TacticalPanel(
            borderColor = if (pressureTendency < -2.0f) BorderCritical else BorderGlass
        ) {
            TacticalSectionHeader(
                tag = "BARO-PHYSICS",
                title = "Atmospheric Tendency (ΔP / Δt)",
                trailingBadge = baroStatus,
                badgeColor = if (pressureTendency < -2.0f) CriticalCrimson else CyberEmerald,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalMetricBox(
                    label = "PRESSURE TENDENCY",
                    value = "${if (pressureTendency > 0) "+" else ""}$pressureTendency",
                    unit = "hPa / hour",
                    statusColor = if (pressureTendency < -2.0f) CriticalCrimson else TextPrimary,
                    modifier = Modifier.weight(1f)
                )

                TacticalMetricBox(
                    label = "SQUALL THRESHOLD",
                    value = "-2.0 hPa/h",
                    unit = "CRITICAL",
                    statusColor = HazardAmber,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Rapid barometric drops exceeding -2.0 hPa/hr precede severe convective downbursts and gust fronts by 10 to 20 minutes prior to cloud-to-ground lightning discharge.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        }

        // 4. 3-Axis Seismic Tremor & Peak Ground Acceleration
        TacticalPanel(
            borderColor = if (isTremor) BorderCritical else BorderGlass
        ) {
            TacticalSectionHeader(
                tag = "SEISMIC-01",
                title = "Accelerometer Tremor Detection (PGA)",
                trailingBadge = if (isTremor) "TREMOR ACTIVE" else "SEISMIC CALM",
                badgeColor = if (isTremor) CriticalCrimson else CyberEmerald,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalMetricBox(
                    label = "INSTANT PGA",
                    value = "$pgaG",
                    unit = "g-force",
                    statusColor = if (isTremor) CriticalCrimson else CyberEmerald,
                    modifier = Modifier.weight(1f)
                )

                TacticalMetricBox(
                    label = "RECORDED PEAK",
                    value = "$maxPga",
                    unit = "g-force",
                    statusColor = TextPrimary,
                    modifier = Modifier.weight(1f)
                )

                TacticalMetricBox(
                    label = "TRIGGER TRIP",
                    value = "0.060g",
                    unit = "USGS MMI IV",
                    statusColor = TextMuted,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Onboard MEMS accelerometer monitors 3-axis vector magnitude at 50 Hz. Exceeding 0.06g trips the automated seismic alarm before destructive S-waves arrive.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        }

        // 5. Zero-False-Alarm Gating Architecture Card
        TacticalPanel(borderColor = BorderEmerald) {
            TacticalSectionHeader(
                tag = "GATING-01",
                title = "Zero-False-Alarm Gating Engine (FR-02)",
                trailingBadge = "MATHEMATICALLY PROVEN",
                badgeColor = CyberEmerald,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Text(
                text = "Warnly enforces a strict dual-condition gating law: If strike count inside 15 km is 0 and local atmospheric CAPE is below 1,000 J/kg, risk is mathematically clamped to strictly 0% to prevent warning fatigue and maintain crew trust.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        }
    }
}
