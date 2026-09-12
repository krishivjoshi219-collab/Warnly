package com.example.warnly.ui.tabs

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.mesh.MeshPacketType
import com.example.warnly.service.DisasterEngine
import com.example.warnly.telephony.CompressedSmsBeacon
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * Off-Grid P2P Disaster Mesh & Survivor Beacon Screen
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
    var survivorMessageInput by remember { mutableStateOf("Trapped in collapsed structure. Need extraction!") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(VoidBlack)
            .verticalScroll(rememberScrollState())
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Header & Mesh Master Switch
        TacticalPanel(
            borderColor = if (isMeshActive) BorderEmerald else BorderGlass,
            contentPadding = PaddingValues(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PulsingLed(
                        color = if (isMeshActive) CyberEmerald else TextMuted,
                        size = 9.dp
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "OFF-GRID P2P DISASTER MESH",
                            color = if (isMeshActive) CyberEmerald else TextSecondary,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "AUTONOMOUS 2.4GHZ / BLE PEER-TO-PEER RELAY",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Switch(
                    checked = isMeshActive,
                    onCheckedChange = { if (it) mesh.startMesh() else mesh.stopMesh() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = CyberEmerald,
                        checkedTrackColor = SurfaceElevated
                    )
                )
            }
        }

        // 2. Mesh Topology & Active Nodes
        TacticalPanel(borderColor = BorderBright) {
            TacticalSectionHeader(
                tag = "TOPOLOGY-01",
                title = "Ad-Hoc Network Cluster",
                trailingBadge = if (isMeshActive) "${connectedPeers.size} NODES DISCOVERED" else "OFFLINE",
                badgeColor = if (isMeshActive) CyberEmerald else TextMuted,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            if (isMeshActive && connectedPeers.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    connectedPeers.forEach { peer ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(SurfaceDark)
                                .border(1.dp, BorderSubtle, RoundedCornerShape(8.dp))
                                .padding(8.dp)
                        ) {
                            Column {
                                Text(
                                    text = peer.alias,
                                    color = HighGroundTeal,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = "${peer.rssiDbm} dBm • Hop 1",
                                    color = TextSecondary,
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            } else {
                Text(
                    text = if (isMeshActive) "Scanning for nearby survivors and relays..." else "Activate mesh radio to participate in ad-hoc off-grid relay cluster.",
                    color = TextSecondary,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // 3. Trapped Survivor Distress Beacon (SOS)
        TacticalPanel(
            borderColor = if (isSosActive) BorderCritical else BorderAmber
        ) {
            TacticalSectionHeader(
                tag = "SOS-BEACON",
                title = "Trapped Survivor Distress Transmitter",
                trailingBadge = if (isSosActive) "TRANSMITTING SOS (30s)" else "STANDBY",
                badgeColor = if (isSosActive) CriticalCrimson else HazardAmber,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            OutlinedTextField(
                value = survivorMessageInput,
                onValueChange = { survivorMessageInput = it },
                label = { Text("Distress Payload", color = TextSecondary, fontSize = 11.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CriticalCrimson,
                    unfocusedBorderColor = BorderGlass,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TacticalButton(
                    text = if (isSosActive) "CANCEL SOS DISTRESS" else "BROADCAST P2P MESH SOS",
                    onClick = {
                        if (isSosActive) {
                            mesh.cancelSurvivorSos()
                        } else {
                            val count = survivorCountInput.toIntOrNull() ?: 1
                            mesh.broadcastSosBeacon(
                                latitude = userLat,
                                longitude = userLon,
                                medicalTriage = "IMMEDIATE_EXTRACTION",
                                survivorCount = count
                            )
                        }
                    },
                    accentColor = if (isSosActive) CriticalCrimson else HazardAmber,
                    leadingIcon = "🚨",
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 4. Sub-100 Byte Compressed GSM / 2G SMS Beacon
        TacticalPanel(borderColor = BorderSubtle) {
            TacticalSectionHeader(
                tag = "SMS-BEACON",
                title = "Compressed 80-Char 2G SMS Beacon",
                trailingBadge = "SUB-100 BYTES",
                badgeColor = CyberEmerald,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            val compressedMsg = remember(userLat, userLon, batteryPct, selectedShelter) {
                CompressedSmsBeacon.formatEmergencyPayload(
                    latitude = userLat,
                    longitude = userLon,
                    status = "EVAC_REQUIRED",
                    batteryPercent = batteryPct,
                    nearestShelterName = selectedShelter?.name ?: "HIGH_RIDGE"
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(SurfaceDark)
                    .border(1.dp, BorderGlass, RoundedCornerShape(8.dp))
                    .padding(10.dp)
            ) {
                Text(
                    text = compressedMsg,
                    color = CyberEmerald,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            TacticalButton(
                text = "DISPATCH VIA 2G / GSM SMS (1-TAP)",
                onClick = {
                    CompressedSmsBeacon.dispatchSmsBroadcast(context, compressedMsg)
                },
                accentColor = CyberEmerald,
                leadingIcon = "📱",
                modifier = Modifier.fillMaxWidth()
            )
        }

        // 5. Live Mesh Traffic Packet Inspector
        TacticalPanel(borderColor = BorderGlass) {
            TacticalSectionHeader(
                tag = "PACKET-SNIFFER",
                title = "Ad-Hoc Packet Log",
                trailingBadge = "${receivedPackets.size} PACKETS",
                badgeColor = NeonCyan,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            if (receivedPackets.isNotEmpty()) {
                receivedPackets.take(6).forEach { packet ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "${packet.type.name} • ${packet.senderId.take(8)}...",
                                color = if (packet.type == MeshPacketType.SURVIVOR_SOS) CriticalCrimson else NeonCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = packet.payload.take(45),
                                color = TextSecondary,
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        TacticalBadge(
                            text = "HOP: ${packet.hopCount}",
                            accentColor = BorderGlass
                        )
                    }
                }
            } else {
                Text(
                    text = "No mesh packets in buffer. Packets auto-flood across multi-hop neighbors within 4 TTL hops.",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}
