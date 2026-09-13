export type RiskLevel = "safe" | "advisory" | "danger";

export interface Coords {
  lat: number;
  lon: number;
}

export interface Strike {
  id: string;
  lat: number;
  lon: number;
  distanceKm: number;
  bearingDeg: number;
  ageMin: number;
}

export interface DailyForecast {
  date: string;
  code: number;
  max: number;
  min: number;
  apparentMax: number;
  apparentMin: number;
  precipSum: number;
  precipProb: number;
  windMax: number;
  uvMax: number;
}

export interface Minutely15Forecast {
  time: string;
  precip: number;
}

export interface WeatherSnapshot {
  place: string;
  coords: Coords;
  temperature: number;
  apparent: number;
  humidity: number;
  dewPoint: number;
  cloudCover: number;
  uvIndex: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  cape: number;
  liftedIndex: number;
  precipProbability: number;
  updatedAt: number;
  rainSummary: string;
  daily: DailyForecast[];
  hourly: { time: string; temp: number; cape: number; precipProb: number; precip: number }[];
  minutely15: Minutely15Forecast[];
}

export interface SurvivalSnapshot {
  directive: string;
  doNot: string[];
  fallback: string;
  evacAdvice: string;
  custody: string;
  airAdvice: string;
  careSteps: string[];
  calmNext: string;
}
