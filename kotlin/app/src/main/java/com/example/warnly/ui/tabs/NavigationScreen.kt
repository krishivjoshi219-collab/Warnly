package com.example.warnly.ui.tabs

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.Shelter
import com.example.warnly.physics.GeoMath
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * Tactical Offline Disaster Navigation Screen
 * Fully autonomous mobile guidance system for life-saving high-ground evacuation.
 * Operates 100% offline with zero network connectivity.
 */
@Composable
fun NavigationScreen(engine: DisasterEngine) {
    val context = LocalContext.current
    val navigator = engine.navigator
    val sensorManager = engine.sensorManager

    val currentHeading by sensorManager.compassAzimuthDegrees.collectAsState()
    val selectedShelter by navigator.selectedShelter.collectAsState()
    val distanceMeters by navigator.distanceMeters.collectAsState()
    val targetBearing by navigator.targetBearingDegrees.collectAsState()
    val relativeDeviation by navigator.relativeDeviationDegrees.collectAsState()
    val isAligned by navigator.isTargetAligned.collectAsState()
    val guidanceInstruction by navigator.guidanceInstruction.collectAsState()
    val verticalClimb by navigator.verticalClimbRequiredMeters.collectAsState()
    val hazardWarning by navigator.corridorHazardWarning.collectAsState()
    val isHomingActive by navigator.homingBeeper.isHomingActive.collectAsState()
    val allShelters by engine.shelters.collectAsState()

    val navColor = if (isAligned) CyberEmerald else HazardAmber
    val distanceDisplay = if (distanceMeters >= 1000.0) {
        String.format("%.2f km", distanceMeters / 1000.0)
    } else {
        "${distanceMeters.toInt()} m"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(VoidBlack)
            .verticalScroll(rememberScrollState())
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Header & Autonomous Offline Badge
        TacticalPanel(
            borderColor = if (isAligned) BorderEmerald else BorderBright,
            contentPadding = PaddingValues(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PulsingLed(color = navColor, size = 9.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "TACTICAL EVACUATION HUD",
                            color = navColor,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "100% OFFLINE SENSOR GUIDANCE • ZERO CELL DEPENDENCY",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                TacticalBadge(
                    text = if (isAligned) "LOCK-ON" else "COURSE CORR",
                    accentColor = navColor
                )
            }
        }

        // 2. Active High-Ground Target Lock Card
        selectedShelter?.let { shelter ->
            TacticalPanel(borderColor = BorderBright) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = shelter.name.uppercase(),
                            color = TextHighlight,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "${shelter.type.title} • ${shelter.address}",
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }
                    TacticalBadge(
                        text = "+${shelter.elevationGainMeters}M RIDGE",
                        accentColor = HighGroundTeal
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TacticalMetricBox(
                        label = "DISTANCE",
                        value = distanceDisplay,
                        statusColor = navColor,
                        modifier = Modifier.weight(1f)
                    )
                    TacticalMetricBox(
                        label = "BEARING",
                        value = "${targetBearing.toInt()}°",
                        unit = GeoMath.bearingToCardinal(targetBearing),
                        statusColor = NeonCyan,
                        modifier = Modifier.weight(1f)
                    )
                    TacticalMetricBox(
                        label = "DRIFT",
                        value = "${if (relativeDeviation > 0) "+" else ""}${relativeDeviation.toInt()}°",
                        statusColor = if (isAligned) CyberEmerald else HazardAmber,
                        modifier = Modifier.weight(1f)
                    )
                    TacticalMetricBox(
                        label = "ASCENT",
                        value = "+${verticalClimb}m",
                        statusColor = HighGroundTeal,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 3. Course Deviation Indicator (CDI) Ribbon
        TacticalPanel(
            borderColor = if (isAligned) BorderEmerald else BorderAmber,
            contentPadding = PaddingValues(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = guidanceInstruction.uppercase(),
                    color = if (isAligned) CyberEmerald else HazardAmber,
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.weight(1f)
                )
                TacticalBadge(
                    text = if (isAligned) "ALIGNMENT ±8° OK" else "CROSS-TRACK DRIFT",
                    accentColor = if (isAligned) CyberEmerald else HazardAmber
                )
            }

            if (hazardWarning != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "⚠️ $hazardWarning",
                    color = CriticalCrimson,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // 4. Tactical Compass Rose Canvas (FR-06)
        TacticalPanel(
            borderColor = BorderSubtle,
            contentPadding = PaddingValues(6.dp)
        ) {
            TacticalSectionHeader(
                tag = "HSI-01",
                title = "Tactical Aviation Compass & CDI",
                trailingBadge = "${currentHeading.toInt()}° MAG",
                badgeColor = NeonCyan,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
            ) {
                TacticalCompassCanvas(
                    currentHeadingDegrees = currentHeading,
                    targetBearingDegrees = targetBearing,
                    isAligned = isAligned,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        // 5. Blind Navigation Sonar & Voice Guide
        TacticalPanel(borderColor = BorderGlass) {
            TacticalSectionHeader(
                tag = "AUDIO-01",
                title = "Blind Navigation Acoustic & Voice HUD",
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                TacticalButton(
                    text = if (isHomingActive) "STOP 1200HZ SONAR" else "START HOMING SONAR",
                    onClick = {
                        if (isHomingActive) navigator.homingBeeper.stopHoming() else navigator.homingBeeper.startHoming()
                    },
                    accentColor = if (isHomingActive) CyberEmerald else SurfaceDark,
                    leadingIcon = "📡",
                    modifier = Modifier.weight(1f)
                )

                TacticalButton(
                    text = "SPEAK GUIDANCE (TTS)",
                    onClick = {
                        engine.voiceGuide.speakUrgentDirective(guidanceInstruction, true)
                    },
                    accentColor = NeonCyan,
                    leadingIcon = "🗣️",
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 6. Offline Vector Topographic Contours Canvas
        TacticalPanel(borderColor = BorderSubtle) {
            TacticalSectionHeader(
                tag = "TERRAIN-01",
                title = "Offline Vector Elevation Contours",
                trailingBadge = "+${verticalClimb}m Required",
                badgeColor = HighGroundTeal,
                modifier = Modifier.padding(bottom = 6.dp)
            )

            TopographicContourCanvas(
                userElevationMeters = 12,
                targetShelterElevationMeters = verticalClimb,
                targetBearingDegrees = targetBearing,
                modifier = Modifier.fillMaxWidth()
            )
        }

        // 7. High-Ground Shelter Quick-Switch Carousel
        TacticalPanel(borderColor = BorderGlass) {
            TacticalSectionHeader(
                tag = "SHELTER-LIST",
                title = "Select Evacuation Waypoint",
                modifier = Modifier.padding(bottom = 10.dp)
            )

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(allShelters) { s ->
                    val isCurrent = (s.id == selectedShelter?.id)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isCurrent) SurfaceElevated else SurfaceDark)
                            .border(
                                1.dp,
                                if (isCurrent) CyberEmerald else BorderGlass,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable { engine.startNavigatingTo(s) }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Column {
                            Text(
                                text = s.name,
                                color = if (isCurrent) CyberEmerald else TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "${s.distanceKm} km • ${s.bearingDegrees.toInt()}° • +${s.elevationGainMeters}m",
                                color = TextSecondary,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }
        }
    }
}
