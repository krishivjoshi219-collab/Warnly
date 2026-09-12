package com.example.warnly.ui.tabs

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AlertLevel
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * FR-07: Family Shield 10-Zone Perimeter Monitoring Screen
 * Monitors multiple geographically dispersed perimeters simultaneously.
 */
@Composable
fun FamilyShieldScreen(engine: DisasterEngine) {
    val zones by engine.familyShieldZones.collectAsState()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(VoidBlack)
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Header
        TacticalPanel(
            borderColor = BorderBright,
            contentPadding = PaddingValues(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PulsingLed(color = NeonCyan, size = 9.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "FAMILY SHIELD MULTI-PERIMETER",
                            color = NeonCyan,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "FR-07: 10 DISPERSED ASSET RINGS ACTIVE",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                TacticalBadge(
                    text = "${zones.size}/10 MONITORED",
                    accentColor = CyberEmerald
                )
            }
        }

        // 2. Zone List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(zones) { zone ->
                val badgeColor = when (zone.alertLevel) {
                    AlertLevel.DANGER -> CriticalCrimson
                    AlertLevel.ADVISORY -> HazardAmber
                    AlertLevel.SAFE -> CyberEmerald
                }

                val borderTone = when (zone.alertLevel) {
                    AlertLevel.DANGER -> BorderCritical
                    AlertLevel.ADVISORY -> BorderAmber
                    AlertLevel.SAFE -> BorderGlass
                }

                TacticalPanel(borderColor = borderTone) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(text = zone.type.icon, fontSize = 22.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = zone.name.uppercase(),
                                    color = TextHighlight,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = zone.type.title,
                                    color = TextSecondary,
                                    fontSize = 10.sp
                                )
                                if (zone.nearestStrikeKm != null) {
                                    Text(
                                        text = "Nearest Threat: ${String.format("%.1f", zone.nearestStrikeKm)} km away",
                                        color = if (zone.nearestStrikeKm <= 15.0) HazardAmber else TextSecondary,
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            TacticalBadge(
                                text = zone.alertLevel.name,
                                accentColor = badgeColor
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            TacticalButton(
                                text = "BROADCAST SMS",
                                onClick = {
                                    val sendIntent = Intent().apply {
                                        action = Intent.ACTION_SEND
                                        putExtra(
                                            Intent.EXTRA_TEXT,
                                            "⚠️ WARNLY ALERT: Perimeter advisory for ${zone.name}. Current status is ${zone.alertLevel.name}. Nearest strike: ${zone.nearestStrikeKm ?: 0} km. Take indoor shelter if thunder is heard!"
                                        )
                                        type = "text/plain"
                                    }
                                    context.startActivity(Intent.createChooser(sendIntent, "Share Warnly Alert"))
                                },
                                accentColor = BorderGlass,
                                leadingIcon = "📤",
                                height = 32.dp
                            )
                        }
                    }
                }
            }
        }
    }
}
