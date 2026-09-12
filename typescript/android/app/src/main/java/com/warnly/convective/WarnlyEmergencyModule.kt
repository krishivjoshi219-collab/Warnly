package com.warnly.convective

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlin.math.sin

class WarnlyEmergencyModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var audioTrack: AudioTrack? = null
    @Volatile
    private var isPlayingSiren = false
    private var sirenThread: Thread? = null

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
}
