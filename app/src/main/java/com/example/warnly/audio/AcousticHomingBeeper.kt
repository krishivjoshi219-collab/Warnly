package com.example.warnly.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.PI
import kotlin.math.sin

/**
 * Directional Acoustic Homing Beacon Synthesizer
 * Synthesizes dynamic sonar pings directly in RAM via AudioTrack.
 * Enables zero-visibility blind evacuation (smoke, torrential downpour, night power outages).
 * Pulse rate and frequency adapt in real-time to compass alignment:
 *  - Aligned (±10°): Rapid 1200 Hz high-pitch chirps (5 pings/sec)
 *  - Misaligned: Slow 440 Hz low-pitch pings (1 ping/sec)
 */
class AcousticHomingBeeper {

    private val sampleRate = 44100
    private var isPlaying = false
    private var beeperJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    private val _isHomingActive = MutableStateFlow(false)
    val isHomingActive: StateFlow<Boolean> = _isHomingActive.asStateFlow()

    private var currentDeviationDegrees: Float = 0f

    fun updateDeviation(deviationDegrees: Float) {
        currentDeviationDegrees = deviationDegrees
    }

    fun startHoming() {
        if (isPlaying) return
        isPlaying = true
        _isHomingActive.value = true

        beeperJob = scope.launch {
            while (isActive && isPlaying) {
                val absDev = kotlin.math.abs(currentDeviationDegrees)
                val isAligned = absDev <= 12f

                // Dynamic Pitch and Cadence based on alignment
                val freq = if (isAligned) 1200.0 else 520.0
                val pulseDurationMs = if (isAligned) 60 else 100
                val sleepIntervalMs = when {
                    absDev <= 8f -> 120L   // Rapid continuous lock-on sonar
                    absDev <= 25f -> 260L  // Near alignment
                    absDev <= 60f -> 550L  // Moderate off-course
                    else -> 900L           // Far off-course
                }

                playTonePulse(freq, pulseDurationMs)
                delay(sleepIntervalMs)
            }
        }
    }

    fun stopHoming() {
        isPlaying = false
        _isHomingActive.value = false
        beeperJob?.cancel()
        beeperJob = null
    }

    private fun playTonePulse(frequency: Double, durationMs: Int) {
        try {
            val numSamples = (durationMs * sampleRate) / 1000
            val samples = ShortArray(numSamples)

            for (i in 0 until numSamples) {
                // Smooth Hann envelope to prevent clicking
                val envelope = 0.5 * (1.0 - kotlin.math.cos(2.0 * PI * i / numSamples))
                val angle = 2.0 * PI * i / (sampleRate / frequency)
                val rawVal = (sin(angle) * envelope * Short.MAX_VALUE * 0.75).toInt()
                samples[i] = rawVal.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
            }

            val bufferSize = numSamples * 2
            val audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(bufferSize)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            audioTrack.write(samples, 0, samples.size)
            audioTrack.play()

            // Release after pulse completes
            scope.launch {
                delay(durationMs + 30L)
                try {
                    audioTrack.stop()
                    audioTrack.release()
                } catch (ignored: Exception) {}
            }
        } catch (e: Exception) {
            Log.w("AcousticHomingBeeper", "Pulse play failed", e)
        }
    }

    fun release() {
        stopHoming()
        scope.cancel()
    }
}
