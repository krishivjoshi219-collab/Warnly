package com.example.warnly.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.warnly.model.AtmosphericIndices
import com.example.warnly.theme.*

/**
 * FR-02: Calibrated Risk Probability & Atmospheric Convective Physics Card
 * Evaluates CAPE, Lifted Index, Precipitation rate, and enforces strict
 * 0% Zero-False-Alarm Gating when skies are stable and no strikes exist.
 */
@Composable
fun RiskGaugeCard(
    atmosphericIndices: AtmosphericIndices,
    nearestStrikeKm: Double?,
    modifier: Modifier = Modifier
) {
    val risk = atmosphericIndices.calculatedRiskPercent
    val isZeroGated = (risk == 0)

    val riskColor = when {
        isZeroGated -> CyberEmerald
        risk < 30 -> HighGroundTeal
        risk < 65 -> HazardAmber
        else -> CriticalCrimson
    }

    val riskBorder = when {
        isZeroGated -> BorderEmerald
        risk < 65 -> BorderAmber
        else -> BorderCritical
    }

    TacticalPanel(
        modifier = modifier,
        borderColor = riskBorder
    ) {
        // Section Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PulsingLed(color = riskColor, size = 7.dp)
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "FR-02 // CONVECTIVE RISK PROBABILITY",
                        color = TextMuted,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = if (isZeroGated) "0% GATED SAFE (ZERO FALSE ALARM)" else "$risk% ELEVATED RISK",
                        color = riskColor,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            if (atmosphericIndices.leadTimeMinutes > 0) {
                TacticalBadge(
                    text = "+${atmosphericIndices.leadTimeMinutes}M LEAD-TIME",
                    accentColor = ElectricBlue
                )
            } else {
                TacticalBadge(
                    text = if (isZeroGated) "GATED CLEAR" else "LIVE RADAR",
                    accentColor = riskColor
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Linear Gauge with Glow
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(SurfaceDark)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction = (risk / 100f).coerceIn(0.02f, 1f))
                    .fillMaxHeight()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(
                                riskColor.copy(alpha = 0.6f),
                                riskColor
                            )
                        )
                    )
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Multi-Parameter Convective Physics Telemetry Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TacticalMetricBox(
                label = "CAPE",
                value = "${atmosphericIndices.cape.toInt()}",
                unit = "J/kg",
                statusColor = if (atmosphericIndices.cape > 1500) CriticalCrimson else TextPrimary,
                modifier = Modifier.weight(1f)
            )

            TacticalMetricBox(
                label = "LIFTED IDX",
                value = String.format("%.1f", atmosphericIndices.liftedIndex),
                unit = "LI",
                statusColor = if (atmosphericIndices.liftedIndex < -4.0) CriticalCrimson else TextPrimary,
                modifier = Modifier.weight(1f)
            )

            TacticalMetricBox(
                label = "PRECIP",
                value = String.format("%.1f", atmosphericIndices.precipitationRateMmH),
                unit = "mm/h",
                statusColor = if (atmosphericIndices.precipitationRateMmH > 15.0) HazardAmber else TextPrimary,
                modifier = Modifier.weight(1f)
            )

            TacticalMetricBox(
                label = "STORM V",
                value = "${atmosphericIndices.stormSpeedKmh.toInt()}",
                unit = "km/h",
                statusColor = NeonCyan,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
