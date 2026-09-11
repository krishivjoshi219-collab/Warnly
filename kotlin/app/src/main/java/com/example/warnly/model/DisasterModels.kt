package com.example.warnly.model

enum class HazardType(val displayName: String, val iconLabel: String) {
    LIGHTNING("Lightning Strikes", "⚡"),
    GLOF("Glacial Outburst (GLOF)", "🌊"),
    FLASH_FLOOD("Flash Flood Surge", "🌧️"),
    SEISMIC("Seismic Earthquake", "🌋"),
    TSUNAMI("Coastal Tsunami Inundation", "🌊")
}

enum class AlertLevel(val label: String, val severityColorHex: Long) {
    SAFE("SAFE PERIMETER", 0xFF00E676),       // Emerald Green
    ADVISORY("ADVISORY PERIMETER", 0xFFFFB300), // Convective Warning Amber
    DANGER("CRITICAL DANGER", 0xFFFF1744)      // Life-Threatening Crimson Red
}

data class LightningStrike(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val distanceKm: Double,
    val bearingDegrees: Double,
    val timestamp: Long,
    val intensityKa: Double,
    val ageSeconds: Long
)

data class AtmosphericIndices(
    val cape: Double,                   // Convective Available Potential Energy (J/kg)
    val liftedIndex: Double,           // Lifted Index (< -4 severe convective risk)
    val precipitationRateMmH: Double,  // mm/hr
    val stormSpeedKmh: Double,         // Storm motion vector speed
    val stormBearingDegrees: Double,   // Storm motion heading
    val calculatedRiskPercent: Int,    // 0-100% Calibrated risk
    val leadTimeMinutes: Int           // 10-25 min predictive window
)

data class SeismicAlert(
    val id: String,
    val magnitude: Double,
    val epicenterLocationName: String,
    val epicenterDistanceKm: Double,
    val pWaveDetectedTimestamp: Long,
    val sWaveEstimatedArrivalTimestamp: Long,
    val sWaveCountdownSeconds: Int,
    val estimatedMmi: String // e.g. "VI - Strong"
)

data class FloodAlert(
    val id: String,
    val floodType: String,
    val basinName: String,
    val crestLeadTimeMinutes: Int,
    val verticalEvacuationMeters: Int, // e.g. +30m to +50m
    val dischargeSurgeRateM3s: Double,
    val statusSummary: String
)

enum class ShelterType(val title: String) {
    REINFORCED_CONCRETE("Reinforced Concrete Facility"),
    HIGH_GROUND_RIDGE("High-Ground Ridge Sanctuary (+30m)"),
    CIVIL_DEFENSE_CAMP("Civil Defense Assembly Camp"),
    ENCLOSED_GYMNASIUM("Substantial Enclosed Sports Hall")
}

data class Shelter(
    val id: String,
    val name: String,
    val type: ShelterType,
    val latitude: Double,
    val longitude: Double,
    val elevationGainMeters: Int,
    val capacity: Int,
    val distanceKm: Double,
    val bearingDegrees: Double,
    val address: String
)

enum class ZoneType(val title: String, val icon: String) {
    HOME("Home Base", "🏠"),
    SCHOOL("Kids' School", "🏫"),
    WORK_SITE("Construction / Work Site", "🏗️"),
    ELDERLY_PARENTS("Parents' Residence", "🏡"),
    CAMP("Highland Scout Camp", "⛺"),
    MARINA("Harbor & Marina", "⛵"),
    FARM("Agricultural Farm", "🚜")
}

data class MonitoredZone(
    val id: String,
    val name: String,
    val type: ZoneType,
    val latitude: Double,
    val longitude: Double,
    val alertLevel: AlertLevel,
    val nearestStrikeKm: Double?,
    val activeThreatCount: Int,
    val lastUpdateTimestamp: Long
)

data class DemographicProtocol(
    val id: String,
    val title: String,
    val vulnerabilityProfile: String,
    val oshaOrSafetyRule: String,
    val actionChecklist: List<String>
)
