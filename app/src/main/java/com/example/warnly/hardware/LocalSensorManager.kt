package com.example.warnly.hardware

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Local Sensor & Edge Intelligence Manager
 * Operates 100% locally without cellular networks or internet.
 * Analyzes:
 *  1. Barometric Pressure Tendency (ΔP / Δt) for rapid convective / squall line detection.
 *  2. 3-Axis Accelerometer Peak Ground Acceleration (PGA) for seismic tremor detection.
 *  3. Hardware Magnetometer & Rotation Vector for smoothed azimuth compass heading.
 */
class LocalSensorManager(private val context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

    // Hardware Sensors
    private val pressureSensor: Sensor? = sensorManager?.getDefaultSensor(Sensor.TYPE_PRESSURE)
    private val rotationVectorSensor: Sensor? = sensorManager?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    private val accelerometerSensor: Sensor? = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val magneticSensor: Sensor? = sensorManager?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    // Vibrator for Haptic Waypoint Lock
    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    // Live Sensor State Flows
    private val _compassAzimuthDegrees = MutableStateFlow(0f)
    val compassAzimuthDegrees: StateFlow<Float> = _compassAzimuthDegrees.asStateFlow()

    private val _currentPressureHpa = MutableStateFlow(1013.25f)
    val currentPressureHpa: StateFlow<Float> = _currentPressureHpa.asStateFlow()

    private val _pressureTendencyHpaPerHour = MutableStateFlow(0f)
    val pressureTendencyHpaPerHour: StateFlow<Float> = _pressureTendencyHpaPerHour.asStateFlow()

    private val _barometricStatus = MutableStateFlow("Pressure Stable (Normal Atmosphere)")
    val barometricStatus: StateFlow<String> = _barometricStatus.asStateFlow()

    private val _hasHardwareBarometer = MutableStateFlow(pressureSensor != null)
    val hasHardwareBarometer: StateFlow<Boolean> = _hasHardwareBarometer.asStateFlow()

    // Seismic Acceleration & PGA
    private val _currentPgaG = MutableStateFlow(0f)
    val currentPgaG: StateFlow<Float> = _currentPgaG.asStateFlow()

    private val _maxPgaRecorded = MutableStateFlow(0f)
    val maxPgaRecorded: StateFlow<Float> = _maxPgaRecorded.asStateFlow()

    private val _isSeismicTremorDetected = MutableStateFlow(false)
    val isSeismicTremorDetected: StateFlow<Boolean> = _isSeismicTremorDetected.asStateFlow()

    // Sensor Fusion Temp Buffers
    private val rotationMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)
    private val lastAccelerometerValues = FloatArray(3)
    private val lastMagnetometerValues = FloatArray(3)
    private var hasAccelerometer = false
    private var hasMagnetometer = false

    // Barometer History Ring Buffer for ΔP/Δt analysis
    private data class PressureSample(val timestampMs: Long, val pressureHpa: Float)
    private val pressureHistory = mutableListOf<PressureSample>()

    // Compass Smoothing Filter (exponential moving average on circular angle)
    private var smoothedHeading = 0f

    // Simulated / Test Overrides for devices without specific sensors
    private var manualHeadingOverride: Float? = null

    init {
        startSensorListening()
    }

    fun startSensorListening() {
        sensorManager?.let { sm ->
            // Barometer
            pressureSensor?.let {
                sm.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
            }
            // Compass / Heading
            if (rotationVectorSensor != null) {
                sm.registerListener(this, rotationVectorSensor, SensorManager.SENSOR_DELAY_UI)
            } else {
                accelerometerSensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
                magneticSensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
            }
            // Accelerometer for PGA
            accelerometerSensor?.let {
                sm.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
        }
    }

    fun stopSensorListening() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_PRESSURE -> {
                val hpa = event.values[0]
                processBarometricReading(hpa)
            }
            Sensor.TYPE_ROTATION_VECTOR -> {
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                SensorManager.getOrientation(rotationMatrix, orientationAngles)
                val rawHeadingRad = orientationAngles[0]
                var rawDegrees = Math.toDegrees(rawHeadingRad.toDouble()).toFloat()
                if (rawDegrees < 0) rawDegrees += 360f
                updateSmoothedHeading(rawDegrees)
            }
            Sensor.TYPE_ACCELEROMETER -> {
                System.arraycopy(event.values, 0, lastAccelerometerValues, 0, 3)
                hasAccelerometer = true
                processSeismicAccelerometer(event.values[0], event.values[1], event.values[2])
                if (rotationVectorSensor == null && hasMagnetometer) {
                    computeOrientationFromAccMag()
                }
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                System.arraycopy(event.values, 0, lastMagnetometerValues, 0, 3)
                hasMagnetometer = true
                if (rotationVectorSensor == null && hasAccelerometer) {
                    computeOrientationFromAccMag()
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Calibration notifications if needed
    }

    private fun computeOrientationFromAccMag() {
        val success = SensorManager.getRotationMatrix(
            rotationMatrix,
            null,
            lastAccelerometerValues,
            lastMagnetometerValues
        )
        if (success) {
            SensorManager.getOrientation(rotationMatrix, orientationAngles)
            var rawDegrees = Math.toDegrees(orientationAngles[0].toDouble()).toFloat()
            if (rawDegrees < 0) rawDegrees += 360f
            updateSmoothedHeading(rawDegrees)
        }
    }

    private fun updateSmoothedHeading(rawHeading: Float) {
        val override = manualHeadingOverride
        if (override != null) {
            _compassAzimuthDegrees.value = override
            return
        }

        // Circular interpolation to avoid 359° -> 1° wrap-around smoothing artifact
        var diff = rawHeading - smoothedHeading
        while (diff < -180f) diff += 360f
        while (diff > 180f) diff -= 360f

        val alpha = 0.20f // Fast responsive smoothing
        smoothedHeading = (smoothedHeading + alpha * diff + 360f) % 360f
        _compassAzimuthDegrees.value = (smoothedHeading * 10f).toInt() / 10f
    }

    /**
     * Analyze Barometric Pressure Tendency (Local Storm Front Detection)
     */
    fun processBarometricReading(hpa: Float) {
        _currentPressureHpa.value = (hpa * 10f).toInt() / 10f
        val now = System.currentTimeMillis()

        synchronized(pressureHistory) {
            pressureHistory.add(PressureSample(now, hpa))
            // Keep past 3 hours of readings
            val threeHoursAgo = now - (3 * 3600 * 1000L)
            pressureHistory.removeAll { it.timestampMs < threeHoursAgo }

            if (pressureHistory.size >= 2) {
                val oldest = pressureHistory.first()
                val deltaHours = (now - oldest.timestampMs) / 3600000.0f
                if (deltaHours > 0.05f) {
                    val deltaHpa = hpa - oldest.pressureHpa
                    val ratePerHour = deltaHpa / deltaHours
                    _pressureTendencyHpaPerHour.value = (ratePerHour * 10f).toInt() / 10f

                    _barometricStatus.value = when {
                        ratePerHour <= -2.5f -> "⚠️ CRITICAL DROP (${String.format("%.1f", ratePerHour)} hPa/h): Severe Convective Front"
                        ratePerHour <= -1.2f -> "⚡ RAPID FALL (${String.format("%.1f", ratePerHour)} hPa/h): Thunderstorm Approaching"
                        ratePerHour <= -0.5f -> "📉 Falling Barometer (${String.format("%.1f", ratePerHour)} hPa/h): Unsettled Weather"
                        ratePerHour >= 1.5f -> "📈 Rapid Rise (${String.format("%.1f", ratePerHour)} hPa/h): Post-Storm Pressure Surge"
                        else -> "✅ Pressure Stable (${String.format("%.1f", ratePerHour)} hPa/h)"
                    }
                }
            }
        }
    }

    /**
     * Analyze Seismic Peak Ground Acceleration (PGA)
     */
    private fun processSeismicAccelerometer(ax: Float, ay: Float, az: Float) {
        val totalMagnitude = sqrt((ax * ax + ay * ay + az * az).toDouble()).toFloat()
        val dynamicAccel = abs(totalMagnitude - 9.81f) // Remove static 1g earth gravity
        val pgaInG = dynamicAccel / 9.81f

        _currentPgaG.value = (pgaInG * 100f).toInt() / 100f

        if (pgaInG > _maxPgaRecorded.value) {
            _maxPgaRecorded.value = (pgaInG * 100f).toInt() / 100f
        }

        // Seismic trigger: >0.06g sustained shaking threshold
        val isTremor = pgaInG >= 0.06f
        _isSeismicTremorDetected.value = isTremor
    }

    /**
     * Trigger Haptic Feedback Pulse for Target Waypoint Alignment
     */
    fun triggerWaypointAlignedHaptic() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(45)
            }
        } catch (e: Exception) {
            Log.w("LocalSensorManager", "Haptic pulse unavailable", e)
        }
    }

    /**
     * Manual Compass Steer Override (for testing on desktop emulators)
     */
    fun setManualHeading(degrees: Float?) {
        manualHeadingOverride = degrees
        if (degrees != null) {
            _compassAzimuthDegrees.value = degrees
        }
    }

    /**
     * Inject a simulated sudden barometric drop for testing local storm analysis
     */
    fun simulateBarometricDrop() {
        val baseline = _currentPressureHpa.value
        val dropTarget = baseline - 4.2f // Severe squall line pressure plunge
        val now = System.currentTimeMillis()

        synchronized(pressureHistory) {
            pressureHistory.clear()
            pressureHistory.add(PressureSample(now - 3600000L, baseline))
            pressureHistory.add(PressureSample(now, dropTarget))
        }
        processBarometricReading(dropTarget)
    }

    /**
     * Reset sensor records
     */
    fun resetSensors() {
        _maxPgaRecorded.value = 0f
        _isSeismicTremorDetected.value = false
        manualHeadingOverride = null
        val normalHpa = 1013.25f
        val now = System.currentTimeMillis()
        synchronized(pressureHistory) {
            pressureHistory.clear()
            pressureHistory.add(PressureSample(now - 3600000L, normalHpa))
            pressureHistory.add(PressureSample(now, normalHpa))
        }
        processBarometricReading(normalHpa)
    }

    fun release() {
        stopSensorListening()
    }
}
