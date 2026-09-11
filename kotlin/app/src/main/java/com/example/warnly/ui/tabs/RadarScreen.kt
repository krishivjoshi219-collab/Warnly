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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AlertLevel
import com.example.warnly.physics.GeoMath
import com.example.warnly.service.DisasterEngine
import com.example.warnly.ui.components.GeodesicRadarCanvas
import com.example.warnly.ui.components.RiskGaugeCard
import com.example.warnly.ui.components.ShelterTimerView

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

    val levelBannerColor = when (alertLevel) {
        AlertLevel.DANGER -> Color(0xFFFF1744)
        AlertLevel.ADVISORY -> Color(0xFFFFB300)
        AlertLevel.SAFE -> Color(0xFF00E676)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Geodesic Status Badge
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.5.dp, levelBannerColor, RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = levelBannerColor.copy(alpha = 0.12f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = alertLevel.label,
                        color = levelBannerColor,
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = if (nearestStrikeKm != null) {
                            "Nearest Strike: ${String.format("%.1f", nearestStrikeKm)} km (${GeoMath.bearingToCardinal(nearestStrikeBearing)} • ${(nearestStrikeBearing).toInt()}°)"
                        } else {
                            "No active strikes detected within 15 km perimeter"
                        },
                        color = Color(0xFFCFD8DC),
                        fontSize = 12.sp
                    )
                }

                if (alertLevel == AlertLevel.DANGER) {
                    Button(
                        onClick = { engine.showEmergencyOverlay() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF1744)),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("ACTION", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Geodesic Safety Rings Radar
        GeodesicRadarCanvas(
            alertLevel = alertLevel,
            strikes = strikes,
            shelters = shelters,
            stormSpeedKmh = atmos.stormSpeedKmh,
            stormBearingDegrees = atmos.stormBearingDegrees,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Calibrated Risk Probability Card (FR-02)
        RiskGaugeCard(
            atmosphericIndices = atmos,
            nearestStrikeKm = nearestStrikeKm
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Automated 30-30 Sheltering Countdown Clock (FR-03)
        ShelterTimerView(
            remainingSeconds = timerSec,
            isActive = isTimerActive,
            resetCount = resetCount,
            onManualStartReset = { engine.startOrReset30_30Timer() },
            onStopTimer = { engine.stop30_30Timer() }
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Siren and SOS Beacon Quick Launch Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF13181F))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val isSirenOn = engine.siren.isSirenActive()
                Button(
                    onClick = {
                        if (isSirenOn) engine.siren.stopSiren() else engine.siren.startSiren()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSirenOn) Color(0xFFD50000) else Color(0xFF37474F)
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(text = if (isSirenOn) "🚨 Silence Siren" else "🔊 Test Siren (880Hz)", fontSize = 12.sp)
                }

                Button(
                    onClick = {
                        if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isTorchActive) Color(0xFFFF8F00) else Color(0xFF37474F)
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(text = if (isTorchActive) "💡 Stop SOS" else "🔦 Optical SOS Strobe", fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}
