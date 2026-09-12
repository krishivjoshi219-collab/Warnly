package com.example.warnly.ui.main

import com.example.warnly.ui.AppNavTab
import org.junit.Assert.assertEquals
import org.junit.Test

class WarnlyViewModelTest {

    @Test
    fun testAppNavTabEnum() {
        assertEquals(10, AppNavTab.values().size)
        assertEquals("Radar & Rings", AppNavTab.RADAR.title)
        assertEquals("Offline Nav", AppNavTab.NAVIGATE.title)
        assertEquals("Edge AI", AppNavTab.EDGE_AI.title)
        assertEquals("Multi-Hazard", AppNavTab.HAZARDS.title)
        assertEquals("P2P Mesh", AppNavTab.MESH.title)
        assertEquals("Survival", AppNavTab.BLACKOUT.title)
        assertEquals("Shelters", AppNavTab.SHELTERS.title)
        assertEquals("Family Shield", AppNavTab.FAMILY_SHIELD.title)
        assertEquals("Protocols", AppNavTab.PROTOCOLS.title)
        assertEquals("Test Hub", AppNavTab.SIMULATOR.title)
    }

    @Test
    fun testTabInitialState() {
        val tab = AppNavTab.RADAR
        assertEquals("📡", tab.icon)
    }
}
