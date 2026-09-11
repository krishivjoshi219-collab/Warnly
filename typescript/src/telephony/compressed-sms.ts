/**
 * Ultra-Compact GSM / 2G Compressed SMS Distress Beacon
 * Encodes survivor telemetry into an 80-character payload capable of transmitting
 * across congested 2G base stations when 4G/5G broadband is dead.
 */
export class CompressedSmsBeacon {
  /**
   * Encode a sub-80 character disaster beacon string:
   * WARNLY:LOC=37.7749,-122.4194;STAT=TRAPPED_4PAX;BAT=78%;SHELTER=CIVIC_BUNKER
   */
  static encodeDistressPayload(
    lat: number,
    lon: number,
    statusText: string,
    batteryPct: number,
    targetShelterName: string
  ): string {
    const latStr = lat.toFixed(4);
    const lonStr = lon.toFixed(4);
    const cleanStatus = statusText.replace(/[^A-Za-z0-9_]/g, '_').substring(0, 16);
    const cleanShelter = targetShelterName.replace(/[^A-Za-z0-9_]/g, '_').substring(0, 14);

    return `WARNLY:LOC=${latStr},${lonStr};STAT=${cleanStatus};BAT=${batteryPct}%;SHELTER=${cleanShelter}`;
  }

  /**
   * Generate an SMS URI for mobile browser / OS dispatch
   */
  static createSmsUri(recipientPhone: string, messagePayload: string): string {
    return `sms:${recipientPhone}?body=${encodeURIComponent(messagePayload)}`;
  }

  /**
   * Launch native SMS client via window.open / location.href
   */
  static dispatchSms(recipientPhone: string, messagePayload: string): void {
    if (typeof window === 'undefined') return;
    const uri = this.createSmsUri(recipientPhone, messagePayload);
    window.location.href = uri;
  }
}
