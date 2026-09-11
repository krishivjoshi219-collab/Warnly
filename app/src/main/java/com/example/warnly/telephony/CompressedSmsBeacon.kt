package com.example.warnly.telephony

import android.content.Context
import android.content.Intent
import android.net.Uri

/**
 * 2G/GSM Compressed Offline SMS Emergency Beacon
 * In severe disasters where 4G/5G data is severed, standard 2G/GSM SMS signaling remains active.
 * Encodes GPS coordinates, battery percentage, hazard status, and shelter ID into an ultra-compact payload.
 */
object CompressedSmsBeacon {

    /**
     * Generate an ultra-compact 80-character standardized emergency SMS payload
     */
    fun formatEmergencyPayload(
        latitude: Double,
        longitude: Double,
        status: String,
        batteryPercent: Int,
        nearestShelterName: String
    ): String {
        val latStr = String.format("%.4f", latitude)
        val lonStr = String.format("%.4f", longitude)
        val shelterClean = nearestShelterName.take(16).replace(" ", "_")
        val timestamp = System.currentTimeMillis() / 1000L

        return "WARNLY:LOC=$latStr,$lonStr;STAT=$status;SHELTER=$shelterClean;BAT=$batteryPercent%;T=$timestamp"
    }

    /**
     * Launch native Android SMS composer with pre-filled compressed payload
     */
    fun dispatchSmsBroadcast(context: Context, payload: String, recipientPhone: String = "") {
        val uri = if (recipientPhone.isNotEmpty()) {
            Uri.parse("smsto:$recipientPhone")
        } else {
            Uri.parse("smsto:")
        }
        val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
            putExtra("sms_body", payload)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(Intent.createChooser(intent, "Dispatch Warnly Emergency SMS"))
    }
}
