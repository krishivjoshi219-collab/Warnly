package com.example.warnly.ui.tabs

import android.content.Intent
import android.net.Uri
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
import com.example.warnly.model.Shelter
import com.example.warnly.physics.GeoMath
import com.example.warnly.service.DisasterEngine

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
            .padding(14.dp)
    ) {
        Text(
            text = "HIGH-GROUND SHELTER FINDER",
            color = Color(0xFF00E676),
            fontWeight = FontWeight.Black,
            fontSize = 15.sp,
            letterSpacing = 1.sp
        )
        Text(
            text = "FR-06: Verified reinforced bunkers, sports arenas, and elevated ridgelines.",
            color = Color(0xFF90A4AE),
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(shelters) { shelter ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF263238), RoundedCornerShape(14.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF131A22))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = shelter.name,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Text(
                                    text = shelter.type.title,
                                    color = Color(0xFF80CBC4),
                                    fontSize = 11.sp
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .background(Color(0xFF004D40), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "+${shelter.elevationGainMeters}m Elevation",
                                    color = Color(0xFF64FFDA),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Distance: ${shelter.distanceKm} km • Bearing: ${shelter.bearingDegrees.toInt()}° (${GeoMath.bearingToCardinal(shelter.bearingDegrees)})",
                                    color = Color(0xFFB0BEC5),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "Capacity: ${shelter.capacity} citizens • ${shelter.address}",
                                    color = Color(0xFF78909C),
                                    fontSize = 11.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    engine.startNavigatingTo(shelter)
                                    onNavigateToShelter?.invoke(shelter)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00C853)),
                                modifier = Modifier.weight(1.2f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "🧭 Tactical Compass HUD", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = {
                                    val geoUri = Uri.parse("geo:${shelter.latitude},${shelter.longitude}?q=${Uri.encode(shelter.name)}")
                                    val mapIntent = Intent(Intent.ACTION_VIEW, geoUri)
                                    context.startActivity(Intent.createChooser(mapIntent, "Open Offline Map"))
                                },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF80CBC4)),
                                modifier = Modifier.weight(0.8f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "🗺️ Map App", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
