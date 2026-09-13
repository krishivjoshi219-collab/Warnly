package com.warnly.convective

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import kotlin.math.sin

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager

class WarnlyEmergencyModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var audioTrack: AudioTrack? = null
    @Volatile
    private var isPlayingSiren = false
    private var sirenThread: Thread? = null

    // Hardware MEMS Barometer (zero-internet offline pressure telemetry)
    private var sensorManager: SensorManager? = null
    private var pressureSensor: Sensor? = null
    private var barometerListener: SensorEventListener? = null
    private val pressureHistory = mutableListOf<Pair<Long, Float>>()
    @Volatile
    private var latestPressureHpa: Float? = null

    companion object {
        const val NAME = "WarnlyEmergencyModule"
        const val CHANNEL_ID = "warnly_critical_channel"
        const val NOTIFICATION_ID = 9001
        private const val TAG = "WarnlyEmergencyModule"
    }

    override fun getName(): String = NAME

    init {
        // Automatically ensure the high-priority DND bypass channel is created on initialization
        setupNotificationChannelInternal()
        setupBarometerInternal()
    }

    private fun setupBarometerInternal() {
        try {
            sensorManager = reactApplicationContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            pressureSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_PRESSURE)
            if (pressureSensor != null) {
                barometerListener = object : SensorEventListener {
                    override fun onSensorChanged(event: SensorEvent) {
                        if (event.sensor.type == Sensor.TYPE_PRESSURE && event.values.isNotEmpty()) {
                            val hpa = event.values[0]
                            latestPressureHpa = hpa
                            val now = System.currentTimeMillis()
                            synchronized(pressureHistory) {
                                pressureHistory.add(Pair(now, hpa))
                                // Keep last 3 hours of readings
                                val threeHoursAgo = now - 3 * 60 * 60 * 1000
                                pressureHistory.removeAll { it.first < threeHoursAgo }
                            }
                        }
                    }
                    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
                }
                sensorManager?.registerListener(
                    barometerListener,
                    pressureSensor,
                    SensorManager.SENSOR_DELAY_NORMAL
                )
                Log.i(TAG, "Hardware barometer sensor (TYPE_PRESSURE) registered successfully")
            } else {
                Log.w(TAG, "Device does not possess a hardware ambient pressure sensor (TYPE_PRESSURE)")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize hardware barometer", e)
        }
    }

    private fun setupNotificationChannelInternal() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            if (nm != null) {
                val name = "Warnly Critical Life-Safety Alerts"
                val descriptionText = "Breakthrough alarms for severe lightning breaches, seismic shaking, and flash floods."
                val importance = NotificationManager.IMPORTANCE_HIGH
                val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                    description = descriptionText
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 400, 200, 400, 200, 400)
                    // Request OS permission to bypass DND
                    setBypassDnd(true)
                    lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                    val audioAttributes = AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                    setSound(Settings.System.DEFAULT_ALARM_ALERT_URI, audioAttributes)
                }
                nm.createNotificationChannel(channel)
                Log.i(TAG, "Created critical notification channel with DND bypass flag")
            }
        }
    }

    @ReactMethod
    fun setupEmergencyNotificationChannel() {
        setupNotificationChannelInternal()
    }

    /**
     * Checks if the app has been granted Notification Policy Access (DND Bypass).
     */
    @ReactMethod
    fun checkDndPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val nm = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                val isGranted = nm?.isNotificationPolicyAccessGranted ?: false
                promise.resolve(isGranted)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("DND_CHECK_ERR", e.message)
        }
    }

    /**
     * Opens Android System Settings directly to Notification Policy Access (DND Access)
     * so user can toggle DND override permission for Warnly.
     */
    @ReactMethod
    fun requestDndPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactApplicationContext.startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Could not open DND settings intent", e)
            }
        }
    }

    /**
     * Starts dual-tone emergency siren routed through USAGE_ALARM (STREAM_ALARM).
     * This punches through DND and Silent mode on Android hardware.
     */
    @ReactMethod
    fun startAlarmSiren() {
        if (isPlayingSiren) {
            Log.d(TAG, "startAlarmSiren called but siren is already active")
            return
        }
        isPlayingSiren = true
        Log.i(TAG, "Starting emergency alarm siren with STREAM_ALARM routing")

        try {
            val am = reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            if (am != null) {
                val maxVol = am.getStreamMaxVolume(AudioManager.STREAM_ALARM)
                val curVol = am.getStreamVolume(AudioManager.STREAM_ALARM)
                Log.i(TAG, "STREAM_ALARM volume is $curVol/$maxVol")
                if (curVol < (maxVol * 0.7).toInt()) {
                    val boosted = (maxVol * 0.85).toInt().coerceAtLeast(1)
                    am.setStreamVolume(AudioManager.STREAM_ALARM, boosted, 0)
                    Log.i(TAG, "Boosted STREAM_ALARM volume to $boosted")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Could not adjust alarm stream volume", e)
        }

        sirenThread = Thread {
            val sampleRate = 44100
            val highFreq = 960.0
            val lowFreq = 640.0
            val halfPeriodSec = 0.45 // 450 ms per tone

            val minBufSize = AudioTrack.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            val audioAttr = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                .build()

            val audioFormat = AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setSampleRate(sampleRate)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .build()

            val track = AudioTrack.Builder()
                .setAudioAttributes(audioAttr)
                .setAudioFormat(audioFormat)
                .setBufferSizeInBytes(maxOf(minBufSize, sampleRate * 2))
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()

            if (track.state != AudioTrack.STATE_INITIALIZED) {
                Log.e(TAG, "AudioTrack failed to initialize! state=${track.state}")
                isPlayingSiren = false
                return@Thread
            }

            audioTrack = track

            try {
                track.play()
                var toggle = false
                val bufferSamples = (sampleRate * halfPeriodSec).toInt()
                val pcmBuffer = ShortArray(bufferSamples)

                Log.i(TAG, "Emergency siren loop running on high-priority audio thread")
                while (isPlayingSiren && !Thread.currentThread().isInterrupted) {
                    val currentFreq = if (toggle) highFreq else lowFreq
                    val angularFreq = 2.0 * Math.PI * currentFreq / sampleRate

                    for (i in 0 until bufferSamples) {
                        // Generate smooth sine wave at high amplitude
                        val sample = (sin(angularFreq * i) * 30000.0).toInt().coerceIn(-32767, 32767)
                        pcmBuffer[i] = sample.toShort()
                    }

                    track.write(pcmBuffer, 0, bufferSamples, AudioTrack.WRITE_BLOCKING)
                    toggle = !toggle
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error playing emergency alarm siren", e)
            } finally {
                try {
                    track.stop()
                    track.release()
                } catch (ignored: Exception) {}
                audioTrack = null
                Log.i(TAG, "Emergency siren stopped and AudioTrack released")
            }
        }.apply {
            priority = Thread.MAX_PRIORITY
            start()
        }
    }

    /**
     * Stops the alarm siren immediately.
     */
    @ReactMethod
    fun stopAlarmSiren() {
        Log.i(TAG, "stopAlarmSiren called, interrupting siren thread")
        isPlayingSiren = false
        sirenThread?.interrupt()
        sirenThread = null
    }

    /**
     * Posts a critical breakthrough notification to the status bar and lock screen.
     */
    @ReactMethod
    fun postCriticalAlert(title: String, message: String) {
        val nm = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            ?: return

        val launchIntent = reactApplicationContext.packageManager.getLaunchIntentForPackage(reactApplicationContext.packageName)
        val pendingIntent = if (launchIntent != null) {
            PendingIntent.getActivity(
                reactApplicationContext,
                0,
                launchIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )
        } else null

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(reactApplicationContext, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(reactApplicationContext)
        }

        builder.setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setAutoCancel(true)
            .setOngoing(false)

        if (pendingIntent != null) {
            builder.setContentIntent(pendingIntent)
            builder.setFullScreenIntent(pendingIntent, true)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder.setCategory(Notification.CATEGORY_ALARM)
            builder.setVisibility(Notification.VISIBILITY_PUBLIC)
            builder.setPriority(Notification.PRIORITY_MAX)
        }

        Log.i(TAG, "Posting critical notification: $title - $message")
        nm.notify(NOTIFICATION_ID, builder.build())
    }

    /**
     * Checks if ACCESS_FINE_LOCATION or ACCESS_COARSE_LOCATION has been granted by user.
     */
    @ReactMethod
    fun checkLocationPermission(promise: Promise) {
        try {
            val hasFine = ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
            val hasCoarse = ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
            promise.resolve(hasFine || hasCoarse)
        } catch (e: Exception) {
            promise.reject("PERM_CHECK_ERR", e.message)
        }
    }

    /**
     * Opens Android System Settings directly to Location Settings
     */
    @ReactMethod
    fun openLocationSettings() {
        try {
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Could not open location settings", e)
        }
    }

    /**
     * Obtains true offline hardware GPS coordinates via Android LocationManager.
     * Integrates directly with satellite GPS chips (GPS_PROVIDER) and cellular hardware (NETWORK_PROVIDER).
     * Works 100% offline with zero internet access during severe disaster infrastructure failures.
     */
    @ReactMethod
    fun getHardwareLocation(promise: Promise) {
        val lm = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (lm == null) {
            promise.reject("NO_LOCATION_SERVICE", "Hardware LocationManager service unavailable")
            return
        }

        val hasFine = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasFine && !hasCoarse) {
            promise.reject("PERMISSION_DENIED", "ACCESS_FINE_LOCATION or ACCESS_COARSE_LOCATION permission required")
            return
        }

        val isGpsEnabled = try { lm.isProviderEnabled(LocationManager.GPS_PROVIDER) } catch (e: Exception) { false }
        val isNetworkEnabled = try { lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) } catch (e: Exception) { false }

        if (!isGpsEnabled && !isNetworkEnabled) {
            promise.reject("LOCATION_DISABLED", "Device GPS and Location Services are disabled. Please enable Location.")
            return
        }

        // 1. Fast check for best recent cached hardware location
        var bestLocation: Location? = null
        try {
            if (isGpsEnabled) {
                val gpsLoc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                if (gpsLoc != null) {
                    bestLocation = gpsLoc
                }
            }
            if (isNetworkEnabled) {
                val netLoc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                if (netLoc != null) {
                    if (bestLocation == null || netLoc.time > bestLocation.time) {
                        bestLocation = netLoc
                    }
                }
            }
        } catch (e: SecurityException) {
            promise.reject("SECURITY_EXCEPTION", e.message)
            return
        }

        // If cached hardware location is fresh (< 2 minutes old), return immediately
        val twoMinAgo = System.currentTimeMillis() - 2 * 60 * 1000
        if (bestLocation != null && bestLocation.time > twoMinAgo) {
            val map = Arguments.createMap().apply {
                putDouble("latitude", bestLocation.latitude)
                putDouble("longitude", bestLocation.longitude)
                putDouble("altitude", bestLocation.altitude)
                putDouble("accuracy", bestLocation.accuracy.toDouble())
                putDouble("timestamp", bestLocation.time.toDouble())
                putString("provider", bestLocation.provider ?: "hardware_gps")
            }
            promise.resolve(map)
            return
        }

        // 2. Request live hardware GPS satellite fix
        val mainHandler = Handler(Looper.getMainLooper())
        var resolved = false

        val listener = object : LocationListener {
            override fun onLocationChanged(loc: Location) {
                if (resolved) return
                resolved = true
                try {
                    lm.removeUpdates(this)
                } catch (ignored: Exception) {}
                val map = Arguments.createMap().apply {
                    putDouble("latitude", loc.latitude)
                    putDouble("longitude", loc.longitude)
                    putDouble("altitude", loc.altitude)
                    putDouble("accuracy", loc.accuracy.toDouble())
                    putDouble("timestamp", loc.time.toDouble())
                    putString("provider", loc.provider ?: "satellite_gps")
                }
                promise.resolve(map)
            }
            @Deprecated("Deprecated in Java")
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
            override fun onProviderEnabled(provider: String) {}
            override fun onProviderDisabled(provider: String) {}
        }

        // 8-second safety timeout: fall back to last known location or reject
        mainHandler.postDelayed({
            if (!resolved) {
                resolved = true
                try {
                    lm.removeUpdates(listener)
                } catch (ignored: Exception) {}
                if (bestLocation != null) {
                    val map = Arguments.createMap().apply {
                        putDouble("latitude", bestLocation.latitude)
                        putDouble("longitude", bestLocation.longitude)
                        putDouble("altitude", bestLocation.altitude)
                        putDouble("accuracy", bestLocation.accuracy.toDouble())
                        putDouble("timestamp", bestLocation.time.toDouble())
                        putString("provider", "${bestLocation.provider ?: "hardware"}_cached")
                    }
                    promise.resolve(map)
                } else {
                    promise.reject("TIMEOUT", "Hardware GPS timed out waiting for satellite fix")
                }
            }
        }, 3500)

        mainHandler.post {
            try {
                if (isGpsEnabled) {
                    lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 1.0f, listener, Looper.getMainLooper())
                }
                if (isNetworkEnabled) {
                    lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000L, 1.0f, listener, Looper.getMainLooper())
                }
            } catch (e: SecurityException) {
                if (!resolved) {
                    resolved = true
                    promise.reject("SECURITY_EXCEPTION", e.message)
                }
            } catch (e: Exception) {
                if (!resolved) {
                    resolved = true
                    promise.reject("GPS_REQUEST_ERR", e.message)
                }
            }
        }
    }

    /**
     * Checks if the device has a physical onboard MEMS barometer sensor.
     */
    @ReactMethod
    fun hasHardwareBarometer(promise: Promise) {
        promise.resolve(pressureSensor != null)
    }

    /**
     * Reads the real-time atmospheric pressure directly from the physical phone sensor.
     * Computes pressure tendency (dP/dt in hPa/hour) completely offline without internet.
     */
    @ReactMethod
    fun getHardwareBarometer(promise: Promise) {
        val curP = latestPressureHpa
        if (pressureSensor == null || curP == null) {
            val map = Arguments.createMap().apply {
                putBoolean("hasHardwareBarometer", pressureSensor != null)
                putDouble("currentPressureHpa", curP?.toDouble() ?: 0.0)
                putDouble("trendHpaPerHour", 0.0)
                putBoolean("isPressurePlunging", false)
                putInt("readingCount", pressureHistory.size)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            promise.resolve(map)
            return
        }

        val now = System.currentTimeMillis()
        var trendHpaPerHour = 0.0
        var isPlunging = false

        synchronized(pressureHistory) {
            if (pressureHistory.size >= 2) {
                // Find reference reading ~30 to 60 minutes ago
                val oneHourAgo = now - 60 * 60 * 1000
                var reference = pressureHistory.first()
                for (reading in pressureHistory) {
                    if (reading.first <= oneHourAgo) {
                        reference = reading
                    } else {
                        break
                    }
                }
                val dtHours = (now - reference.first) / (1000.0 * 60.0 * 60.0)
                if (dtHours >= 0.03) { // At least 2 minutes of sensor readings
                    val dP = curP - reference.second
                    trendHpaPerHour = (dP / dtHours).toDouble()
                    // Sudden microburst / severe thunderstorm surge condition: <= -1.5 hPa/hr
                    if (trendHpaPerHour <= -1.5 || (dtHours >= 0.2 && dP <= -0.8f)) {
                        isPlunging = true
                    }
                }
            }
        }

        val map = Arguments.createMap().apply {
            putBoolean("hasHardwareBarometer", true)
            putDouble("currentPressureHpa", Math.round(curP.toDouble() * 100.0) / 100.0)
            putDouble("trendHpaPerHour", Math.round(trendHpaPerHour * 100.0) / 100.0)
            putBoolean("isPressurePlunging", isPlunging)
            putInt("readingCount", pressureHistory.size)
            putDouble("timestamp", now.toDouble())
        }
        promise.resolve(map)
    }

    /**
     * Explicit start/stop triggers for hardware barometer sensor
     */
    @ReactMethod
    fun startHardwareBarometer() {
        setupBarometerInternal()
    }

    @ReactMethod
    fun stopHardwareBarometer() {
        try {
            if (barometerListener != null) {
                sensorManager?.unregisterListener(barometerListener)
                barometerListener = null
            }
        } catch (ignored: Exception) {}
    }
}
