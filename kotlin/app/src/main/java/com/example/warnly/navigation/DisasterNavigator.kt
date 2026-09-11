package com.example.warnly.navigation

import android.content.Context
import com.example.warnly.audio.AcousticHomingBeeper
import com.example.warnly.hardware.LocalSensorManager
import com.example.warnly.model.LightningStrike
import com.example.warnly.model.Shelter
import com.example.warnly.physics.GeoMath
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.abs

/**
 * Tactical Offline Disaster Navigator
 * Guides evacuees to safe high-ground shelters and bunkers during communication blackouts.
 * Integrates:
 *  - Geodesic great-circle vector calculation (distance + azimuth)
 *  - Real-time hardware compass tracking
 *  - Turn-by-turn course deviation indicator (CDI)
 *  - Vertical flood escape clearance telemetry (+m climb)
 *  - Hazard corridor intersection warnings (lightning cell avoidance)
 *  - Acoustic homing sonar beeper for blind zero-visibility evacuation
 */
class DisasterNavigator(
    private val context: Context,
    val sensorManager: LocalSensorManager
) {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    val homingBeeper = AcousticHomingBeeper()

    private val _selectedShelter = MutableStateFlow<Shelter?>(null)
    val selectedShelter: StateFlow<Shelter?> = _selectedShelter.asStateFlow()

    private val _distanceMeters = MutableStateFlow(0.0)
    val distanceMeters: StateFlow<Double> = _distanceMeters.asStateFlow()

    private val _targetBearingDegrees = MutableStateFlow(0.0)
    val targetBearingDegrees: StateFlow<Double> = _targetBearingDegrees.asStateFlow()

    private val _relativeDeviationDegrees = MutableStateFlow(0f)
    val relativeDeviationDegrees: StateFlow<Float> = _relativeDeviationDegrees.asStateFlow()

    private val _isTargetAligned = MutableStateFlow(false)
    val isTargetAligned: StateFlow<Boolean> = _isTargetAligned.asStateFlow()

    private val _guidanceInstruction = MutableStateFlow("SELECT SHELTER TO BEGIN OFFLINE HUD")
    val guidanceInstruction: StateFlow<String> = _guidanceInstruction.asStateFlow()

    private val _verticalClimbRequiredMeters = MutableStateFlow(0)
    val verticalClimbRequiredMeters: StateFlow<Int> = _verticalClimbRequiredMeters.asStateFlow()

    private val _corridorHazardWarning = MutableStateFlow<String?>(null)
    val corridorHazardWarning: StateFlow<String?> = _corridorHazardWarning.asStateFlow()

    private var lastHapticTriggerTime = 0L

    init {
        // Observe compass azimuth from LocalSensorManager
        scope.launch {
            sensorManager.compassAzimuthDegrees.collect { currentHeading ->
                updateNavigationMath(currentHeading)
            }
        }
    }

    fun setDestination(shelter: Shelter, userLat: Double, userLon: Double, strikes: List<LightningStrike>) {
        _selectedShelter.value = shelter
        _verticalClimbRequiredMeters.value = shelter.elevationGainMeters

        val distKm = GeoMath.calculateHaversineDistanceKm(userLat, userLon, shelter.latitude, shelter.longitude)
        _distanceMeters.value = (distKm * 1000.0 * 10.0).toInt() / 10.0

        val bearing = GeoMath.calculateBearingDegrees(userLat, userLon, shelter.latitude, shelter.longitude)
        _targetBearingDegrees.value = (bearing * 10.0).toInt() / 10.0

        // Check for hazard corridor conflicts (e.g. lightning strike directly in evacuation path)
        evaluateHazardCorridor(bearing, distKm, strikes)

        updateNavigationMath(sensorManager.compassAzimuthDegrees.value)
    }

    private fun updateNavigationMath(currentHeading: Float) {
        val shelter = _selectedShelter.value ?: return
        val targetBearing = _targetBearingDegrees.value

        // Relative deviation: targetBearing - currentHeading
        var diff = (targetBearing.toFloat() - currentHeading) % 360f
        if (diff > 180f) diff -= 360f
        if (diff < -180f) diff += 360f

        _relativeDeviationDegrees.value = (diff * 10f).toInt() / 10f
        homingBeeper.updateDeviation(diff)

        val absDiff = abs(diff)
        val aligned = absDiff <= 8f
        _isTargetAligned.value = aligned

        // Haptic feedback pulse on target lock (rate-limited to every 2.5s)
        if (aligned) {
            val now = System.currentTimeMillis()
            if (now - lastHapticTriggerTime > 2500L) {
                sensorManager.triggerWaypointAlignedHaptic()
                lastHapticTriggerTime = now
            }
        }

        val roundedDev = absDiff.toInt()
        _guidanceInstruction.value = when {
            absDiff <= 8f -> "▲ ON TARGET: PROCEED STRAIGHT (Bearing ${targetBearing.toInt()}°)"
            diff > 8f && diff <= 35f -> "▶ SLIGHT RIGHT ${roundedDev}°"
            diff > 35f && diff <= 110f -> "▶ TURN RIGHT ${roundedDev}°"
            diff < -8f && diff >= -35f -> "◀ SLIGHT LEFT ${roundedDev}°"
            diff < -35f && diff >= -110f -> "◀ TURN LEFT ${roundedDev}°"
            else -> "⚠️ REVERSE DIRECTION: Target is behind you (${roundedDev}°)"
        }
    }

    private fun evaluateHazardCorridor(targetBearing: Double, targetDistKm: Double, strikes: List<LightningStrike>) {
        val hazardousStrikes = strikes.filter { strike ->
            val distToStrike = strike.distanceKm
            // Strike is closer than or near the shelter
            if (distToStrike <= targetDistKm + 1.0) {
                var angleDiff = abs(strike.bearingDegrees - targetBearing)
                if (angleDiff > 180.0) angleDiff = 360.0 - angleDiff
                angleDiff <= 25.0 // Strike lies within a 25° corridor of the evacuation path
            } else {
                false
            }
        }

        if (hazardousStrikes.isNotEmpty()) {
            val closestThreat = hazardousStrikes.minByOrNull { it.distanceKm }
            _corridorHazardWarning.value = "⚠️ HAZARD CORRIDOR: Lightning strike detected ${closestThreat?.distanceKm} km along this bearing! Seek intermediate concrete cover or flank east/west."
        } else {
            _corridorHazardWarning.value = null
        }
    }

    fun toggleAcousticHoming() {
        if (homingBeeper.isHomingActive.value) {
            homingBeeper.stopHoming()
        } else {
            homingBeeper.startHoming()
        }
    }

    fun release() {
        homingBeeper.release()
        scope.cancel()
    }
}
