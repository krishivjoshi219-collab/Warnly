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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import com.example.warnly.ui.components.TacticalCompassCanvas

/**
 * Tactical Offline Disaster Navigation Screen
 * Fully autonomous local mobile guidance system for life-saving evacuation.
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

    val primaryColor = if (isAligned) Color(0xFF00E676) else Color(0xFFFFD600)
    val distanceDisplay = if (distanceMeters >= 1000.0) {
        String.format("%.2f km", distanceMeters / 1000.0)
    } else {
        "${distanceMeters.toInt()} m"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF070A0E))
            .verticalScroll(rememberScrollState())
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 1. Header & Autonomous Offline Badge
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "TACTICAL EVACUATION NAV",
                    color = primaryColor,
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "100% Offline Sensor Guidance • Zero Cellular Needed",
                    color = Color(0xFF90A4AE),
                    fontSize = 11.sp
                )
            }
            Box(
                modifier = Modifier
                    .background(Color(0xFF004D40), RoundedCornerShape(6.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "OFFLINE HUD ACTIVE",
                    color = Color(0xFF64FFDA),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 2. Active Shelter Destination Card
        selectedShelter?.let { shelter ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, primaryColor.copy(alpha = 0.5f), RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = shelter.name,
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Text(
                                text = "${shelter.type.title} • ${shelter.address}",
                                color = Color(0xFF80CBC4),
                                fontSize = 11.sp
                            )
                        }
                        Box(
                            modifier = Modifier
                                .background(Color(0xFF1B5E20), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "+${shelter.elevationGainMeters}m High Ground",
                                color = Color(0xFFB9F6CA),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 3. Course Deviation Indicator (CDI) Ribbon
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    width = if (isAligned) 2.dp else 1.dp,
                    color = if (isAligned) Color(0xFF00E676) else Color(0xFFFFB300),
                    shape = RoundedCornerShape(12.dp)
                ),
            colors = CardDefaults.cardColors(
                containerColor = if (isAligned) Color(0xFF003314) else Color(0xFF261D00)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp, horizontal = 14.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = guidanceInstruction,
                    color = if (isAligned) Color(0xFF69F0AE) else Color(0xFFFFE082),
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 4. Large Compass Canvas HUD
        Box(
            modifier = Modifier
                .size(280.dp)
                .background(Color(0xFF0B0F14), CircleShape)
                .border(2.dp, Color(0xFF263238), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            TacticalCompassCanvas(
                currentHeadingDegrees = currentHeading,
                targetBearingDegrees = targetBearing,
                isAligned = isAligned,
                modifier = Modifier.fillMaxSize()
            )

            // Center HUD Readout
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .background(Color(0xEE070A0E), RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = distanceDisplay,
                    color = primaryColor,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = if (isAligned) "TARGET LOCKED" else "HDG ${currentHeading.toInt()}°",
                    color = if (isAligned) Color(0xFF00E676) else Color(0xFF90A4AE),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 5. Digital Telemetry HUD Metrics
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
            ) {
                Column(
                    modifier = Modifier.padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("BEARING", color = Color(0xFF78909C), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Text(
                        "${targetBearing.toInt()}°",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(GeoMath.bearingToCardinal(targetBearing), color = Color(0xFF80CBC4), fontSize = 10.sp)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
            ) {
                Column(
                    modifier = Modifier.padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("DEVIATION", color = Color(0xFF78909C), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Text(
                        "${if (relativeDeviation >= 0) "+" else ""}${relativeDeviation.toInt()}°",
                        color = if (isAligned) Color(0xFF00E676) else Color(0xFFFFB300),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(if (isAligned) "ALIGNED" else "STEER", color = Color(0xFF90A4AE), fontSize = 10.sp)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
            ) {
                Column(
                    modifier = Modifier.padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("ELEVATION", color = Color(0xFF78909C), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Text(
                        "+${verticalClimb}m",
                        color = Color(0xFF64FFDA),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace
                    )
                    Text("VERTICAL CLIMB", color = Color(0xFF00B0FF), fontSize = 9.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 6. Hazard Corridor Warning (if lightning intersects path)
        hazardWarning?.let { warning ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFFFF1744), RoundedCornerShape(10.dp)),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2B0B11))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("⚡", fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = warning,
                        color = Color(0xFFFF8A80),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
        }

        // 7. Blind / Zero-Visibility Acoustic Sonar Homing Toggle
        Button(
            onClick = { navigator.toggleAcousticHoming() },
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isHomingActive) Color(0xFFD50000) else Color(0xFF00695C)
            ),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(if (isHomingActive) "🔊 STOP ACOUSTIC HOMING" else "📡 START BLIND ACOUSTIC HOMING", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }
        Text(
            text = "Sonification chirps accelerate to 5 Hz as phone faces shelter bearing. Designed for zero-visibility smoke, night blackouts & torrential rain.",
            color = Color(0xFF78909C),
            fontSize = 10.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // 8. Shelter Quick Switcher
        Text(
            text = "SELECT HIGH-GROUND DESTINATION",
            color = Color(0xFFCFD8DC),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(6.dp))

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(allShelters) { shelter ->
                val isCurrent = (shelter.id == selectedShelter?.id)
                Box(
                    modifier = Modifier
                        .background(
                            if (isCurrent) Color(0xFF004D40) else Color(0xFF131A22),
                            RoundedCornerShape(8.dp)
                        )
                        .border(
                            1.dp,
                            if (isCurrent) Color(0xFF00E676) else Color(0xFF263238),
                            RoundedCornerShape(8.dp)
                        )
                        .clickable {
                            engine.startNavigatingTo(shelter)
                        }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Column {
                        Text(
                            text = shelter.name,
                            color = if (isCurrent) Color(0xFF69F0AE) else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                        Text(
                            text = "${shelter.distanceKm} km • +${shelter.elevationGainMeters}m",
                            color = Color(0xFF90A4AE),
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 9. Manual Steer Simulation (For Testing / Calibration)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF263238), RoundedCornerShape(10.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "🧪 DESKTOP / SENSOR TEST OVERRIDE",
                    color = Color(0xFF80D8FF),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "If hardware magnetometer is stationary or on emulator, tap to test orientation:",
                    color = Color(0xFF78909C),
                    fontSize = 10.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Button(
                        onClick = { sensorManager.setManualHeading(targetBearing.toFloat()) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00C853)),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp)
                    ) {
                        Text("Lock-On", fontSize = 10.sp)
                    }
                    Button(
                        onClick = { sensorManager.setManualHeading(((targetBearing + 35f) % 360f).toFloat()) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000)),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp)
                    ) {
                        Text("+35° Right", fontSize = 10.sp)
                    }
                    Button(
                        onClick = { sensorManager.setManualHeading(((targetBearing + 180f) % 360f).toFloat()) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD50000)),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp)
                    ) {
                        Text("180° Reverse", fontSize = 10.sp)
                    }
                    Button(
                        onClick = { sensorManager.setManualHeading(null) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF455A64)),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 4.dp)
                    ) {
                        Text("Live Gyro", fontSize = 10.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 10. Fallback External Offline Map Intent
        OutlinedButton(
            onClick = {
                selectedShelter?.let { s ->
                    val geoUri = Uri.parse("geo:${s.latitude},${s.longitude}?q=${Uri.encode(s.name)}")
                    val mapIntent = Intent(Intent.ACTION_VIEW, geoUri)
                    context.startActivity(Intent.createChooser(mapIntent, "Open Offline Map App"))
                }
            },
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF80D8FF)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("🗺️ Launch External Offline Map App (OsmAnd / Organic Maps)", fontSize = 11.sp)
        }
    }
}
