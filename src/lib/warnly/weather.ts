import type { WeatherSnapshot } from "./types";

export interface SearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export const weatherCodeInfo = (code: number, isDay = true): { label: string; icon: string } => {
  const map: Record<number, { label: string; icon: string }> = {
    0: { label: "Clear sky", icon: isDay ? "sun" : "moon" },
    1: { label: "Mainly clear", icon: isDay ? "sun" : "moon" },
    2: { label: "Partly cloudy", icon: "cloud-sun" },
    3: { label: "Overcast", icon: "cloud" },
    45: { label: "Foggy", icon: "cloud-fog" },
    48: { label: "Rime fog", icon: "cloud-fog" },
    51: { label: "Light drizzle", icon: "cloud-drizzle" },
    53: { label: "Moderate drizzle", icon: "cloud-drizzle" },
    55: { label: "Heavy drizzle", icon: "cloud-drizzle" },
    61: { label: "Light rain", icon: "cloud-rain" },
    63: { label: "Moderate rain", icon: "cloud-rain" },
    65: { label: "Heavy rain", icon: "cloud-rain" },
    71: { label: "Light snow", icon: "snowflake" },
    73: { label: "Snowfall", icon: "snowflake" },
    75: { label: "Heavy snow", icon: "snowflake" },
    80: { label: "Rain showers", icon: "cloud-rain" },
    81: { label: "Heavy showers", icon: "cloud-rain" },
    82: { label: "Violent rainstorm", icon: "cloud-rain" },
    95: { label: "Thunderstorm", icon: "cloud-lightning" },
    96: { label: "Thunderstorm & hail", icon: "cloud-lightning" },
    99: { label: "Severe thunderstorm", icon: "cloud-lightning" },
  };
  return map[code] ?? { label: "Unsettled", icon: "cloud" };
};

export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (!res.ok) throw new Error("geocode failed");
    const j = (await res.json()) as { city?: string; locality?: string; countryName?: string; principalSubdivision?: string };
    const name = j.city || j.locality || j.principalSubdivision;
    return [name, j.countryName].filter(Boolean).join(", ") || `${lat.toFixed(2)}\u00B0, ${lon.toFixed(2)}\u00B0`;
  } catch {
    return `${lat.toFixed(2)}\u00B0, ${lon.toFixed(2)}\u00B0`;
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m,cloud_cover` +
    `&hourly=temperature_2m,precipitation_probability,precipitation,cape,lifted_index` +
    `&minutely_15=precipitation` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
    `&forecast_days=7&timezone=auto`;

  const [res, place] = await Promise.all([fetch(url), reverseGeocode(lat, lon)]);
  if (!res.ok) throw new Error("Weather service unavailable");
  const d = (await res.json()) as any;

  const times: string[] = d.hourly?.time ?? [];
  const now = Date.now();
  let idx = times.findIndex((t) => new Date(t).getTime() >= now - 30 * 60 * 1000);
  if (idx < 0) idx = 0;

  const hourly = times.slice(idx, idx + 12).map((t, i) => ({
    time: t,
    temp: d.hourly.temperature_2m?.[idx + i] ?? 0,
    cape: d.hourly.cape?.[idx + i] ?? 0,
    precipProb: d.hourly.precipitation_probability?.[idx + i] ?? 0,
    precip: d.hourly.precipitation?.[idx + i] ?? 0,
  }));

  const minutelyTimes: string[] = d.minutely_15?.time ?? [];
  let minIdx = minutelyTimes.findIndex((t) => new Date(t).getTime() >= now - 10 * 60 * 1000);
  if (minIdx < 0) minIdx = 0;

  const minutely15 = minutelyTimes.slice(minIdx, minIdx + 8).map((t, i) => ({
    time: t,
    precip: d.minutely_15?.precipitation?.[minIdx + i] ?? 0,
  }));

  const daily = (d.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    code: d.daily.weather_code?.[i] ?? 0,
    max: d.daily.temperature_2m_max?.[i] ?? 0,
    min: d.daily.temperature_2m_min?.[i] ?? 0,
    apparentMax: d.daily.apparent_temperature_max?.[i] ?? 0,
    apparentMin: d.daily.apparent_temperature_min?.[i] ?? 0,
    precipSum: d.daily.precipitation_sum?.[i] ?? 0,
    precipProb: d.daily.precipitation_probability_max?.[i] ?? 0,
    windMax: d.daily.wind_speed_10m_max?.[i] ?? 0,
    uvMax: d.daily.uv_index_max?.[i] ?? 0,
  }));

  const currentPrecip = d.current?.precipitation ?? 0;
  const currentCode = d.current?.weather_code ?? 0;
  const nextRainMin = minutely15.findIndex((m) => m.precip > 0.1);

  let rainSummary = "No rain expected in the immediate 2-hour forecast.";
  if (currentPrecip > 0.2 || (currentCode >= 50 && currentCode <= 99)) {
    rainSummary = `Active ${weatherCodeInfo(currentCode).label.toLowerCase()} currently falling.`;
  } else if (nextRainMin > 0) {
    const mins = nextRainMin * 15;
    rainSummary = `Rain starting in approximately ${mins} minutes.`;
  } else {
    const maxUpcomingProb = Math.max(...hourly.slice(0, 6).map((h) => h.precipProb));
    if (maxUpcomingProb >= 40) {
      rainSummary = `${maxUpcomingProb}% chance of rain in the next 6 hours.`;
    }
  }

  return {
    place,
    coords: { lat, lon },
    temperature: d.current?.temperature_2m ?? 0,
    apparent: d.current?.apparent_temperature ?? 0,
    humidity: d.current?.relative_humidity_2m ?? 0,
    dewPoint: d.current?.dew_point_2m ?? 0,
    cloudCover: d.current?.cloud_cover ?? 0,
    uvIndex: d.daily?.uv_index_max?.[0] ?? Math.min(11, Math.round(((d.hourly?.cape?.[idx] ?? 0) / 400) + 3)),
    windSpeed: d.current?.wind_speed_10m ?? 0,
    windGust: d.current?.wind_gusts_10m ?? 0,
    windDirection: d.current?.wind_direction_10m ?? 0,
    pressure: d.current?.surface_pressure ?? 0,
    precipitation: currentPrecip,
    weatherCode: currentCode,
    isDay: (d.current?.is_day ?? 1) === 1,
    cape: d.hourly?.cape?.[idx] ?? 0,
    liftedIndex: d.hourly?.lifted_index?.[idx] ?? 0,
    precipProbability: d.hourly?.precipitation_probability?.[idx] ?? 0,
    updatedAt: Date.now(),
    rainSummary,
    daily,
    hourly,
    minutely15,
  };
}

export interface RadarFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  host: string;
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
}

export async function fetchRainViewerRadar(): Promise<{ host: string; frames: RadarFrame[] }> {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    if (!res.ok) throw new Error("Failed to fetch radar");
    const data: RainViewerData = await res.json();
    const frames = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])];
    return { host: data.host, frames };
  } catch {
    return { host: "https://tilecache.rainviewer.com", frames: [] };
  }
}