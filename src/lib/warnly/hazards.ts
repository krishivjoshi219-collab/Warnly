import { useState, useEffect } from "react";
import { distanceKm, bearingDeg } from "./risk";
import type { Coords } from "./types";

export interface Quake {
  id: string;
  place: string;
  mag: number;
  depthKm: number;
  lat: number;
  lon: number;
  distanceKm: number;
  bearingDeg: number;
  time: number;
  url: string;
}

export type FloodLevel = "none" | "low" | "moderate" | "high" | "severe";

export interface FloodSnapshot {
  rainNow: number; // mm/hr
  showers: number;
  precipProb: number;
  next6hTotal: number;
  discharge: number | null; // m3/s
  dischargeMax: number | null;
  level: FloodLevel;
  label: string;
}

const USGS_FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export const MAX_QUAKE_RADIUS_KM = 350;

async function fetchWithSignal(url: string, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchEarthquakes(origin: Coords): Promise<Quake[]> {
  const res = await fetchWithSignal(USGS_FEED, 8000);
  if (!res.ok) throw new Error("USGS feed unavailable");
  const data = await res.json();
  const allQuakes: Quake[] = (data.features ?? []).map((f: any) => {
    const [lon, lat, depth] = f.geometry.coordinates;
    const c = { lat, lon };
    return {
      id: f.id,
      place: f.properties.place ?? "Unknown region",
      mag: f.properties.mag ?? 0,
      depthKm: Math.round(depth ?? 0),
      lat,
      lon,
      distanceKm: Math.round(distanceKm(origin, c)),
      bearingDeg: bearingDeg(origin, c),
      time: f.properties.time,
      url: f.properties.url,
    };
  });

  // Strictly filter to earthquakes that are within real seismic sensing distance of the user
  // M >= 6.0 felt up to 500 km; M >= 4.5 felt up to 300 km; M < 4.5 felt up to 150 km.
  // Never show quakes in Alaska, Tonga, or Chile as "nearby".
  const regionalQuakes = allQuakes.filter((q) => {
    if (q.mag >= 6.0) return q.distanceKm <= 500;
    if (q.mag >= 4.5) return q.distanceKm <= 300;
    return q.distanceKm <= 150;
  });

  return regionalQuakes.sort((a, b) => a.distanceKm - b.distanceKm);
}

export function quakeColor(mag: number): string {
  if (mag >= 6) return "#ef4444";
  if (mag >= 4.5) return "#f59e0b";
  return "#eab308";
}

export function floodMeta(level: FloodLevel): { label: string; color: string } {
  switch (level) {
    case "severe":
      return { label: "Severe flood risk", color: "#ef4444" };
    case "high":
      return { label: "High flood risk", color: "#f97316" };
    case "moderate":
      return { label: "Moderate surge risk", color: "#f59e0b" };
    case "low":
      return { label: "Low water risk", color: "#38bdf8" };
    default:
      return { label: "No flooding indicators", color: "#10b981" };
  }
}

export async function fetchFloodRisk(origin: Coords): Promise<FloodSnapshot> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${origin.lat}&longitude=${origin.lon}&current=precipitation,rain,showers&hourly=precipitation,precipitation_probability&forecast_days=1&timezone=auto&timeformat=unixtime`;
  const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${origin.lat}&longitude=${origin.lon}&daily=river_discharge,river_discharge_max&forecast_days=3`;

  const [wRes, fRes] = await Promise.all([
    fetchWithSignal(weatherUrl, 8000),
    fetchWithSignal(floodUrl, 8000).catch(() => null),
  ]);

  const w = wRes.ok ? await wRes.json() : {};
  const f = fRes && fRes.ok ? await fRes.json() : null;

  const rainNow = w.current?.rain ?? w.current?.precipitation ?? 0;
  const showers = w.current?.showers ?? 0;
  const hourlyPrecip: number[] = w.hourly?.precipitation ?? [];
  const hourlyProb: number[] = w.hourly?.precipitation_probability ?? [];
  const hourlyTime: number[] = w.hourly?.time ?? [];
  // Match forecast slots to real time (was: device-local getHours() used as
  // an array index — wrong timezone whenever the device and the queried
  // location differ, or when the series doesn't start at midnight).
  const nowSec = Math.floor(Date.now() / 1000);
  let nowIdx = hourlyTime.findIndex((t) => t >= nowSec - 1800);
  if (nowIdx < 0) nowIdx = 0;
  const next6hTotal = hourlyPrecip
    .slice(nowIdx, nowIdx + 6)
    .reduce((a: number, b: number) => a + (b ?? 0), 0);
  const precipProb = hourlyProb[nowIdx] ?? 0;

  const discharge = f?.daily?.river_discharge?.[0] ?? null;
  const dischargeMax = f?.daily?.river_discharge_max
    ? Math.max(...f.daily.river_discharge_max.filter((v: number | null) => v != null))
    : null;

  const intensity = Math.max(rainNow + showers, next6hTotal / 3);
  const surging =
    discharge != null && dischargeMax != null && dischargeMax > 0
      ? dischargeMax / Math.max(discharge, 0.01)
      : 1;

  let level: FloodLevel = "none";
  if (intensity >= 15 || (intensity >= 8 && surging > 1.6)) level = "severe";
  else if (intensity >= 7.5) level = "high";
  else if (intensity >= 2.5 || surging > 1.8) level = "moderate";
  else if (intensity > 0.2 || precipProb >= 50) level = "low";

  return {
    rainNow: Math.round((rainNow + showers) * 10) / 10,
    showers,
    precipProb,
    next6hTotal: Math.round(next6hTotal * 10) / 10,
    discharge: discharge != null ? Math.round(discharge * 100) / 100 : null,
    dischargeMax: dischargeMax != null ? Math.round(dischargeMax * 100) / 100 : null,
    level,
    label: floodMeta(level).label,
  };
}

export function useEarthquakes(origin: Coords | null) {
  const [data, setData] = useState<Quake[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!origin) return;
    let active = true;
    setIsLoading(true);
    fetchEarthquakes(origin)
      .then((res) => {
        if (active) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setIsLoading(false);
        }
      });
    const timer = setInterval(() => {
      fetchEarthquakes(origin)
        .then((res) => active && setData(res))
        .catch(() => {});
    }, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [origin?.lat, origin?.lon]);

  return { data, isLoading, error };
}

export function useFloodRisk(origin: Coords | null) {
  const [data, setData] = useState<FloodSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!origin) return;
    let active = true;
    setIsLoading(true);
    fetchFloodRisk(origin)
      .then((res) => {
        if (active) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setIsLoading(false);
        }
      });
    const timer = setInterval(() => {
      fetchFloodRisk(origin)
        .then((res) => active && setData(res))
        .catch(() => {});
    }, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [origin?.lat, origin?.lon]);

  return { data, isLoading, error };
}
