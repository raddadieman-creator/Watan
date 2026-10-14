"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AtlasPatterns } from "./AtlasDefs";
import { formatCompact, formatNumber } from "@/lib/format";
import type { AtlasData } from "@/lib/geo";
import { describeWeather, useWeather } from "@/lib/weather";

export interface MapRegionInfo {
  id: string;
  nameAr: string;
  shortAr: string;
  seatAr: string;
  accent: string;
  population: number;
  areaKm2: number;
  governorates: number | null;
  detailLevel: "full" | "basic";
  seat: [number, number] | null;
}

interface Props {
  atlas: AtlasData;
  regions: MapRegionInfo[];
  /** محتوى الافتتاحية (العنوان والأزرار) — يُستبدل بملخص المنطقة عند اختيارها على الشاشات الكبيرة */
  intro: React.ReactNode;
}

type View = { k: number; tx: number; ty: number };

const POP_CLASSES = [
  { max: 600_000, fill: "#FFE6BF", label: "أقل من 600 ألف" },
  { max: 1_500_000, fill: "#FDC584", label: "600 ألف – 1.5 مليون" },
  { max: 2_500_000, fill: "#F69E52", label: "1.5 – 2.5 مليون" },
  { max: 6_000_000, fill: "#E6702F", label: "2.5 – 6 ملايين" },
  { max: Infinity, fill: "#C24A1C", label: "أكثر من 6 ملايين" },
];
const popFill = (p: number) => POP_CLASSES.find((c) => p < c.max)!.fill;

const P = "atl";

export function AtlasMap({ atlas, regions, intro }: Props) {
  const { width: W, height: H } = atlas;
  const router = useRouter();
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>({ k: 1, tx: 0, ty: 0 });
  const [layers, setLayers] = useState({ terrain: true, labels: true, seats: true, population: false, weather: false });
  const [touring, setTouring] = useState(false);
  const weatherPoints = useMemo(
    () => regions.filter((r) => r.seat).map((r) => ({ id: r.id, lat: r.seat![1], lon: r.seat![0] })),
    [regions],
  );
  const { data: weather } = useWeather(weatherPoints);
  // على الهاتف تُقص اللوحة حول المملكة لتكبر الخريطة؛ وعلى الشاشات الكبيرة تظهر بسياقها البحري
  const [isLg, setIsLg] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsLg(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const vb = useMemo(() => {
    if (isLg) return { x: 0, y: 0, w: W, h: H };
    const [x, y, w, h] = atlas.ksaBox;
    const pad = 18;
    return { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 };
  }, [isLg, atlas.ksaBox, W, H]);

  const info = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);
  const shapeById = useMemo(() => new Map(atlas.regions.map((s) => [s.id, s])), [atlas.regions]);

  const fitTo = useCallback(
    (id: string | null) => {
      if (!id) return setView({ k: 1, tx: 0, ty: 0 });
      const s = shapeById.get(id);
      if (!s) return;
      const [[x0, y0], [x1, y1]] = s.bounds;
      const k = Math.min(3.2, 0.72 / Math.max((x1 - x0) / vb.w, (y1 - y0) / vb.h));
      setView({ k, tx: vb.x + vb.w / 2 - (k * (x0 + x1)) / 2, ty: vb.y + vb.h / 2 - (k * (y0 + y1)) / 2 });
    },
    [shapeById, vb],
  );

  const select = useCallback((id: string | null) => { setSelected(id); fitTo(id); }, [fitTo]);

  const zoomBy = (factor: number) =>
    setView((v) => {
      const k = Math.min(6, Math.max(1, v.k * factor));
      if (k === 1 && !selected) return { k: 1, tx: 0, ty: 0 };
      const mx = vb.x + vb.w / 2, my = vb.y + vb.h / 2;
      const cx = (mx - v.tx) / v.k, cy = (my - v.ty) / v.k;
      return { k, tx: mx - k * cx, ty: my - k * cy };
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && selected) { setTouring(false); select(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  // جولة تلقائية بين المناطق
  useEffect(() => {
    if (!touring) return;
    const order = [...regions].sort((a, b) => b.population - a.population).map((r) => r.id);
    let i = selected ? Math.max(0, order.indexOf(selected) + 1) : 0;
    const step = () => { select(order[i % order.length]); i++; };
    if (!selected) step();
    const t = setInterval(step, 4200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touring]);

  const reset = () => { setTouring(false); select(null); };
  const activate = (id: string) => { setTouring(false); activateRegion(id); };
  const activateRegion = (id: string) => (selected === id ? router.push(`/regions/${id}`) : select(id));
  const lifted = selected ?? hovered;
  const tip = hovered && hovered !== selected ? shapeById.get(hovered) : null;
  const sel = selected ? info.get(selected) : null;
  const s = (n: number) => n / view.k; // حجم ثابت على الشاشة رغم التكبير

  // موضع بطاقة الاسم على الشاشة، مع مراعاة قصّ اللوحة وأسلوب الاحتواء (meet)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const svgWrap = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
  }, []);
  const tipPos = (c: [number, number]): React.CSSProperties => {
    const bw = box?.w ?? 1, bh = box?.h ?? 1;
    const scale = Math.min(bw / vb.w, bh / vb.h);
    const ox = (bw - vb.w * scale) / 2, oy = (bh - vb.h * scale) / 2;
    return { left: ox + (c[0] * view.k + view.tx - vb.x) * scale, top: oy + (c[1] * view.k + view.ty - vb.y) * scale };
  };

  // كل منطقة بلونها المميز فوق أرضية رملية فاتحة؛ وطبقة السكان تستبدل اللون بتدرج دافئ
  const baseFill = (id: string) => (layers.population ? popFill(info.get(id)!.population) : info.get(id)!.accent);
  const baseOpacity = (id: string) => (layers.population ? 1 : selected && selected !== id ? 0.18 : 0.5);

  const panel = sel && (
    <motion.section
      key={sel.id}
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: 16 }}
      transition={{ duration: 0.45, ease: [0.22, 0.8, 0.24, 1] }}
      aria-label={`ملخص ${sel.nameAr}`}
      className="relative"
    >
      <p className="flex items-center gap-2 text-sm font-bold" style={{ color: sel.accent }}>
        <span className="inline-block h-[3px] w-8 rounded-full" style={{ background: sel.accent }} aria-hidden />
        المنطقة المختارة
      </p>
      <h2 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,3.8rem)] font-bold leading-[1.3] text-ink">{sel.nameAr}</h2>
      <p className="mt-1 text-ink/70">المقر الإداري: {sel.seatAr}</p>
      {weather?.[sel.id] && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-ink shadow-sm ring-1 ring-ink/5">
          <span aria-hidden>{describeWeather(weather[sel.id].code, weather[sel.id].isDay).icon}</span>
          الطقس الآن في {sel.seatAr.replace(/^مدينة /, "")}:
          <span className="num font-bold">{Math.round(weather[sel.id].temp)}°</span>
          {describeWeather(weather[sel.id].code, weather[sel.id].isDay).label}
        </p>
      )}
      <dl className="mt-6 grid grid-cols-3 rounded-2xl bg-white/80 shadow-[0_18px_40px_-28px_rgba(30,111,134,0.6)] ring-1 ring-ink/5">
        {[
          { k: "السكان، تعداد 2022", v: formatCompact(sel.population), t: formatNumber(sel.population) },
          { k: "المساحة التقريبية", v: `${formatNumber(sel.areaKm2)}`, u: "كم²" },
          { k: "المحافظات", v: sel.governorates != null ? String(sel.governorates) : "—" },
        ].map((x, i) => (
          <div key={x.k} className={`px-4 py-4 ${i > 0 ? "border-s border-ink/8" : ""}`}>
            <dt className="text-xs text-ink/60">{x.k}</dt>
            <dd className="num mt-1 whitespace-nowrap text-xl font-extrabold text-ink" title={x.t}>
              {x.v} {x.u && <span className="text-sm font-normal text-ink/60">{x.u}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link href={`/regions/${sel.id}`} className="btn-gold">افتح صفحة {sel.shortAr}</Link>
        <button type="button" onClick={reset} className="btn-ghost">عرض المملكة كاملة</button>
      </div>

    </motion.section>
  );

  return (
    <section className="atlas-plate relative overflow-hidden text-ink" aria-label="أطلس وطن التفاعلي">
      <div className="relative mx-auto max-w-[1600px] lg:grid lg:h-[calc(100svh-72px)] lg:[direction:rtl] lg:min-h-[660px] lg:max-h-[980px] lg:grid-cols-[minmax(24rem,32rem)_minmax(0,1fr)]">
        {/* الافتتاحية، وتحل محلها لوحة المنطقة المختارة على الشاشات الكبيرة */}
        <div className="relative z-10 px-5 pt-10 sm:px-8 lg:flex lg:items-center lg:bg-gradient-to-l lg:from-[#FFF4E4] lg:from-30% lg:via-[#FFF4E4]/70 lg:via-60% lg:to-transparent lg:py-10 lg:pe-0 lg:ps-12">
          <div className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              {sel && isLg ? (
                <div key="panel">{panel}</div>
              ) : (
                <motion.div
                  key="intro"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0, x: 16 }}
                  transition={{ duration: 0.35 }}
                >
                  {intro}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* الخريطة */}
        <div ref={svgWrap} className="atlas-rise relative mt-6 min-h-0 lg:mt-0">
          <svg
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            preserveAspectRatio="xMidYMid meet"
            className="block h-auto w-full touch-manipulation select-none lg:h-full lg:overflow-visible"
            role="group"
            aria-label="خريطة المملكة العربية السعودية بمناطقها الإدارية الثلاث عشرة. استخدم Tab للتنقل بين المناطق وEnter لاختيارها، وEnter مرة أخرى لفتح صفحتها."
          >
            <defs>
              <AtlasPatterns prefix={P} scale={1 / view.k} />
              {atlas.regions.map((r) => (
                <path key={r.id} id={`${P}-r-${r.id}`} d={r.d} />
              ))}
              {atlas.regions.map((r) => (
                <clipPath key={r.id} id={`${P}-c-${r.id}`}><use href={`#${P}-r-${r.id}`} /></clipPath>
              ))}
              <path id={`${P}-land`} d={atlas.land} />
              <g id={`${P}-ksa-shape`}>
                {atlas.regions.map((r) => <use key={r.id} href={`#${P}-r-${r.id}`} />)}
              </g>
              {atlas.physical.map((p) => <path key={p.id} id={`${P}-ph-${p.id}`} d={p.d} />)}
              <filter id={`${P}-halo`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
              {lifted && (
                <filter id={`${P}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={info.get(lifted)!.accent} floodOpacity="0.85" />
                  <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1E6F86" floodOpacity="0.35" />
                </filter>
              )}
              <clipPath id={`${P}-ksa`}>
                {atlas.regions.map((r) => <use key={r.id} href={`#${P}-r-${r.id}`} />)}
              </clipPath>
              <radialGradient id={`${P}-sea`} cx="42%" cy="45%" r="70%">
                <stop offset="0%" stopColor="#15493E" />
                <stop offset="100%" stopColor="#0A2B24" />
              </radialGradient>
            </defs>

            <path d={atlas.graticule} fill="none" stroke="#1E6F86" strokeOpacity="0.14" strokeWidth="0.8" strokeDasharray="2 6" />

            <g
              style={{
                transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})`,
                transformOrigin: "0 0",
                transition: reduce ? "none" : "transform 1100ms var(--ease-atlas)",
              }}
            >
              {/* خطوط الماء الساحلية: اصطلاح خرائطي يحدد الساحل */}
              {[20, 11, 5].map((w, i) => (
                <use key={w} href={`#${P}-land`} fill="none" stroke="#FFFFFF" strokeOpacity={[0.3, 0.45, 0.7][i]} strokeWidth={s(w)} strokeLinejoin="round" />
              ))}
              {/* اليابسة المجاورة */}
              <use href={`#${P}-land`} fill="#F6EEDC" stroke="#E4D3AE" strokeWidth={s(0.8)} />

              {/* هالة ضوئية حول المملكة */}
              <use href={`#${P}-ksa-shape`} fill="#FFE2A8" filter={`url(#${P}-halo)`} className="atlas-halo" />

              {/* سماكة الصفيحة: تمنح المملكة عمقًا ثلاثي الأبعاد */}
              <g filter={`url(#${P}-slab)`}>
                {[7, 5, 3].map((dy) => (
                  <use key={dy} href={`#${P}-ksa-shape`} fill={dy === 7 ? "#D9B77A" : "#EBD2A0"} transform={`translate(0 ${s(dy)})`} />
                ))}
              </g>

              {/* أرضية رملية تحت ألوان المناطق */}
              <use href={`#${P}-ksa-shape`} fill="#FFF7E6" />

              {/* المناطق */}
              {atlas.regions.map((r) => {
                const reg = info.get(r.id)!;
                const dim = selected && selected !== r.id;
                return (
                  <use
                    key={r.id}
                    href={`#${P}-r-${r.id}`}
                    data-region={r.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${reg.nameAr}، المقر ${reg.seatAr}`}
                    aria-pressed={selected === r.id}
                    onPointerEnter={() => setHovered(r.id)}
                    onPointerLeave={() => setHovered((h) => (h === r.id ? null : h))}
                    onFocus={() => setHovered(r.id)}
                    onBlur={() => setHovered((h) => (h === r.id ? null : h))}
                    onClick={() => activate(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(r.id); }
                    }}
                    className="atlas-region cursor-pointer outline-none"
                    style={{
                      fill: baseFill(r.id),
                      fillOpacity: baseOpacity(r.id),
                      opacity: dim && layers.population ? 0.5 : 1,
                      transition: reduce ? "none" : "fill-opacity 400ms ease, opacity 400ms ease",
                    }}
                  />
                );
              })}

              {/* التضاريس فوق المملكة فقط */}
              {layers.terrain && (
                <g clipPath={`url(#${P}-ksa)`} pointerEvents="none">
                  {atlas.physical.map((p) => (
                    <use key={p.id} href={`#${P}-ph-${p.id}`} fill={`url(#${P}-${p.kind})`} />
                  ))}
                </g>
              )}

              {/* الحدود الإدارية */}
              <g pointerEvents="none" className={reduce ? "" : "atlas-draw"}>
                {atlas.regions.map((r, i) => (
                  <use
                    key={r.id}
                    href={`#${P}-r-${r.id}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={s(1)}
                    strokeDasharray={`${s(5)} ${s(3)}`}
                    strokeOpacity="0.75"
                    style={{ animationDelay: `${i * 70}ms` }}
                  />
                ))}
                <use href={`#${P}-ksa-shape`} fill="none" stroke="#FFFFFF" strokeWidth={s(2.4)} />
              </g>

              {/* المنطقة المرفوعة عند المرور أو الاختيار */}
              {lifted && (
                <g pointerEvents="none" transform={`translate(0 ${s(-7)})`} filter={`url(#${P}-glow)`}>
                  <use href={`#${P}-r-${lifted}`} fill="#FFF7E6" />
                  <use href={`#${P}-r-${lifted}`} fill={baseFill(lifted)} fillOpacity={layers.population ? 1 : selected === lifted ? 0.92 : 0.75} />
                  {layers.terrain && (
                    <g clipPath={`url(#${P}-c-${lifted})`}>
                      {atlas.physical.map((p) => <use key={p.id} href={`#${P}-ph-${p.id}`} fill={`url(#${P}-${p.kind})`} opacity={0.7} />)}
                    </g>
                  )}
                  <use href={`#${P}-r-${lifted}`} fill="none" stroke="#FFFFFF" strokeWidth={s(2.6)} />
                </g>
              )}

              {/* أسماء البحار والمعالم */}
              {layers.labels && (
                <g pointerEvents="none" fontFamily="var(--font-display)">
                  {atlas.seas.map((sea) => (
                    <text
                      key={sea.label}
                      transform={`translate(${sea.at[0]} ${sea.at[1]}) rotate(${sea.angle})`}
                      textAnchor="middle"
                      fill="#1E6F86"
                      fillOpacity="0.7"
                      fontSize={s(26)}
                    >
                      {sea.label}
                    </text>
                  ))}
                  {layers.terrain && atlas.physical.map((p) => (
                    <text
                      key={p.id}
                      x={p.labelAt[0]}
                      y={p.labelAt[1]}
                      textAnchor="middle"
                      fill="#5A4220"
                      fillOpacity={selected ? 0.5 : 0.85}
                      fontSize={s(p.kind === "desert" ? 22 : 16)}
                      stroke="#FFFFFF"
                      strokeWidth={s(3)}
                      paintOrder="stroke"
                    >
                      {p.label}
                    </text>
                  ))}
                  {layers.terrain && atlas.peaks.map((pk) => (
                    <g key={pk.label} transform={`translate(${pk.at[0]} ${pk.at[1]})`}>
                      <path d={`M0 ${s(-7)} L${s(6)} ${s(4)} L${s(-6)} ${s(4)}Z`} fill="#5A4220" />
                      <text y={s(18)} textAnchor="middle" fontSize={s(13)} fill="#5A4220" stroke="#FFFFFF" strokeWidth={s(2.5)} paintOrder="stroke">
                        {pk.label}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* مقار الإمارات */}
              {layers.seats && (
                <g pointerEvents="none">
                  {atlas.regions.map((r) =>
                    r.seat ? (
                      <g key={r.id} transform={`translate(${r.seat[0]} ${r.seat[1] + (lifted === r.id ? s(-7) : 0)})`}>
                        <circle r={s(9)} fill={info.get(r.id)!.accent} className={reduce ? "" : "seat-pulse"} style={{ animationDelay: `${(r.id.length % 7) * 0.35}s` }} />
                        <rect x={s(-4.5)} y={s(-4.5)} width={s(9)} height={s(9)} transform="rotate(45)" fill="#FFFFFF" stroke="#1E2B28" strokeWidth={s(1.6)} />
                      </g>
                    ) : null,
                  )}
                </g>
              )}

              {/* طبقة الطقس */}
              {layers.weather && weather && (
                <g pointerEvents="none" fontFamily="var(--font-sans)">
                  {atlas.regions.map((r) => {
                    const w = weather[r.id];
                    if (!w || !r.seat) return null;
                    const label = `${describeWeather(w.code, w.isDay).icon} ${Math.round(w.temp)}°`;
                    return (
                      <g key={r.id} transform={`translate(${r.seat[0]} ${r.seat[1] - s(20) + (lifted === r.id ? s(-7) : 0)})`}>
                        <rect x={s(-30)} y={s(-15)} width={s(60)} height={s(26)} rx={s(13)} fill="#FFFFFF" stroke={info.get(r.id)!.accent} strokeWidth={s(2)} />
                        <text textAnchor="middle" y={s(4)} fontSize={s(14)} fontWeight={800} fill="#1E2B28">{label}</text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* أسماء المناطق */}
              {layers.labels && (
                <g pointerEvents="none" fontFamily="var(--font-sans)" fontWeight={700}>
                  {atlas.regions.map((r) => (
                    <text
                      key={r.id}
                      x={r.centroid[0]}
                      y={r.centroid[1] + (lifted === r.id ? s(-7) : 0) + s(r.seat ? 24 : 0)}
                      textAnchor="middle"
                      fontSize={s(selected === r.id ? 19 : 14)}
                      fill="#1E2B28"
                      stroke="#FFFFFF"
                      strokeWidth={s(3.5)}
                      paintOrder="stroke"
                      opacity={selected && selected !== r.id ? 0.45 : 1}
                    >
                      {info.get(r.id)!.shortAr}
                    </text>
                  ))}
                </g>
              )}
            </g>

            {/* سهم الشمال */}
            <g transform={`translate(${vb.x + vb.w * 0.33} ${vb.y + vb.h - 70})`} pointerEvents="none" aria-hidden display={isLg && view.k === 1 ? undefined : "none"}>
              <circle r="26" fill="#FFFFFF" fillOpacity="0.6" stroke="#1E6F86" strokeOpacity="0.4" />
              <path d="M0 -22 L7 6 L0 1 L-7 6 Z" fill="#E5534B" />
              <text y="42" textAnchor="middle" fill="#1E6F86" fontSize="14" fontFamily="var(--font-sans)">ش</text>
            </g>
          </svg>

          {/* بطاقة الاسم عند المرور */}
          {tip && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[130%] rounded-xl bg-white px-3.5 py-2 text-ink shadow-[0_16px_34px_-14px_rgba(30,111,134,0.55)] ring-1 ring-ink/5"
              style={tipPos(tip.centroid)}
              role="status"
            >
              <p className="font-display text-lg leading-7">{info.get(tip.id)!.nameAr}</p>
              <p className="text-xs text-ink/60">المقر: {info.get(tip.id)!.seatAr}</p>
            </div>
          )}

          {/* أدوات التحكم */}
          <div className="absolute end-3 top-3 flex gap-1.5 lg:bottom-8 lg:end-8 lg:top-auto lg:flex-col" role="group" aria-label="التحكم في الخريطة">
            <MapButton label="تكبير" onClick={() => zoomBy(1.4)}>+</MapButton>
            <MapButton label="تصغير" onClick={() => zoomBy(1 / 1.4)}>−</MapButton>
            <MapButton label="إعادة ضبط الخريطة" onClick={reset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </MapButton>
          </div>
          <fieldset className="glass-panel mx-5 mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl px-4 py-2 text-sm text-ink/80 sm:mx-8 lg:absolute lg:end-8 lg:top-6 lg:m-0">
            <legend className="sr-only">طبقات الخريطة</legend>
            <LayerToggle checked={layers.terrain} onChange={(v) => setLayers((l) => ({ ...l, terrain: v }))} label="التضاريس" />
            <LayerToggle checked={layers.labels} onChange={(v) => setLayers((l) => ({ ...l, labels: v }))} label="الأسماء" />
            <LayerToggle checked={layers.seats} onChange={(v) => setLayers((l) => ({ ...l, seats: v }))} label="مقار الإمارات" />
            <LayerToggle checked={layers.population} onChange={(v) => setLayers((l) => ({ ...l, population: v }))} label="السكان 2022" />
            <LayerToggle checked={layers.weather} onChange={(v) => setLayers((l) => ({ ...l, weather: v }))} label="الطقس الآن" />
            <button
              type="button"
              onClick={() => setTouring((t) => !t)}
              aria-pressed={touring}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition ${touring ? "bg-coral text-white" : "bg-gradient-to-l from-coral to-sun text-white"}`}
            >
              <span aria-hidden>{touring ? "⏸" : "▶"}</span>
              {touring ? "إيقاف الجولة" : "جولة تلقائية"}
            </button>
          </fieldset>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px]">
        {/* لوحة المنطقة على الشاشات الصغيرة */}
        <div aria-live="polite" className="px-5 sm:px-8 lg:hidden">
          <AnimatePresence mode="wait">{panel}</AnimatePresence>
        </div>

        {/* الطبقات والقائمة البديلة */}
        <div className="relative z-10 grid gap-4 px-5 pb-14 pt-6 sm:px-8 lg:px-12">
          <nav aria-label="قائمة المناطق على الخريطة">
            <ul className="flex flex-wrap gap-2">
              {[...regions].sort((a, b) => a.shortAr.localeCompare(b.shortAr, "ar")).map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    aria-pressed={selected === r.id}
                    onClick={() => { setTouring(false); select(selected === r.id ? null : r.id); }}
                    onPointerEnter={() => setHovered(r.id)}
                    onPointerLeave={() => setHovered((h) => (h === r.id ? null : h))}
                    style={selected === r.id ? { background: r.accent } : undefined}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
                      selected === r.id ? "border-transparent text-white shadow-md" : "border-ink/10 bg-white/75 text-ink/80 hover:border-ink/25 hover:bg-white"
                    }`}
                  >
                    <span className="inline-block size-2.5 rounded-full ring-2 ring-white" style={{ background: selected === r.id ? "#fff" : r.accent }} aria-hidden />
                    {r.shortAr}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {layers.population && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink/75" aria-label="وسيلة إيضاح طبقة السكان">
              {POP_CLASSES.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-1.5">
                  <span className="inline-block size-3 rounded-sm border border-ink/15" style={{ background: c.fill }} />
                  {c.label}
                </span>
              ))}
              <span className="text-ink/55">المصدر: الهيئة العامة للإحصاء، تعداد 2022</span>
            </div>
          )}
          <p className="text-[0.7rem] text-ink/50">
            الحدود الإدارية مرحلية من Natural Earth، والمعالم الطبيعية تقريبية للإيضاح؛ المرجع الرسمي للحدود هو الهيئة العامة للمساحة والمعلومات الجيومكانية.
          </p>
        </div>
      </div>
    </section>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="glass-panel inline-flex size-11 items-center justify-center rounded-xl text-xl text-ink hover:text-coral"
    >
      {children}
    </button>
  );
}

function LayerToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[#F28C38]" />
      {label}
    </label>
  );
}
