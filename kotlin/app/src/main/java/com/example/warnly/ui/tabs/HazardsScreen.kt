package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.example.warnly.model.HazardType
import com.example.warnly.model.LightningStrike
import com.example.warnly.model.SeismicAlert
import com.example.warnly.model.FloodAlert
import com.example.warnly.physics.TsunamiAlert
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * Multi-Hazard Resilience Ecosystem Screen
 * Unified telemetry across atmospheric and geophysical threats.
 */
@Composable
fun HazardsScreen(engine: DisasterEngine) {
    val selectedHazard by engine.selectedHazard.collectAsState()
    val seismicAlert by engine.seismicAlert.collectAsState()
    val floodAlert by engine.floodAlert.collectAsState()
    val tsunamiAlert by engine.tsunamiAlert.collectAsState()
    val strikes by engine.strikes.collectAsState()

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
                            text = "MULTI-HAZARD MATRIX",
                            color = NeonCyan,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "UNIFIED SENSORY & KINEMATICS TELEMETRY",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                TacticalBadge(
                    text = "5 VECTORS",
                    accentColor = HighGroundTeal
                )
            }
        }

        // 2. Tactical Hazard Type Selector Bar
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(HazardType.values()) { hazard ->
                val isSelected = (hazard == selectedHazard)
                val badgeColor = when (hazard) {
                    HazardType.LIGHTNING -> NeonCyan
                    HazardType.SEISMIC -> CriticalCrimson
                    HazardType.GLOF -> ElectricBlue
                    HazardType.FLASH_FLOOD -> HazardAmber
                    HazardType.TSUNAMI -> TacticalPurple
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) SurfaceElevated else SurfaceDark)
                        .border(
                            1.dp,
                            if (isSelected) badgeColor else BorderGlass,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { engine.setHazard(hazard) }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = hazard.iconLabel, fontSize = 13.sp)
                        Text(
                            text = hazard.displayName.split(" ")[0].uppercase(),
                            color = if (isSelected) badgeColor else TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }

        // 3. Dynamic Hazard Intelligence Panel
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
            HazardType.TSUNAMI -> {
                TsunamiHazardPanel(
                    tsunamiAlert = tsunamiAlert,
                    onTriggerDemo = { engine.simulateTsunamiEvent() }
                )
            }
        }
    }
}

@Composable
private fun SeismicHazardPanel(
    seismicAlert: SeismicAlert?,
    onTriggerDemo: () -> Unit
) {
    TacticalPanel(borderColor = BorderCritical) {
        TacticalSectionHeader(
            tag = "USGS-SEISMIC",
            title = "Earthquake P/S Wave Differential",
            trailingBadge = if (seismicAlert != null) "TREMOR ARMED" else "STANDBY",
            badgeColor = if (seismicAlert != null) CriticalCrimson else BorderGlass,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        if (seismicAlert != null) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalMetricBox(
                    label = "MAGNITUDE",
                    value = "M${seismicAlert.magnitude}",
                    statusColor = CriticalCrimson,
                    modifier = Modifier.weight(1f)
                )
                TacticalMetricBox(
                    label = "EPICENTER",
                    value = "${seismicAlert.epicenterDistanceKm.toInt()} km",
                    unit = seismicAlert.epicenterLocationName,
                    statusColor = HazardAmber,
                    modifier = Modifier.weight(1.4f)
                )
                TacticalMetricBox(
                    label = "S-WAVE COUNTDOWN",
                    value = "${seismicAlert.sWaveCountdownSeconds}s",
                    statusColor = CriticalCrimson,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Primary P-wave (6.0 km/s) detected before destructive shear S-wave (3.5 km/s). Estimated MMI: ${seismicAlert.estimatedMmi}.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        } else {
            Text(
                text = "USGS seismic network standby. Detects P-wave velocity differentials to deliver 15–45 second early warnings prior to destructive ground motion.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        TacticalButton(
            text = "TRIGGER M6.4 SEISMIC COUNTDOWN",
            onClick = onTriggerDemo,
            accentColor = CriticalCrimson,
            leadingIcon = "🌋",
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun GlofHazardPanel(
    floodAlert: FloodAlert?,
    onTriggerDemo: () -> Unit
) {
    TacticalPanel(borderColor = BorderBright) {
        TacticalSectionHeader(
            tag = "GLOF-VALLEY",
            title = "Glacial Lake Outburst Flood Inundation",
            trailingBadge = if (floodAlert != null) "CREST INBOUND" else "STANDBY",
            badgeColor = if (floodAlert != null) HazardAmber else BorderGlass,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        if (floodAlert != null) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalMetricBox(
                    label = "CREST ETA",
                    value = "${floodAlert.crestLeadTimeMinutes} min",
                    statusColor = HazardAmber,
                    modifier = Modifier.weight(1f)
                )
                TacticalMetricBox(
                    label = "VERTICAL CLIMB",
                    value = "+${floodAlert.verticalEvacuationMeters}m",
                    statusColor = HighGroundTeal,
                    modifier = Modifier.weight(1f)
                )
                TacticalMetricBox(
                    label = "DISCHARGE",
                    value = "${floodAlert.dischargeSurgeRateM3s.toInt()}",
                    unit = "m³/s",
                    statusColor = ElectricBlue,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Moraine breach upstream at ${floodAlert.basinName}. Mandatory immediate vertical climb out of valley riverbed.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        } else {
            Text(
                text = "Glacial basin moraine monitoring standby. High-altitude outburst models compute hydrological surge wave velocities down valleys.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        TacticalButton(
            text = "SIMULATE GLOF MORAINE BURST",
            onClick = onTriggerDemo,
            accentColor = ElectricBlue,
            leadingIcon = "🌊",
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun FlashFloodPanel(
    floodAlert: FloodAlert?,
    onTriggerDemo: () -> Unit
) {
    TacticalPanel(borderColor = BorderAmber) {
        TacticalSectionHeader(
            tag = "CANYON-SURGE",
            title = "Flash Flood Canyon Runoff",
            trailingBadge = if (floodAlert != null) "ACTIVE SURGE" else "MONITORING",
            badgeColor = if (floodAlert != null) HazardAmber else BorderGlass,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        Text(
            text = "Upstream convective cloudbursts exceeding 50 mm/hr trigger rapid canyon washes and flash flood hydrographs.",
            color = TextSecondary,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            lineHeight = 16.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        TacticalButton(
            text = "TRIGGER CANYON RUNOFF SURGE",
            onClick = onTriggerDemo,
            accentColor = HazardAmber,
            leadingIcon = "🌧️",
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun LightningTelemetryPanel(
    strikes: List<LightningStrike>,
    onTriggerDemo: () -> Unit
) {
    TacticalPanel(borderColor = BorderBright) {
        TacticalSectionHeader(
            tag = "LIGHTNING-01",
            title = "Atmospheric Strike Log",
            trailingBadge = "${strikes.size} DETECTIONS",
            badgeColor = if (strikes.isEmpty()) CyberEmerald else CriticalCrimson,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        if (strikes.isNotEmpty()) {
            strikes.take(5).forEach { strike ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "⚡", fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${String.format("%.1f", strike.distanceKm)} km • ${strike.bearingDegrees.toInt()}°",
                            color = if (strike.distanceKm <= 10.0) CriticalCrimson else HazardAmber,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    Text(
                        text = "${strike.intensityKa.toInt()} kA • ${strike.ageSeconds}s ago",
                        color = TextSecondary,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        } else {
            Text(
                text = "Zero convective lightning discharges detected within 15 km perimeter.",
                color = CyberEmerald,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        TacticalButton(
            text = "SIMULATE 5.2 KM STRIKE INTRUSION",
            onClick = onTriggerDemo,
            accentColor = CriticalCrimson,
            leadingIcon = "⚡",
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun TsunamiHazardPanel(
    tsunamiAlert: TsunamiAlert?,
    onTriggerDemo: () -> Unit
) {
    TacticalPanel(borderColor = BorderBright) {
        TacticalSectionHeader(
            tag = "TSUNAMI-01",
            title = "Submarine Rupture & Shoaling Kinematics",
            trailingBadge = if (tsunamiAlert != null) "WAVE INBOUND" else "STANDBY",
            badgeColor = if (tsunamiAlert != null) CriticalCrimson else BorderGlass,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        if (tsunamiAlert != null) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalMetricBox(
                    label = "DEEP V (v=√(g·d))",
                    value = "${tsunamiAlert.deepOceanSpeedKmh.toInt()}",
                    unit = "km/h",
                    statusColor = CriticalCrimson,
                    modifier = Modifier.weight(1f)
                )
                TacticalMetricBox(
                    label = "COASTAL ETA",
                    value = "${tsunamiAlert.estimatedArrivalMinutes}m",
                    statusColor = HazardAmber,
                    modifier = Modifier.weight(1f)
                )
                TacticalMetricBox(
                    label = "MANDATORY CLIMB",
                    value = "+${tsunamiAlert.verticalAscentRequiredMeters}m",
                    statusColor = HighGroundTeal,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Kinematics: Deep ocean (d=4000m) velocity ${tsunamiAlert.deepOceanSpeedKmh.toInt()} km/h. Shoaling amplitude at coast: ${tsunamiAlert.projectedRunupHeightMeters}m. Mandatory vertical ascent!",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        } else {
            Text(
                text = "Coastal tsunami inundation engine standby. Solves shallow-water wave equation v = √(g·d) and Green's law shoaling factors.",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                lineHeight = 16.sp
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        TacticalButton(
            text = "TRIGGER M8.2 TSUNAMI SCENARIO",
            onClick = onTriggerDemo,
            accentColor = TacticalPurple,
            leadingIcon = "🌊",
            modifier = Modifier.fillMaxWidth()
        )
    }
}
