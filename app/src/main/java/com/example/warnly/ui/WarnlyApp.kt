package com.example.warnly.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.warnly.model.*
import com.example.warnly.ui.components.EmergencyOverlayDialog
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

    val primaryColor = when (alertLevel) {
        AlertLevel.DANGER -> Color(0xFFFF1744)
        AlertLevel.ADVISORY -> Color(0xFFFFB300)
        AlertLevel.SAFE -> Color(0xFF00E5FF)
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            topBar = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0B0F14))
                ) {
                    TopAppBar(
                        title = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "WARNLY",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 20.sp,
                                    color = primaryColor,
                                    letterSpacing = 2.sp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .background(primaryColor.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                        .border(1.dp, primaryColor.copy(alpha = 0.6f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = alertLevel.name,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = primaryColor
                                    )
                                }
                            }
                        },
                        actions = {
                            // Survival mode toggle
                            IconButton(onClick = {
                                if (isBlackoutModeActive) {
                                    engine.blackoutManager.exitSurvivalMode()
                                } else {
                                    engine.blackoutManager.enter72HourSurvivalMode()
                                }
                            }) {
                                Text(if (isBlackoutModeActive) "🔋" else "⚡", fontSize = 16.sp)
                            }
                            // Sync live APIs button
                            IconButton(onClick = { engine.syncAllLiveFeeds() }) {
                                Text("🔄", fontSize = 16.sp)
                            }
                            // Siren toggle
                            IconButton(onClick = {
                                if (isSirenActive) engine.siren.stopSiren() else engine.siren.startSiren()
                            }) {
                                Text(if (isSirenActive) "🚨" else "🔊", fontSize = 18.sp)
                            }
                            // Optical torch toggle
                            IconButton(onClick = {
                                if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                            }) {
                                Text(if (isTorchActive) "💡" else "🔦", fontSize = 18.sp)
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = Color(0xFF0B0F14),
                            titleContentColor = Color.White
                        )
                    )

                    // Live Telemetry Ticker & Location Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF101721))
                            .padding(horizontal = 14.dp, vertical = 5.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "📡 $telemetryStatus",
                            color = Color(0xFF80D8FF),
                            fontSize = 11.sp,
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = "📍 $locationName",
                            color = Color(0xFFB0BEC5),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            },
            bottomBar = {
                Surface(
                    color = Color(0xFF0B0F14),
                    tonalElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 8.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AppNavTab.values().forEach { tab ->
                            val selected = (tab == currentTab)
                            Box(
                                modifier = Modifier
                                    .background(
                                        if (selected) primaryColor.copy(alpha = 0.2f) else Color.Transparent,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .border(
                                        1.dp,
                                        if (selected) primaryColor.copy(alpha = 0.8f) else Color.Transparent,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { viewModel.setTab(tab) }
                                    .padding(horizontal = 10.dp, vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(tab.icon, fontSize = 14.sp)
                                    Text(
                                        text = tab.title,
                                        fontSize = 11.sp,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (selected) primaryColor else Color(0xFF90A4AE)
                                    )
                                }
                            }
                        }
                    }
                }
            },
            containerColor = Color(0xFF070A0E)
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
                    AppNavTab.SHELTERS -> SheltersScreen(engine, onNavigateToShelter = { viewModel.setTab(AppNavTab.NAVIGATE) })
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
                    .background(Color.White.copy(alpha = 0.85f))
            )
        }

        // Full Screen Danger Overlay Dialog (FR-04)
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
