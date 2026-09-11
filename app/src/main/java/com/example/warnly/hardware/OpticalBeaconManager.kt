package com.example.warnly.hardware

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * FR-05: Morse SOS Optical Strobe
 * Blinks physical device camera flash & emits UI screen strobe in standard Morse:
 * S (...) O (---) S (...)
 */
class OpticalBeaconManager(private val context: Context) {

    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
    private var cameraId: String? = null
    private var strobeJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    private val _isStrobeActive = MutableStateFlow(false)
    val isStrobeActive: StateFlow<Boolean> = _isStrobeActive.asStateFlow()

    private val _screenFlashState = MutableStateFlow(false)
    val screenFlashState: StateFlow<Boolean> = _screenFlashState.asStateFlow()

    init {
        try {
            cameraManager?.cameraIdList?.firstOrNull { id ->
                val chars = cameraManager.getCameraCharacteristics(id)
                val hasFlash = chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) ?: false
                val facing = chars.get(CameraCharacteristics.LENS_FACING)
                hasFlash && facing == CameraCharacteristics.LENS_FACING_BACK
            }?.let {
                cameraId = it
            }
        } catch (e: Exception) {
            Log.e("WarnlyOptical", "Unable to query camera torch", e)
        }
    }

    fun startSosStrobe() {
        if (_isStrobeActive.value) return
        _isStrobeActive.value = true

        strobeJob = scope.launch {
            // Morse SOS timing (ms)
            // Dot: 150ms, Dash: 450ms, intra-element gap: 150ms, inter-letter: 450ms, inter-word: 1200ms
            try {
                while (isActive && _isStrobeActive.value) {
                    // 'S': . . .
                    flashSequence(booleanArrayOf(true, false, true, false, true))
                    delay(450)

                    // 'O': - - -
                    flashDash()
                    delay(150)
                    flashDash()
                    delay(150)
                    flashDash()
                    delay(450)

                    // 'S': . . .
                    flashSequence(booleanArrayOf(true, false, true, false, true))
                    delay(1200) // Word pause before repeat
                }
            } finally {
                setTorch(false)
                _screenFlashState.value = false
            }
        }
    }

    private suspend fun flashSequence(pattern: BooleanArray) {
        for (state in pattern) {
            setTorch(state)
            _screenFlashState.value = state
            delay(150)
        }
    }

    private suspend fun flashDash() {
        setTorch(true)
        _screenFlashState.value = true
        delay(450)
        setTorch(false)
        _screenFlashState.value = false
    }

    private fun setTorch(on: Boolean) {
        val cid = cameraId ?: return
        try {
            cameraManager?.setTorchMode(cid, on)
        } catch (e: CameraAccessException) {
            Log.w("WarnlyOptical", "CameraAccessException toggling torch", e)
        } catch (e: Exception) {
            Log.w("WarnlyOptical", "Failed setting torch mode", e)
        }
    }

    fun stopSosStrobe() {
        _isStrobeActive.value = false
        strobeJob?.cancel()
        strobeJob = null
        setTorch(false)
        _screenFlashState.value = false
    }

    fun release() {
        stopSosStrobe()
        scope.cancel()
    }
}
