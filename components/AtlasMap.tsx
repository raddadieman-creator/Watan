"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AtlasPatterns } from "./AtlasDefs";
import { formatCompact, formatNumber } from "@/lib/format";
import type { AtlasData } from "@/lib/geo";

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
}

interface Props {
  atlas: AtlasData;
  regions: MapRegionInfo[];
  /** محتوى الافتتاحية (العنوان والأزرار) — يُستبدل بملخص المنطقة عند اختيارها على الشاشات الكبيرة */
  intro: React.ReactNode;
}

type View = { k: number; tx: number; ty: number };

const POP_CLASSES = [
  { max: 600_000, fill: "#E9DDBF", label: "أقل من 600 ألف" },
  { max: 1_500_000, fill: "#D6BE8A", label: "600 ألف – 1.5 مليون" },
  { max: 2_500_000, fill: "#B99558", label: "1.5 – 2.5 مليون" },
  { max: 6_000_000, fill: "#8F6B37", label: "2.5 – 6 ملايين" },
  { max: Infinity, fill: "#5E4423", label: "أكثر من 6 ملايين" },
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
  const [layers, setLayers] = useState({ terrain: true, labels: true, seats: true, population: false });
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
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && selected) select(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  const activate = (id: string) => (selected === id ? router.push(`/regions/${id}`) : select(id));
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

  const baseFill = (id: string) =>
    layers.population ? popFill(info.get(id)!.population) : `url(#${P}-parchment)`;

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
      <p className="flex items-center gap-2 text-sm text-sand">
        <span className="inline-block h-px w-8 bg-sand" aria-hidden />
        المنطقة المختارة
      </p>
      <h2 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,3.8rem)] font-bold leading-[1.15] text-ivory">{sel.nameAr}</h2>
      <p className="mt-2 text-ivory/70">المقر الإداري: {sel.seatAr}</p>
      <dl className="mt-7 grid grid-cols-3 border-y border-sand/25">
        {[
          { k: "السكان، تعداد 2022", v: formatCompact(sel.population), t: formatNumber(sel.population) },
          { k: "المساحة التقريبية", v: `${formatNumber(sel.areaKm2)}`, u: "كم²" },
          { k: "المحافظات", v: sel.governorates != null ? String(sel.governorates) : "—" },
        ].map((x, i) => (
          <div key={x.k} className={`py-4 ${i > 0 ? "border-s border-sand/25 ps-4" : ""}`}>
            <dt className="text-xs text-ivory/60">{x.k}</dt>
            <dd className="num mt-1 whitespace-nowrap text-xl font-extrabold text-ivory" title={x.t}>
              {x.v} {x.u && <span className="text-sm font-normal text-ivory/70">{x.u}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link href={`/regions/${sel.id}`} className="btn-gold">افتح صفحة {sel.shortAr}</Link>
        <button type="button" onClick={() => select(null)} className="btn-ghost">عرض المملكة كاملة</button>
      </div>
      {sel.detailLevel === "basic" && (
        <p className="mt-4 text-xs text-ivory/55">صفحة أساسية؛ المحتوى التفصيلي قيد التوثيق ولن يُنشر إلا بمصادره.</p>
      )}
    </motion.section>
  );

  return (
    <section className="atlas-plate relative overflow-hidden text-ivory" aria-label="أطلس وطن التفاعلي">
      <div className="relative mx-auto max-w-[1600px] lg:grid lg:h-[calc(100svh-72px)] lg:[direction:rtl] lg:min-h-[660px] lg:max-h-[980px] lg:grid-cols-[minmax(24rem,32rem)_minmax(0,1fr)]">
        {/* الافتتاحية، وتحل محلها لوحة المنطقة المختارة على الشاشات الكبيرة */}
        <div className="relative z-10 px-5 pt-10 sm:px-8 lg:flex lg:items-center lg:bg-gradient-to-l lg:from-[#0A2B24] lg:from-35% lg:via-[#0A2B24]/75 lg:via-65% lg:to-transparent lg:py-10 lg:pe-0 lg:ps-12">
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
              <clipPath id={`${P}-ksa`}>
                {atlas.regions.map((r) => <use key={r.id} href={`#${P}-r-${r.id}`} />)}
              </clipPath>
              <radialGradient id={`${P}-sea`} cx="42%" cy="45%" r="70%">
                <stop offset="0%" stopColor="#15493E" />
                <stop offset="100%" stopColor="#0A2B24" />
              </radialGradient>
            </defs>

            <path d={atlas.graticule} fill="none" stroke="#C5A46D" strokeOpacity="0.1" strokeWidth="0.8" strokeDasharray="2 6" />

            <g
              style={{
                transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})`,
                transformOrigin: "0 0",
                transition: reduce ? "none" : "transform 1100ms var(--ease-atlas)",
              }}
            >
              {/* خطوط الماء الساحلية: اصطلاح خرائطي يحدد الساحل */}
              {[20, 11, 5].map((w, i) => (
                <use key={w} href={`#${P}-land`} fill="none" stroke="#9FC2B4" strokeOpacity={[0.035, 0.05, 0.08][i]} strokeWidth={s(w)} strokeLinejoin="round" />
              ))}
              {/* اليابسة المجاورة */}
              <use href={`#${P}-land`} fill="#1C4A3F" stroke="#3E6B5D" strokeWidth={s(0.8)} />

              {/* سماكة الصفيحة: تمنح المملكة عمقًا ثلاثي الأبعاد */}
              <g filter={`url(#${P}-slab)`}>
                {[7, 5, 3].map((dy) => (
                  <use key={dy} href={`#${P}-ksa-shape`} fill={dy === 7 ? "#5B4526" : "#8A6C40"} transform={`translate(0 ${s(dy)})`} />
                ))}
              </g>

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
                      opacity: dim ? 0.55 : 1,
                      transition: reduce ? "none" : "opacity 400ms ease",
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
                    stroke="#7D6037"
                    strokeWidth={s(1)}
                    strokeDasharray={`${s(5)} ${s(3)}`}
                    strokeOpacity="0.75"
                    style={{ animationDelay: `${i * 70}ms` }}
                  />
                ))}
                <use href={`#${P}-ksa-shape`} fill="none" stroke="#C5A46D" strokeWidth={s(1.6)} />
              </g>

              {/* المنطقة المرفوعة عند المرور أو الاختيار */}
              {lifted && (
                <g pointerEvents="none" transform={`translate(0 ${s(-7)})`} filter={`url(#${P}-lift)`}>
                  <use href={`#${P}-r-${lifted}`} fill={baseFill(lifted)} />
                  <use href={`#${P}-r-${lifted}`} fill={info.get(lifted)!.accent} fillOpacity={selected === lifted ? 0.82 : 0.4} />
                  {layers.terrain && (
                    <g clipPath={`url(#${P}-c-${lifted})`}>
                      {atlas.physical.map((p) => <use key={p.id} href={`#${P}-ph-${p.id}`} fill={`url(#${P}-${p.kind})`} opacity={0.7} />)}
                    </g>
                  )}
                  <use href={`#${P}-r-${lifted}`} fill="none" stroke="#F3E3BC" strokeWidth={s(2)} />
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
                      fill="#CFE0D8"
                      fillOpacity="0.55"
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
                      fill="#6B4F2A"
                      fillOpacity={selected ? 0.5 : 0.85}
                      fontSize={s(p.kind === "desert" ? 22 : 16)}
                      stroke="#F1E6CC"
                      strokeWidth={s(3)}
                      paintOrder="stroke"
                    >
                      {p.label}
                    </text>
                  ))}
                  {layers.terrain && atlas.peaks.map((pk) => (
                    <g key={pk.label} transform={`translate(${pk.at[0]} ${pk.at[1]})`}>
                      <path d={`M0 ${s(-7)} L${s(6)} ${s(4)} L${s(-6)} ${s(4)}Z`} fill="#5B4526" />
                      <text y={s(18)} textAnchor="middle" fontSize={s(13)} fill="#5B4526" stroke="#F1E6CC" strokeWidth={s(2.5)} paintOrder="stroke">
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
                        <rect x={s(-4.5)} y={s(-4.5)} width={s(9)} height={s(9)} transform="rotate(45)" fill="#103B32" stroke="#F3E3BC" strokeWidth={s(1.5)} />
                      </g>
                    ) : null,
                  )}
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
                      fill={selected === r.id ? "#FFFDF7" : "#2A2216"}
                      stroke={selected === r.id ? "#2A2216" : "#F4EAD2"}
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
            <g transform={`translate(${vb.x + vb.w - 60} ${vb.y + vb.h - 90})`} pointerEvents="none" aria-hidden>
              <circle r="26" fill="none" stroke="#C5A46D" strokeOpacity="0.5" />
              <path d="M0 -22 L7 6 L0 1 L-7 6 Z" fill="#C5A46D" />
              <text y="42" textAnchor="middle" fill="#C5A46D" fontSize="14" fontFamily="var(--font-sans)">ش</text>
            </g>
          </svg>

          {/* بطاقة الاسم عند المرور */}
          {tip && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[130%] rounded-md border border-sand/50 bg-[#0B2A23]/95 px-3 py-1.5 text-ivory shadow-xl"
              style={tipPos(tip.centroid)}
              role="status"
            >
              <p className="font-display text-lg leading-7">{info.get(tip.id)!.nameAr}</p>
              <p className="text-xs text-ivory/70">المقر: {info.get(tip.id)!.seatAr}</p>
            </div>
          )}

          {/* أدوات التحكم */}
          <div className="absolute end-3 top-3 flex gap-1.5 lg:bottom-8 lg:end-8 lg:top-auto lg:flex-col" role="group" aria-label="التحكم في الخريطة">
            <MapButton label="تكبير" onClick={() => zoomBy(1.4)}>+</MapButton>
            <MapButton label="تصغير" onClick={() => zoomBy(1 / 1.4)}>−</MapButton>
            <MapButton label="إعادة ضبط الخريطة" onClick={() => select(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </MapButton>
          </div>
          <fieldset className="glass-panel mx-5 mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl px-4 py-2 text-sm text-ivory/85 sm:mx-8 lg:absolute lg:end-8 lg:top-6 lg:m-0">
            <legend className="sr-only">طبقات الخريطة</legend>
            <LayerToggle checked={layers.terrain} onChange={(v) => setLayers((l) => ({ ...l, terrain: v }))} label="التضاريس" />
            <LayerToggle checked={layers.labels} onChange={(v) => setLayers((l) => ({ ...l, labels: v }))} label="الأسماء" />
            <LayerToggle checked={layers.seats} onChange={(v) => setLayers((l) => ({ ...l, seats: v }))} label="مقار الإمارات" />
            <LayerToggle checked={layers.population} onChange={(v) => setLayers((l) => ({ ...l, population: v }))} label="السكان 2022" />
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
                    onClick={() => select(selected === r.id ? null : r.id)}
                    onPointerEnter={() => setHovered(r.id)}
                    onPointerLeave={() => setHovered((h) => (h === r.id ? null : h))}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
                      selected === r.id ? "border-sand bg-sand text-green-deep" : "border-ivory/15 bg-[#0B2A23]/40 text-ivory/85 hover:border-sand/70 hover:text-ivory"
                    }`}
                  >
                    <span className="inline-block size-2 rounded-full" style={{ background: r.accent }} aria-hidden />
                    {r.shortAr}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {layers.population && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-ivory/80" aria-label="وسيلة إيضاح طبقة السكان">
              {POP_CLASSES.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-1.5">
                  <span className="inline-block size-3 rounded-sm border border-ivory/30" style={{ background: c.fill }} />
                  {c.label}
                </span>
              ))}
              <span className="text-ivory/55">المصدر: الهيئة العامة للإحصاء، تعداد 2022</span>
            </div>
          )}
          <p className="text-[0.7rem] text-ivory/45">
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
      className="glass-panel inline-flex size-11 items-center justify-center rounded-xl text-xl text-ivory hover:text-sand"
    >
      {children}
    </button>
  );
}

function LayerToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[#C5A46D]" />
      {label}
    </label>
  );
}
