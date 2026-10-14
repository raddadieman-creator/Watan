"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { describeWeather, useWeather } from "@/lib/weather";

export interface LiveRegion {
  id: string;
  shortAr: string;
  seatAr: string;
  accent: string;
  seat: [number, number];
}

const CAPITALS = [
  { city: "القاهرة", tz: "Africa/Cairo" },
  { city: "لندن", tz: "Europe/London" },
  { city: "باريس", tz: "Europe/Paris" },
  { city: "موسكو", tz: "Europe/Moscow" },
  { city: "نيودلهي", tz: "Asia/Kolkata" },
  { city: "بكين", tz: "Asia/Shanghai" },
  { city: "طوكيو", tz: "Asia/Tokyo" },
  { city: "واشنطن", tz: "America/New_York" },
];

const timeFmt = (tz: string) =>
  new Intl.DateTimeFormat("ar-SA-u-nu-latn", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz });

/** فرق التوقيت عن الرياض بالساعات */
function offsetFromRiyadh(tz: string, now: Date) {
  const part = (zone: string) => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(now);
    const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
    return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
  };
  return Math.round(((part(tz) - part("Asia/Riyadh")) / 3_600_000) * 2) / 2;
}

export function LiveNow({ regions }: { regions: LiveRegion[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const points = useMemo(() => regions.map((r) => ({ id: r.id, lat: r.seat[1], lon: r.seat[0] })), [regions]);
  const { data: weather, error } = useWeather(points);
  const visits = useVisits();

  const riyadhTime = now
    ? new Intl.DateTimeFormat("ar-SA-u-nu-latn", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Riyadh" }).format(now)
    : "—";
  const hijri = now ? new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(now) : "";
  const greg = now ? new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(now) : "";

  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8" aria-labelledby="live-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="live-h" className="font-display text-[clamp(2.1rem,4vw,3.2rem)] text-ink">المملكة الآن</h2>
          <p className="mt-1 text-[1.02rem] text-ink-muted">الوقت والتاريخ والطقس في مقار الإمارات، محدَّثة تلقائيًا.</p>
        </div>
        {visits.enabled && (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-[0_18px_40px_-28px_rgba(30,111,134,0.6)] ring-1 ring-ink/5" role="status">
            <span className="relative flex size-3" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint/60" />
              <span className="relative inline-flex size-3 rounded-full bg-mint" />
            </span>
            <span className="text-sm text-ink-muted">عدد الزيارات</span>
            <span className="num text-2xl font-extrabold text-sea">{visits.count.toLocaleString("ar-SA-u-nu-latn")}</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* الساعة */}
        <div className="relative overflow-hidden rounded-[1.6rem] p-7 text-white shadow-[0_30px_60px_-34px_rgba(229,83,75,0.7)]" style={{ background: "linear-gradient(130deg,#E5534B 0%,#F28C38 55%,#F6B13D 100%)" }}>
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-white/15 blur-2xl" aria-hidden />
          <p className="text-sm text-white/85">الوقت في المملكة (الرياض)</p>
          <p className="num mt-1 text-[clamp(2.6rem,6vw,4rem)] font-extrabold leading-tight" aria-live="off">{riyadhTime}</p>
          <p className="mt-2 font-display text-xl leading-9">{hijri}</p>
          <p className="text-white/85">{greg}</p>

          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CAPITALS.map((c) => {
              const off = now ? offsetFromRiyadh(c.tz, now) : 0;
              return (
                <li key={c.tz} className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs text-white/85">{c.city}</p>
                  <p className="num text-lg font-bold">{now ? timeFmt(c.tz).format(now) : "—"}</p>
                  <p className="num text-[0.7rem] text-white/75">{off === 0 ? "توقيت الرياض نفسه" : `${off > 0 ? "+" : "−"}${Math.abs(off)} س عن الرياض`}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* الطقس */}
        <div className="rounded-[1.6rem] bg-white p-6 shadow-[0_30px_60px_-40px_rgba(30,111,134,0.6)] ring-1 ring-ink/5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl text-ink">الطقس الآن</h3>
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-xs text-ink-muted underline underline-offset-2">بيانات Open-Meteo</a>
          </div>
          {error && !weather && (
            <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-ink-muted">تعذّر الاتصال بخدمة الطقس الآن. ستُعاد المحاولة تلقائيًا.</p>
          )}
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {regions.map((r) => {
              const w = weather?.[r.id];
              const d = w ? describeWeather(w.code, w.isDay) : null;
              return (
                <li key={r.id}>
                  <Link href={`/regions/${r.id}`} className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 ring-1 ring-ink/5 transition hover:-translate-y-0.5 hover:shadow-md" style={{ background: `${r.accent}14` }}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">{r.seatAr.replace(/^مدينة /, "")}</span>
                      <span className="block truncate text-xs text-ink-muted">{d ? d.label : "…"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span aria-hidden className="text-lg">{d?.icon ?? ""}</span>
                      <span className="num text-xl font-extrabold" style={{ color: r.accent }}>{w ? `${Math.round(w.temp)}°` : "—"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** يسجّل زيارة واحدة لكل جلسة متصفح، ثم يعرض الإجمالي */
function useVisits() {
  const [state, setState] = useState<{ enabled: boolean; count: number }>({ enabled: false, count: 0 });
  useEffect(() => {
    let counted = false;
    try { counted = sessionStorage.getItem("watan-visit") === "1"; } catch {}
    fetch("/api/visits", { method: counted ? "GET" : "POST" })
      .then((r) => r.json())
      .then((d) => {
        setState({ enabled: !!d.enabled, count: Number(d.count) || 0 });
        if (d.enabled && !counted) { try { sessionStorage.setItem("watan-visit", "1"); } catch {} }
      })
      .catch(() => {});
  }, []);
  return state;
}
