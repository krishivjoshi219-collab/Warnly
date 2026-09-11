package com.example.warnly.physics

import com.example.warnly.model.AlertLevel
import kotlin.math.*

object GeoMath {

    const val EARTH_RADIUS_KM = 6371.0
    const val CRITICAL_DANGER_RADIUS_KM = 10.0 // 30-second acoustic travel boundary (FR-01)
    const val ADVISORY_RADIUS_KM = 15.0       // Impending convective threshold (FR-01)

    // Seismic wave velocities
    const val P_WAVE_VELOCITY_KM_S = 6.0   // Primary compression wave
    const val S_WAVE_VELOCITY_KM_S = 3.5   // Secondary shear destructive wave

    /**
     * Calculates Great-Circle distance using Haversine formula (FR-01)
     */
    fun calculateHaversineDistanceKm(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val rLat1 = Math.toRadians(lat1)
        val rLat2 = Math.toRadians(lat2)

        val a = sin(dLat / 2).pow(2) +
                cos(rLat1) * cos(rLat2) * sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return EARTH_RADIUS_KM * c
    }

    /**
     * Calculates initial compass bearing (azimuth in 0..360 degrees)
     */
    fun calculateBearingDegrees(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Double {
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val deltaLambda = Math.toRadians(lon2 - lon1)

        val y = sin(deltaLambda) * cos(phi2)
        val x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(deltaLambda)
        val theta = atan2(y, x)
        val bearing = Math.toDegrees(theta)
        return (bearing + 360.0) % 360.0
    }

    /**
     * Evaluates Geodesic Safety Ring Alert Level (FR-01)
     */
    fun evaluateGeodesicRingLevel(nearestStrikeDistanceKm: Double?): AlertLevel {
        if (nearestStrikeDistanceKm == null) return AlertLevel.SAFE
        return when {
            nearestStrikeDistanceKm <= CRITICAL_DANGER_RADIUS_KM -> AlertLevel.DANGER
            nearestStrikeDistanceKm <= ADVISORY_RADIUS_KM -> AlertLevel.ADVISORY
            else -> AlertLevel.SAFE
        }
    }

    /**
     * Calibrated Grid Probability & Zero False Alarm Gating Rule (FR-02)
     * "Strict 0% output when zero strikes exist and sky is clear/stable.
     * Incorporate CAPE (>1500 J/kg) and Lifted Index (<-4)."
     */
    fun evaluateCalibratedRisk(
        nearestStrikeDistanceKm: Double?,
        activeStrikesWithin15Km: Int,
        cape: Double,
        liftedIndex: Double
    ): Int {
        // Zero-False-Alarm Gating Rule
        val isAtmosphereStable = (cape < 1000.0) && (liftedIndex > 0.0)
        val noStrikesNearby = (nearestStrikeDistanceKm == null || nearestStrikeDistanceKm > ADVISORY_RADIUS_KM)

        if (isAtmosphereStable && noStrikesNearby) {
            return 0 // Strict 0% calibrated gating
        }

        var risk = 0

        // 1. Strike proximity factor
        if (nearestStrikeDistanceKm != null && nearestStrikeDistanceKm <= CRITICAL_DANGER_RADIUS_KM) {
            val proximityFraction = (CRITICAL_DANGER_RADIUS_KM - nearestStrikeDistanceKm) / CRITICAL_DANGER_RADIUS_KM
            risk = max(risk, (60 + proximityFraction * 40).toInt()) // 60% - 100%
        } else if (nearestStrikeDistanceKm != null && nearestStrikeDistanceKm <= ADVISORY_RADIUS_KM) {
            val advisoryFraction = (ADVISORY_RADIUS_KM - nearestStrikeDistanceKm) / (ADVISORY_RADIUS_KM - CRITICAL_DANGER_RADIUS_KM)
            risk = max(risk, (30 + advisoryFraction * 29).toInt()) // 30% - 59%
        }

        // 2. Convective Instability factor (CAPE & Lifted Index)
        if (cape > 1500.0) {
            val capeContribution = min(35, ((cape - 1500.0) / 100.0).toInt())
            risk = max(risk, 25 + capeContribution)
        }
        if (liftedIndex < -4.0) {
            val liContribution = min(35, (abs(liftedIndex - (-4.0)) * 6.0).toInt())
            risk = max(risk, 30 + liContribution)
        }

        // 3. Multi-strike escalation
        if (activeStrikesWithin15Km >= 3) {
            risk = min(100, risk + activeStrikesWithin15Km * 3)
        }

        return risk.coerceIn(0, 100)
    }

    /**
     * Computes differential S-wave arrival countdown (Seismic Feed)
     * Delta T = d * (1/3.5 - 1/6.0)
     */
    fun calculateSWaveLeadTimeSeconds(epicenterDistanceKm: Double): Int {
        val diffTravelTimeSeconds = epicenterDistanceKm * ( (1.0 / S_WAVE_VELOCITY_KM_S) - (1.0 / P_WAVE_VELOCITY_KM_S) )
        return max(1, diffTravelTimeSeconds.roundToInt())
    }

    /**
     * Compass cardinal label from bearing degrees
     */
    fun bearingToCardinal(degrees: Double): String {
        val directions = arrayOf("N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW")
        val index = ((degrees + 11.25) / 22.5).toInt() % 16
        return directions[index]
    }
}
