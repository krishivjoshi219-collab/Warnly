package com.example.warnly.physics

import kotlin.math.sqrt

data class TsunamiAlert(
    val id: String,
    val earthquakeMagnitude: Double,
    val epicenterDistanceKm: Double,
    val deepOceanSpeedKmh: Double,
    val estimatedArrivalMinutes: Int,
    val projectedRunupHeightMeters: Int,
    val verticalAscentRequiredMeters: Int,
    val coastalBasinName: String,
    val evacuationDirective: String
)

/**
 * Tsunami & Coastal Storm Surge Inundation Physics Engine
 * Implements shallow-water gravity wave kinematics:
 *   v = sqrt(g * d)
 * Evaluates coastal distance, wave ETA countdown, and mandatory vertical ascent clearance.
 */
object TsunamiInundationEngine {

    private const val GRAVITY = 9.81 // m/s^2
    private const val AVERAGE_OCEAN_DEPTH_METERS = 4000.0 // Average oceanic basin depth

    /**
     * Compute deep ocean phase speed in km/h
     * v = sqrt(9.81 * 4000) ~ 198 m/s = 713 km/h
     */
    fun calculateWaveSpeedKmh(depthMeters: Double = AVERAGE_OCEAN_DEPTH_METERS): Double {
        val speedMps = sqrt(GRAVITY * depthMeters)
        return speedMps * 3.6
    }

    /**
     * Compute Tsunami arrival ETA in minutes from epicenter distance
     */
    fun calculateArrivalMinutes(distanceKm: Double, averageSpeedKmh: Double = 720.0): Int {
        val hours = distanceKm / averageSpeedKmh
        // Add 6 minutes deceleration buffer for continental shelf shoaling
        val totalMinutes = (hours * 60.0).toInt() + 6
        return maxOf(4, totalMinutes)
    }

    /**
     * Estimate coastal wave runup height (meters) based on earthquake magnitude
     */
    fun estimateRunupHeightMeters(magnitude: Double): Int {
        return when {
            magnitude >= 8.5 -> 24
            magnitude >= 7.8 -> 14
            magnitude >= 7.2 -> 8
            magnitude >= 6.8 -> 4
            else -> 2
        }
    }

    /**
     * Mandatory vertical clearance required to escape inundation crest safely (+20% safety margin)
     */
    fun calculateMandatoryVerticalClearance(runupHeightMeters: Int): Int {
        return runupHeightMeters + 8 // +8m safety margin above maximum runup crest
    }

    /**
     * Evaluate a submarine seismic event for tsunami generation potential
     */
    fun evaluateSubmarineEvent(
        magnitude: Double,
        epicenterDistanceKm: Double,
        coastalName: String
    ): TsunamiAlert? {
        // Tsunami generation threshold: Magnitude >= 6.5
        if (magnitude < 6.5) return null

        val speed = calculateWaveSpeedKmh()
        val etaMinutes = calculateArrivalMinutes(epicenterDistanceKm, speed)
        val runup = estimateRunupHeightMeters(magnitude)
        val clearance = calculateMandatoryVerticalClearance(runup)

        return TsunamiAlert(
            id = "TSUNAMI-SURGE-${(System.currentTimeMillis() % 10000)}",
            earthquakeMagnitude = magnitude,
            epicenterDistanceKm = (epicenterDistanceKm * 10.0).toInt() / 10.0,
            deepOceanSpeedKmh = (speed * 10.0).toInt() / 10.0,
            estimatedArrivalMinutes = etaMinutes,
            projectedRunupHeightMeters = runup,
            verticalAscentRequiredMeters = clearance,
            coastalBasinName = coastalName,
            evacuationDirective = "CRITICAL COASTAL TSUNAMI INUNDATION WARNING: M$magnitude subsea rupture. Wave arrival in $etaMinutes min. Projected runup: ${runup}m. Mandatory vertical evacuation uphill (+${clearance}m elevation) immediately! Do NOT stay in coastal structures or harbors!"
        )
    }
}
