package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.service.DisasterEngine

/**
 * Local Edge Disaster Intelligence Dashboard
 * Analyzes real-time physics on the mobile device itself with ZERO cloud reliance:
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
            .background(Color(0xFF070A0E))
            .verticalScroll(rememberScrollState())
            .padding(14.dp)
    ) {
        // 1. Header
        Text(
            text = "LOCAL EDGE DISASTER INTELLIGENCE",
            color = Color(0xFF00E5FF),
            fontWeight = FontWeight.Black,
            fontSize = 16.sp,
            letterSpacing = 1.sp
        )
        Text(
            text = "Autonomous On-Device Sensor Physics • Zero Cloud or Tower Reliance",
            color = Color(0xFF90A4AE),
            fontSize = 11.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        // 2. Hardware Sensor Telemetry Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF263238), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "DEVICE HARDWARE SENSOR FUSION",
                    color = Color(0xFF80D8FF),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Barometer Sensor Chip
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF131E2B))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("BAROMETER", color = Color(0xFF90A4AE), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text(
                                "$currentPressure hPa",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                if (hasHardwareBaro) "Hardware Sensor" else "Emulated Sensor",
                                color = Color(0xFF00E676),
                                fontSize = 9.sp
                            )
                        }
                    }

                    // Accelerometer / Seismic Chip
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF131E2B))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("SEISMIC ACCEL", color = Color(0xFF90A4AE), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text(
                                "${pgaG}g",
                                color = if (isTremor) Color(0xFFFF1744) else Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                "Peak: ${maxPga}g",
                                color = Color(0xFFB0BEC5),
                                fontSize = 9.sp
                            )
                        }
                    }

                    // Compass Heading Chip
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF131E2B))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("COMPASS GYRO", color = Color(0xFF90A4AE), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text(
                                "${compassHeading.toInt()}°",
                                color = Color(0xFF64FFDA),
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                "Magnetometer",
                                color = Color(0xFF80CBC4),
                                fontSize = 9.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 3. Local Barometric Convective Front Analysis
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    1.dp,
                    if (pressureTendency <= -2.0f) Color(0xFFFF1744) else Color(0xFF263238),
                    RoundedCornerShape(12.dp)
                ),
            colors = CardDefaults.cardColors(
                containerColor = if (pressureTendency <= -2.0f) Color(0xFF2E0C11) else Color(0xFF101721)
            )
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ATMOSPHERIC TENDENCY (ΔP / Δt)",
                        color = Color(0xFFFFD54F),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "${if (pressureTendency >= 0) "+" else ""}${pressureTendency} hPa/hr",
                        color = if (pressureTendency <= -2.0f) Color(0xFFFF1744) else Color.White,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = baroStatus,
                    color = if (pressureTendency <= -2.0f) Color(0xFFFF8A80) else Color(0xFFB0BEC5),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Physics Rule: Rapid drops exceeding -2.0 hPa/hr precede severe convective gust fronts, downbursts, and tornadic squall lines.",
                    color = Color(0xFF78909C),
                    fontSize = 10.sp
                )

                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { sensorManager.simulateBarometricDrop() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 6.dp)
                    ) {
                        Text("⚡ Test Squall Drop (-4.2 hPa)", fontSize = 10.sp)
                    }
                    Button(
                        onClick = { sensorManager.resetSensors() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF37474F)),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 6.dp)
                    ) {
                        Text("Reset Pressure", fontSize = 10.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 4. Local Seismic Ground Acceleration (PGA) Classifier
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    1.dp,
                    if (isTremor) Color(0xFFFF1744) else Color(0xFF263238),
                    RoundedCornerShape(12.dp)
                ),
            colors = CardDefaults.cardColors(
                containerColor = if (isTremor) Color(0xFF2B090F) else Color(0xFF101721)
            )
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "SEISMIC GROUND MOTION (PGA ACCELEROMETER)",
                    color = Color(0xFFFF80AB),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isTremor) "⚠️ EARTHQUAKE SHAKING DETECTED" else "✅ Ground Stable (Ambient Noise Only)",
                        color = if (isTremor) Color(0xFFFF1744) else Color(0xFF00E676),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "${pgaG}g",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 16.sp
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))
                // PGA Progress bar
                LinearProgressIndicator(
                    progress = { (pgaG / 0.30f).coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color = if (isTremor) Color(0xFFFF1744) else Color(0xFF00E5FF),
                    trackColor = Color(0xFF1C2735),
                )

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Threshold: >0.06g indicates destructive ground motion. P-waves travel at ~6.0 km/s; phone sensor acts as a distributed seismic node.",
                    color = Color(0xFF78909C),
                    fontSize = 10.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 5. Local Geodesic Storm Velocity & CPA Vector Engine
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF263238), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "GEODESIC STORM KINEMATICS & CPA SOLVER",
                    color = Color(0xFFB388FF),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("STORM SPEED", color = Color(0xFF90A4AE), fontSize = 10.sp)
                        Text(
                            "${atmos.stormSpeedKmh.toInt()} km/h",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    Column {
                        Text("MOTION HEADING", color = Color(0xFF90A4AE), fontSize = 10.sp)
                        Text(
                            "${atmos.stormBearingDegrees.toInt()}°",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    Column {
                        Text("LEAD TIME WINDOW", color = Color(0xFF90A4AE), fontSize = 10.sp)
                        Text(
                            "${atmos.leadTimeMinutes} min",
                            color = Color(0xFF00E676),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Active Strikes Tracked: ${strikes.size} strikes • Nearest: ${nearestStrikeKm ?: "None"} km",
                    color = Color(0xFFB0BEC5),
                    fontSize = 11.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 6. Zero False Alarm Calibrated Gating (FR-02)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF004D40), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0A1F1B))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "FR-02: ZERO FALSE ALARM GATING",
                        color = Color(0xFF64FFDA),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                    Box(
                        modifier = Modifier
                            .background(Color(0xFF004D40), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "${atmos.calculatedRiskPercent}% RISK",
                            color = if (atmos.calculatedRiskPercent == 0) Color(0xFF69F0AE) else Color(0xFFFFD54F),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = if (atmos.calculatedRiskPercent == 0) {
                        "✅ Gating Condition Active: 0 strikes detected within 15 km & stable atmospheric indices. Risk output is calibrated to strict 0% to prevent alert fatigue."
                    } else {
                        "⚠️ Threat Active: Grid probability incorporates CAPE (${atmos.cape.toInt()} J/kg) & strike density within 15 km perimeter."
                    },
                    color = Color(0xFFB2DFDB),
                    fontSize = 11.sp
                )
            }
        }
    }
}
