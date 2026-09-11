package com.example.warnly.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.example.warnly.data.DisasterRepository
import com.example.warnly.model.*
import com.example.warnly.service.DisasterEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AppNavTab(val title: String, val icon: String) {
    RADAR("Radar & Rings", "📡"),
    NAVIGATE("Offline Nav", "🧭"),
    EDGE_AI("Edge AI", "⚡"),
    HAZARDS("Multi-Hazard", "⚠️"),
    MESH("P2P Mesh", "📶"),
    BLACKOUT("Survival", "🔋"),
    SHELTERS("Shelters", "🛡️"),
    FAMILY_SHIELD("Family Shield", "👨‍👩‍👧"),
    PROTOCOLS("Protocols", "📋"),
    SIMULATOR("Test Hub", "🧪")
}

class WarnlyViewModel(application: Application) : AndroidViewModel(application) {

    val engine = DisasterEngine(application.applicationContext)

    private val _currentTab = MutableStateFlow(AppNavTab.RADAR)
    val currentTab: StateFlow<AppNavTab> = _currentTab.asStateFlow()

    val protocols = DisasterRepository.demographicProtocols

    fun setTab(tab: AppNavTab) {
        _currentTab.value = tab
    }

    override fun onCleared() {
        super.onCleared()
        engine.release()
    }
}
