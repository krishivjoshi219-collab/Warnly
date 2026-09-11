package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
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
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "⚡ 72-HOUR BLACKOUT SURVIVAL HUD",
                color = Color(0xFF00E676),
                fontSize = 14.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp
            )
            Text(
                text = "Pure OLED Subpixel Power Gating • CPU Duty-Cycled",
                color = Color(0xFF555555),
                fontSize = 10.sp
            )
        }

        // Center Digital HUD
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Big Battery % and Projected Hours
            Text(
                text = "$batteryPct%",
                color = if (batteryPct <= 20) Color(0xFFFF1744) else Color(0xFF00E676),
                fontSize = 58.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = if (isCharging) "CHARGING • UNLIMITED" else "~$hoursRemaining HOURS REMAINING",
                color = Color(0xFFAAAAAA),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "Duty Cycle: 58s Sleep / 2s Sensor Wake",
                color = Color(0xFF444444),
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Waypoint Quick Bearing
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF222222), RoundedCornerShape(8.dp)),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF050505))
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "HIGH-GROUND WAYPOINT",
                        color = Color(0xFF666666),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = selectedShelter?.name ?: "No Shelter Selected",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Distance: ${(distanceMeters / 1000.0 * 10).toInt() / 10.0} km • Compass: ${currentHeading.toInt()}°",
                        color = Color(0xFF00E676),
                        fontSize = 13.sp,
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
            Button(
                onClick = {
                    if (isTorchActive) engine.opticalBeacon.stopSosStrobe() else engine.opticalBeacon.startSosStrobe()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isTorchActive) Color(0xFFD50000) else Color(0xFF222222)
                ),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (isTorchActive) "💡 STOP SOS STROBE" else "🔦 PULSE MORSE SOS FLASHLIGHT",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Button(
                onClick = {
                    if (isBlackoutActive) blackoutManager.disableBlackoutMode() else blackoutManager.enableBlackoutMode()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isBlackoutActive) Color(0xFF00897B) else Color(0xFF1B5E20)
                ),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (isBlackoutActive) "EXIT BLACKOUT SURVIVAL (RESTORE NORMAL UI)" else "ENGAGE DEEP SURVIVAL MODE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
