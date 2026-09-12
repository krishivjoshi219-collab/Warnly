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
import com.example.warnly.model.AlertLevel
import com.example.warnly.physics.GeoMath
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * Radar & Geodesic Rings Situational Awareness Screen
 * Implements FR-01, FR-02, FR-03, and quick tactical actuators.
 */
@Composable
fun RadarScreen(engine: DisasterEngine) {
    val alertLevel by engine.alertLevel.collectAsState()
    val nearestStrikeKm by engine.nearestStrikeDistanceKm.collectAsState()
    val nearestStrikeBearing by engine.nearestStrikeBearing.collectAsState()
    val strikes by engine.strikes.collectAsState()
    val shelters by engine.shelters.collectAsState()
    val atmos by engine.atmosphericIndices.collectAsState()
    val timerSec by engine.timerRemainingSeconds.collectAsState()
    val isTimerActive by engine.isTimerActive.collectAsState()
    val resetCount by engine.timerResetCount.collectAsState()
    val isTorchActive by engine.opticalBeacon.isStrobeActive.collectAsState()
    val isSirenOn = engine.siren.isSirenActive()

    val levelBannerColor = when (alertLevel) {
        AlertLevel.DANGER -> CriticalCrimson
        AlertLevel.ADVISORY -> HazardAmber
        AlertLevel.SAFE -> CyberEmerald
    }

    val levelBorderColor = when (alertLevel) {
        AlertLevel.DANGER -> BorderCritical
        AlertLevel.ADVISORY -> BorderAmber
        AlertLevel.SAFE -> BorderEmerald
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
        // 1. Top DEFCON Status Banner
        TacticalPanel(
            borderColor = levelBorderColor,
            contentPadding = PaddingValues(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PulsingLed(color = levelBannerColor, size = 9.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = alertLevel.label,
                            color = levelBannerColor,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = if (nearestStrikeKm != null) {
                                "NEAREST STRIKE: ${String.format("%.1f", nearestStrikeKm)} KM (${GeoMath.bearingToCardinal(nearestStrikeBearing)} • ${(nearestStrikeBearing).toInt()}°)"
                            } else {
                                "15 KM PERIMETER CLEAR • ZERO INTRUSIONS"
                            },
                            color = TextSecondary,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                if (alertLevel == AlertLevel.DANGER) {
                    TacticalButton(
                        text = "ACTION HUD",
                        onClick = { engine.showEmergencyOverlay() },
                        accentColor = CriticalCrimson,
                        leadingIcon = "🚨",
                        height = 36.dp
                    )
                }
            }
        }

        // 2. Geodesic Safety Rings Radar (FR-01)
        TacticalPanel(
            borderColor = BorderSubtle,
            contentPadding = PaddingValues(8.dp)
        ) {
            TacticalSectionHeader(
                tag = "RADAR-01",
                title = "Geodesic Range Rings (10km / 15km)",
                trailingBadge = if (strikes.isEmpty()) "ALL CLEAR" else "${strikes.size} DETECTIONS",
                badgeColor = if (strikes.isEmpty()) CyberEmerald else CriticalCrimson,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
            )

            GeodesicRadarCanvas(
                alertLevel = alertLevel,
                strikes = strikes,
                shelters = shelters,
                stormSpeedKmh = atmos.stormSpeedKmh,
                stormBearingDegrees = atmos.stormBearingDegrees,
                modifier = Modifier.fillMaxWidth()
            )
        }

        // 3. Calibrated Risk Probability Card (FR-02)
        RiskGaugeCard(
            atmosphericIndices = atmos,
            nearestStrikeKm = nearestStrikeKm
        )

        // 4. Automated 30-30 Sheltering Countdown Clock (FR-03)
        ShelterTimerView(
            remainingSeconds = timerSec,
            isActive = isTimerActive,
            resetCount = resetCount,
            onManualStartReset = { engine.startOrReset30_30Timer() },
            onStopTimer = { engine.stop30_30Timer() }
        )

        // 5. Rapid Audible & Optical Actuators
        TacticalPanel(borderColor = BorderGlass) {
            TacticalSectionHeader(
                tag = "ACT-01",
                title = "Hardware Alert Actuators",
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                TacticalButton(
                    text = if (isSirenOn) "STOP 880/440HZ SIREN" else "START WARBLE SIREN",
                    onClick = {
                        if (isSirenOn) engine.siren.stopSiren() else engine.siren.startSiren()
                    },
                    accentColor = if (isSirenOn) CriticalCrimson else SurfaceDark,
                    leadingIcon = if (isSirenOn) "🚨" else "🔊",
                    modifier = Modifier.weight(1f)
                )

                TacticalButton(
                    text = if (isTorchActive) "STOP SOS STROBE" else "FLASH MORSE SOS",
                    onClick = {
                        if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                    },
                    accentColor = if (isTorchActive) HazardAmber else SurfaceDark,
                    leadingIcon = if (isTorchActive) "💡" else "🔦",
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}
