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
import kotlin.math.cos
import kotlin.math.sin

/**
 * Offline Vector Topographic Contours & River Basin Canvas
 * Visualizes local terrain elevation profiles and flood inundation corridors completely offline.
 *  - Topographic isolines (+10m, +25m, +50m, +75m, +100m)
 *  - Red/Amber hazard corridors marking low-lying river washes
 *  - Green sanctuary ridges for vertical evacuation
 */
@Composable
fun TopographicContourCanvas(
    userElevationMeters: Int,
    targetShelterElevationMeters: Int,
    targetBearingDegrees: Double,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        // 1. Terrain Base Background
        drawRect(color = Color(0xFF0A1017))

        // 2. Low-Lying River Channel / Flood Wash Corridor (Danger Zone)
        val floodPath = Path().apply {
            moveTo(0f, h * 0.72f)
            cubicTo(
                w * 0.3f, h * 0.65f,
                w * 0.6f, h * 0.85f,
                w, h * 0.70f
            )
            lineTo(w, h)
            lineTo(0f, h)
            close()
        }
        drawPath(
            path = floodPath,
            color = Color(0x33D50000) // Deep translucent crimson danger wash
        )
        drawPath(
            path = floodPath,
            color = Color(0xFFFF1744),
            style = Stroke(width = 2f)
        )

        // 3. Topographic Elevation Contour Lines
        // +10m Contour
        drawContourSpline(
            w = w,
            h = h,
            yRatio = 0.62f,
            waveAmp = 18f,
            color = Color(0xFF37474F),
            strokeWidth = 1.5f
        )
        // +25m Contour
        drawContourSpline(
            w = w,
            h = h,
            yRatio = 0.48f,
            waveAmp = 26f,
            color = Color(0xFF455A64),
            strokeWidth = 1.5f
        )
        // +50m Contour (Flood Crest Boundary)
        drawContourSpline(
            w = w,
            h = h,
            yRatio = 0.34f,
            waveAmp = 20f,
            color = Color(0xFF00E676).copy(alpha = 0.6f),
            strokeWidth = 2f
        )
        // +75m Contour (High Ridge Sanctuary)
        drawContourSpline(
            w = w,
            h = h,
            yRatio = 0.20f,
            waveAmp = 15f,
            color = Color(0xFF64FFDA).copy(alpha = 0.5f),
            strokeWidth = 1.5f
        )
        // +100m Alpine Crest
        drawContourSpline(
            w = w,
            h = h,
            yRatio = 0.08f,
            waveAmp = 10f,
            color = Color(0xFF80D8FF).copy(alpha = 0.4f),
            strokeWidth = 1.2f
        )

        // 4. User Current Position (Low ground)
        val userX = w * 0.45f
        val userY = h * 0.68f
        drawCircle(
            color = Color(0xFF00E5FF).copy(alpha = 0.3f),
            radius = 16f,
            center = Offset(userX, userY)
        )
        drawCircle(
            color = Color(0xFF00E5FF),
            radius = 6f,
            center = Offset(userX, userY)
        )

        // 5. Target High-Ground Ridge Sanctuary (+Elevation Gain)
        val targetX = w * 0.75f
        val targetY = h * 0.22f

        // Shelter Sanctuary Halo
        drawCircle(
            color = Color(0xFF00E676).copy(alpha = 0.25f),
            radius = 22f,
            center = Offset(targetX, targetY)
        )
        drawCircle(
            color = Color(0xFF00E676),
            radius = 8f,
            center = Offset(targetX, targetY)
        )

        // 6. Evacuation Ridge Ascent Vector Line
        drawLine(
            color = Color(0xFF00E676),
            start = Offset(userX, userY),
            end = Offset(targetX, targetY),
            strokeWidth = 2.5f
        )
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
        val baseY = h * yRatio
        moveTo(0f, baseY)
        cubicTo(
            w * 0.25f, baseY - waveAmp,
            w * 0.75f, baseY + waveAmp,
            w, baseY
        )
    }
    drawPath(path = path, color = color, style = Stroke(width = strokeWidth))
}
