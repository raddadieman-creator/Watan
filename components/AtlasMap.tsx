"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCompact, formatNumber } from "@/lib/format";

export interface MapShape {
  id: string;
  d: string;
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
  seat: [number, number] | null;
}

export interface MapRegionInfo {
  id: string;
  nameAr: string;
  shortAr: string;
  seatAr: string;
  population: number;
  areaKm2: number;
  governorates: number | null;
  detailLevel: "full" | "basic";
}

interface Props {
  shapes: MapShape[];
  regions: MapRegionInfo[];
  width: number;
  height: number;
}

type View = { k: number; tx: number; ty: number };

const POP_CLASSES = [
  { max: 600_000, fill: "#1E5A4B", label: "أقل من 600 ألف" },
  { max: 1_500_000, fill: "#2F7A60", label: "600 ألف – 1.5 مليون" },
  { max: 2_500_000, fill: "#6E9A6A", label: "1.5 – 2.5 مليون" },
  { max: 6_000_000, fill: "#B89A5E", label: "2.5 – 6 ملايين" },
  { max: Infinity, fill: "#D9BE84", label: "أكثر من 6 ملايين" },
];

function popFill(p: number) {
  return POP_CLASSES.find((c) => p < c.max)!.fill;
}

export function AtlasMap({ shapes, regions, width: W, height: H }: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>({ k: 1, tx: 0, ty: 0 });
  const [layers, setLayers] = useState({ population: false, seats: true, labels: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const info = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);
  const shapeById = useMemo(() => new Map(shapes.map((s) => [s.id, s])), [shapes]);

  const fitTo = useCallback(
    (id: string | null) => {
      if (!id) return setView({ k: 1, tx: 0, ty: 0 });
      const s = shapeById.get(id);
      if (!s) return;
      const [[x0, y0], [x1, y1]] = s.bounds;
      // على الشاشات الكبيرة تُعرض لوحة الملخص فوق أسفل الخريطة، فتُوضع المنطقة في الجزء العلوي
      const lg = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
      const boxH = lg ? H * 0.66 : H;
      const k = Math.min(5, 0.74 / Math.max((x1 - x0) / W, (y1 - y0) / boxH));
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      setView({ k, tx: W / 2 - k * cx, ty: boxH / 2 - k * cy });
    },
    [shapeById, W, H],
  );

  const select = useCallback(
    (id: string | null) => {
      setSelected(id);
      fitTo(id);
    },
    [fitTo],
  );

  const zoomBy = (factor: number) => {
    setView((v) => {
      const k = Math.min(6, Math.max(1, v.k * factor));
      const cx = (W / 2 - v.tx) / v.k;
      const cy = (H / 2 - v.ty) / v.k;
      return k === 1 && !selected ? { k: 1, tx: 0, ty: 0 } : { k, tx: W / 2 - k * cx, ty: H / 2 - k * cy };
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected) select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  const toPct = (x: number, y: number) => ({
    left: `${((x * view.k + view.tx) / W) * 100}%`,
    top: `${((y * view.k + view.ty) / H) * 100}%`,
  });

  const tipId = hovered && hovered !== selected ? hovered : null;
  const tipShape = tipId ? shapeById.get(tipId) : null;
  const tipInfo = tipId ? info.get(tipId) : null;
  const sel = selected ? info.get(selected) : null;

  return (
    <div className="grid gap-6">
      <div ref={containerRef} className="relative">
        {/* أدوات الخريطة */}
        <div className="absolute end-2 top-2 z-10 flex flex-col gap-1.5" role="group" aria-label="التحكم في الخريطة">
          <MapButton label="تكبير" onClick={() => zoomBy(1.4)}>+</MapButton>
          <MapButton label="تصغير" onClick={() => zoomBy(1 / 1.4)}>−</MapButton>
          <MapButton label="إعادة ضبط الخريطة" onClick={() => select(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </MapButton>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sand/15 bg-green-deep/30">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-manipulation select-none"
          role="group"
          aria-label="خريطة المملكة العربية السعودية بمناطقها الإدارية الثلاث عشرة. استخدم مفتاح Tab للتنقل بين المناطق وEnter لاختيارها."
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g
            style={{
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})`,
              transformOrigin: "0 0",
              transition: reduce ? "none" : "transform 900ms var(--ease-atlas)",
            }}
          >
            {shapes.map((s) => {
              const r = info.get(s.id)!;
              const isSel = selected === s.id;
              const isHov = hovered === s.id;
              const dim = selected && !isSel;
              const base = layers.population ? popFill(r.population) : "rgba(248,245,237,0.07)";
              return (
                <path
                  key={s.id}
                  d={s.d}
                  data-region={s.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${r.nameAr}، المقر ${r.seatAr}`}
                  aria-pressed={isSel}
                  onPointerEnter={() => setHovered(s.id)}
                  onPointerLeave={() => setHovered((h) => (h === s.id ? null : h))}
                  onFocus={() => setHovered(s.id)}
                  onBlur={() => setHovered((h) => (h === s.id ? null : h))}
                  onClick={() => (isSel ? router.push(`/regions/${s.id}`) : select(s.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isSel) router.push(`/regions/${s.id}`);
                      else select(s.id);
                    }
                  }}
                  className="cursor-pointer outline-none"
                  style={{
                    fill: isSel ? "#F8F5ED" : isHov ? "#16745D" : base,
                    fillOpacity: dim ? 0.45 : 1,
                    stroke: isSel || isHov ? "#E7D9BC" : "rgba(197,164,109,0.7)",
                    strokeWidth: isSel || isHov ? 1.8 : 0.9,
                    vectorEffect: "non-scaling-stroke",
                    transition: reduce ? "none" : "fill 220ms ease, fill-opacity 300ms ease, stroke 220ms ease",
                  }}
                />
              );
            })}

            {/* حدود المنطقة المحددة فوق غيرها */}
            {selected && (
              <path
                d={shapeById.get(selected)!.d}
                fill="none"
                stroke="#C5A46D"
                strokeWidth={2.6}
                style={{ vectorEffect: "non-scaling-stroke" }}
                filter="url(#glow)"
                pointerEvents="none"
              />
            )}

            {layers.seats &&
              shapes.map((s) =>
                s.seat ? (
                  <g key={`seat-${s.id}`} pointerEvents="none">
                    <circle cx={s.seat[0]} cy={s.seat[1]} r={5 / view.k} fill={selected === s.id ? "#103B32" : "#C5A46D"} />
                    <circle cx={s.seat[0]} cy={s.seat[1]} r={9 / view.k} fill="none" stroke={selected === s.id ? "#103B32" : "#C5A46D"} strokeOpacity={0.6} strokeWidth={1} style={{ vectorEffect: "non-scaling-stroke" }} />
                  </g>
                ) : null,
              )}

            {layers.labels &&
              shapes.map((s) => (
                <text
                  key={`lbl-${s.id}`}
                  x={s.centroid[0]}
                  y={s.centroid[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  style={{ fontSize: `${13 / view.k}px`, fontFamily: "var(--font-display)" }}
                  fill={selected === s.id ? "#103B32" : "#F8F5ED"}
                  stroke={selected === s.id ? "none" : "#103B32"}
                  strokeWidth={3 / view.k}
                  paintOrder="stroke"
                >
                  {info.get(s.id)!.shortAr}
                </text>
              ))}
          </g>
        </svg>
        </div>

        {/* بطاقة موجزة عند المرور أو التركيز */}
        {tipShape && tipInfo && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[115%] rounded-lg border border-sand/50 bg-charcoal/92 px-3 py-2 text-ivory shadow-lg"
            style={toPct(tipShape.centroid[0], tipShape.centroid[1])}
            role="status"
          >
            <p className="font-display text-sm font-bold leading-6">{tipInfo.nameAr}</p>
            <p className="text-xs text-ivory/75">المقر: {tipInfo.seatAr}</p>
          </div>
        )}

        {/* لوحة المنطقة المختارة */}
        <div aria-live="polite" className="mt-4 lg:absolute lg:inset-x-4 lg:bottom-4 lg:z-20 lg:mt-0">
          <AnimatePresence mode="wait">
            {sel && (
              <motion.section
                key={sel.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }}
                className="rounded-2xl border border-sand/40 bg-ivory p-5 text-charcoal shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-6 lg:gap-y-3 lg:p-5"
                aria-label={`ملخص ${sel.nameAr}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 lg:col-span-2">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-green-deep lg:text-xl">{sel.nameAr}</h3>
                    <p className="mt-1 text-sm text-ink-muted">المقر الإداري: {sel.seatAr}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => select(null)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted hover:border-sand hover:text-green-deep"
                  >
                    عرض المملكة كاملة
                  </button>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-line py-4 lg:mt-0 lg:border-b-0 lg:pb-0 lg:pt-3">
                  <div>
                    <dt className="text-xs text-ink-muted">السكان، تعداد 2022</dt>
                    <dd className="num mt-1 whitespace-nowrap font-display text-lg font-bold text-charcoal" title={formatNumber(sel.population)}>{formatCompact(sel.population)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">المساحة التقريبية</dt>
                    <dd className="num mt-1 whitespace-nowrap font-display text-lg font-bold text-charcoal">{formatNumber(sel.areaKm2)} كم²</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">المحافظات</dt>
                    <dd className="num mt-1 whitespace-nowrap font-display text-lg font-bold text-charcoal">{sel.governorates ?? "بحاجة للتحقق"}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-3 lg:mt-0 lg:flex-col lg:items-end lg:pt-3">
                  <Link
                    href={`/regions/${sel.id}`}
                    className="inline-flex h-11 items-center rounded-full bg-green-deep px-5 font-display text-sm font-medium text-ivory hover:bg-emerald"
                  >
                    افتح صفحة {sel.shortAr}
                  </Link>
                  {sel.detailLevel === "basic" && (
                    <span className="max-w-[11rem] text-xs leading-5 text-ink-muted">صفحة أساسية؛ المحتوى التفصيلي قيد التوثيق</span>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* الطبقات ووسيلة الإيضاح */}
      <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ivory/85">
        <legend className="sr-only">طبقات الخريطة</legend>
        <LayerToggle checked={layers.seats} onChange={(v) => setLayers((l) => ({ ...l, seats: v }))} label="مقار الإمارات" />
        <LayerToggle checked={layers.labels} onChange={(v) => setLayers((l) => ({ ...l, labels: v }))} label="أسماء المناطق" />
        <LayerToggle checked={layers.population} onChange={(v) => setLayers((l) => ({ ...l, population: v }))} label="السكان (تعداد 2022)" />
      </fieldset>
      {layers.population && (
        <div className="-mt-2 flex flex-wrap items-center gap-3 text-xs text-ivory/80" aria-label="وسيلة إيضاح طبقة السكان">
          {POP_CLASSES.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-sm border border-ivory/30" style={{ background: c.fill }} />
              {c.label}
            </span>
          ))}
        </div>
      )}

      {/* قائمة بديلة مرتبطة بالخريطة: تعمل بلوحة المفاتيح وقارئات الشاشة */}
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
                className={`min-h-10 rounded-full border px-3.5 text-sm transition-colors ${
                  selected === r.id
                    ? "border-sand bg-sand text-green-deep"
                    : "border-ivory/20 text-ivory/85 hover:border-sand/70 hover:text-ivory"
                }`}
              >
                {r.shortAr}
              </button>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-sand/40 bg-green-deep/80 font-display text-lg text-ivory backdrop-blur hover:border-sand hover:text-sand"
    >
      {children}
    </button>
  );
}

function LayerToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[#C5A46D]"
      />
      {label}
    </label>
  );
}
