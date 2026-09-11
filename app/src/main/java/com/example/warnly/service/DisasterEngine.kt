package com.example.warnly.service

import android.content.Context
import android.util.Log
import com.example.warnly.audio.AcousticSirenSynthesizer
import com.example.warnly.data.DisasterRepository
import com.example.warnly.hardware.LocalSensorManager
import com.example.warnly.hardware.OpticalBeaconManager
import com.example.warnly.model.*
import com.example.warnly.navigation.DisasterNavigator
import com.example.warnly.physics.GeoMath
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID
import kotlin.math.max

/**
 * Warnly Real-Time Resilience & Life-Safety Engine
 * Integrates live global open APIs (Open-Meteo Convective Models, USGS Real-time Seismic Feeds),
 * geodesic safety ring mathematics, acoustic siren synthesis, optical Morse SOS strobe,
 * automated 30-30 sheltering countdown timers, and local hardware-driven tactical disaster navigation.
 */
class DisasterEngine(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    val siren = AcousticSirenSynthesizer()
    val opticalBeacon = OpticalBeaconManager(context)
    val sensorManager = LocalSensorManager(context)
    val navigator = DisasterNavigator(context, sensorManager)

    // User Location (Default: San Francisco / Configurable / GPS)
    private val _userLatitude = MutableStateFlow(37.7749)
    val userLatitude: StateFlow<Double> = _userLatitude.asStateFlow()

    private val _userLongitude = MutableStateFlow(-122.4194)
    val userLongitude: StateFlow<Double> = _userLongitude.asStateFlow()

    private val _locationName = MutableStateFlow("San Francisco, CA (Default Base)")
    val locationName: StateFlow<String> = _locationName.asStateFlow()

    // Selected Hazard Tab
    private val _selectedHazard = MutableStateFlow(HazardType.LIGHTNING)
    val selectedHazard: StateFlow<HazardType> = _selectedHazard.asStateFlow()

    // Alert Level & Geodesic Status
    private val _alertLevel = MutableStateFlow(AlertLevel.SAFE)
    val alertLevel: StateFlow<AlertLevel> = _alertLevel.asStateFlow()

    private val _nearestStrikeDistanceKm = MutableStateFlow<Double?>(null)
    val nearestStrikeDistanceKm: StateFlow<Double?> = _nearestStrikeDistanceKm.asStateFlow()

    private val _nearestStrikeBearing = MutableStateFlow(0.0)
    val nearestStrikeBearing: StateFlow<Double> = _nearestStrikeBearing.asStateFlow()

    private val _strikes = MutableStateFlow<List<LightningStrike>>(emptyList())
    val strikes: StateFlow<List<LightningStrike>> = _strikes.asStateFlow()

    // Atmospheric Indices (CAPE J/kg, Lifted Index, Storm Motion)
    private val _atmosphericIndices = MutableStateFlow(
        AtmosphericIndices(
            cape = 180.0,
            liftedIndex = 3.2,
            precipitationRateMmH = 0.0,
            stormSpeedKmh = 0.0,
            stormBearingDegrees = 0.0,
            calculatedRiskPercent = 0, // Strict 0% calibrated gating
            leadTimeMinutes = 0
        )
    )
    val atmosphericIndices: StateFlow<AtmosphericIndices> = _atmosphericIndices.asStateFlow()

    // 30-30 Countdown Timer (FR-03)
    private val _timerRemainingSeconds = MutableStateFlow(0)
    val timerRemainingSeconds: StateFlow<Int> = _timerRemainingSeconds.asStateFlow()

    private val _isTimerActive = MutableStateFlow(false)
    val isTimerActive: StateFlow<Boolean> = _isTimerActive.asStateFlow()

    private val _timerResetCount = MutableStateFlow(0)
    val timerResetCount: StateFlow<Int> = _timerResetCount.asStateFlow()

    private var countdownJob: Job? = null

    // Seismic Alert State (USGS P/S Differential)
    private val _seismicAlert = MutableStateFlow<SeismicAlert?>(null)
    val seismicAlert: StateFlow<SeismicAlert?> = _seismicAlert.asStateFlow()
    private var seismicJob: Job? = null

    // Flood Alert State (GLOF / Flash Flood Runoff)
    private val _floodAlert = MutableStateFlow<FloodAlert?>(null)
    val floodAlert: StateFlow<FloodAlert?> = _floodAlert.asStateFlow()

    // Emergency Intrusion Overlay (FR-04)
    private val _isEmergencyOverlayVisible = MutableStateFlow(false)
    val isEmergencyOverlayVisible: StateFlow<Boolean> = _isEmergencyOverlayVisible.asStateFlow()

    // Family Shield 10 Monitored Perimeters (FR-07)
    private val _familyShieldZones = MutableStateFlow<List<MonitoredZone>>(emptyList())
    val familyShieldZones: StateFlow<List<MonitoredZone>> = _familyShieldZones.asStateFlow()

    // High Ground Shelters (FR-06)
    private val _shelters = MutableStateFlow<List<Shelter>>(emptyList())
    val shelters: StateFlow<List<Shelter>> = _shelters.asStateFlow()

    // Telemetry Sync Status
    private val _liveTelemetryStatus = MutableStateFlow("Standby (Tap 'Sync Live APIs')")
    val liveTelemetryStatus: StateFlow<String> = _liveTelemetryStatus.asStateFlow()

    private val _autoSirenOnDanger = MutableStateFlow(true)
    val autoSirenOnDanger: StateFlow<Boolean> = _autoSirenOnDanger.asStateFlow()

    init {
        updateLocationsAndPerimeters(_userLatitude.value, _userLongitude.value, "San Francisco Base")
    }

    fun updateLocationsAndPerimeters(lat: Double, lon: Double, name: String) {
        _userLatitude.value = lat
        _userLongitude.value = lon
        _locationName.value = name
        _familyShieldZones.value = DisasterRepository.createDefaultFamilyShieldZones(lat, lon)
        val updatedShelters = DisasterRepository.getUpdatedShelters(lat, lon)
        _shelters.value = updatedShelters

        val currentTarget = navigator.selectedShelter.value
        val newTarget = if (currentTarget != null) {
            updatedShelters.find { it.id == currentTarget.id } ?: updatedShelters.firstOrNull()
        } else {
            updatedShelters.firstOrNull()
        }
        if (newTarget != null) {
            navigator.setDestination(newTarget, lat, lon, _strikes.value)
        }
    }

    fun startNavigatingTo(shelter: Shelter) {
        navigator.setDestination(shelter, _userLatitude.value, _userLongitude.value, _strikes.value)
    }

    fun setHazard(hazard: HazardType) {
        _selectedHazard.value = hazard
    }

    fun toggleAutoSiren() {
        _autoSirenOnDanger.value = !_autoSirenOnDanger.value
    }

    fun dismissEmergencyOverlay() {
        _isEmergencyOverlayVisible.value = false
    }

    fun showEmergencyOverlay() {
        _isEmergencyOverlayVisible.value = true
    }

    /**
     * Start or reset the 30-30 sheltering countdown timer (FR-03)
     */
    fun startOrReset30_30Timer() {
        _timerRemainingSeconds.value = 30 * 60 // 30:00 (1800 seconds)
        _isTimerActive.value = true
        _timerResetCount.value += 1

        countdownJob?.cancel()
        countdownJob = scope.launch {
            while (isActive && _timerRemainingSeconds.value > 0) {
                delay(1000L)
                _timerRemainingSeconds.value -= 1
            }
            if (_timerRemainingSeconds.value <= 0) {
                _isTimerActive.value = false
            }
        }
    }

    fun stop30_30Timer() {
        _isTimerActive.value = false
        countdownJob?.cancel()
        countdownJob = null
        _timerRemainingSeconds.value = 0
    }

    /**
     * Ingest a lightning strike and evaluate geodesic boundaries (FR-01, FR-02)
     */
    fun ingestLightningStrike(lat: Double, lon: Double, intensityKa: Double) {
        val userLat = _userLatitude.value
        val userLon = _userLongitude.value
        val distKm = GeoMath.calculateHaversineDistanceKm(userLat, userLon, lat, lon)
        val bearing = GeoMath.calculateBearingDegrees(userLat, userLon, lat, lon)

        val strike = LightningStrike(
            id = UUID.randomUUID().toString(),
            latitude = lat,
            longitude = lon,
            distanceKm = (distKm * 10.0).toInt() / 10.0,
            bearingDegrees = (bearing * 10.0).toInt() / 10.0,
            timestamp = System.currentTimeMillis(),
            intensityKa = intensityKa,
            ageSeconds = 0
        )

        val updatedList = (listOf(strike) + _strikes.value).take(30)
        _strikes.value = updatedList

        // Recalculate nearest strike
        val nearest = updatedList.minByOrNull { it.distanceKm }
        _nearestStrikeDistanceKm.value = nearest?.distanceKm
        _nearestStrikeBearing.value = nearest?.bearingDegrees ?: 0.0

        val level = GeoMath.evaluateGeodesicRingLevel(nearest?.distanceKm)
        _alertLevel.value = level

        val strikesIn15Km = updatedList.count { it.distanceKm <= GeoMath.ADVISORY_RADIUS_KM }
        val currentAtmos = _atmosphericIndices.value
        val risk = GeoMath.evaluateCalibratedRisk(
            nearest?.distanceKm,
            strikesIn15Km,
            currentAtmos.cape,
            currentAtmos.liftedIndex
        )

        _atmosphericIndices.value = currentAtmos.copy(
            calculatedRiskPercent = risk,
            leadTimeMinutes = when (level) {
                AlertLevel.DANGER -> 0
                AlertLevel.ADVISORY -> 14
                AlertLevel.SAFE -> if (risk > 20) 22 else 0
            }
        )

        // FR-03 & FR-04: If strike breaches 10 km Danger Ring
        if (distKm <= GeoMath.CRITICAL_DANGER_RADIUS_KM) {
            startOrReset30_30Timer()
            _isEmergencyOverlayVisible.value = true
            if (_autoSirenOnDanger.value && !siren.isSirenActive()) {
                siren.startSiren()
            }
        }

        // Update Family Shield Perimeters with proximity to this strike
        updateFamilyShieldDistances(lat, lon)

        // Update navigator corridor hazard analysis
        navigator.selectedShelter.value?.let { currentShelter ->
            navigator.setDestination(currentShelter, userLat, userLon, updatedList)
        }
    }

    private fun updateFamilyShieldDistances(strikeLat: Double, strikeLon: Double) {
        val updatedZones = _familyShieldZones.value.map { zone ->
            val distToZone = GeoMath.calculateHaversineDistanceKm(zone.latitude, zone.longitude, strikeLat, strikeLon)
            val currentNearest = zone.nearestStrikeKm ?: 999.0
            val newNearest = minOf(currentNearest, (distToZone * 10.0).toInt() / 10.0)
            val zoneLevel = GeoMath.evaluateGeodesicRingLevel(newNearest)
            zone.copy(
                nearestStrikeKm = newNearest,
                alertLevel = zoneLevel,
                activeThreatCount = if (newNearest <= 15.0) zone.activeThreatCount + 1 else zone.activeThreatCount,
                lastUpdateTimestamp = System.currentTimeMillis()
            )
        }
        _familyShieldZones.value = updatedZones
    }

    /**
     * LIVE OPEN API 1: Fetch Live Convective Instability from Open-Meteo
     * (Free, No API Key, Global NWP Models for CAPE & Lifted Index)
     */
    fun fetchLiveOpenMeteoConvectiveData() {
        scope.launch(Dispatchers.IO) {
            _liveTelemetryStatus.value = "Ingesting Open-Meteo Convective NWP..."
            try {
                val lat = _userLatitude.value
                val lon = _userLongitude.value
                val urlStr = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&hourly=cape,lifted_index,convective_inhibition,precipitation,wind_speed_10m,wind_direction_10m&current=precipitation,surface_pressure,wind_speed_10m,wind_direction_10m"
                val url = URL(urlStr)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 6000
                conn.readTimeout = 6000
                conn.requestMethod = "GET"

                if (conn.responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(conn.inputStream))
                    val response = reader.readText()
                    reader.close()

                    val json = JSONObject(response)
                    val hourly = json.optJSONObject("hourly")
                    val current = json.optJSONObject("current")

                    val capeArray = hourly?.optJSONArray("cape")
                    val liArray = hourly?.optJSONArray("lifted_index")
                    val precipCurrent = current?.optDouble("precipitation", 0.0) ?: 0.0
                    val windSpeed = current?.optDouble("wind_speed_10m", 15.0) ?: 15.0
                    val windDir = current?.optDouble("wind_direction_10m", 220.0) ?: 220.0

                    val liveCape = if (capeArray != null && capeArray.length() > 0) capeArray.optDouble(0, 250.0) else 250.0
                    val liveLi = if (liArray != null && liArray.length() > 0) liArray.optDouble(0, 1.5) else 1.5

                    withContext(Dispatchers.Default) {
                        val strikesIn15Km = _strikes.value.count { it.distanceKm <= GeoMath.ADVISORY_RADIUS_KM }
                        val risk = GeoMath.evaluateCalibratedRisk(_nearestStrikeDistanceKm.value, strikesIn15Km, liveCape, liveLi)

                        _atmosphericIndices.value = AtmosphericIndices(
                            cape = liveCape,
                            liftedIndex = liveLi,
                            precipitationRateMmH = precipCurrent,
                            stormSpeedKmh = windSpeed,
                            stormBearingDegrees = windDir,
                            calculatedRiskPercent = risk,
                            leadTimeMinutes = if (liveCape > 1500) 20 else 0
                        )

                        _liveTelemetryStatus.value = "✅ Open-Meteo Synced: CAPE ${liveCape.toInt()} J/kg • LI ${String.format("%.1f", liveLi)}"
                    }
                } else {
                    _liveTelemetryStatus.value = "⚠️ Open-Meteo HTTP ${conn.responseCode} (Fallback Cache Active)"
                }
                conn.disconnect()
            } catch (e: Exception) {
                Log.w("WarnlyEngine", "Open-Meteo fetch failed", e)
                _liveTelemetryStatus.value = "Offline Mode (Using Local Calibrated Engine)"
            }
        }
    }

    /**
     * LIVE OPEN API 2: Fetch Live USGS Real-Time Earthquake GeoJSON Feed
     * (Free, No API Key, Updated every 60 seconds)
     */
    fun fetchLiveUsgsEarthquakes() {
        scope.launch(Dispatchers.IO) {
            _liveTelemetryStatus.value = "Polling USGS Real-Time Earthquake GeoJSON..."
            try {
                val urlStr = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
                val url = URL(urlStr)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 6000
                conn.readTimeout = 6000
                conn.requestMethod = "GET"

                if (conn.responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(conn.inputStream))
                    val response = reader.readText()
                    reader.close()

                    val json = JSONObject(response)
                    val features = json.optJSONArray("features")

                    if (features != null && features.length() > 0) {
                        var mostSignificantEvent: SeismicAlert? = null
                        var shortestDistance = Double.MAX_VALUE

                        for (i in 0 until minOf(features.length(), 15)) {
                            val feature = features.getJSONObject(i)
                            val props = feature.getJSONObject("properties")
                            val geom = feature.getJSONObject("geometry")
                            val coords = geom.getJSONArray("coordinates")

                            val eqLon = coords.getDouble(0)
                            val eqLat = coords.getDouble(1)
                            val mag = props.optDouble("mag", 3.0)
                            val place = props.optString("place", "Regional Epicenter")
                            val time = props.optLong("time", System.currentTimeMillis())

                            val dist = GeoMath.calculateHaversineDistanceKm(
                                _userLatitude.value, _userLongitude.value,
                                eqLat, eqLon
                            )

                            // Pick earthquake closest to user or significant
                            if (dist < shortestDistance) {
                                shortestDistance = dist
                                val leadSec = GeoMath.calculateSWaveLeadTimeSeconds(dist)
                                mostSignificantEvent = SeismicAlert(
                                    id = feature.optString("id", "USGS-LIVE"),
                                    magnitude = mag,
                                    epicenterLocationName = place,
                                    epicenterDistanceKm = (dist * 10.0).toInt() / 10.0,
                                    pWaveDetectedTimestamp = time,
                                    sWaveEstimatedArrivalTimestamp = time + (leadSec * 1000L),
                                    sWaveCountdownSeconds = leadSec,
                                    estimatedMmi = if (mag >= 5.5) "VI - Strong" else "IV - Light Shaking"
                                )
                            }
                        }

                        withContext(Dispatchers.Default) {
                            if (mostSignificantEvent != null) {
                                _seismicAlert.value = mostSignificantEvent
                                _liveTelemetryStatus.value = "✅ USGS Synced: M${mostSignificantEvent.magnitude} ${mostSignificantEvent.epicenterLocationName} (${mostSignificantEvent.epicenterDistanceKm} km)"
                            }
                        }
                    } else {
                        _liveTelemetryStatus.value = "✅ USGS Feed Synced: 0 Recent Earthquakes Past Hour"
                    }
                }
                conn.disconnect()
            } catch (e: Exception) {
                Log.w("WarnlyEngine", "USGS fetch failed", e)
                _liveTelemetryStatus.value = "Offline Mode (Seismic Simulation Ready)"
            }
        }
    }

    /**
     * Combined Live Fetch: Updates all available free real-time APIs
     */
    fun syncAllLiveFeeds() {
        fetchLiveOpenMeteoConvectiveData()
        fetchLiveUsgsEarthquakes()
    }

    /**
     * Scenario 1: Convective Thunderstorm Intrusion (14.2 km advisory -> 7.4 km danger)
     */
    fun simulateConvectiveIntrusion() {
        scope.launch {
            _selectedHazard.value = HazardType.LIGHTNING
            _atmosphericIndices.value = AtmosphericIndices(
                cape = 2650.0,
                liftedIndex = -6.2,
                precipitationRateMmH = 22.0,
                stormSpeedKmh = 48.0,
                stormBearingDegrees = 235.0,
                calculatedRiskPercent = 52,
                leadTimeMinutes = 18
            )

            val uLat = _userLatitude.value
            val uLon = _userLongitude.value

            // 1st strike at 13.5 km (Advisory ring breach)
            delay(400)
            ingestLightningStrike(uLat + 0.038, uLon - 0.115, -48.2)

            // 2nd strike at 7.4 km (Danger Ring intrusion!)
            delay(1200)
            ingestLightningStrike(uLat + 0.018, uLon - 0.062, -74.6)
        }
    }

    /**
     * Scenario 2: Secondary Strike Resets 30-30 Timer (FR-03)
     */
    fun simulateSecondaryStrikeReset() {
        scope.launch {
            _selectedHazard.value = HazardType.LIGHTNING
            val uLat = _userLatitude.value
            val uLon = _userLongitude.value
            // Immediate strike at 3.6 km
            ingestLightningStrike(uLat + 0.009, uLon - 0.031, -95.0)
        }
    }

    /**
     * Scenario 3: Seismic Differential P/S Wave Alert (Section 6.2)
     */
    fun simulateSeismicEvent() {
        scope.launch {
            _selectedHazard.value = HazardType.SEISMIC
            seismicJob?.cancel()

            val distKm = 72.0
            val leadSeconds = GeoMath.calculateSWaveLeadTimeSeconds(distKm) // ~9s
            val now = System.currentTimeMillis()

            _alertLevel.value = AlertLevel.DANGER
            _isEmergencyOverlayVisible.value = true
            if (_autoSirenOnDanger.value) siren.startSiren()

            var remaining = leadSeconds
            while (isActive && remaining >= 0) {
                _seismicAlert.value = SeismicAlert(
                    id = "USGS-SIM-${UUID.randomUUID().toString().take(6)}",
                    magnitude = 6.6,
                    epicenterLocationName = "San Andreas Fault System (Segment 3)",
                    epicenterDistanceKm = distKm,
                    pWaveDetectedTimestamp = now,
                    sWaveEstimatedArrivalTimestamp = now + (leadSeconds * 1000L),
                    sWaveCountdownSeconds = remaining,
                    estimatedMmi = "VII - Very Strong Destructive Shaking"
                )
                delay(1000L)
                remaining--
            }
        }
    }

    /**
     * Scenario 4: Glacial Lake Outburst Flood (GLOF) Valley Surge
     */
    fun simulateGlofOutburst() {
        _selectedHazard.value = HazardType.GLOF
        _alertLevel.value = AlertLevel.DANGER
        _isEmergencyOverlayVisible.value = true
        if (_autoSirenOnDanger.value) siren.startSiren()

        _floodAlert.value = FloodAlert(
            id = "GLOF-VALLEY-09",
            floodType = "Glacial Lake Outburst Flood (GLOF)",
            basinName = "Imja Alpine Glacial Moraine Breach",
            crestLeadTimeMinutes = 26,
            verticalEvacuationMeters = 45, // Mandatory +45m vertical climb
            dischargeSurgeRateM3s = 2100.0,
            statusSummary = "High-altitude moraine barrier failed. 2,100 m³/s outburst torrent rushing down valley. Climb vertically (+45m) immediately! Do NOT follow river channel!"
        )
    }

    /**
     * Scenario 5: Flash Flood Runoff Surge
     */
    fun simulateFlashFlood() {
        _selectedHazard.value = HazardType.FLASH_FLOOD
        _alertLevel.value = AlertLevel.ADVISORY
        _floodAlert.value = FloodAlert(
            id = "FLASH-CANYON-04",
            floodType = "Canyon Runoff Flash Flood Surge",
            basinName = "Red Canyon Arroyo Wash Drainage",
            crestLeadTimeMinutes = 12,
            verticalEvacuationMeters = 30,
            dischargeSurgeRateM3s = 580.0,
            statusSummary = "Upstream cloudburst detected (75 mm/hr). Sudden wall of water moving through dry canyon washes. Evacuate low crossings now!"
        )
    }

    /**
     * Scenario 6: Reset to Calibrated 0% Safe Baseline (FR-02)
     */
    fun resetToSafeState() {
        siren.stopSiren()
        opticalBeacon.stopSosStrobe()
        stop30_30Timer()
        seismicJob?.cancel()
        _seismicAlert.value = null
        _floodAlert.value = null
        _strikes.value = emptyList()
        _nearestStrikeDistanceKm.value = null
        _nearestStrikeBearing.value = 0.0
        _alertLevel.value = AlertLevel.SAFE
        _isEmergencyOverlayVisible.value = false

        // Strict 0% Calibrated risk
        _atmosphericIndices.value = AtmosphericIndices(
            cape = 120.0,
            liftedIndex = 3.8,
            precipitationRateMmH = 0.0,
            stormSpeedKmh = 0.0,
            stormBearingDegrees = 0.0,
            calculatedRiskPercent = 0, // Strict 0% output
            leadTimeMinutes = 0
        )
        _liveTelemetryStatus.value = "Calibrated Safe Baseline (0% Risk Gated)"
    }

    fun release() {
        siren.release()
        opticalBeacon.release()
        sensorManager.release()
        navigator.release()
        countdownJob?.cancel()
        seismicJob?.cancel()
        scope.cancel()
    }
}
