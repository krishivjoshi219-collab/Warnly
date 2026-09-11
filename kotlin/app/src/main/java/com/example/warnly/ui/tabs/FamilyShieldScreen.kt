package com.example.warnly.ui.tabs

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AlertLevel
import com.example.warnly.service.DisasterEngine

@Composable
fun FamilyShieldScreen(engine: DisasterEngine) {
    val zones by engine.familyShieldZones.collectAsState()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "FAMILY SHIELD MULTI-ZONE RINGS",
                    color = Color(0xFFFF80AB),
                    fontWeight = FontWeight.Black,
                    fontSize = 15.sp,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "FR-07: Monitoring 10 dispersed perimeters simultaneously.",
                    color = Color(0xFF90A4AE),
                    fontSize = 12.sp
                )
            }

            Box(
                modifier = Modifier
                    .background(Color(0xFF880E4F), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(text = "${zones.size}/10 Active", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(zones) { zone ->
                val badgeColor = when (zone.alertLevel) {
                    AlertLevel.DANGER -> Color(0xFFFF1744)
                    AlertLevel.ADVISORY -> Color(0xFFFFB300)
                    AlertLevel.SAFE -> Color(0xFF00E676)
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF263238), RoundedCornerShape(14.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF141923))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Text(text = zone.type.icon, fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = zone.name,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = zone.type.title,
                                    color = Color(0xFF90A4AE),
                                    fontSize = 11.sp
                                )
                                if (zone.nearestStrikeKm != null) {
                                    Text(
                                        text = "Nearest Strike: ${zone.nearestStrikeKm} km away",
                                        color = if (zone.nearestStrikeKm <= 15.0) Color(0xFFFFCA28) else Color(0xFF78909C),
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Box(
                                modifier = Modifier
                                    .background(badgeColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                                    .border(1.dp, badgeColor, RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = zone.alertLevel.name,
                                    color = badgeColor,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            IconButton(
                                onClick = {
                                    val sendIntent = Intent().apply {
                                        action = Intent.ACTION_SEND
                                        putExtra(
                                            Intent.EXTRA_TEXT,
                                            "⚠️ WARNLY ALERT: Perimeter advisory for ${zone.name}. Current status is ${zone.alertLevel.name}. Nearest strike: ${zone.nearestStrikeKm} km. Seek shelter if thunder is heard!"
                                        )
                                        type = "text/plain"
                                    }
                                    context.startActivity(Intent.createChooser(sendIntent, "Broadcast Perimeter Alert"))
                                },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Text("📢", fontSize = 16.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
