package com.example.warnly.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AlertLevel
import com.example.warnly.theme.*

/**
 * Warnly Consumer Tactical Dynamic Island HUD
 * An interactive, spring-animated floating pill at the top of the display.
 * Blends iOS-style consumer fluidity with military-grade tactical defense telemetry.
 */
@Composable
fun DynamicIslandHud(
    alertLevel: AlertLevel,
    nearestStrikeKm: Double?,
    nearestStrikeBearing: Double,
    timerSeconds: Int,
    isTimerActive: Boolean,
    batteryPct: Int,
    isBlackoutActive: Boolean,
    isSirenActive: Boolean,
    isTorchActive: Boolean,
    locationName: String,
    telemetryStatus: String,
    onToggleSiren: () -> Unit,
    onToggleTorch: () -> Unit,
    onToggleBlackout: () -> Unit,
    onSyncFeeds: () -> Unit,
    onNavigateToShelter: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isExpanded by remember { mutableStateOf(false) }

    val alertAccentColor = when (alertLevel) {
        AlertLevel.DANGER -> CriticalCrimson
        AlertLevel.ADVISORY -> HazardAmber
        AlertLevel.SAFE -> CyberEmerald
    }

    val timerFormatted = String.format("%02d:%02d", timerSeconds / 60, timerSeconds % 60)

    val threatTitle = when (alertLevel) {
        AlertLevel.DANGER -> "TACTICAL DANGER"
        AlertLevel.ADVISORY -> "STORM ADVISORY"
        AlertLevel.SAFE -> "WARNLY SECURE"
    }

    val threatIcon = when (alertLevel) {
        AlertLevel.DANGER -> "⚡"
        AlertLevel.ADVISORY -> "⚠️"
        AlertLevel.SAFE -> "🛡️"
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 6.dp),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(if (isExpanded) 20.dp else 28.dp))
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFA090F16),
                            Color(0xF00D1622)
                        )
                    )
                )
                .border(
                    width = if (alertLevel == AlertLevel.DANGER) 1.5.dp else 1.dp,
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            alertAccentColor.copy(alpha = if (isExpanded) 0.8f else 0.5f),
                            alertAccentColor.copy(alpha = 0.15f)
                        )
                    ),
                    shape = RoundedCornerShape(if (isExpanded) 20.dp else 28.dp)
                )
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    isExpanded = !isExpanded
                }
                .animateContentSize(
                    animationSpec = spring(
                        dampingRatio = Spring.DampingRatioMediumBouncy,
                        stiffness = Spring.StiffnessMedium
                    )
                )
                .padding(horizontal = 14.dp, vertical = if (isExpanded) 14.dp else 8.dp)
        ) {
            // ==========================================
            // COMPACT PILL BAR (Always Visible)
            // ==========================================
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left Pill: Pulsing Dot + Icon + Title
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    PulsingLed(color = alertAccentColor, size = 8.dp)
                    Text(threatIcon, fontSize = 13.sp)
                    Text(
                        text = threatTitle,
                        color = alertAccentColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 0.6.sp
                    )
                }

                // Right Pill: Live Metrics + Chevron
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (isTimerActive) {
                        // Glowing 30-30 Timer Chip
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(CriticalCrimson.copy(alpha = 0.2f))
                                .border(1.dp, CriticalCrimson.copy(alpha = 0.6f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 7.dp, vertical = 3.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("⏱️", fontSize = 9.sp)
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = timerFormatted,
                                    color = CriticalCrimson,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    } else if (nearestStrikeKm != null) {
                        // Nearest Strike Proximity Chip
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(HazardAmber.copy(alpha = 0.18f))
                                .border(1.dp, HazardAmber.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 7.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = String.format("%.1f km", nearestStrikeKm),
                                color = HazardAmber,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    } else {
                        // Safe State Chip
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(CyberEmerald.copy(alpha = 0.15f))
                                .border(1.dp, CyberEmerald.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 7.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "100% SAFE",
                                color = CyberEmerald,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    // Battery Indicator Pill
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isBlackoutActive) CyberEmerald.copy(alpha = 0.2f) else SurfaceElevated)
                            .border(1.dp, if (isBlackoutActive) CyberEmerald else BorderGlass, RoundedCornerShape(12.dp))
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "🔋$batteryPct%",
                            color = if (batteryPct <= 20) CriticalCrimson else TextSecondary,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    // Expand / Collapse Chevron
                    Text(
                        text = if (isExpanded) "▲" else "▼",
                        color = TextMuted,
                        fontSize = 9.sp,
                        modifier = Modifier.padding(start = 2.dp)
                    )
                }
            }

            // ==========================================
            // EXPANDED COMMAND CARD
            // ==========================================
            if (isExpanded) {
                Spacer(modifier = Modifier.height(12.dp))

                // Hairline Divider
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(BorderGlass)
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Telemetry & Location Sub-header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "📡 $telemetryStatus",
                        color = NeonCyan,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "📍 $locationName",
                        color = TextSecondary,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 3-Column Metrics Dashboard
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Metric 1: Nearest Strike
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceElevated.copy(alpha = 0.6f))
                            .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                            .padding(8.dp)
                    ) {
                        Column {
                            Text(
                                text = "STRIKE RADAR",
                                fontSize = 8.sp,
                                color = TextMuted,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = if (nearestStrikeKm != null) String.format("%.1f km", nearestStrikeKm) else "CLEAR",
                                fontSize = 13.sp,
                                color = alertAccentColor,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    // Metric 2: 30-30 Timer
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceElevated.copy(alpha = 0.6f))
                            .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                            .padding(8.dp)
                    ) {
                        Column {
                            Text(
                                text = "30-30 TIMER",
                                fontSize = 8.sp,
                                color = TextMuted,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = if (isTimerActive) timerFormatted else "STANDBY",
                                fontSize = 13.sp,
                                color = if (isTimerActive) CriticalCrimson else TextSecondary,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    // Metric 3: Edge Status
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(SurfaceElevated.copy(alpha = 0.6f))
                            .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                            .padding(8.dp)
                    ) {
                        Column {
                            Text(
                                text = "EDGE CORE",
                                fontSize = 8.sp,
                                color = TextMuted,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "100% RAM",
                                fontSize = 13.sp,
                                color = CyberEmerald,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Fast Tactical Command Cluster
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Siren Toggle Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSirenActive) CriticalCrimson.copy(alpha = 0.35f) else SurfaceElevated)
                            .border(1.dp, if (isSirenActive) CriticalCrimson else BorderGlass, RoundedCornerShape(10.dp))
                            .clickable { onToggleSiren() }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(if (isSirenActive) "🚨" else "🔊", fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isSirenActive) "SILENCE" else "SIREN",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = if (isSirenActive) CriticalCrimson else TextPrimary
                            )
                        }
                    }

                    // Optical Torch SOS Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isTorchActive) HazardAmber.copy(alpha = 0.35f) else SurfaceElevated)
                            .border(1.dp, if (isTorchActive) HazardAmber else BorderGlass, RoundedCornerShape(10.dp))
                            .clickable { onToggleTorch() }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(if (isTorchActive) "💡" else "🔦", fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isTorchActive) "STROBE" else "TORCH",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = if (isTorchActive) HazardAmber else TextPrimary
                            )
                        }
                    }

                    // 72h Survival Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isBlackoutActive) CyberEmerald.copy(alpha = 0.35f) else SurfaceElevated)
                            .border(1.dp, if (isBlackoutActive) CyberEmerald else BorderGlass, RoundedCornerShape(10.dp))
                            .clickable { onToggleBlackout() }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🔋", fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isBlackoutActive) "72H ON" else "SURVIVAL",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = if (isBlackoutActive) CyberEmerald else TextPrimary
                            )
                        }
                    }

                    // Navigate to Shelter Button
                    Box(
                        modifier = Modifier
                            .weight(1.2f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(NeonCyan.copy(alpha = 0.25f))
                            .border(1.dp, NeonCyan.copy(alpha = 0.8f), RoundedCornerShape(10.dp))
                            .clickable {
                                isExpanded = false
                                onNavigateToShelter()
                            }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🧭", fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "NAV BUNKER",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = NeonCyan
                            )
                        }
                    }
                }
            }
        }
    }
}
