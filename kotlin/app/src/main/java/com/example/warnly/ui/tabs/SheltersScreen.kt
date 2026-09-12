package com.example.warnly.ui.tabs

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.Shelter
import com.example.warnly.physics.GeoMath
import com.example.warnly.service.DisasterEngine
import com.example.warnly.theme.*
import com.example.warnly.ui.components.*

/**
 * High-Ground Shelter Finder Screen (FR-06)
 * Database of verified reinforced bunkers, high-ground ridges, and emergency shelters.
 */
@Composable
fun SheltersScreen(
    engine: DisasterEngine,
    onNavigateToShelter: ((Shelter) -> Unit)? = null
) {
    val shelters by engine.shelters.collectAsState()
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
            borderColor = BorderEmerald,
            contentPadding = PaddingValues(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PulsingLed(color = CyberEmerald, size = 9.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "HIGH-GROUND SANCTUARY DIRECTORY",
                            color = CyberEmerald,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "FR-06: HARDENED BUNKERS & ELEVATED RIDGES",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                TacticalBadge(
                    text = "${shelters.size} VERIFIED",
                    accentColor = HighGroundTeal
                )
            }
        }

        // 2. Shelters List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(shelters) { shelter ->
                TacticalPanel(borderColor = BorderBright) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = shelter.name.uppercase(),
                                color = TextHighlight,
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = shelter.type.title,
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }

                        TacticalBadge(
                            text = "+${shelter.elevationGainMeters}M ASCENT",
                            accentColor = HighGroundTeal
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        TacticalMetricBox(
                            label = "DISTANCE",
                            value = "${shelter.distanceKm}",
                            unit = "km",
                            statusColor = NeonCyan,
                            modifier = Modifier.weight(1f)
                        )
                        TacticalMetricBox(
                            label = "BEARING",
                            value = "${shelter.bearingDegrees.toInt()}°",
                            unit = GeoMath.bearingToCardinal(shelter.bearingDegrees),
                            statusColor = HighGroundTeal,
                            modifier = Modifier.weight(1f)
                        )
                        TacticalMetricBox(
                            label = "CAPACITY",
                            value = "${shelter.capacity}",
                            unit = "seats",
                            statusColor = TextPrimary,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        TacticalButton(
                            text = "LOCK EVACUATION HUD",
                            onClick = {
                                engine.startNavigatingTo(shelter)
                                onNavigateToShelter?.invoke(shelter)
                            },
                            accentColor = CyberEmerald,
                            leadingIcon = "🧭",
                            modifier = Modifier.weight(1.3f)
                        )

                        TacticalButton(
                            text = "MAP",
                            onClick = {
                                val mapIntent = Intent(
                                    Intent.ACTION_VIEW,
                                    Uri.parse("geo:${shelter.latitude},${shelter.longitude}?q=${shelter.latitude},${shelter.longitude}(${Uri.encode(shelter.name)})")
                                )
                                context.startActivity(mapIntent)
                            },
                            accentColor = BorderGlass,
                            leadingIcon = "📍",
                            modifier = Modifier.weight(0.7f)
                        )
                    }
                }
            }
        }
    }
}
