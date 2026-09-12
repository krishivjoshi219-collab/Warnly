package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * 72-Hour Ultra-Low-Power Blackout Survival Screen
 * Renders on a pure 100% OLED black canvas to minimize battery consumption.
 * Disables non-essential graphics while maintaining critical life-safety awareness.
 */
@Composable
fun BlackoutSurvivalScreen(engine: DisasterEngine) {
    val blackoutManager = engine.blackoutManager
    val isBlackoutActive by blackoutManager.isBlackoutModeActive.collectAsState()
    val batteryPct by blackoutManager.batteryPercent.collectAsState()
    val hoursRemaining by blackoutManager.estimatedHoursRemaining.collectAsState()
    val isCharging by blackoutManager.isCharging.collectAsState()
    val isTorchActive by engine.opticalBeacon.isStrobeActive.collectAsState()
    val selectedShelter by engine.navigator.selectedShelter.collectAsState()
    val distanceMeters by engine.navigator.distanceMeters.collectAsState()
    val currentHeading by engine.sensorManager.compassAzimuthDegrees.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Header
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                PulsingLed(color = CyberEmerald, size = 8.dp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "72-HOUR BLACKOUT SURVIVAL HUD",
                    color = CyberEmerald,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.sp
                )
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "PURE OLED SUBPIXEL POWER GATING • 0 MW CANVAS",
                color = Color(0xFF555555),
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace
            )
        }

        // Center Digital HUD
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Big Battery %
            Text(
                text = "$batteryPct%",
                color = if (batteryPct <= 20) CriticalCrimson else CyberEmerald,
                fontSize = 64.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                letterSpacing = (-2).sp
            )

            Text(
                text = if (isCharging) "EXTERNAL POWER CONNECTED" else "~$hoursRemaining HOURS REMAINING",
                color = Color(0xFFCCCCCC),
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )

            Text(
                text = "Duty Cycle: 58s Sleep / 2s Sensor Wake",
                color = Color(0xFF444444),
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Waypoint Quick Bearing
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF06090D), RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFF1A2633), RoundedCornerShape(8.dp))
                    .padding(14.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "HIGH-GROUND WAYPOINT",
                        color = Color(0xFF666666),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = selectedShelter?.name ?: "Nearest High Ridge",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Distance: ${(distanceMeters / 1000.0 * 10).toInt() / 10.0} km • Heading: ${currentHeading.toInt()}°",
                        color = CyberEmerald,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }

        // Bottom Controls
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            TacticalButton(
                text = if (isTorchActive) "STOP OPTICAL SOS STROBE" else "PULSE MORSE SOS FLASHLIGHT",
                onClick = {
                    if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                },
                accentColor = if (isTorchActive) CriticalCrimson else CyberEmerald,
                leadingIcon = if (isTorchActive) "💡" else "🔦",
                modifier = Modifier.fillMaxWidth()
            )

            TacticalButton(
                text = "EXIT 72H SURVIVAL MODE",
                onClick = { blackoutManager.exitSurvivalMode() },
                accentColor = Color(0xFF555555),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
