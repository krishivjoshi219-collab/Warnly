package com.example.warnly.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.warnly.model.HazardType
import com.example.warnly.theme.*

/**
 * FR-04: Full-Screen Emergency Intrusion Screen
 * Highest-priority tactical dialog that supersedes standard UI upon critical danger breach.
 */
@Composable
fun EmergencyOverlayDialog(
    isVisible: Boolean,
    hazardType: HazardType,
    nearestStrikeKm: Double?,
    nearestStrikeBearing: Double,
    isSirenActive: Boolean,
    isTorchActive: Boolean,
    onToggleSiren: () -> Unit,
    onToggleTorch: () -> Unit,
    onDismiss: () -> Unit,
    onNavigateToShelter: (() -> Unit)? = null
) {
    val infiniteTransition = rememberInfiniteTransition(label = "emergencyStrobe")
    val strobeAlpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "strobeAlpha"
    )

    AnimatedVisibility(
        visible = isVisible,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Dialog(
            onDismissRequest = { /* un-dismissible without explicit button click */ },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                dismissOnBackPress = false,
                dismissOnClickOutside = false
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xF5050204))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xFF1F0508),
                                    VoidBlack
                                )
                            )
                        )
                        .border(
                            width = 2.dp,
                            color = CriticalCrimson.copy(alpha = strobeAlpha),
                            shape = RoundedCornerShape(18.dp)
                        )
                        .padding(20.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Flashing Threat Header Banner
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(6.dp))
                                .background(CriticalCrimson)
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "CRITICAL LIFE-SAFETY ALERT",
                                color = Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 15.sp,
                                fontFamily = FontFamily.Monospace,
                                letterSpacing = 2.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "10 KM DANGER PERIMETER BREACH",
                            color = CriticalCrimson,
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            fontFamily = FontFamily.Monospace,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = if (nearestStrikeKm != null) {
                                "Lightning Strike Detected at ${String.format("%.1f", nearestStrikeKm)} km (Bearing ${(nearestStrikeBearing).toInt()}°)\nInside Thunder's 30-Second Acoustic Travel Boundary!"
                            } else {
                                "Geophysical Threat Incursion Detected Inside Primary Danger Ring!"
                            },
                            color = Color(0xFFFFCDD2),
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Monospace,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Evacuation Action Protocol Checklist
                        TacticalPanel(
                            borderColor = BorderCritical,
                            backgroundColor = Color(0xFF180508),
                            contentPadding = PaddingValues(12.dp)
                        ) {
                            Text(
                                text = "MANDATORY EVACUATION ACTIONS:",
                                color = CriticalCrimson,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            ActionStepItem("1", "TAKE HARDENED INDOOR SHELTER IMMEDIATELY. Do not wait for rain or visual strike confirmation.")
                            ActionStepItem("2", "SUSPEND OUTDOOR & CRANE WORK (OSHA Rule: 10-mile radius suspension).")
                            ActionStepItem("3", "STAY AWAY FROM PLUMBING, CORDED PHONES, WIRED APPLIANCES, AND WINDOWS.")
                            ActionStepItem("4", "30-30 TIMER ACTIVE: Stay sheltered for 30 full minutes after the last nearby strike.")
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Hardware Actuator Controls (Siren & Torch)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            TacticalButton(
                                text = if (isSirenActive) "SIREN: ON" else "SIREN: OFF",
                                onClick = onToggleSiren,
                                accentColor = if (isSirenActive) CriticalCrimson else BorderGlass,
                                leadingIcon = "🚨",
                                modifier = Modifier.weight(1f)
                            )

                            TacticalButton(
                                text = if (isTorchActive) "STROBE: ON" else "STROBE: OFF",
                                onClick = onToggleTorch,
                                accentColor = if (isTorchActive) HazardAmber else BorderGlass,
                                leadingIcon = "💡",
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Navigation to Shelter Vector Button
                        TacticalButton(
                            text = "LOCK EVACUATION HUD TO SHELTER",
                            onClick = {
                                onNavigateToShelter?.invoke()
                                onDismiss()
                            },
                            accentColor = CyberEmerald,
                            leadingIcon = "🧭",
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        TacticalButton(
                            text = "ACKNOWLEDGE & MINIMIZE ALERT",
                            onClick = onDismiss,
                            accentColor = TextMuted,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ActionStepItem(number: String, instruction: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(18.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(CriticalCrimson.copy(alpha = 0.3f))
                .border(1.dp, CriticalCrimson, RoundedCornerShape(3.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = number,
                color = Color.White,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = instruction,
            color = Color(0xFFFFEBEE),
            fontSize = 11.sp,
            lineHeight = 15.sp
        )
    }
}
