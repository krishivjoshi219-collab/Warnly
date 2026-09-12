package com.example.warnly.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Log
import kotlinx.coroutines.*
import kotlin.math.sin

/**
 * FR-05: Software Siren Synthesizer
 * Synthesizes an 880Hz / 440Hz bi-tonal emergency siren via audio oscillators
 * with zero network download requirements.
 */
class AcousticSirenSynthesizer {

    private var audioTrack: AudioTrack? = null
    private var isPlaying = false
    private var sirenJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    fun isSirenActive(): Boolean = isPlaying

    @Synchronized
    fun startSiren() {
        if (isPlaying) return
        isPlaying = true

        sirenJob = scope.launch {
            try {
                val sampleRate = 44100
                val highFreq = 880.0 // Hz
                val lowFreq = 440.0  // Hz
                val toneDurationMs = 250L

                val minBufferSize = AudioTrack.getMinBufferSize(
                    sampleRate,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                )

                val bufferSize = (sampleRate * (toneDurationMs / 1000.0)).toInt() * 2
                val actualBufferSize = maxOf(minBufferSize, bufferSize)

                audioTrack = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(actualBufferSize)
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()

                audioTrack?.play()

                var toggle = false
                while (isPlaying && isActive) {
                    val currentFreq = if (toggle) highFreq else lowFreq
                    val samples = (sampleRate * (toneDurationMs / 1000.0)).toInt()
                    val pcmBuffer = ShortArray(samples)

                    for (i in 0 until samples) {
                        val angle = 2.0 * Math.PI * i / (sampleRate / currentFreq)
                        // Volume envelope to prevent harsh pops at boundaries
                        val envelope = when {
                            i < 100 -> i / 100.0
                            i > samples - 100 -> (samples - i) / 100.0
                            else -> 1.0
                        }
                        pcmBuffer[i] = (sin(angle) * 32767 * 0.85 * envelope).toInt().toShort()
                    }

                    audioTrack?.write(pcmBuffer, 0, pcmBuffer.size, AudioTrack.WRITE_BLOCKING)
                    toggle = !toggle
                }
            } catch (e: Exception) {
                Log.e("WarnlySiren", "Siren playback exception", e)
            } finally {
                stopInternal()
            }
        }
    }

    @Synchronized
    fun stopSiren() {
        isPlaying = false
        sirenJob?.cancel()
        sirenJob = null
        stopInternal()
    }

    private fun stopInternal() {
        try {
            audioTrack?.apply {
                if (playState == AudioTrack.PLAYSTATE_PLAYING) {
                    pause()
                    flush()
                    stop()
                }
                release()
            }
        } catch (e: Exception) {
            Log.e("WarnlySiren", "Error releasing AudioTrack", e)
        } finally {
            audioTrack = null
        }
    }

    fun release() {
        stopSiren()
        scope.cancel()
    }
}
