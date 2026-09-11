package com.example.warnly.ui.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.data.DisasterRepository

@Composable
fun ProtocolsScreen() {
    val protocols = DisasterRepository.demographicProtocols

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(14.dp)
    ) {
        Text(
            text = "DEMOGRAPHIC EVACUATION PROTOCOLS",
            color = Color(0xFFFFD54F),
            fontWeight = FontWeight.Black,
            fontSize = 15.sp,
            letterSpacing = 1.sp
        )
        Text(
            text = "Offline-first verified life-safety procedures conforming to OSHA & WMO standards.",
            color = Color(0xFF90A4AE),
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(protocols) { protocol ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF263238), RoundedCornerShape(14.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF131922))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = protocol.title,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF212C3B), RoundedCornerShape(6.dp))
                                .padding(8.dp)
                        ) {
                            Text(
                                text = "⚠️ ${protocol.vulnerabilityProfile}",
                                color = Color(0xFFFFCC80),
                                fontSize = 11.sp,
                                lineHeight = 15.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Rule: ${protocol.oshaOrSafetyRule}",
                            color = Color(0xFF80DEEA),
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 12.sp
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            protocol.actionChecklist.forEachIndexed { idx, step ->
                                Row(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        text = "${idx + 1}.",
                                        color = Color(0xFFFFD54F),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = step,
                                        color = Color(0xFFECEFF1),
                                        fontSize = 12.sp,
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
