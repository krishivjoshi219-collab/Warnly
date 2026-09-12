package com.example.warnly.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.warnly.model.AlertLevel
import com.example.warnly.theme.*
import com.example.warnly.ui.components.DynamicIslandHud
import com.example.warnly.ui.components.EmergencyOverlayDialog
import com.example.warnly.ui.components.PulsingLed
import com.example.warnly.ui.components.TacticalBadge
import com.example.warnly.ui.tabs.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WarnlyApp(viewModel: WarnlyViewModel = viewModel()) {
    val engine = viewModel.engine
    val currentTab by viewModel.currentTab.collectAsState()
    val alertLevel by engine.alertLevel.collectAsState()
    val nearestStrikeKm by engine.nearestStrikeDistanceKm.collectAsState()
    val nearestStrikeBearing by engine.nearestStrikeBearing.collectAsState()
    val timerSeconds by engine.timerRemainingSeconds.collectAsState()
    val isTimerActive by engine.isTimerActive.collectAsState()
    val isOverlayVisible by engine.isEmergencyOverlayVisible.collectAsState()
    val isSirenActive = engine.siren.isSirenActive()
    val isTorchActive by engine.opticalBeacon.isStrobeActive.collectAsState()
    val screenFlashState by engine.opticalBeacon.screenFlashState.collectAsState()
    val telemetryStatus by engine.liveTelemetryStatus.collectAsState()
    val locationName by engine.locationName.collectAsState()
    val isBlackoutModeActive by engine.blackoutManager.isBlackoutModeActive.collectAsState()
    val batteryPct by engine.blackoutManager.batteryPercent.collectAsState()

    val alertAccentColor = when (alertLevel) {
        AlertLevel.DANGER -> CriticalCrimson
        AlertLevel.ADVISORY -> HazardAmber
        AlertLevel.SAFE -> CyberEmerald
    }

    val activeCategory = currentTab.getCategory()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(VoidBlack)
    ) {
        Scaffold(
            topBar = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    DeepObsidian,
                                    VoidBlack
                                )
                            )
                        )
                        .statusBarsPadding()
                ) {
                    // Floating Interactive Dynamic Island HUD
                    DynamicIslandHud(
                        alertLevel = alertLevel,
                        nearestStrikeKm = nearestStrikeKm,
                        nearestStrikeBearing = nearestStrikeBearing,
                        timerSeconds = timerSeconds,
                        isTimerActive = isTimerActive,
                        batteryPct = batteryPct,
                        isBlackoutActive = isBlackoutModeActive,
                        isSirenActive = isSirenActive,
                        isTorchActive = isTorchActive,
                        locationName = locationName,
                        telemetryStatus = telemetryStatus,
                        onToggleSiren = {
                            if (isSirenActive) engine.siren.stopSiren() else engine.siren.startSiren()
                        },
                        onToggleTorch = {
                            if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                        },
                        onToggleBlackout = {
                            if (isBlackoutModeActive) {
                                engine.blackoutManager.exitSurvivalMode()
                            } else {
                                engine.blackoutManager.enter72HourSurvivalMode()
                            }
                        },
                        onSyncFeeds = { engine.syncAllLiveFeeds() },
                        onNavigateToShelter = { viewModel.setTab(AppNavTab.NAVIGATE) }
                    )
                }
            },
            bottomBar = {
                // Sleek Floating Consumer / Tactical Glassmorphic Dock
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                        .clip(RoundedCornerShape(22.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xF50D1622),
                                    Color(0xFA070C12)
                                )
                            )
                        )
                        .border(
                            width = 1.dp,
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    BorderBright.copy(alpha = 0.4f),
                                    BorderGlass
                                )
                            ),
                            shape = RoundedCornerShape(22.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 8.dp)
                ) {
                    // Category Selector Pills
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StationCategory.values().forEach { cat ->
                            val isCatActive = (cat == activeCategory)
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        if (isCatActive) NeonCyan.copy(alpha = 0.18f) else Color.Transparent
                                    )
                                    .border(
                                        width = 1.dp,
                                        color = if (isCatActive) NeonCyan.copy(alpha = 0.8f) else Color.Transparent,
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        viewModel.setTab(cat.getTabs().first())
                                    }
                                    .padding(vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Text(cat.icon, fontSize = 12.sp)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = cat.label,
                                        color = if (isCatActive) NeonCyan else TextMuted,
                                        fontSize = 10.sp,
                                        fontWeight = if (isCatActive) FontWeight.Black else FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        letterSpacing = 0.5.sp,
                                        maxLines = 1,
                                        softWrap = false
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Secondary Sub-Module Pills for the active category
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        activeCategory.getTabs().forEach { tab ->
                            val isSelected = (tab == currentTab)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(
                                        brush = Brush.horizontalGradient(
                                            colors = if (isSelected) {
                                                listOf(
                                                    alertAccentColor.copy(alpha = 0.32f),
                                                    alertAccentColor.copy(alpha = 0.15f)
                                                )
                                            } else {
                                                listOf(
                                                    SurfaceElevated.copy(alpha = 0.7f),
                                                    SurfaceDark.copy(alpha = 0.7f)
                                                )
                                            }
                                        )
                                    )
                                    .border(
                                        width = 1.dp,
                                        color = if (isSelected) alertAccentColor else BorderGlass,
                                        shape = RoundedCornerShape(14.dp)
                                    )
                                    .clickable { viewModel.setTab(tab) }
                                    .padding(horizontal = 14.dp, vertical = 7.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(tab.icon, fontSize = 13.sp)
                                    Text(
                                        text = tab.shortTag.ifEmpty { tab.title }.uppercase(),
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = if (isSelected) alertAccentColor else TextSecondary
                                    )
                                }
                            }
                        }
                    }
                }
            },
            containerColor = VoidBlack
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (currentTab) {
                    AppNavTab.RADAR -> RadarScreen(engine)
                    AppNavTab.NAVIGATE -> NavigationScreen(engine)
                    AppNavTab.EDGE_AI -> LocalEdgeScreen(engine)
                    AppNavTab.HAZARDS -> HazardsScreen(engine)
                    AppNavTab.MESH -> MeshNetworkScreen(engine)
                    AppNavTab.BLACKOUT -> BlackoutSurvivalScreen(engine)
                    AppNavTab.SHELTERS -> SheltersScreen(
                        engine = engine,
                        onNavigateToShelter = { viewModel.setTab(AppNavTab.NAVIGATE) }
                    )
                    AppNavTab.FAMILY_SHIELD -> FamilyShieldScreen(engine)
                    AppNavTab.PROTOCOLS -> ProtocolsScreen()
                    AppNavTab.SIMULATOR -> SimulatorScreen(engine)
                }
            }
        }

        // 72-Hour Pure OLED Blackout Survival Overlay
        if (isBlackoutModeActive) {
            BlackoutSurvivalScreen(engine)
        }

        // Screen Flash Strobe Overlay (Optical SOS)
        if (screenFlashState) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White.copy(alpha = 0.88f))
            )
        }

        // Full Screen Critical Danger Intrusion Overlay Dialog (FR-04)
        EmergencyOverlayDialog(
            isVisible = isOverlayVisible,
            hazardType = engine.selectedHazard.collectAsState().value,
            nearestStrikeKm = nearestStrikeKm,
            nearestStrikeBearing = nearestStrikeBearing,
            isSirenActive = isSirenActive,
            isTorchActive = isTorchActive,
            onToggleSiren = {
                if (isSirenActive) engine.siren.stopSiren() else engine.siren.startSiren()
            },
            onToggleTorch = {
                if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
            },
            onDismiss = { engine.dismissEmergencyOverlay() },
            onNavigateToShelter = { viewModel.setTab(AppNavTab.NAVIGATE) }
        )
    }
}
