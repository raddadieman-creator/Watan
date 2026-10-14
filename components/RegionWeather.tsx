"use client";

import { useEffect, useState } from "react";
import { describeWeather, useWeather } from "@/lib/weather";

export function RegionWeather({ id, seatAr, seat, accent }: { id: string; seatAr: string; seat: [number, number]; accent: string }) {
  const { data, error } = useWeather([{ id, lat: seat[1], lon: seat[0] }]);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const w = data?.[id];
  const d = w ? describeWeather(w.code, w.isDay) : null;
  return (
    <div className="overflow-hidden rounded-[1.4rem] text-white shadow-[0_24px_50px_-30px_rgba(30,111,134,0.7)]" style={{ background: `linear-gradient(140deg, ${accent}, #1DB4C8)` }}>
      <div className="p-5">
        <p className="text-sm text-white/85">الطقس الآن في {seatAr.replace(/^مدينة /, "")}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="num text-5xl font-extrabold">{w ? `${Math.round(w.temp)}°` : "—"}</p>
          <span className="text-5xl" aria-hidden>{d?.icon ?? ""}</span>
        </div>
        <p className="mt-1 font-bold">{d ? d.label : error ? "تعذّر الاتصال بخدمة الطقس" : "جارٍ التحميل…"}</p>
        {w && (
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/15 px-3 py-2"><dt className="text-white/75 text-xs">الرطوبة</dt><dd className="num font-bold">{Math.round(w.humidity)}%</dd></div>
            <div className="rounded-xl bg-white/15 px-3 py-2"><dt className="text-white/75 text-xs">الرياح</dt><dd className="num font-bold">{Math.round(w.wind)} كم/س</dd></div>
          </dl>
        )}
        <p className="mt-3 text-xs text-white/80">
          الوقت الآن: <span className="num">{now ? new Intl.DateTimeFormat("ar-SA-u-nu-latn", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Riyadh" }).format(now) : "—"}</span>
        </p>
      </div>
      <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="block bg-black/10 px-5 py-2 text-[0.7rem] text-white/85">بيانات الطقس: Open-Meteo</a>
    </div>
  );
}
