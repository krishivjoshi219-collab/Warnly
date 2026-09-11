package com.example.warnly.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AtmosphericIndices

/**
 * FR-02: Calibrated Risk Probability & Atmospheric Convective Physics Card
 */
@Composable
fun RiskGaugeCard(
    atmosphericIndices: AtmosphericIndices,
    nearestStrikeKm: Double?,
    modifier: Modifier = Modifier
) {
    val risk = atmosphericIndices.calculatedRiskPercent
    val riskColor = when {
        risk == 0 -> Color(0xFF00E676)   // Emerald Green (Calibrated 0% Gating)
        risk < 35 -> Color(0xFF69F0AE)  // Low
        risk < 65 -> Color(0xFFFFB300)  // Moderate / Advisory
        else -> Color(0xFFFF1744)       // Critical Danger
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF263238), RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131A22))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "CALIBRATED CONVECTIVE RISK",
                        color = Color(0xFF90A4AE),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = if (risk == 0) "0% Gated Safe (Clear Sky)" else "$risk% Convective Threat",
                        color = riskColor,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }

                if (atmosphericIndices.leadTimeMinutes > 0) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFF0D47A1), RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "⚡ +${atmosphericIndices.leadTimeMinutes} min Lead-Time",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Linear Risk Meter
            LinearProgressIndicator(
                progress = { risk / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = riskColor,
                trackColor = Color(0xFF1E293B)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Atmospheric Convective Physics Metrics (CAPE, Lifted Index, Vector)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricItem(
                    label = "CAPE",
                    value = "${atmosphericIndices.cape.toInt()} J/kg",
                    isWarning = atmosphericIndices.cape > 1500,
                    modifier = Modifier.weight(1f)
                )
                MetricItem(
                    label = "LIFTED INDEX",
                    value = String.format("%.1f", atmosphericIndices.liftedIndex),
                    isWarning = atmosphericIndices.liftedIndex < -4.0,
                    modifier = Modifier.weight(1f)
                )
                MetricItem(
                    label = "PRECIP",
                    value = "${String.format("%.1f", atmosphericIndices.precipitationRateMmH)} mm/h",
                    isWarning = atmosphericIndices.precipitationRateMmH > 10.0,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun MetricItem(
    label: String,
    value: String,
    isWarning: Boolean,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(
                if (isWarning) Color(0x33FF1744) else Color(0xFF1B242E),
                RoundedCornerShape(8.dp)
            )
            .border(
                1.dp,
                if (isWarning) Color(0xFFFF5252) else Color(0xFF2C3B4D),
                RoundedCornerShape(8.dp)
            )
            .padding(8.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text(text = label, color = Color(0xFF78909C), fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
            Text(
                text = value,
                color = if (isWarning) Color(0xFFFF5252) else Color(0xFFECEFF1),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
