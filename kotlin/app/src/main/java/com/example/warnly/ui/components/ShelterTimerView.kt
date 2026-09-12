package com.example.warnly.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.theme.*

/**
 * FR-03: Automated 30-30 Sheltering Countdown Clock
 * Enforces international 30-30 rule: must remain sheltered for 30 full minutes
 * after the last strike inside the 10 km danger perimeter.
 */
@Composable
fun ShelterTimerView(
    remainingSeconds: Int,
    isActive: Boolean,
    resetCount: Int,
    onManualStartReset: () -> Unit,
    onStopTimer: () -> Unit,
    modifier: Modifier = Modifier
) {
    val minutes = remainingSeconds / 60
    val seconds = remainingSeconds % 60
    val formattedTime = String.format("%02d:%02d", minutes, seconds)

    val timerColor = if (isActive) CriticalCrimson else TextSecondary
    val timerBorder = if (isActive) BorderCritical else BorderGlass

    TacticalPanel(
        modifier = modifier,
        borderColor = timerBorder
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PulsingLed(
                    color = if (isActive) CriticalCrimson else TextMuted,
                    size = 7.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "FR-03 // 30-30 SHELTER COUNTDOWN",
                    color = TextMuted,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            }

            if (resetCount > 0) {
                TacticalBadge(
                    text = "AUTO-RESETS: $resetCount",
                    accentColor = CriticalCrimson
                )
            } else {
                TacticalBadge(
                    text = if (isActive) "ACTIVE LOCK" else "STANDBY",
                    accentColor = if (isActive) CriticalCrimson else BorderGlass
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Center Digital Display
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = formattedTime,
                color = if (isActive) CriticalCrimson else TextPrimary,
                fontSize = 44.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 3.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = if (isActive) {
                    "⚠️ MANDATORY SHELTER ENGAGED • DO NOT RESUME OUTDOOR WORK"
                } else {
                    "Thunder Speed: 343 m/s • 10 km = 29.15s Acoustic Travel Window"
                },
                color = if (isActive) CriticalCrimson.copy(alpha = 0.9f) else TextSecondary,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )

            // Progress bar
            if (isActive) {
                Spacer(modifier = Modifier.height(10.dp))
                val progress = remainingSeconds / (30f * 60f)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(SurfaceDark)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(fraction = progress.coerceIn(0.01f, 1f))
                            .fillMaxHeight()
                            .background(CriticalCrimson)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Action Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TacticalButton(
                text = if (isActive) "FORCE RESET (30:00)" else "ARM 30-30 CLOCK",
                onClick = onManualStartReset,
                accentColor = if (isActive) CriticalCrimson else NeonCyan,
                leadingIcon = "⏱️",
                modifier = Modifier.weight(1f)
            )

            if (isActive) {
                TacticalButton(
                    text = "DISMISS",
                    onClick = onStopTimer,
                    accentColor = TextMuted,
                    modifier = Modifier.width(90.dp)
                )
            }
        }
    }
}
