"use client";

import { useEffect, useState } from "react";

/**
 * طقس مقار الإمارات الثلاث عشرة من Open-Meteo (مجاني، بلا مفتاح، CC BY 4.0).
 * يُجلب في المتصفح بطلب واحد لكل المواقع، ويُشارك بين مكونات الصفحة، ويُحدَّث كل 15 دقيقة.
 */
export interface WeatherNow {
  temp: number;
  code: number;
  wind: number;
  humidity: number;
  isDay: boolean;
  time: string;
}

export type WeatherMap = Record<string, WeatherNow>;
type Point = { id: string; lat: number; lon: number };

const REFRESH_MS = 15 * 60 * 1000;
let cache: { at: number; key: string; data: Promise<WeatherMap> } | null = null;

async function fetchWeather(points: Point[]): Promise<WeatherMap> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", points.map((p) => p.lat.toFixed(4)).join(","));
  url.searchParams.set("longitude", points.map((p) => p.lon.toFixed(4)).join(","));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,is_day");
  url.searchParams.set("timezone", "Asia/Riyadh");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const json = await res.json();
  const list: Array<{ current: Record<string, number | string> }> = Array.isArray(json) ? json : [json];
  const out: WeatherMap = {};
  list.forEach((item, i) => {
    const c = item.current;
    if (!c || !points[i]) return;
    out[points[i].id] = {
      temp: Number(c.temperature_2m),
      code: Number(c.weather_code),
      wind: Number(c.wind_speed_10m),
      humidity: Number(c.relative_humidity_2m),
      isDay: Number(c.is_day) === 1,
      time: String(c.time),
    };
  });
  return out;
}

export function useWeather(points: Point[]) {
  const [data, setData] = useState<WeatherMap | null>(null);
  const [error, setError] = useState(false);
  const key = points.map((p) => p.id).join(",");

  useEffect(() => {
    let alive = true;
    const load = () => {
      const now = Date.now();
      if (!cache || cache.key !== key || now - cache.at > REFRESH_MS) {
        cache = { at: now, key, data: fetchWeather(points) };
      }
      cache.data
        .then((d) => { if (alive) { setData(d); setError(false); } })
        .catch(() => { if (alive) setError(true); cache = null; });
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, error };
}

/** وصف رموز الطقس (WMO) بالعربية مع رمز تعبيري بسيط */
export function describeWeather(code: number, isDay = true): { label: string; icon: string } {
  if (code === 0) return { label: "صحو", icon: isDay ? "☀️" : "🌙" };
  if (code <= 2) return { label: "غائم جزئيًا", icon: isDay ? "🌤️" : "☁️" };
  if (code === 3) return { label: "غائم", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "ضباب", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "رذاذ", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { label: "مطر", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "ثلج", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { label: "زخات مطر", icon: "🌦️" };
  if (code >= 85 && code <= 86) return { label: "زخات ثلج", icon: "🌨️" };
  if (code >= 95) return { label: "عواصف رعدية", icon: "⛈️" };
  return { label: "—", icon: "🌡️" };
}
