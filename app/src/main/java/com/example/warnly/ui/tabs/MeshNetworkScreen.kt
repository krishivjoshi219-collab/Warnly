package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.mesh.MeshPacketType
import com.example.warnly.service.DisasterEngine
import com.example.warnly.telephony.CompressedSmsBeacon

/**
 * P2P Disaster Mesh & Survivor Beacon Dashboard
 * Operates 100% off-grid when cell towers, power grids, and internet are down.
 */
@Composable
fun MeshNetworkScreen(engine: DisasterEngine) {
    val context = LocalContext.current
    val mesh = engine.meshNetwork
    val isMeshActive by mesh.isMeshActive.collectAsState()
    val connectedPeers by mesh.connectedPeers.collectAsState()
    val receivedPackets by mesh.receivedPackets.collectAsState()
    val isSosActive by mesh.sosDistressActive.collectAsState()
    val userLat by engine.userLatitude.collectAsState()
    val userLon by engine.userLongitude.collectAsState()
    val selectedShelter by engine.navigator.selectedShelter.collectAsState()
    val batteryPct by engine.blackoutManager.batteryPercent.collectAsState()

    var survivorCountInput by remember { mutableStateOf("2") }
    var survivorMessageInput by remember { mutableStateOf("Trapped in collapsed structure. Need immediate extraction!") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF070A0E))
            .verticalScroll(rememberScrollState())
            .padding(14.dp)
    ) {
        // 1. Header & Mesh Status
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "OFF-GRID P2P DISASTER MESH",
                    color = Color(0xFF00E676),
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Autonomous Device-to-Device Mesh • Zero Cell Towers Needed",
                    color = Color(0xFF90A4AE),
                    fontSize = 11.sp
                )
            }
            Switch(
                checked = isMeshActive,
                onCheckedChange = { if (it) mesh.startMesh() else mesh.stopMesh() },
                colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF00E676))
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 2. Active Peers Status Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF263238), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF101721))
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "MESH TOPOLOGY: ${if (isMeshActive) "${connectedPeers.size} NEARBY NODES" else "OFFLINE"}",
                        color = if (isMeshActive) Color(0xFF64FFDA) else Color(0xFF78909C),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "Ad-Hoc 2.4GHz / BLE",
                        color = Color(0xFF80CBC4),
                        fontSize = 11.sp
                    )
                }

                if (isMeshActive) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        connectedPeers.forEach { peer ->
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFF16222F), RoundedCornerShape(6.dp))
                                    .border(1.dp, Color(0xFF2E3E4F), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "📶 ${peer.alias} (${peer.rssiDbm} dBm)",
                                    color = Color(0xFFCFD8DC),
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Trapped Survivor Distress Beacon (SOS)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(
                    1.5.dp,
                    if (isSosActive) Color(0xFFFF1744) else Color(0xFFB71C1C),
                    RoundedCornerShape(12.dp)
                ),
            colors = CardDefaults.cardColors(
                containerColor = if (isSosActive) Color(0xFF33090F) else Color(0xFF1A080B)
            )
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "🚨 TRAPPED SURVIVOR DISTRESS BEACON (P2P SOS)",
                    color = Color(0xFFFF5252),
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp
                )
                Text(
                    text = "Broadcasts a high-priority distress beacon across all nearby mesh phones and rescue relays.",
                    color = Color(0xFFFFCDD2),
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = {
                        if (isSosActive) {
                            mesh.cancelSurvivorSos()
                        } else {
                            mesh.broadcastSurvivorSos(
                                survivorCount = survivorCountInput.toIntOrNull() ?: 1,
                                message = survivorMessageInput,
                                lat = userLat,
                                lon = userLon
                            )
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSosActive) Color(0xFF424242) else Color(0xFFFF1744)
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = if (isSosActive) "CANCEL DISTRESS BEACON" else "🆘 BROADCAST SURVIVOR SOS TO MESH",
                        fontWeight = FontWeight.Black,
                        fontSize = 13.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 4. Live Received Mesh Relays & Hazard Stream
        Text(
            text = "LIVE MESH RELAY STREAM (${receivedPackets.size} Packets)",
            color = Color(0xFFCFD8DC),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(6.dp))

        if (receivedPackets.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF101721), RoundedCornerShape(8.dp))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No mesh packets received yet. Tap 'Inject Survivor SOS' below to simulate.",
                    color = Color(0xFF78909C),
                    fontSize = 11.sp
                )
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                receivedPackets.take(8).forEach { pkt ->
                    val isSos = pkt.type == MeshPacketType.SURVIVOR_SOS
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                1.dp,
                                if (isSos) Color(0xFFFF1744) else Color(0xFF263238),
                                RoundedCornerShape(8.dp)
                            ),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSos) Color(0xFF2B0A0E) else Color(0xFF131A24)
                        )
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${pkt.type.icon} ${pkt.type.title} • Hop ${pkt.hopCount}",
                                    color = if (isSos) Color(0xFFFF8A80) else Color(0xFF80D8FF),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                                Text(
                                    text = pkt.senderAlias,
                                    color = Color(0xFF90A4AE),
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = pkt.payload,
                                color = Color.White,
                                fontSize = 12.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Coordinates: ${String.format("%.4f", pkt.latitude)}, ${String.format("%.4f", pkt.longitude)}",
                                color = Color(0xFF80CBC4),
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 5. 2G/GSM Compressed SMS Fallback Beacon
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF00695C), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0D2422))
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "📲 2G/GSM COMPRESSED SMS EMERGENCY BROADCAST",
                    color = Color(0xFF64FFDA),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
                Text(
                    text = "Standard 2G/GSM cellular channels remain operational during 4G/5G data collapse. Dispatches an ultra-compact 80-char beacon to family contacts.",
                    color = Color(0xFFB2DFDB),
                    fontSize = 11.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                val smsPayload = CompressedSmsBeacon.formatEmergencyPayload(
                    latitude = userLat,
                    longitude = userLon,
                    status = engine.alertLevel.value.name,
                    batteryPercent = batteryPct,
                    nearestShelterName = selectedShelter?.name ?: "Unknown"
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF071413), RoundedCornerShape(6.dp))
                        .padding(8.dp)
                ) {
                    Text(
                        text = smsPayload,
                        color = Color(0xFF80CBC4),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = {
                        CompressedSmsBeacon.dispatchSmsBroadcast(context, smsPayload)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00897B)),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("📨 Dispatch 1-Tap Emergency SMS", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 6. Test Hub Simulation
        Button(
            onClick = {
                mesh.simulateIncomingSurvivorSos(userLat + 0.012, userLon - 0.018)
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF37474F)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("🧪 Simulate Receiving Peer Survivor SOS", fontSize = 11.sp)
        }
    }
}
