package com.example.warnly.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * FR-03: Automated 30-30 Sheltering Countdown Clock
 * Displays 30:00 timer, auto-reset counter, and explanation of thunder acoustic speed.
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

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(
                1.5.dp,
                if (isActive) Color(0xFFFF1744) else Color(0xFF263238),
                RoundedCornerShape(16.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (isActive) Color(0xFF1F070A) else Color(0xFF13181F)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "⏱️", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "30-30 SHELTER TIMER",
                        color = if (isActive) Color(0xFFFF5252) else Color(0xFFB0BEC5),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        letterSpacing = 1.sp
                    )
                }

                if (resetCount > 0) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFB71C1C), RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Auto-Resets: $resetCount",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Large Digital Countdown
            Text(
                text = formattedTime,
                color = if (isActive) Color(0xFFFF1744) else Color(0xFF78909C),
                fontSize = 44.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 3.sp
            )

            Text(
                text = if (isActive) {
                    "MANDATORY SHELTER ENGAGED • DO NOT RESUME OUTDOOR WORK"
                } else {
                    "Standard 30-30 Rule: Stay sheltered until 30 min after last strike."
                },
                color = if (isActive) Color(0xFFFFCDD2) else Color(0xFF90A4AE),
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )

            // Progress bar
            if (isActive) {
                val progress = remainingSeconds / (30f * 60f)
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .height(6.dp),
                    color = Color(0xFFFF1744),
                    trackColor = Color(0xFF371015),
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onManualStartReset,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isActive) Color(0xFFC62828) else Color(0xFF1E88E5)
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (isActive) "Force Reset (30:00)" else "Start 30-30 Timer",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (isActive) {
                    OutlinedButton(
                        onClick = onStopTimer,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFF8A80)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFB71C1C)),
                        modifier = Modifier.weight(0.7f)
                    ) {
                        Text(text = "End Timer", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
