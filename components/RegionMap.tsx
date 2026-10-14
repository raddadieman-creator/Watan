"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { AtlasPatterns } from "./AtlasDefs";
import type { RegionMapData } from "@/lib/geo";

export const CATEGORIES: Record<string, { label: string; color: string; glyph: string }> = {
  religious: { label: "ديني", color: "#23A887", glyph: "M12 3c-1.2 2.2-4.5 3.6-4.5 7.4h9C16.5 6.6 13.2 5.2 12 3zM5.5 11.4h13v1.8h-13zM6.8 13.2h10.4V21H6.8z" },
  heritage: { label: "تراث وتاريخ", color: "#F28C38", glyph: "M4 21V9h3V5.5h2.2V9h1.7V5.5h2.2V9h1.7V5.5H17V9h3v12z" },
  nature: { label: "طبيعة", color: "#3FA34D", glyph: "M1.5 20.5 9 8.5l4.2 6.4 3-4.2 6.3 9.8z" },
  leisure: { label: "ترفيه", color: "#E5534B", glyph: "M12 2.5l2.8 6.3 6.9.6-5.2 4.6 1.5 6.8L12 17.3 6 20.8l1.5-6.8L2.3 9.4l6.9-.6z" },
  museum: { label: "متاحف ومعارض", color: "#8C6BDB", glyph: "M12 2.5l10 5v1.8H2V7.5zM4 10.5h3v7.5H4zm6.5 0h3v7.5h-3zm6.5 0h3v7.5h-3zM2 19.2h20V21H2z" },
};

type Marker = RegionMapData["markers"][number] & { lat: number; lon: number };
type View = { k: number; tx: number; ty: number };

export function RegionMap({ data, accent, regionName, markers }: { data: RegionMapData; accent: string; regionName: string; markers: Marker[] }) {
  const { width: W, height: H } = data;
  const reduce = useReducedMotion();
  const P = `rm-${data.id}`;
  const [view, setView] = useState<View>({ k: 1, tx: 0, ty: 0 });
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const cats = useMemo(() => [...new Set(markers.map((m) => m.category))], [markers]);
  const [shown, setShown] = useState<Set<string>>(() => new Set(cats));
  const s = (n: number) => n / view.k;

  // تجميع النقاط المتقاربة على الشاشة؛ يتفكك التجمع تلقائيًا مع التكبير
  const clusters = useMemo(() => {
    const out: Array<{ x: number; y: number; members: number[] }> = [];
    const r = 22 / view.k;
    markers.forEach((m, i) => {
      if (!shown.has(m.category)) return;
      const c = out.find((c) => Math.hypot(c.x - m.x, c.y - m.y) < r);
      if (c) {
        c.members.push(i);
        c.x = (c.x * (c.members.length - 1) + m.x) / c.members.length;
        c.y = (c.y * (c.members.length - 1) + m.y) / c.members.length;
      } else out.push({ x: m.x, y: m.y, members: [i] });
    });
    return out;
  }, [markers, shown, view.k]);

  const fitPoints = (idx: number[]) => {
    const xs = idx.map((i) => markers[i].x), ys = idx.map((i) => markers[i].y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const span = Math.max(x1 - x0, y1 - y0, 4);
    const k = Math.min(60, Math.max(view.k * 1.8, (Math.min(W, H) * 0.45) / span));
    setView({ k, tx: W / 2 - k * (x0 + x1) / 2, ty: H / 2 - k * (y0 + y1) / 2 });
  };

  const focusMarker = (i: number) => {
    setActive(i);
    const m = markers[i];
    const k = Math.max(view.k, 3);
    setView({ k, tx: W / 2 - k * m.x, ty: H / 2 - k * m.y });
  };

  const zoomBy = (f: number) =>
    setView((v) => {
      const k = Math.min(60, Math.max(1, v.k * f));
      if (k === 1) return { k: 1, tx: 0, ty: 0 };
      const cx = (W / 2 - v.tx) / v.k, cy = (H / 2 - v.ty) / v.k;
      return { k, tx: W / 2 - k * cx, ty: H / 2 - k * cy };
    });

  const sel = active != null ? markers[active] : null;
  const tip = hover != null && hover !== active ? markers[hover] : null;
  const pos = (x: number, y: number) => ({ left: `${((x * view.k + view.tx) / W) * 100}%`, top: `${((y * view.k + view.ty) / H) * 100}%` });

  return (
    <div className="grid gap-4">
      {/* التصنيفات */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="تصفية الأماكن حسب النوع">
        {cats.map((c) => {
          const on = shown.has(c);
          const meta = CATEGORIES[c];
          const n = markers.filter((m) => m.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setShown((prev) => { const nx = new Set(prev); if (nx.has(c)) nx.delete(c); else nx.add(c); return nx; })}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm font-bold transition ${on ? "text-white shadow-md" : "bg-white text-ink/60 ring-1 ring-ink/10"}`}
              style={on ? { background: meta.color } : undefined}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d={meta.glyph} /></svg>
              {meta.label}
              <span className="num rounded-full bg-black/10 px-1.5 text-xs">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[1.6rem] shadow-[0_30px_60px_-36px_rgba(30,111,134,0.7)] ring-1 ring-ink/5" style={{ background: "radial-gradient(70% 70% at 50% 45%, #DDF4F4, #B6E4EA)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-manipulation select-none" role="group" aria-label={`خريطة ${regionName} التفاعلية وأهم أماكنها`}>
          <defs>
            <AtlasPatterns prefix={P} scale={1 / view.k} />
            <clipPath id={`${P}-clip`}><path d={data.region} /></clipPath>
            <filter id={`${P}-halo`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18" /></filter>
            <filter id={`${P}-shadow`} x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#1E6F86" floodOpacity="0.35" /></filter>
          </defs>
          <g style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})`, transformOrigin: "0 0", transition: reduce ? "none" : "transform 900ms var(--ease-atlas)" }}>
            {[16, 8].map((w, i) => <path key={w} d={data.land} fill="none" stroke="#FFFFFF" strokeOpacity={[0.35, 0.6][i]} strokeWidth={s(w)} strokeLinejoin="round" />)}
            <path d={data.land} fill="#F6EEDC" stroke="#E4D3AE" strokeWidth={s(0.8)} />
            {data.neighbors.map((n) => <path key={n.id} d={n.d} fill="#FBF4E4" stroke="#FFFFFF" strokeWidth={s(1.2)} />)}

            {/* المنطقة المضيئة */}
            <path d={data.region} fill={accent} filter={`url(#${P}-halo)`} className="atlas-halo" />
            <g filter={`url(#${P}-shadow)`}>
              <path d={data.region} fill="#D9B77A" transform={`translate(0 ${s(9)})`} />
              <path d={data.region} fill="#EBD2A0" transform={`translate(0 ${s(4.5)})`} />
            </g>
            <path d={data.region} fill="#FFF7E6" />
            <path d={data.region} fill={accent} fillOpacity="0.5" />
            <g clipPath={`url(#${P}-clip)`}>
              {data.physical.map((p) => <path key={p.id} d={p.d} fill={`url(#${P}-${p.kind})`} />)}
            </g>
            <path d={data.region} fill="none" stroke="#FFFFFF" strokeWidth={s(3)} />

            {data.seat && (
              <rect x={data.seat[0] - s(6)} y={data.seat[1] - s(6)} width={s(12)} height={s(12)} transform={`rotate(45 ${data.seat[0]} ${data.seat[1]})`} fill="#FFFFFF" stroke="#1E2B28" strokeWidth={s(2)} />
            )}

            {/* الأماكن */}
            {clusters.map((c) => {
              if (c.members.length > 1) {
                return (
                  <g
                    key={`c-${c.members.join("-")}`}
                    transform={`translate(${c.x} ${c.y})`}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`${c.members.length} أماكن متقاربة، اضغط للتكبير`}
                    onClick={() => fitPoints(c.members)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fitPoints(c.members); } }}
                  >
                    <circle r={s(24)} fill="#FFFFFF" opacity="0.55" className={reduce ? "" : "seat-pulse"} />
                    <circle r={s(17)} fill="#1E6F86" stroke="#FFFFFF" strokeWidth={s(3)} />
                    <text textAnchor="middle" y={s(5.5)} fontSize={s(15)} fontWeight={800} fill="#FFFFFF" fontFamily="var(--font-sans)">{c.members.length}</text>
                  </g>
                );
              }
              const i = c.members[0];
              const m = markers[i];
              const meta = CATEGORIES[m.category];
              const isActive = active === i;
              const r = isActive ? 17 : 14;
              return (
                <g
                  key={`m-${i}`}
                  transform={`translate(${m.x} ${m.y})`}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.nameAr} — ${meta.label}`}
                  aria-pressed={isActive}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover((h) => (h === i ? null : h))}
                  onClick={() => setActive(isActive ? null : i)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(isActive ? null : i); } }}
                >
                  <circle r={s(r + 8)} fill={meta.color} opacity="0.35" className={reduce ? "" : "seat-pulse"} style={{ animationDelay: `${(i % 6) * 0.4}s` }} />
                  <circle r={s(r)} fill={meta.color} stroke="#FFFFFF" strokeWidth={s(3)} style={{ filter: `drop-shadow(0 0 ${s(8)}px ${meta.color})` }} />
                  <g transform={`translate(${s(-9)} ${s(-9)}) scale(${s(0.75)})`}><path d={meta.glyph} fill="#FFFFFF" /></g>
                </g>
              );
            })}
          </g>
        </svg>

        {tip && (
          <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[150%] whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-ink shadow-lg ring-1 ring-ink/5" style={pos(tip.x, tip.y)}>
            {tip.nameAr}
          </div>
        )}

        <div className="absolute end-3 top-3 flex gap-1.5" role="group" aria-label="التحكم في الخريطة">
          {[{ l: "تكبير", f: 1.6, t: "+" }, { l: "تصغير", f: 1 / 1.6, t: "−" }].map((b) => (
            <button key={b.l} type="button" aria-label={b.l} onClick={() => zoomBy(b.f)} className="glass-panel inline-flex size-10 items-center justify-center rounded-xl text-lg text-ink hover:text-coral">{b.t}</button>
          ))}
          <button type="button" aria-label="إظهار المنطقة كاملة" onClick={() => { setView({ k: 1, tx: 0, ty: 0 }); setActive(null); }} className="glass-panel inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-bold text-ink hover:text-coral">المنطقة كاملة</button>
        </div>

        <AnimatePresence>
          {sel && (
            <motion.div
              key={sel.nameAr}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-3 bottom-3 z-30 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-ink/5 backdrop-blur sm:inset-x-auto sm:start-3 sm:w-[24rem]"
              role="dialog"
              aria-label={sel.nameAr}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: CATEGORIES[sel.category].color }}>{CATEGORIES[sel.category].label}</span>
                <button type="button" onClick={() => setActive(null)} aria-label="إغلاق" className="rounded-full px-2 text-lg leading-none text-ink/50 hover:text-ink">×</button>
              </div>
              <p className="mt-2 font-display text-xl leading-9 text-ink">{sel.nameAr}</p>
              <p className="text-[0.92rem] leading-7 text-ink/75">{sel.descAr}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {sel.url && <a href={encodeURI(decodeURI(sel.url))} target="_blank" rel="noopener noreferrer" className="rounded-full bg-sea px-3 py-1.5 font-bold text-white hover:bg-turq">اقرأ المزيد</a>}
                <a href={`https://www.google.com/maps/search/?api=1&query=${sel.lat},${sel.lon}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cream px-3 py-1.5 font-bold text-ink hover:bg-sun hover:text-white">افتحه في خرائط Google</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* قائمة بديلة مرتبطة بالخريطة */}
      <ul className="flex flex-wrap gap-2" aria-label={`أماكن ${regionName} على الخريطة`}>
        {markers.map((m, i) =>
          shown.has(m.category) ? (
            <li key={m.nameAr}>
              <button
                type="button"
                onClick={() => focusMarker(i)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm transition ${active === i ? "text-white" : "bg-white text-ink/80 ring-1 ring-ink/10 hover:ring-ink/25"}`}
                style={active === i ? { background: CATEGORIES[m.category].color } : undefined}
              >
                <span className="inline-block size-2.5 rounded-full" style={{ background: active === i ? "#fff" : CATEGORIES[m.category].color }} aria-hidden />
                {m.nameAr}
              </button>
            </li>
          ) : null,
        )}
      </ul>
      <p className="text-[0.7rem] text-ink-muted">مواقع الأماكن من ويكيبيديا وصفحات اليونسكو وقاعدة GeoNames، والحدود مرحلية من Natural Earth.</p>
    </div>
  );
}
