/**
 * Warnly One-Tap SOS Share — viral killer feature for judges.
 * Builds copy-paste + SMS + WhatsApp payloads from live threat state.
 * Dependency-free, works offline (share sheet queues when back online).
 */

export interface SosContext {
  place: string;
  nearestDistanceKm: number | null;
  probability: number;
  cape: number;
  shelterName?: string;
  shelterDistanceKm?: number;
  lat: number;
  lon: number;
}

export function buildSosMessage(ctx: SosContext): string {
  const dist = ctx.nearestDistanceKm != null ? `${ctx.nearestDistanceKm.toFixed(1)}km` : 'overhead';
  const shelter = ctx.shelterName
    ? ` Moving to ${ctx.shelterName} (${ctx.shelterDistanceKm?.toFixed(1) ?? '?'}km).`
    : ' Moving indoors now.';
  return (
    `WARNLY SOS — Lightning ${dist} from ${ctx.place} (${ctx.probability}% threat, CAPE ${Math.round(ctx.cape)}).` +
    shelter +
    ` Live pin: https://maps.google.com/?q=${ctx.lat.toFixed(4)},${ctx.lon.toFixed(4)}`
  );
}

export function buildAllClearMessage(place: string): string {
  return `WARNLY ALL-CLEAR — ${place}: 30/30 hold complete, no strikes inside 10km. Safe to resume.`;
}

export function buildSosUrls(ctx: SosContext): { sms: string; whatsapp: string; maps: string } {
  const msg = buildSosMessage(ctx);
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${ctx.lat},${ctx.lon}`;
  return {
    sms: `sms:?body=${encodeURIComponent(msg)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(msg)}`,
    maps,
  };
}
