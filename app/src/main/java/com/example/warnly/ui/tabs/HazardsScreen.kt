package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
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
import com.example.warnly.model.HazardType
import com.example.warnly.service.DisasterEngine

@Composable
fun HazardsScreen(engine: DisasterEngine) {
    val selectedHazard by engine.selectedHazard.collectAsState()
    val seismicAlert by engine.seismicAlert.collectAsState()
    val floodAlert by engine.floodAlert.collectAsState()
    val strikes by engine.strikes.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(14.dp)
    ) {
        Text(
            text = "MULTI-HAZARD RESILIENCE ECOSYSTEM",
            color = Color(0xFF00E5FF),
            fontWeight = FontWeight.Black,
            fontSize = 15.sp,
            letterSpacing = 1.sp
        )
        Text(
            text = "Unified telemetry across atmospheric and geophysical threats.",
            color = Color(0xFF90A4AE),
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Hazard Type Selector
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            HazardType.values().forEach { hazard ->
                val isSelected = (hazard == selectedHazard)
                FilterChip(
                    selected = isSelected,
                    onClick = { engine.setHazard(hazard) },
                    label = {
                        Text(
                            text = "${hazard.iconLabel} ${hazard.displayName.split(" ")[0]}",
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF0D47A1),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (selectedHazard) {
            HazardType.SEISMIC -> {
                SeismicHazardPanel(
                    seismicAlert = seismicAlert,
                    onTriggerDemo = { engine.simulateSeismicEvent() }
                )
            }
            HazardType.GLOF -> {
                GlofHazardPanel(
                    floodAlert = floodAlert,
                    onTriggerDemo = { engine.simulateGlofOutburst() }
                )
            }
            HazardType.FLASH_FLOOD -> {
                FlashFloodPanel(
                    floodAlert = floodAlert,
                    onTriggerDemo = { engine.simulateFlashFlood() }
                )
            }
            HazardType.LIGHTNING -> {
                LightningTelemetryPanel(
                    strikes = strikes,
                    onTriggerDemo = { engine.simulateConvectiveIntrusion() }
                )
            }
        }
    }
}

@Composable
private fun SeismicHazardPanel(
    seismicAlert: com.example.warnly.model.SeismicAlert?,
    onTriggerDemo: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF161A22))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "🌋 USGS SEISMIC P/S WAVE DIFFERENTIAL",
                color = Color(0xFFFF5252),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = "Primary P-wave (6.0 km/s) detected before destructive shear S-wave (3.5 km/s).",
                color = Color(0xFFB0BEC5),
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            if (seismicAlert != null && seismicAlert.sWaveCountdownSeconds > 0) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFB71C1C), RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "DESTRUCTIVE S-WAVE ARRIVAL IN",
                            color = Color(0xFFFFCDD2),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${seismicAlert.sWaveCountdownSeconds}s",
                            color = Color.White,
                            fontSize = 48.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "DROP, COVER & HOLD ON! (Magnitude ${seismicAlert.magnitude} • ${seismicAlert.epicenterDistanceKm.toInt()} km away)",
                            color = Color(0xFFFFEBEE),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            } else {
                Text(
                    text = "No active seismic P-wave events detected in immediate fault sectors.",
                    color = Color(0xFF00E676),
                    fontSize = 13.sp,
                    modifier = Modifier.padding(vertical = 12.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onTriggerDemo,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Simulate M6.4 Earthquake P/S Differential", fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun GlofHazardPanel(
    floodAlert: com.example.warnly.model.FloodAlert?,
    onTriggerDemo: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF101923))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "🌊 GLACIAL LAKE OUTBURST FLOOD (GLOF)",
                color = Color(0xFF40C4FF),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = "High-altitude moraine lake collapse monitoring with mandatory vertical escape (+30-50m).",
                color = Color(0xFFB0BEC5),
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (floodAlert != null && floodAlert.floodType.contains("GLOF")) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0D2538))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(text = "Crest Lead-Time: ${floodAlert.crestLeadTimeMinutes} min", color = Color(0xFF80D8FF), fontWeight = FontWeight.Bold)
                        Text(text = "Required Vertical Climb: +${floodAlert.verticalEvacuationMeters}m uphill", color = Color(0xFFFFD54F), fontWeight = FontWeight.Bold)
                        Text(text = "Discharge Surge: ${floodAlert.dischargeSurgeRateM3s.toInt()} m³/s", color = Color(0xFFFF8A80), fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = floodAlert.statusSummary, color = Color.White, fontSize = 12.sp)
                    }
                }
            } else {
                Text(text = "All monitored alpine glacial basins stable. Normal hydrograph.", color = Color(0xFF00E676), fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onTriggerDemo,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0277BD)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Simulate GLOF Moraine Burst (+45m Vertical Escape)", fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun FlashFloodPanel(
    floodAlert: com.example.warnly.model.FloodAlert?,
    onTriggerDemo: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF151D24))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "🌧️ FLASH FLOOD RUNOFF SURGE",
                color = Color(0xFF64B5F6),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = "Rapid wash and canyon drainage surge alerts derived from minutely rainfall telemetry.",
                color = Color(0xFFB0BEC5),
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (floodAlert != null && floodAlert.floodType.contains("Flash")) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E2833))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(text = "Surge Lead-Time: ${floodAlert.crestLeadTimeMinutes} min", color = Color(0xFFFFCA28), fontWeight = FontWeight.Bold)
                        Text(text = "Basin: ${floodAlert.basinName}", color = Color.White, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = floodAlert.statusSummary, color = Color(0xFFECEFF1), fontSize = 12.sp)
                    }
                }
            } else {
                Text(text = "Dry drainage channels. Runoff risk negligible.", color = Color(0xFF00E676), fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onTriggerDemo,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1565C0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Simulate Canyon Flash Flood Runoff Surge", fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun LightningTelemetryPanel(
    strikes: List<com.example.warnly.model.LightningStrike>,
    onTriggerDemo: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131821))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "⚡ VLF/LF LIGHTNING STROKE TELEMETRY",
                color = Color(0xFFFFD600),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = "Real-time ground discharges with sub-kilometer TOA accuracy & peak current (kA).",
                color = Color(0xFFB0BEC5),
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            if (strikes.isEmpty()) {
                Text(
                    text = "Zero strike discharges detected in local 15 km perimeter.",
                    color = Color(0xFF00E676),
                    fontSize = 13.sp,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    strikes.take(6).forEach { strike ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF1D2430), RoundedCornerShape(8.dp))
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "${String.format("%.1f", strike.distanceKm)} km (${strike.bearingDegrees.toInt()}°)",
                                    color = if (strike.distanceKm <= 10.0) Color(0xFFFF1744) else Color(0xFFFFB300),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "Current: ${String.format("%.1f", strike.intensityKa)} kA",
                                    color = Color(0xFF90A4AE),
                                    fontSize = 11.sp
                                )
                            }
                            Text(
                                text = if (strike.distanceKm <= 10.0) "CRITICAL RING" else "ADVISORY RING",
                                color = if (strike.distanceKm <= 10.0) Color(0xFFFF5252) else Color(0xFFFFD54F),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onTriggerDemo,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF57F17)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Simulate Approaching Lightning Cell", fontSize = 12.sp)
            }
        }
    }
}
