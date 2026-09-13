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
  const cleanQ = query.trim();

  // Normalize common transliteration/spelling typos
  const typoMap: Record<string, string> = {
    kathmadu: 'kathmandu',
    katmandu: 'kathmandu',
    ktm: 'kathmandu',
    delih: 'delhi',
    mubmai: 'mumbai',
    pokra: 'pokhara',
    pkh: 'pokhara',
    ny: 'new york',
    nyc: 'new york',
  };

  const normalizedQ = typoMap[cleanQ.toLowerCase()] ?? cleanQ;

  try {
    let res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizedQ)}&count=6&language=en&format=json`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results;
      }
    }

    // Resilient fallback: OpenStreetMap Nominatim for any global language or place
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalizedQ)}&limit=6`,
      { headers: { 'User-Agent': 'WarnlyEmergencyApp/1.1 (team@warnly.app)' } }
    );
    if (nomRes.ok) {
      const nomData = (await nomRes.json()) as any[];
      return nomData.map((n: any, idx: number) => {
        const parts = (n.display_name || '').split(',');
        return {
          id: n.place_id || idx + 100000,
          name: n.name || parts[0] || 'Location',
          latitude: parseFloat(n.lat),
          longitude: parseFloat(n.lon),
          country: parts.slice(-1)[0]?.trim(),
          admin1: parts.slice(-2, -1)[0]?.trim(),
        };
      });
    }

    return [];
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
    const locality = j.locality || j.city || j.principalSubdivision;
    const region = j.principalSubdivision && j.principalSubdivision !== locality ? j.principalSubdivision : j.countryName;
    return [locality, region].filter(Boolean).join(", ") || `${lat.toFixed(2)}\u00B0, ${lon.toFixed(2)}\u00B0`;
  } catch {
    return `${lat.toFixed(2)}\u00B0, ${lon.toFixed(2)}\u00B0`;
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m,cloud_cover,uv_index` +
    `&hourly=temperature_2m,precipitation_probability,precipitation,cape,lifted_index,uv_index` +
    `&minutely_15=precipitation` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
    `&forecast_days=7&timezone=auto&timeformat=unixtime`;

  const [res, place] = await Promise.all([fetch(url), reverseGeocode(lat, lon)]);
  if (!res.ok) throw new Error("Weather service unavailable");
  const d = (await res.json()) as any;

  const times: number[] = d.hourly?.time ?? [];
  const nowSec = Math.floor(Date.now() / 1000);
  let idx = times.findIndex((t) => t >= nowSec - 1800);
  if (idx < 0) idx = 0;

  const hourly = times.slice(idx, idx + 12).map((t, i) => ({
    time: new Date(t * 1000).toISOString(),
    temp: d.hourly.temperature_2m?.[idx + i] ?? 0,
    cape: d.hourly.cape?.[idx + i] ?? 0,
    precipProb: d.hourly.precipitation_probability?.[idx + i] ?? 0,
    precip: d.hourly.precipitation?.[idx + i] ?? 0,
  }));

  const minutelyTimes: number[] = d.minutely_15?.time ?? [];
  let minIdx = minutelyTimes.findIndex((t) => t >= nowSec - 600);
  if (minIdx < 0) minIdx = 0;

  const minutely15 = minutelyTimes.slice(minIdx, minIdx + 8).map((t, i) => ({
    time: new Date(t * 1000).toISOString(),
    precip: d.minutely_15?.precipitation?.[minIdx + i] ?? 0,
  }));

  const dailyTimes: number[] = d.daily?.time ?? [];
  const daily = dailyTimes.map((t: number, i: number) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
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

  let rainSummary = "0.0 mm/h • Dry conditions in immediate forecast.";
  if (currentPrecip > 0.1 || (currentCode >= 50 && currentCode <= 99 && currentPrecip > 0)) {
    rainSummary = `${currentPrecip.toFixed(1)} mm/h • Active ${weatherCodeInfo(currentCode).label.toLowerCase()} currently falling.`;
  } else if (nextRainMin > 0) {
    const mins = nextRainMin * 15;
    const incomingPrecip = minutely15[nextRainMin]?.precip ?? 0.2;
    rainSummary = `Rain starting in ~${mins} minutes (${incomingPrecip.toFixed(1)} mm/h expected).`;
  } else {
    const maxUpcomingProb = Math.max(...hourly.slice(0, 6).map((h) => h.precipProb));
    if (maxUpcomingProb >= 40) {
      rainSummary = `${maxUpcomingProb}% chance of rain in the next 6 hours (currently dry).`;
    } else {
      rainSummary = "Dry conditions • 0.0 mm precipitation expected.";
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
    uvIndex: d.current?.uv_index !== undefined ? Math.round(d.current.uv_index * 10) / 10 : (d.daily?.uv_index_max?.[0] ?? 5),
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