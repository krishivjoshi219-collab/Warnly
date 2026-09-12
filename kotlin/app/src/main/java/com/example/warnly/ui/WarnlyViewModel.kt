package com.example.warnly.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.example.warnly.data.DisasterRepository
import com.example.warnly.model.*
import com.example.warnly.service.DisasterEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AppNavTab(val title: String, val icon: String, val shortTag: String = "") {
    RADAR("Radar & Rings", "📡", "RADAR"),
    NAVIGATE("Offline Nav", "🧭", "NAV HUD"),
    EDGE_AI("Edge AI", "⚡", "EDGE AI"),
    HAZARDS("Multi-Hazard", "⚠️", "HAZARDS"),
    MESH("P2P Mesh", "📶", "MESH P2P"),
    BLACKOUT("Survival", "🔋", "BLACKOUT"),
    SHELTERS("Shelters", "🛡️", "SHELTERS"),
    FAMILY_SHIELD("Family Shield", "👨‍👩‍👧", "SHIELD"),
    PROTOCOLS("Protocols", "📋", "PROTOCOLS"),
    SIMULATOR("Test Hub", "🧪", "SIM LAB")
}

enum class StationCategory(val label: String, val icon: String) {
    SURVEILLANCE("SURV", "📡"),
    HAZARDS("HAZARDS", "⚠️"),
    OFF_GRID("OFF-GRID", "📶"),
    OPERATIONS("OPS", "🎛️")
}

fun AppNavTab.getCategory(): StationCategory = when (this) {
    AppNavTab.RADAR, AppNavTab.NAVIGATE, AppNavTab.EDGE_AI -> StationCategory.SURVEILLANCE
    AppNavTab.HAZARDS, AppNavTab.SHELTERS, AppNavTab.FAMILY_SHIELD -> StationCategory.HAZARDS
    AppNavTab.MESH, AppNavTab.BLACKOUT -> StationCategory.OFF_GRID
    AppNavTab.PROTOCOLS, AppNavTab.SIMULATOR -> StationCategory.OPERATIONS
}

fun StationCategory.getTabs(): List<AppNavTab> = when (this) {
    StationCategory.SURVEILLANCE -> listOf(AppNavTab.RADAR, AppNavTab.NAVIGATE, AppNavTab.EDGE_AI)
    StationCategory.HAZARDS -> listOf(AppNavTab.HAZARDS, AppNavTab.SHELTERS, AppNavTab.FAMILY_SHIELD)
    StationCategory.OFF_GRID -> listOf(AppNavTab.MESH, AppNavTab.BLACKOUT)
    StationCategory.OPERATIONS -> listOf(AppNavTab.PROTOCOLS, AppNavTab.SIMULATOR)
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
