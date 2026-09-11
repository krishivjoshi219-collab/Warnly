package com.example.warnly.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.warnly.model.AlertLevel
import com.example.warnly.model.HazardType

/**
 * FR-04: Full-Screen Emergency Intrusion Overlay
 * High-contrast life-safety card mounted when hazards breach critical danger thresholds.
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
    AnimatedVisibility(
        visible = isVisible,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Dialog(
            onDismissRequest = { /* un-dismissible by back click, explicit button needed */ },
            properties = DialogProperties(usePlatformDefaultWidth = false, dismissOnBackPress = false, dismissOnClickOutside = false)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0D0204).copy(alpha = 0.96f))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.dp, Color(0xFFFF1744), RoundedCornerShape(20.dp))
                        .clip(RoundedCornerShape(20.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E0608))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp)
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Flashing banner
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFFF1744), RoundedCornerShape(10.dp))
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "CRITICAL LIFE-SAFETY ALERT",
                                color = Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                letterSpacing = 2.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "DANGER PERIMETER BREACH",
                            color = Color(0xFFFF5252),
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = if (nearestStrikeKm != null) {
                                "Lightning Strike Detected at ${String.format("%.1f", nearestStrikeKm)} km (Bearing ${(nearestStrikeBearing).toInt()}°)\nInside Thunder's 30-Second Travel Ring!"
                            } else {
                                "Geophysical Threat Incursion Detected Inside Primary Danger Ring!"
                            },
                            color = Color(0xFFFFCDD2),
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Evacuation Action Checklist
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF2C0A0D)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "MANDATORY EVACUATION ACTIONS:",
                                    color = Color(0xFFFF8A80),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                ActionStepItem("1", "TAKE HARDENED INDOOR SHELTER IMMEDIATELY. Do not wait for rain or visual strike confirmation.")
                                ActionStepItem("2", "SUSPEND CRANES & OUTDOOR WORK (OSHA Rule: 10-mile radius suspension).")
                                ActionStepItem("3", "STAY AWAY FROM PLUMBING, CORDED PHONES, WIRED APPLIANCES, AND WINDOWS.")
                                ActionStepItem("4", "30-30 TIMER ACTIVE: Stay sheltered for 30 full minutes after the last nearby strike.")
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Hardware Controls Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = onToggleSiren,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSirenActive) Color(0xFFD50000) else Color(0xFF424242)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = if (isSirenActive) "Siren: ON" else "Siren: OFF",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }

                            Button(
                                onClick = onToggleTorch,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isTorchActive) Color(0xFFFF9100) else Color(0xFF424242)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = if (isTorchActive) "SOS Strobe: ON" else "SOS Torch: OFF",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Immediate Evacuation Navigation Button
                        Button(
                            onClick = {
                                onDismiss()
                                onNavigateToShelter?.invoke()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E676)),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                text = "🧭 EVACUATE NOW (OFFLINE HUD)",
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF003314),
                                fontSize = 14.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Acknowledge Button
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF5252))
                        ) {
                            Text(
                                text = "Acknowledge & Monitor Radar",
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFFFCDD2)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ActionStepItem(number: String, text: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .background(Color(0xFFFF1744), RoundedCornerShape(11.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(text = number, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            color = Color(0xFFEEEEEE),
            fontSize = 12.sp,
            lineHeight = 16.sp
        )
    }
}
