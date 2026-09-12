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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.theme.*
import kotlin.math.cos
import kotlin.math.sin

/**
 * Offline Vector Topographic Contours & Flood Inundation Canvas
 * Visualizes terrain elevation gradients, flood hazard wash corridors,
 * and high-ground vertical evacuation ridge sanctuaries completely offline.
 */
@Composable
fun TopographicContourCanvas(
    userElevationMeters: Int,
    targetShelterElevationMeters: Int,
    targetBearingDegrees: Double,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "topoWater")
    val waterPhase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "waterPhase"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(220.dp)
            .padding(4.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // 1. Terrain Gradient Canvas
            drawRect(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF07111C),
                        Color(0xFF040A10),
                        VoidBlack
                    )
                )
            )

            // Outer Hairline Border
            drawRect(
                color = BorderGlass,
                style = Stroke(width = 1f)
            )

            // 2. Low-Lying River Basin / Flood Corridor Inundation Zone
            val floodPath = Path().apply {
                moveTo(0f, h * 0.72f)
                val waveOffset1 = sin(waterPhase) * 6f
                val waveOffset2 = cos(waterPhase) * 6f

                cubicTo(
                    w * 0.25f, h * 0.66f + waveOffset1,
                    w * 0.65f, h * 0.82f + waveOffset2,
                    w, h * 0.70f
                )
                lineTo(w, h)
                lineTo(0f, h)
                close()
            }

            // Hazard Flood Wash Fill
            drawPath(
                path = floodPath,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        CriticalCrimson.copy(alpha = 0.25f),
                        CriticalCrimson.copy(alpha = 0.5f)
                    ),
                    startY = h * 0.7f,
                    endY = h
                )
            )
            drawPath(
                path = floodPath,
                color = CriticalCrimson.copy(alpha = 0.85f),
                style = Stroke(width = 2f)
            )

            // 3. Topographic Elevation Contour Lines
            // +10m Base Contour
            drawContourSpline(w, h, 0.62f, 16f, Color(0xFF2E3E50), 1.2f)
            // +25m Lowland Contour
            drawContourSpline(w, h, 0.48f, 22f, Color(0xFF3B526B), 1.2f)
            // +50m Inundation Crest (Safe Threshold)
            drawContourSpline(w, h, 0.35f, 18f, HazardAmber.copy(alpha = 0.65f), 1.8f)
            // +75m Mountain Ridge Sanctuary
            drawContourSpline(w, h, 0.22f, 14f, CyberEmerald.copy(alpha = 0.7f), 2f)
            // +100m High Alpine Peak
            drawContourSpline(w, h, 0.10f, 10f, HighGroundTeal.copy(alpha = 0.6f), 1.5f)

            // 4. User Current Position (Valley Ground)
            val userX = w * 0.32f
            val userY = h * 0.68f

            drawCircle(color = NeonCyan.copy(alpha = 0.25f), radius = 16f, center = Offset(userX, userY))
            drawCircle(color = NeonCyan, radius = 5f, center = Offset(userX, userY))
            drawCircle(color = Color.White, radius = 2f, center = Offset(userX, userY))

            // 5. Target High-Ground Sanctuary (+Elevation Gain)
            val targetX = w * 0.78f
            val targetY = h * 0.22f

            drawCircle(color = CyberEmerald.copy(alpha = 0.25f), radius = 20f, center = Offset(targetX, targetY))
            drawCircle(color = CyberEmerald, radius = 6.5f, center = Offset(targetX, targetY))

            // 6. Evacuation Ascent Ridge Line (Neon Green Gradient)
            drawLine(
                brush = Brush.linearGradient(
                    colors = listOf(NeonCyan, CyberEmerald),
                    start = Offset(userX, userY),
                    end = Offset(targetX, targetY)
                ),
                start = Offset(userX, userY),
                end = Offset(targetX, targetY),
                strokeWidth = 2.5f,
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 6f))
            )
        }

        // Overlay Labels
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                TacticalBadge(text = "+100M HIGH RIDGE SANCTUARY", accentColor = CyberEmerald)
                TacticalBadge(text = "CONTOURS // OFFLINE", accentColor = NeonCyan)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "VALLEY WASH (INUNDATION DANGER)",
                    color = CriticalCrimson,
                    fontSize = 8.sp,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "ASCENT VECTOR: +${targetShelterElevationMeters}M",
                    color = HighGroundTeal,
                    fontSize = 8.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

private fun DrawScope.drawContourSpline(
    w: Float,
    h: Float,
    yRatio: Float,
    waveAmp: Float,
    color: Color,
    strokeWidth: Float
) {
    val path = Path().apply {
        moveTo(0f, h * yRatio)
        cubicTo(
            w * 0.28f, h * yRatio - waveAmp,
            w * 0.68f, h * yRatio + waveAmp,
            w, h * yRatio - (waveAmp * 0.4f)
        )
    }
    drawPath(path = path, color = color, style = Stroke(width = strokeWidth))
}
