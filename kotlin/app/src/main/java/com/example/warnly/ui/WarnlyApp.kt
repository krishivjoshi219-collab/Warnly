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
                        .background(SurfaceDark)
                        .border(
                            width = 1.dp,
                            color = BorderGlass,
                            shape = RoundedCornerShape(bottomStart = 14.dp, bottomEnd = 14.dp)
                        )
                ) {
                    // Aerospace Command Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .statusBarsPadding()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Title & Status LED
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            PulsingLed(color = alertAccentColor, size = 9.dp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "WARNLY",
                                fontWeight = FontWeight.Black,
                                fontSize = 18.sp,
                                color = TextHighlight,
                                fontFamily = FontFamily.Monospace,
                                letterSpacing = 2.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            TacticalBadge(
                                text = alertLevel.name,
                                accentColor = alertAccentColor
                            )
                        }

                        // Tactical Quick-Action Command Cluster
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // 72h Survival toggle with battery %
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isBlackoutModeActive) CyberEmerald.copy(alpha = 0.2f) else SurfaceElevated)
                                    .border(
                                        1.dp,
                                        if (isBlackoutModeActive) CyberEmerald else BorderGlass,
                                        RoundedCornerShape(6.dp)
                                    )
                                    .clickable {
                                        if (isBlackoutModeActive) {
                                            engine.blackoutManager.exitSurvivalMode()
                                        } else {
                                            engine.blackoutManager.enter72HourSurvivalMode()
                                        }
                                    }
                                    .padding(horizontal = 7.dp, vertical = 5.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("🔋", fontSize = 11.sp)
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = "$batteryPct%",
                                        color = if (batteryPct <= 20) CriticalCrimson else CyberEmerald,
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            // Sync live APIs button
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(SurfaceElevated)
                                    .border(1.dp, BorderGlass, RoundedCornerShape(6.dp))
                                    .clickable { engine.syncAllLiveFeeds() }
                                    .padding(horizontal = 7.dp, vertical = 5.dp)
                            ) {
                                Text("🔄", fontSize = 12.sp)
                            }

                            // Siren toggle button
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSirenActive) CriticalCrimson.copy(alpha = 0.25f) else SurfaceElevated)
                                    .border(
                                        1.dp,
                                        if (isSirenActive) CriticalCrimson else BorderGlass,
                                        RoundedCornerShape(6.dp)
                                    )
                                    .clickable {
                                        if (isSirenActive) engine.siren.stopSiren() else engine.siren.startSiren()
                                    }
                                    .padding(horizontal = 7.dp, vertical = 5.dp)
                            ) {
                                Text(if (isSirenActive) "🚨" else "🔊", fontSize = 12.sp)
                            }

                            // Optical torch SOS toggle
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isTorchActive) HazardAmber.copy(alpha = 0.25f) else SurfaceElevated)
                                    .border(
                                        1.dp,
                                        if (isTorchActive) HazardAmber else BorderGlass,
                                        RoundedCornerShape(6.dp)
                                    )
                                    .clickable {
                                        if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                                    }
                                    .padding(horizontal = 7.dp, vertical = 5.dp)
                            ) {
                                Text(if (isTorchActive) "💡" else "🔦", fontSize = 12.sp)
                            }
                        }
                    }

                    // Live Telemetry Ribbon & GNSS Location
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(VoidBlack)
                            .padding(horizontal = 14.dp, vertical = 5.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "📡 $telemetryStatus",
                            color = NeonCyan,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "📍 $locationName",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            },
            bottomBar = {
                // Tactical Aerospace Dock
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceDark)
                        .border(
                            width = 1.dp,
                            color = BorderGlass,
                            shape = RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp)
                        )
                        .navigationBarsPadding()
                        .padding(vertical = 8.dp)
                ) {
                    // Category Selector Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StationCategory.values().forEach { cat ->
                            val isCatActive = (cat == activeCategory)
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isCatActive) NeonCyan.copy(alpha = 0.15f) else Color.Transparent)
                                    .border(
                                        width = 1.dp,
                                        color = if (isCatActive) NeonCyan else Color.Transparent,
                                        shape = RoundedCornerShape(6.dp)
                                    )
                                    .clickable {
                                        viewModel.setTab(cat.getTabs().first())
                                    }
                                    .padding(vertical = 5.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Text(cat.icon, fontSize = 11.sp)
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = cat.label,
                                        color = if (isCatActive) NeonCyan else TextMuted,
                                        fontSize = 9.sp,
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

                    // Secondary Sub-Station Module Pills (The tabs for the active category)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        activeCategory.getTabs().forEach { tab ->
                            val isSelected = (tab == currentTab)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(
                                        brush = Brush.horizontalGradient(
                                            colors = if (isSelected) {
                                                listOf(
                                                    alertAccentColor.copy(alpha = 0.28f),
                                                    alertAccentColor.copy(alpha = 0.12f)
                                                )
                                            } else {
                                                listOf(
                                                    SurfaceElevated,
                                                    SurfaceDark
                                                )
                                            }
                                        )
                                    )
                                    .border(
                                        width = 1.dp,
                                        color = if (isSelected) alertAccentColor else BorderGlass,
                                        shape = RoundedCornerShape(6.dp)
                                    )
                                    .clickable { viewModel.setTab(tab) }
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                                ) {
                                    Text(tab.icon, fontSize = 12.sp)
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
