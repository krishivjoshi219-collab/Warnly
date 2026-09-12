package com.example.warnly.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.theme.*
import kotlin.math.*

/**
 * Tactical Aviation Evacuation Compass & CDI (Course Deviation Indicator)
 * Precision aerospace dial driven by device magnetometer & gyro sensors.
 */
@Composable
fun TacticalCompassCanvas(
    currentHeadingDegrees: Float,
    targetBearingDegrees: Double,
    isAligned: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "compassGlow")
    val lockAlpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "lockAlpha"
    )

    val dialColor = if (isAligned) CyberEmerald else NeonCyan
    val needleColor = if (isAligned) CyberEmerald else HazardAmber

    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(10.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val radius = min(size.width, size.height) / 2f - 20f
            if (radius <= 0) return@Canvas

            // 1. Compass Instrument Cavity
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF04121C),
                        Color(0xFF02070E),
                        VoidBlack
                    ),
                    center = center,
                    radius = radius + 15f
                ),
                radius = radius + 6f,
                center = center
            )

            // Outer Instrument Bezel
            drawCircle(
                color = if (isAligned) CyberEmerald.copy(alpha = lockAlpha) else BorderBright.copy(alpha = 0.4f),
                radius = radius,
                center = center,
                style = Stroke(width = if (isAligned) 3f else 1.5f)
            )

            // Concentric Gauge Rings
            drawCircle(
                color = BorderGlass.copy(alpha = 0.5f),
                radius = radius * 0.72f,
                center = center,
                style = Stroke(width = 1f)
            )
            drawCircle(
                color = BorderGlass.copy(alpha = 0.3f),
                radius = radius * 0.42f,
                center = center,
                style = Stroke(width = 1f)
            )

            // 2. Rotating Ticks & Cardinal Dial
            val rotationOffsetRad = Math.toRadians(-currentHeadingDegrees.toDouble())

            for (deg in 0 until 360 step 10) {
                val angleRad = Math.toRadians(deg.toDouble()) + rotationOffsetRad - (PI / 2.0)
                val isMajor = (deg % 90 == 0)
                val isSemi = (deg % 30 == 0)
                val tickLen = when {
                    isMajor -> 20f
                    isSemi -> 13f
                    else -> 7f
                }

                val startX = (center.x + (radius - tickLen) * cos(angleRad)).toFloat()
                val startY = (center.y + (radius - tickLen) * sin(angleRad)).toFloat()
                val endX = (center.x + radius * cos(angleRad)).toFloat()
                val endY = (center.y + radius * sin(angleRad)).toFloat()

                val tickColor = when {
                    deg == 0 -> CriticalCrimson
                    isMajor -> TextPrimary
                    else -> BorderGlass
                }

                drawLine(
                    color = tickColor,
                    start = Offset(startX, startY),
                    end = Offset(endX, endY),
                    strokeWidth = if (isMajor) 2.5f else 1.2f
                )

                // Draw Cardinal Text (N, E, S, W)
                if (isMajor) {
                    val textRadius = radius - 34f
                    val textX = (center.x + textRadius * cos(angleRad)).toFloat()
                    val textY = (center.y + textRadius * sin(angleRad)).toFloat()

                    val label = when (deg) {
                        0 -> "N"
                        90 -> "E"
                        180 -> "S"
                        270 -> "W"
                        else -> ""
                    }

                    drawContext.canvas.nativeCanvas.apply {
                        val paint = android.graphics.Paint().apply {
                            color = if (deg == 0) 0xFFFF1744.toInt() else 0xFFF1F5F9.toInt()
                            textSize = 28f
                            isFakeBoldText = true
                            textAlign = android.graphics.Paint.Align.CENTER
                        }
                        drawText(label, textX, textY + 10f, paint)
                    }
                }
            }

            // 3. Target Waypoint Bug (Points toward shelter bearing)
            val targetRad = Math.toRadians(targetBearingDegrees - currentHeadingDegrees - 90.0)
            val bugDist = radius * 0.88f
            val bx = (center.x + bugDist * cos(targetRad)).toFloat()
            val by = (center.y + bugDist * sin(targetRad)).toFloat()

            // Waypoint Triangle Bug
            val bugPath = Path().apply {
                val headX = (center.x + (radius - 2f) * cos(targetRad)).toFloat()
                val headY = (center.y + (radius - 2f) * sin(targetRad)).toFloat()
                val leftRad = targetRad + 0.18
                val rightRad = targetRad - 0.18
                val baseRadius = radius - 24f
                val lx = (center.x + baseRadius * cos(leftRad)).toFloat()
                val ly = (center.y + baseRadius * sin(leftRad)).toFloat()
                val rx = (center.x + baseRadius * cos(rightRad)).toFloat()
                val ry = (center.y + baseRadius * sin(rightRad)).toFloat()

                moveTo(headX, headY)
                lineTo(lx, ly)
                lineTo(rx, ry)
                close()
            }
            drawPath(path = bugPath, color = needleColor.copy(alpha = 0.4f))
            drawPath(path = bugPath, color = needleColor, style = Stroke(width = 2f))

            // Vector line connecting center to target waypoint bug
            drawLine(
                color = needleColor.copy(alpha = if (isAligned) 0.8f else 0.45f),
                start = center,
                end = Offset(bx, by),
                strokeWidth = if (isAligned) 2.5f else 1.5f,
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 6f))
            )

            // 4. Center Aircraft / Heading Reticle
            val shipLength = 22f
            val shipWidth = 14f
            val shipPath = Path().apply {
                moveTo(center.x, center.y - shipLength)
                lineTo(center.x + shipWidth, center.y + shipLength * 0.5f)
                lineTo(center.x, center.y + shipLength * 0.2f)
                lineTo(center.x - shipWidth, center.y + shipLength * 0.5f)
                close()
            }
            drawPath(path = shipPath, color = if (isAligned) CyberEmerald else NeonCyan)

            // Fixed Top Heading Index Lubber Line (12 O'clock)
            val lubberPath = Path().apply {
                moveTo(center.x, center.y - radius + 2f)
                lineTo(center.x - 9f, center.y - radius - 16f)
                lineTo(center.x + 9f, center.y - radius - 16f)
                close()
            }
            drawPath(path = lubberPath, color = NeonCyan)
        }

        // Tactical HUD Telemetry Overlay
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                TacticalBadge(
                    text = "HDG: ${currentHeadingDegrees.toInt()}° TRUE",
                    accentColor = NeonCyan
                )
                TacticalBadge(
                    text = if (isAligned) "TARGET LOCKED" else "STEER TO: ${targetBearingDegrees.toInt()}°",
                    accentColor = if (isAligned) CyberEmerald else HazardAmber
                )
            }

            if (isAligned) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    TacticalBadge(
                        text = ">>> ON VECTOR TO HIGH GROUND <<<",
                        accentColor = CyberEmerald
                    )
                }
            } else {
                Spacer(modifier = Modifier.height(1.dp))
            }
        }
    }
}
