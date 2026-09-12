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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AlertLevel
import com.example.warnly.model.LightningStrike
import com.example.warnly.model.Shelter
import com.example.warnly.theme.*
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * FR-01: High-Definition Tactical Geodesic Radar Canvas
 * Military-grade circular phosphor radar with 10 km / 15 km geodesic safety rings,
 * rotating phosphor sweep beam, acoustic shockwave ripples, and shelter waypoints.
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
    val infiniteTransition = rememberInfiniteTransition(label = "radarSweep")

    // Continuous 360-degree radar beam sweep
    val sweepAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(3500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "sweepAngle"
    )

    // Acoustic shockwave pulse for strikes
    val acousticPulse by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "acousticPulse"
    )

    // Critical ring alert breathing
    val dangerPulse by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dangerPulse"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .padding(6.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val maxRadius = min(size.width, size.height) * 0.44f
            if (maxRadius <= 0) return@Canvas

            // Scale: 16.0 km = maxRadius
            val kmToPx = maxRadius / 16.0f
            val r5km = 5.0f * kmToPx
            val r10km = 10.0f * kmToPx
            val r15km = 15.0f * kmToPx

            // 1. Radar Screen Dark Phosphor Cavity
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF04121A),
                        Color(0xFF02070D),
                        VoidBlack
                    ),
                    center = center,
                    radius = maxRadius + 16f
                ),
                radius = maxRadius + 10f,
                center = center
            )

            // Outer Scope Bezel
            drawCircle(
                color = BorderBright.copy(alpha = 0.4f),
                radius = maxRadius,
                center = center,
                style = Stroke(width = 1.5f)
            )

            // 2. Concentric Distance Range Rings
            // 5 km Ring (Dashed Cyan)
            drawCircle(
                color = NeonCyan.copy(alpha = 0.25f),
                radius = r5km,
                center = center,
                style = Stroke(
                    width = 1f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f))
                )
            )

            // 15 km Advisory Ring (Amber / Yellow Warning)
            val advisoryAlpha = if (alertLevel == AlertLevel.ADVISORY) dangerPulse else 0.4f
            drawCircle(
                color = HazardAmber.copy(alpha = advisoryAlpha),
                radius = r15km,
                center = center,
                style = Stroke(
                    width = if (alertLevel == AlertLevel.ADVISORY) 2.5f else 1.2f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f))
                )
            )

            // 10 km Critical Danger Ring (Crimson / Thunder 30s Boundary)
            val isCritical = alertLevel == AlertLevel.DANGER
            val dangerAlpha = if (isCritical) dangerPulse else 0.35f
            val dangerStroke = if (isCritical) 3.5f else 1.8f
            // Glow halo for danger ring
            if (isCritical) {
                drawCircle(
                    color = CriticalCrimson.copy(alpha = dangerAlpha * 0.25f),
                    radius = r10km,
                    center = center,
                    style = Stroke(width = 12f)
                )
            }
            drawCircle(
                color = CriticalCrimson.copy(alpha = dangerAlpha),
                radius = r10km,
                center = center,
                style = Stroke(width = dangerStroke)
            )

            // 3. Radial Crosshairs & 30-deg Spokes
            for (angleDeg in 0 until 360 step 45) {
                val rad = Math.toRadians(angleDeg.toDouble())
                val startX = (center.x + 12f * cos(rad)).toFloat()
                val startY = (center.y + 12f * sin(rad)).toFloat()
                val endX = (center.x + maxRadius * cos(rad)).toFloat()
                val endY = (center.y + maxRadius * sin(rad)).toFloat()

                drawLine(
                    color = BorderGlass.copy(alpha = 0.5f),
                    start = Offset(startX, startY),
                    end = Offset(endX, endY),
                    strokeWidth = 1f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 8f))
                )
            }

            // 4. Rotating Phosphor Sweep Cone (Shader Brush)
            rotate(degrees = sweepAngle, pivot = center) {
                val sweepPath = Path().apply {
                    moveTo(center.x, center.y)
                    arcTo(
                        rect = androidx.compose.ui.geometry.Rect(
                            center.x - maxRadius,
                            center.y - maxRadius,
                            center.x + maxRadius,
                            center.y + maxRadius
                        ),
                        startAngleDegrees = -35f,
                        sweepAngleDegrees = 35f,
                        forceMoveTo = false
                    )
                    close()
                }

                drawPath(
                    path = sweepPath,
                    brush = Brush.radialGradient(
                        colors = listOf(
                            NeonCyan.copy(alpha = 0.22f),
                            NeonCyan.copy(alpha = 0.05f),
                            Color.Transparent
                        ),
                        center = center,
                        radius = maxRadius
                    )
                )

                // High-visibility beam leading edge
                drawLine(
                    color = NeonCyan.copy(alpha = 0.85f),
                    start = center,
                    end = Offset(center.x + maxRadius, center.y),
                    strokeWidth = 2f
                )
            }

            // 5. Storm Motion Vector Arrow
            if (stormSpeedKmh > 0) {
                val stormRad = Math.toRadians(stormBearingDegrees - 90.0)
                val stormLength = (stormSpeedKmh.toFloat() * 1.5f).coerceIn(20f, maxRadius * 0.7f)
                val stormEnd = Offset(
                    (center.x + stormLength * cos(stormRad)).toFloat(),
                    (center.y + stormLength * sin(stormRad)).toFloat()
                )

                drawLine(
                    color = HazardAmber.copy(alpha = 0.8f),
                    start = center,
                    end = stormEnd,
                    strokeWidth = 2f
                )
                // Arrowhead
                val arrowSize = 10f
                val headAngle1 = stormRad + PI * 0.85
                val headAngle2 = stormRad - PI * 0.85
                drawLine(
                    color = HazardAmber,
                    start = stormEnd,
                    end = Offset(
                        (stormEnd.x + arrowSize * cos(headAngle1)).toFloat(),
                        (stormEnd.y + arrowSize * sin(headAngle1)).toFloat()
                    ),
                    strokeWidth = 2f
                )
                drawLine(
                    color = HazardAmber,
                    start = stormEnd,
                    end = Offset(
                        (stormEnd.x + arrowSize * cos(headAngle2)).toFloat(),
                        (stormEnd.y + arrowSize * sin(headAngle2)).toFloat()
                    ),
                    strokeWidth = 2f
                )
            }

            // 6. Shelters Plotting (Emerald Diamonds)
            shelters.forEach { shelter ->
                val distKm = shelter.distanceKm.toFloat()
                if (distKm <= 16.0f) {
                    val sRadius = distKm * kmToPx
                    val sRad = Math.toRadians(shelter.bearingDegrees - 90.0)
                    val sx = (center.x + sRadius * cos(sRad)).toFloat()
                    val sy = (center.y + sRadius * sin(sRad)).toFloat()

                    // Diamond icon
                    val diamondSize = 6f
                    val diamondPath = Path().apply {
                        moveTo(sx, sy - diamondSize)
                        lineTo(sx + diamondSize, sy)
                        lineTo(sx, sy + diamondSize)
                        lineTo(sx - diamondSize, sy)
                        close()
                    }
                    drawPath(path = diamondPath, color = CyberEmerald.copy(alpha = 0.35f))
                    drawPath(path = diamondPath, color = CyberEmerald, style = Stroke(width = 1.5f))

                    // Small center dot
                    drawCircle(color = CyberEmerald, radius = 2f, center = Offset(sx, sy))
                }
            }

            // 7. Lightning Strikes Plotting with Acoustic Wave Shockwaves
            strikes.forEach { strike ->
                val distKm = strike.distanceKm.toFloat()
                if (distKm <= 16.0f) {
                    val strikeRadius = distKm * kmToPx
                    val strikeRad = Math.toRadians(strike.bearingDegrees - 90.0)
                    val px = (center.x + strikeRadius * cos(strikeRad)).toFloat()
                    val py = (center.y + strikeRadius * sin(strikeRad)).toFloat()

                    // Expanding acoustic shockwave ripple (thunder sound expanding at 343 m/s)
                    val rippleRadius = (acousticPulse * 28f).coerceAtLeast(4f)
                    drawCircle(
                        color = CriticalCrimson.copy(alpha = (1f - acousticPulse) * 0.6f),
                        radius = rippleRadius,
                        center = Offset(px, py),
                        style = Stroke(width = 1.5f)
                    )

                    // Strike pip (Bright Yellow/Crimson Core)
                    drawCircle(
                        color = Color(0xFFFFD600),
                        radius = 4.5f,
                        center = Offset(px, py)
                    )
                    drawCircle(
                        color = CriticalCrimson,
                        radius = 7.5f,
                        center = Offset(px, py),
                        style = Stroke(width = 1.5f)
                    )
                }
            }

            // 8. User Observer Center Reticle
            drawCircle(
                color = NeonCyan.copy(alpha = 0.25f),
                radius = 14f,
                center = center
            )
            drawCircle(
                color = NeonCyan,
                radius = 5f,
                center = center
            )
            drawCircle(
                color = Color.White,
                radius = 2f,
                center = center
            )
        }

        // Tactical Corner Metadata Overlays
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "RADAR // 16 KM SCOPE",
                    color = NeonCyan.copy(alpha = 0.7f),
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (strikes.isEmpty()) "NO ACTIVE ECHOES" else "${strikes.size} DETECTIONS",
                    color = if (strikes.isEmpty()) CyberEmerald else CriticalCrimson,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "RED: 10KM DANGER (THUNDER 30s)",
                    color = CriticalCrimson.copy(alpha = 0.8f),
                    fontSize = 8.sp,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "AMBER: 15KM ADV",
                    color = HazardAmber.copy(alpha = 0.8f),
                    fontSize = 8.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}
