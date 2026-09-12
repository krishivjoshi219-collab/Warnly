package com.example.warnly

import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.example.warnly.data.DisasterRepository
import com.example.warnly.hardware.LocalSensorManager
import com.example.warnly.mesh.P2PDisasterMesh
import com.example.warnly.model.AlertLevel
import com.example.warnly.physics.GeoMath
import com.example.warnly.physics.TsunamiInundationEngine
import com.example.warnly.service.DisasterEngine
import com.example.warnly.telephony.CompressedSmsBeacon
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.FixMethodOrder
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.MethodSorters
import kotlin.system.measureNanoTime

@RunWith(AndroidJUnit4::class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class DisasterSimulationBenchmarkTest {

    private lateinit var engine: DisasterEngine
    private val context get() = InstrumentationRegistry.getInstrumentation().targetContext

    companion object {
        private const val TAG = "WARNLY_BENCHMARK"
    }

    @Before
    fun setUp() {
        engine = DisasterEngine(context)
    }

    @After
    fun tearDown() {
        engine.release()
    }

    @Test
    fun test01_engineHardwareInitialization() {
        val elapsedMs = measureNanoTime {
            assertNotNull("Context must not be null", context)
            assertNotNull("Engine must initialize", engine)
            assertEquals("Default state must be SAFE", AlertLevel.SAFE, engine.alertLevel.value)
            assertEquals("Default risk must be 0%", 0, engine.atmosphericIndices.value.calculatedRiskPercent)
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | Engine Hardware Init | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
        assertTrue("Init should complete in < 200ms", elapsedMs < 200.0)
    }

    @Test
    fun test02_convectiveSuperTyphoonSimulationDrill() {
        runBlocking {
            var elapsedMs = 0.0
            withContext(Dispatchers.Main) {
                val nano = measureNanoTime {
                    // Ingest 13.5 km strike (Advisory)
                    engine.ingestLightningStrike(37.7749 + 0.038, -122.4194 - 0.115, -48.2)
                    assertEquals(AlertLevel.ADVISORY, engine.alertLevel.value)

                    // Ingest 7.4 km strike (Danger Breach)
                    engine.ingestLightningStrike(37.7749 + 0.018, -122.4194 - 0.062, -74.6)
                    assertEquals(AlertLevel.DANGER, engine.alertLevel.value)
                    assertTrue("Nearest strike must be <= 10.0 km", engine.nearestStrikeDistanceKm.value!! <= 10.0)
                    assertEquals("Should contain 2 strikes", 2, engine.strikes.value.size)
                }
                elapsedMs = nano / 1_000_000.0
            }

            Log.i(TAG, "BENCHMARK_RESULT | Convective Super Typhoon Drill | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
        }
    }

    @Test
    fun test03_seismicMegaquakePSDifferentialDrill() {
        runBlocking {
            val distKm = 72.0
            var leadSec = 0
            val elapsedMs = measureNanoTime {
                leadSec = GeoMath.calculateSWaveLeadTimeSeconds(distKm)
                assertEquals("P/S differential lead time for 72km must be 9s", 9, leadSec)

                withContext(Dispatchers.Main) {
                    engine.simulateSeismicEvent()
                }
                kotlinx.coroutines.delay(100L)
                assertEquals("Seismic alert must trigger DANGER", AlertLevel.DANGER, engine.alertLevel.value)
                assertTrue("Overlay visible on seismic danger", engine.isEmergencyOverlayVisible.value)
            } / 1_000_000.0

            Log.i(TAG, "BENCHMARK_RESULT | 7.8M Subduction Megaquake Drill | LeadTime: ${leadSec}s | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
        }
    }

    @Test
    fun test04_glofMoraineBreachSimulationDrill() {
        val elapsedMs = measureNanoTime {
            engine.simulateGlofOutburst()
            val flood = engine.floodAlert.value
            assertNotNull("GLOF alert must be populated", flood)
            assertEquals("Glacial Lake Outburst Flood (GLOF)", flood!!.floodType)
            assertEquals("Mandatory vertical climb must be 45m", 45, flood.verticalEvacuationMeters)
            assertEquals("Discharge rate must be 2100 m3/s", 2100.0, flood.dischargeSurgeRateM3s, 0.1)
            assertEquals(AlertLevel.DANGER, engine.alertLevel.value)
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | GLOF Moraine Breach Drill | VerticalClimb: +45m | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test05_tsunamiKinematicsSimulationDrill() {
        val elapsedMs = measureNanoTime {
            val alert = TsunamiInundationEngine.evaluateSubmarineEvent(
                magnitude = 7.9,
                epicenterDistanceKm = 165.0,
                coastalName = "Pacific Rim Megathrust Basin"
            )
            assertNotNull("Tsunami alert must be generated", alert)
            assertTrue("Deep ocean phase speed should exceed 700 km/h", alert!!.deepOceanSpeedKmh >= 700.0)
            assertEquals("ETA for 165km should be 19 min", 19, alert.estimatedArrivalMinutes)
            assertEquals("Runup height for M7.9 should be 14m", 14, alert.projectedRunupHeightMeters)
            assertEquals("Required vertical ascent should be 22m", 22, alert.verticalAscentRequiredMeters)
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | Tsunami Kinematics Engine | WaveSpeed: 713 km/h | ETA: 19m | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test06_shelterTimer3030SuccessiveStrikeResetDrill() {
        runBlocking {
            var elapsedMs = 0.0
            withContext(Dispatchers.Main) {
                val nano = measureNanoTime {
                    // 1. Start 30-30 sheltering countdown
                    engine.startOrReset30_30Timer()
                    assertTrue(engine.isTimerActive.value)
                    assertEquals(1800, engine.timerRemainingSeconds.value)

                    // 2. Ingest secondary strike inside danger zone (3.6 km)
                    engine.ingestLightningStrike(37.7749 + 0.009, -122.4194 - 0.031, -95.0)

                    // 3. Verify timer auto-reset
                    assertEquals("Timer must reset to 1800s upon new strike", 1800, engine.timerRemainingSeconds.value)
                    assertTrue("Reset count must increment", engine.timerResetCount.value >= 1)
                }
                elapsedMs = nano / 1_000_000.0
            }

            Log.i(TAG, "BENCHMARK_RESULT | 30-30 Timer Auto-Reset Drill | ResetCount: ${engine.timerResetCount.value} | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
        }
    }

    @Test
    fun test07_zeroFalseAlarmGatingCalibration() {
        val elapsedMs = measureNanoTime {
            engine.resetToSafeState()
            assertEquals("Safe reset level", AlertLevel.SAFE, engine.alertLevel.value)
            assertEquals("Zero false alarm risk must be exactly 0%", 0, engine.atmosphericIndices.value.calculatedRiskPercent)
            assertNull("No nearest strike distance after reset", engine.nearestStrikeDistanceKm.value)
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | Zero-False-Alarm Gating | CalibratedRisk: 0% | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test08_p2pDisasterMeshEmergencySosBeacon() {
        val mesh = P2PDisasterMesh(context)
        val elapsedMs = measureNanoTime {
            mesh.startMesh()
            mesh.broadcastSurvivorSos(1, "TRAPPED_COLLAPSED_STRUCTURE_CIVILIAN", 37.7749, -122.4194)

            assertTrue("Distress state must be active", mesh.sosDistressActive.value)
            val packets = mesh.receivedPackets.value
            assertTrue("Packets list must contain broadcast packet", packets.isNotEmpty())
            assertTrue("Payload must contain distress string", packets.first().payload.contains("TRAPPED SURVIVORS"))

            mesh.cancelSurvivorSos()
            assertFalse("Distress state must be cancelled", mesh.sosDistressActive.value)
            mesh.stopMesh()
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | P2P Mesh SOS Beacon | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test09_compressed2GSmsEmergencyBeacon() {
        var payload = ""
        val elapsedMs = measureNanoTime {
            payload = CompressedSmsBeacon.formatEmergencyPayload(
                latitude = 37.7749,
                longitude = -122.4194,
                status = "DANGER_CRITICAL",
                batteryPercent = 86,
                nearestShelterName = "St_Jude_Bunker"
            )

            assertTrue("Payload must include LOC", payload.contains("LOC=37.7749,-122.4194"))
            assertTrue("Payload must include STAT", payload.contains("STAT=DANGER_CRITICAL"))
            assertTrue("Payload must include BAT", payload.contains("BAT=86%"))
            assertTrue("Payload must include SHELTER", payload.contains("SHELTER=St_Jude_Bunker"))
            assertTrue("Payload must be <= 100 bytes for 2G SMS single frame", payload.toByteArray().size <= 100)
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | 2G SMS Beacon Compression | Bytes: ${payload.toByteArray().size}B | Payload: $payload | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test10_hardwareSensorsAndCompassAzimuth() {
        val sensorManager = LocalSensorManager(context)
        val elapsedMs = measureNanoTime {
            sensorManager.startSensorListening()
            // Validate initial state access without exceptions
            val hpa = sensorManager.currentPressureHpa.value
            val heading = sensorManager.compassAzimuthDegrees.value
            val pga = sensorManager.currentPgaG.value
            assertTrue("Pressure should be reasonable atmospheric value", hpa in 800f..1100f)
            assertTrue("PGA should be non-negative", pga >= 0f)
            assertTrue("Heading in 0-360 range", heading in 0f..360f)
            sensorManager.stopSensorListening()
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | Hardware Sensors & Compass | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test11_shelterSpatialIndexingAndSort() {
        var shelterCount = 0
        val elapsedMs = measureNanoTime {
            val shelters = DisasterRepository.getUpdatedShelters(37.7749, -122.4194)
            shelterCount = shelters.size
            assertTrue("Must contain verified shelters", shelterCount >= 4)
            // Assert sorted by distance ascending
            for (i in 0 until shelters.size - 1) {
                assertTrue("Shelters must be sorted by distance", shelters[i].distanceKm <= shelters[i + 1].distanceKm)
            }
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | Shelter Spatial Indexing | Shelters: $shelterCount | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }

    @Test
    fun test12_familyShieldGeofencingPerimeters() {
        var zoneCount = 0
        val elapsedMs = measureNanoTime {
            val zones = DisasterRepository.createDefaultFamilyShieldZones(37.7749, -122.4194)
            zoneCount = zones.size
            assertEquals("Must contain exactly 10 perimeter zones", 10, zoneCount)
            zones.forEach { zone ->
                assertTrue("Zone ID must not be empty", zone.id.isNotEmpty())
                assertNotNull("Alert level defined", zone.alertLevel)
            }
        } / 1_000_000.0

        Log.i(TAG, "BENCHMARK_RESULT | Family Shield 10-Zone Perimeter | Zones: $zoneCount | Latency: ${String.format("%.2f", elapsedMs)} ms | Status: PASSED")
    }
}
