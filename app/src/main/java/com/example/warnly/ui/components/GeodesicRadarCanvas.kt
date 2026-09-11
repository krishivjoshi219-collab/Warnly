package com.example.warnly.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AlertLevel
import com.example.warnly.model.LightningStrike
import com.example.warnly.model.Shelter
import com.example.warnly.physics.GeoMath
import kotlin.math.cos
import kotlin.math.sin

/**
 * FR-01: Precision Geodesic Safety Rings Radar
 * Renders concentric 10 km (Critical Danger) and 15 km (Advisory) rings,
 * user location, age-coded strike vectors, and shelters.
 */
@Composable
fun GeodesicRadarCanvas(
    alertLevel: AlertLevel,
    strikes: List<LightningStrike>,
    shelters: List<Shelter>,
    stormSpeedKmh: Double,
    stormBearingDegrees: Double,
    modifier: Modifier = Modifier
) {
    // Pulse animation for critical ring and sweep beam
    val infiniteTransition = rememberInfiniteTransition(label = "radarPulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    val sweepAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing)
        ),
        label = "sweepAngle"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val maxRadius = size.width * 0.44f

            // Scale: 16 km corresponds to maxRadius
            val kmToPx = maxRadius / 16.0f

            // Radar background grid circles
            val r5km = 5.0f * kmToPx
            val r10km = 10.0f * kmToPx
            val r15km = 15.0f * kmToPx

            // Deep background
            drawCircle(
                color = Color(0xFF090D12),
                radius = maxRadius + 12f,
                center = center
            )

            // Radar radial crosshairs
            drawLine(
                color = Color(0xFF1E2D3D),
                start = Offset(center.x - maxRadius, center.y),
                end = Offset(center.x + maxRadius, center.y),
                strokeWidth = 1.5f
            )
            drawLine(
                color = Color(0xFF1E2D3D),
                start = Offset(center.x, center.y - maxRadius),
                end = Offset(center.x, center.y + maxRadius),
                strokeWidth = 1.5f
            )

            // Sweep beam
            val sweepRad = Math.toRadians(sweepAngle.toDouble())
            val sweepEnd = Offset(
                (center.x + maxRadius * cos(sweepRad)).toFloat(),
                (center.y + maxRadius * sin(sweepRad)).toFloat()
            )
            drawLine(
                color = Color(0x3300E5FF),
                start = center,
                end = sweepEnd,
                strokeWidth = 2f
            )

            // 5 km Inner Proximity Ring (Sub-danger)
            drawCircle(
                color = Color(0xFF1B3A4B),
                radius = r5km,
                center = center,
                style = Stroke(width = 1.5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f)))
            )

            // 10 km Critical Danger Ring (FR-01: Thunder 30-sec travel boundary)
            val dangerColor = if (alertLevel == AlertLevel.DANGER) {
                Color(0xFFFF1744).copy(alpha = pulseAlpha)
            } else {
                Color(0xFFD50000).copy(alpha = 0.5f)
            }
            drawCircle(
                color = dangerColor,
                radius = r10km,
                center = center,
                style = Stroke(width = if (alertLevel == AlertLevel.DANGER) 4f else 2.5f)
            )

            // 15 km Advisory Ring (FR-01)
            val advisoryColor = if (alertLevel == AlertLevel.ADVISORY) {
                Color(0xFFFFB300).copy(alpha = pulseAlpha)
            } else {
                Color(0xFFFFB300).copy(alpha = 0.5f)
            }
            drawCircle(
                color = advisoryColor,
                radius = r15km,
                center = center,
                style = Stroke(width = 2f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f)))
            )

            // Plot Shelters on Radar
            shelters.forEach { shelter ->
                if (shelter.distanceKm <= 16.0) {
                    val sRadius = (shelter.distanceKm * kmToPx).toFloat()
                    val sRad = Math.toRadians(shelter.bearingDegrees - 90.0) // 0 deg is North
                    val sX = center.x + sRadius * cos(sRad).toFloat()
                    val sY = center.y + sRadius * sin(sRad).toFloat()

                    // Shelter green square dot
                    drawRect(
                        color = Color(0xFF00E676),
                        topLeft = Offset(sX - 5f, sY - 5f),
                        size = androidx.compose.ui.geometry.Size(10f, 10f)
                    )
                }
            }

            // Plot Lightning Strikes (Age-Coded)
            val now = System.currentTimeMillis()
            strikes.forEachIndexed { index, strike ->
                if (strike.distanceKm <= 16.0) {
                    val strikeRadius = (strike.distanceKm * kmToPx).toFloat()
                    val strikeRad = Math.toRadians(strike.bearingDegrees - 90.0)
                    val x = center.x + strikeRadius * cos(strikeRad).toFloat()
                    val y = center.y + strikeRadius * sin(strikeRad).toFloat()

                    val ageMinutes = ((now - strike.timestamp) / 60000).coerceAtLeast(0)

                    // Color Coding based on age
                    val strikeColor = when {
                        ageMinutes < 2 -> Color(0xFF00FFFF) // Fresh <2 min: Bright Cyan
                        ageMinutes < 10 -> Color(0xFFFFEB3B) // 2-10 min: Yellow
                        else -> Color(0xFFFF5252)           // >10 min: Red
                    }

                    // Fresh strike glow ring
                    if (ageMinutes < 2) {
                        drawCircle(
                            color = strikeColor.copy(alpha = 0.4f),
                            radius = 14f,
                            center = Offset(x, y)
                        )
                    }

                    // Strike core marker
                    drawCircle(
                        color = strikeColor,
                        radius = 6f,
                        center = Offset(x, y)
                    )

                    // Vector line from center to nearest strike
                    if (index == 0) {
                        drawLine(
                            color = Color(0x66FF1744),
                            start = center,
                            end = Offset(x, y),
                            strokeWidth = 2f,
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f))
                        )
                    }
                }
            }

            // User GPS Location (Center)
            drawCircle(
                color = Color(0xFF00E5FF).copy(alpha = 0.3f),
                radius = 18f,
                center = center
            )
            drawCircle(
                color = Color(0xFF00E5FF),
                radius = 7f,
                center = center
            )
            drawCircle(
                color = Color.White,
                radius = 3f,
                center = center
            )

            // Storm Vector Arrow
            if (stormSpeedKmh > 5.0) {
                val stormRad = Math.toRadians(stormBearingDegrees - 90.0)
                val arrowLen = (stormSpeedKmh * 1.2).coerceIn(20.0, 60.0).toFloat()
                val arrowStart = Offset(
                    (center.x + r10km * 0.7f * cos(stormRad)).toFloat(),
                    (center.y + r10km * 0.7f * sin(stormRad)).toFloat()
                )
                val arrowEnd = Offset(
                    (arrowStart.x + arrowLen * cos(stormRad)).toFloat(),
                    (arrowStart.y + arrowLen * sin(stormRad)).toFloat()
                )
                drawLine(
                    color = Color(0xFFFFD600),
                    start = arrowStart,
                    end = arrowEnd,
                    strokeWidth = 3f
                )
            }
        }

        // Radar Overlay Labels
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "N (0°)", color = Color(0xFF78909C), fontSize = 11.sp, fontWeight = FontWeight.Bold)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "W (270°)", color = Color(0xFF78909C), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text(text = "E (90°)", color = Color(0xFF78909C), fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }

            Text(text = "S (180°)", color = Color(0xFF78909C), fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }

        // Distance Ring Badges
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(12.dp)
                .background(Color(0xCC111720), androidx.compose.foundation.shape.RoundedCornerShape(6.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Column(horizontalAlignment = Alignment.End) {
                Text(text = "15km Advisory Ring", color = Color(0xFFFFB300), fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                Text(text = "10km Danger Ring", color = Color(0xFFFF1744), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text(text = "■ Shelter Haven", color = Color(0xFF00E676), fontSize = 10.sp)
            }
        }
    }
}
