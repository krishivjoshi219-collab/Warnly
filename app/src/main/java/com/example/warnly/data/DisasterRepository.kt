package com.example.warnly.data

import com.example.warnly.model.*
import com.example.warnly.physics.GeoMath

object DisasterRepository {

    /**
     * Initial verified high-ground shelters and reinforced bunkers (FR-06)
     */
    val verifiedShelters = listOf(
        Shelter(
            id = "SH-01",
            name = "St. Jude Civil Defense Bunker",
            type = ShelterType.REINFORCED_CONCRETE,
            latitude = 37.7790,
            longitude = -122.4230,
            elevationGainMeters = 42,
            capacity = 350,
            distanceKm = 1.8,
            bearingDegrees = 45.0,
            address = "450 Golden Gate Ave, Reinforced Sub-level B1"
        ),
        Shelter(
            id = "SH-02",
            name = "Mount Sutro High-Ground Ridge Refuge",
            type = ShelterType.HIGH_GROUND_RIDGE,
            latitude = 37.7580,
            longitude = -122.4550,
            elevationGainMeters = 85,
            capacity = 1200,
            distanceKm = 4.2,
            bearingDegrees = 230.0,
            address = "Upper Crest Ridge Trail Assembly Area"
        ),
        Shelter(
            id = "SH-03",
            name = "Metro Gymnasium Safe Zone",
            type = ShelterType.ENCLOSED_GYMNASIUM,
            latitude = 37.7850,
            longitude = -122.4080,
            elevationGainMeters = 15,
            capacity = 800,
            distanceKm = 2.4,
            bearingDegrees = 85.0,
            address = "730 Howard St, Hardened Interior Hall"
        ),
        Shelter(
            id = "SH-04",
            name = "Highland Reservoir Assembly Grounds",
            type = ShelterType.CIVIL_DEFENSE_CAMP,
            latitude = 37.7420,
            longitude = -122.4430,
            elevationGainMeters = 60,
            capacity = 2500,
            distanceKm = 5.9,
            bearingDegrees = 195.0,
            address = "Highland Perimeter Safety Sector C"
        )
    )

    /**
     * 10 Monitored Family Shield Zones (FR-07)
     */
    fun createDefaultFamilyShieldZones(baseLat: Double, baseLon: Double): List<MonitoredZone> {
        val now = System.currentTimeMillis()
        return listOf(
            MonitoredZone("Z-01", "Primary Residence", ZoneType.HOME, baseLat, baseLon, AlertLevel.SAFE, 18.4, 0, now),
            MonitoredZone("Z-02", "Lincoln High School", ZoneType.SCHOOL, baseLat + 0.035, baseLon - 0.020, AlertLevel.SAFE, 16.2, 0, now),
            MonitoredZone("Z-03", "Skyline Scaffolding Site", ZoneType.WORK_SITE, baseLat + 0.065, baseLon + 0.040, AlertLevel.ADVISORY, 12.8, 1, now),
            MonitoredZone("Z-04", "Grandparents' Homestead", ZoneType.ELDERLY_PARENTS, baseLat - 0.045, baseLon - 0.035, AlertLevel.SAFE, 22.0, 0, now),
            MonitoredZone("Z-05", "Sierra Ridge Trail Camp", ZoneType.CAMP, baseLat + 0.120, baseLon + 0.090, AlertLevel.SAFE, 28.5, 0, now),
            MonitoredZone("Z-06", "Harbor Cove Marina", ZoneType.MARINA, baseLat - 0.050, baseLon + 0.060, AlertLevel.SAFE, 19.1, 0, now),
            MonitoredZone("Z-07", "Valley Agricultural Farm", ZoneType.FARM, baseLat - 0.090, baseLon - 0.080, AlertLevel.SAFE, 24.3, 0, now),
            MonitoredZone("Z-08", "Civic Center Daycare", ZoneType.SCHOOL, baseLat + 0.012, baseLon + 0.015, AlertLevel.SAFE, 17.0, 0, now),
            MonitoredZone("Z-09", "Eastside Logistics Hub", ZoneType.WORK_SITE, baseLat + 0.080, baseLon - 0.050, AlertLevel.SAFE, 21.4, 0, now),
            MonitoredZone("Z-10", "Mountain Vista Retreat", ZoneType.CAMP, baseLat + 0.150, baseLon - 0.110, AlertLevel.SAFE, 31.0, 0, now)
        )
    }

    /**
     * Section 4.2: High-Risk Demographics & Real-World Use Cases Protocols
     */
    val demographicProtocols = listOf(
        DemographicProtocol(
            id = "DP-01",
            title = "Agriculture & Field Laborers",
            vulnerabilityProfile = "Extreme: Open fields, tractors, metal hand tools, isolated trees. Accounts for >50% of lightning fatalities.",
            oshaOrSafetyRule = "Immediate mandatory cessation of field operations within 15 km advisory perimeter.",
            actionChecklist = listOf(
                "Dismount tractors, combines, and heavy machinery immediately (do not touch metal frame).",
                "Drop metal hand tools (shovels, hoes, irrigation pipes) and step away at least 15 meters.",
                "Never seek shelter under isolated trees, wire fences, or small open sheds.",
                "Crouch in low depressions on the balls of your feet (Lightning Crouch), keeping feet together to minimize ground potential step voltage."
            )
        ),
        DemographicProtocol(
            id = "DP-02",
            title = "Construction & Heavy Industry",
            vulnerabilityProfile = "High: Tower cranes, metal scaffolding, elevated ironwork, high-voltage substations.",
            oshaOrSafetyRule = "OSHA Standard: Mandatory suspension of crane and elevated iron work when strikes are within 10 miles (16 km).",
            actionChecklist = listOf(
                "Immediately lower crane boom / hoist hooks and engage structural mechanical locks.",
                "Order complete vertical evacuation of metal scaffolding and elevated structural decks.",
                "Power down non-essential sensitive electrical generators and outdoor substations.",
                "All personnel muster inside grounded, fully enclosed concrete or steel-framed site offices."
            )
        ),
        DemographicProtocol(
            id = "DP-03",
            title = "Schools, Youth Camps & Sports",
            vulnerabilityProfile = "High: Open athletic fields, swimming pools, bleachers, playgrounds.",
            oshaOrSafetyRule = "NFHS & NCAA Rule: Strict 30-30 Rule mandatory suspension. 30 full minutes must elapse after last 10 km strike.",
            actionChecklist = listOf(
                "Blow whistle for mandatory clearing of outdoor soccer/football fields, tracks, and bleachers.",
                "Immediately evacuate indoor and outdoor swimming pools (water conducts lightning currents over hundreds of meters).",
                "Move students into substantial permanent school buildings (avoid picnic shelters, dugouts, or bus stops).",
                "Enforce the 30-30 shelter timer: Coaches must NOT dismiss children until the full 30:00 countdown reaches zero."
            )
        ),
        DemographicProtocol(
            id = "DP-04",
            title = "Alpine & Mountain Communities",
            vulnerabilityProfile = "Extreme: Narrow gorges, GLOF lakes, flash flood runoff, exposed ridgelines.",
            oshaOrSafetyRule = "Mandatory vertical evacuation (+30m to +50m) above valley floor upon GLOF or flash flood detection.",
            actionChecklist = listOf(
                "GLOF / Flood Surge: Abandon riverbanks and valley floors immediately. Climb vertically uphill at least +30m to +50m.",
                "Alpine Lightning: Descend from exposed ridges, summits, and cliff edges immediately.",
                "Avoid shallow rock overhangs or caves where electrical bridging can arc through your body.",
                "In narrow canyons, move to designated reinforced evacuation ridges before water surge crests."
            )
        ),
        DemographicProtocol(
            id = "DP-05",
            title = "Mariners, Boaters & Water Sports",
            vulnerabilityProfile = "Extreme: Open water electrical conductivity, masts acting as lightning rods.",
            oshaOrSafetyRule = "Return to harbor or enclosed cabin at first advisory perimeter breach (15 km / 20-min lead time).",
            actionChecklist = listOf(
                "Steer toward nearest safe dock or marina immediately upon 15 km Advisory warning.",
                "If caught in open water, enter fully enclosed cabin and stay away from metal stanchions and radio antennas.",
                "Disconnect all fishing rods, outriggers, and lower radio antennas if safe.",
                "Swimmers and divers: exit water immediately; stray electrical current propagates radially across the surface."
            )
        )
    )

    /**
     * Recalculates shelter distance and bearing relative to current coordinates
     */
    fun getUpdatedShelters(userLat: Double, userLon: Double): List<Shelter> {
        return verifiedShelters.map { shelter ->
            val dist = GeoMath.calculateHaversineDistanceKm(userLat, userLon, shelter.latitude, shelter.longitude)
            val bearing = GeoMath.calculateBearingDegrees(userLat, userLon, shelter.latitude, shelter.longitude)
            shelter.copy(
                distanceKm = (dist * 10.0).toInt() / 10.0,
                bearingDegrees = (bearing * 10.0).toInt() / 10.0
            )
        }.sortedBy { it.distanceKm }
    }
}
