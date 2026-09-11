package com.example.warnly.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import kotlin.math.*

/**
 * Tactical Disaster Evacuation Compass HUD Canvas
 * Renders an offline aviation/tactical compass rose with:
 *  - Rotating dial driven by device magnetometer/azimuth
 *  - High-visibility Waypoint Pointer oriented towards safe shelter bearing
 *  - Dynamic lock-on glow when aligned (±8°)
 *  - Cardinal direction markings (N, NE, E, SE, S, SW, W, NW)
 */
@Composable
fun TacticalCompassCanvas(
    currentHeadingDegrees: Float,
    targetBearingDegrees: Double,
    isAligned: Boolean,
    modifier: Modifier = Modifier
) {
    val alignedGlowColor = Color(0xFF00E676)   // Emerald Target Lock
    val standardDialColor = Color(0xFF37474F)  // Gunmetal slate
    val targetNeedleColor = if (isAligned) Color(0xFF00E676) else Color(0xFFFFD600) // Golden Amber or Neon Green
    val northColor = Color(0xFFFF1744)         // Crimson North

    Canvas(modifier = modifier.fillMaxSize()) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val radius = min(size.width, size.height) / 2f - 24f
        if (radius <= 0) return@Canvas

        // 1. Compass Background Dial Circles
        drawCircle(
            color = Color(0xFF0D131A),
            radius = radius,
            center = center
        )
        drawCircle(
            color = if (isAligned) alignedGlowColor.copy(alpha = 0.4f) else standardDialColor,
            radius = radius,
            center = center,
            style = Stroke(width = if (isAligned) 3f else 1.5f)
        )
        drawCircle(
            color = standardDialColor.copy(alpha = 0.5f),
            radius = radius * 0.75f,
            center = center,
            style = Stroke(width = 1f)
        )
        drawCircle(
            color = standardDialColor.copy(alpha = 0.3f),
            radius = radius * 0.45f,
            center = center,
            style = Stroke(width = 1f)
        )

        // Center Crosshair
        drawLine(
            color = standardDialColor.copy(alpha = 0.7f),
            start = Offset(center.x - 20f, center.y),
            end = Offset(center.x + 20f, center.y),
            strokeWidth = 1.5f
        )
        drawLine(
            color = standardDialColor.copy(alpha = 0.7f),
            start = Offset(center.x, center.y - 20f),
            end = Offset(center.x, center.y + 20f),
            strokeWidth = 1.5f
        )

        // 2. Rotating Ticks & Cardinal Directions (Rotates with -currentHeading)
        val rotationOffsetRad = Math.toRadians(-currentHeadingDegrees.toDouble())

        for (deg in 0 until 360 step 15) {
            val angleRad = Math.toRadians(deg.toDouble()) + rotationOffsetRad - (PI / 2.0)
            val isMajor = (deg % 90 == 0)
            val isSemi = (deg % 45 == 0)
            val tickLen = when {
                isMajor -> 22f
                isSemi -> 14f
                else -> 8f
            }

            val startX = (center.x + (radius - tickLen) * cos(angleRad)).toFloat()
            val startY = (center.y + (radius - tickLen) * sin(angleRad)).toFloat()
            val endX = (center.x + radius * cos(angleRad)).toFloat()
            val endY = (center.y + radius * sin(angleRad)).toFloat()

            val tickColor = when {
                deg == 0 -> northColor
                isMajor -> Color(0xFFB0BEC5)
                else -> Color(0xFF546E7A)
            }

            drawLine(
                color = tickColor,
                start = Offset(startX, startY),
                end = Offset(endX, endY),
                strokeWidth = if (isMajor) 2.5f else 1.2f
            )

            // Draw Cardinal Text (N, E, S, W)
            if (isMajor || isSemi) {
                val textRadius = radius - 38f
                val textX = (center.x + textRadius * cos(angleRad)).toFloat()
                val textY = (center.y + textRadius * sin(angleRad)).toFloat()

                val label = when (deg) {
                    0 -> "N"
                    45 -> "NE"
                    90 -> "E"
                    135 -> "SE"
                    180 -> "S"
                    225 -> "SW"
                    270 -> "W"
                    315 -> "NW"
                    else -> ""
                }

                drawContext.canvas.nativeCanvas.apply {
                    val paint = android.graphics.Paint().apply {
                        color = if (deg == 0) 0xFFFF1744.toInt() else 0xFFCFD8DC.toInt()
                        textSize = if (isMajor) 28f else 18f
                        isFakeBoldText = true
                        textAlign = android.graphics.Paint.Align.CENTER
                    }
                    drawText(label, textX, textY + 10f, paint)
                }
            }
        }

        // 3. Fixed Device Top Index Pointer (Phone Orientation)
        val fixedIndexY = center.y - radius - 8f
        val indexTriangle = Path().apply {
            moveTo(center.x, fixedIndexY)
            lineTo(center.x - 10f, fixedIndexY - 14f)
            lineTo(center.x + 10f, fixedIndexY - 14f)
            close()
        }
        drawPath(
            path = indexTriangle,
            color = if (isAligned) alignedGlowColor else Color.White
        )

        // 4. Target Waypoint Vector Pointer (Points to Shelter Bearing)
        val targetRelativeAngleDeg = targetBearingDegrees - currentHeadingDegrees
        val targetAngleRad = Math.toRadians(targetRelativeAngleDeg) - (PI / 2.0)

        val arrowHeadRadius = radius * 0.88f
        val arrowTipX = (center.x + arrowHeadRadius * cos(targetAngleRad)).toFloat()
        val arrowTipY = (center.y + arrowHeadRadius * sin(targetAngleRad)).toFloat()

        // Waypoint Arrowhead
        val arrowBaseRadius = radius * 0.72f
        val leftAngleRad = targetAngleRad - 0.14
        val rightAngleRad = targetAngleRad + 0.14

        val arrowLeftX = (center.x + arrowBaseRadius * cos(leftAngleRad)).toFloat()
        val arrowLeftY = (center.y + arrowBaseRadius * sin(leftAngleRad)).toFloat()
        val arrowRightX = (center.x + arrowBaseRadius * cos(rightAngleRad)).toFloat()
        val arrowRightY = (center.y + arrowBaseRadius * sin(rightAngleRad)).toFloat()

        val arrowPath = Path().apply {
            moveTo(arrowTipX, arrowTipY)
            lineTo(arrowLeftX, arrowLeftY)
            lineTo(center.x, center.y)
            lineTo(arrowRightX, arrowRightY)
            close()
        }

        // Glow ring if aligned
        if (isAligned) {
            drawCircle(
                color = alignedGlowColor.copy(alpha = 0.25f),
                radius = 32f,
                center = Offset(arrowTipX, arrowTipY)
            )
        }

        drawPath(
            path = arrowPath,
            color = targetNeedleColor.copy(alpha = 0.85f)
        )
        drawPath(
            path = arrowPath,
            color = targetNeedleColor,
            style = Stroke(width = 2f)
        )

        // Center Waypoint Dot
        drawCircle(
            color = targetNeedleColor,
            radius = 6f,
            center = center
        )
    }
}
