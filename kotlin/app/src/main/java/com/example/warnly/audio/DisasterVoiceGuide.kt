package com.example.warnly.audio

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

/**
 * Hands-Free Offline Disaster Voice Guide
 * Utilizes on-device Android Text-To-Speech (TTS) for eyes-free spoken instructions.
 * Critical for evacuees running in darkness, thick smoke, or assisting injured dependents.
 */
class DisasterVoiceGuide(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    private val _isVoiceActive = MutableStateFlow(true)
    val isVoiceActive: StateFlow<Boolean> = _isVoiceActive.asStateFlow()

    private var lastSpokenMessage = ""
    private var lastSpokenTimestamp = 0L

    init {
        try {
            tts = TextToSpeech(context.applicationContext, this)
        } catch (e: Exception) {
            Log.w("DisasterVoiceGuide", "TTS init failed", e)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            tts?.setSpeechRate(1.1f) // Slightly brisk, clear emergency pace
            tts?.setPitch(1.0f)
            isInitialized = true
        }
    }

    fun toggleVoice() {
        _isVoiceActive.value = !_isVoiceActive.value
        if (!_isVoiceActive.value) {
            tts?.stop()
        }
    }

    /**
     * Speak a critical life-safety instruction out loud
     */
    fun speakUrgentDirective(text: String, isHighPriority: Boolean = false) {
        if (!_isVoiceActive.value || !isInitialized) return

        val now = System.currentTimeMillis()
        // Rate limit non-priority repeated announcements to once every 10 seconds
        if (!isHighPriority && text == lastSpokenMessage && (now - lastSpokenTimestamp < 10000L)) {
            return
        }

        lastSpokenMessage = text
        lastSpokenTimestamp = now

        val queueMode = if (isHighPriority) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD
        tts?.speak(text, queueMode, null, "WARNLY_VOICE_${now}")
    }

    fun release() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}
