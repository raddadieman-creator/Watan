"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";

export interface CompareRegion {
  id: string;
  shortAr: string;
  accent: string;
  population: number;
  areaKm2: number;
  governorates: number | null;
}

type Metric = "population" | "areaKm2" | "density";

const METRICS: Record<Metric, { label: string; unit: string; note: string }> = {
  population: { label: "السكان", unit: "نسمة", note: "تعداد 2022 — الهيئة العامة للإحصاء" },
  areaKm2: { label: "المساحة", unit: "كم²", note: "قيم تقريبية — سعوديبيديا" },
  density: { label: "الكثافة السكانية", unit: "نسمة/كم²", note: "مشتقة: سكان 2022 ÷ مساحة تقريبية؛ لذلك هي تقريبية أيضًا" },
};

function value(r: CompareRegion, m: Metric) {
  if (m === "density") return r.population / r.areaKm2;
  return r[m];
}

export function RegionCompare({ regions }: { regions: CompareRegion[] }) {
  const [metric, setMetric] = useState<Metric>("population");
  const [a, setA] = useState("madinah");
  const [b, setB] = useState("asir");
  const sorted = [...regions].sort((x, y) => value(y, metric) - value(x, metric));
  const max = value(sorted[0], metric);
  const fmt = (n: number) => (metric === "density" ? n.toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 1 }) : formatNumber(Math.round(n)));
  const ra = regions.find((r) => r.id === a)!;
  const rb = regions.find((r) => r.id === b)!;

  return (
    <div className="grid gap-12">
      <section aria-labelledby="chart-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="chart-h" className="font-display text-2xl font-bold text-green-deep">المناطق حسب {METRICS[metric].label}</h2>
          <div role="radiogroup" aria-label="اختر المؤشر" className="inline-flex rounded-full border border-line bg-paper p-1">
            {(Object.keys(METRICS) as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={metric === m}
                onClick={() => setMetric(m)}
                className={`min-h-10 rounded-full px-4 text-sm ${metric === m ? "bg-green-deep text-ivory" : "text-ink-muted hover:text-green-deep"}`}
              >
                {METRICS[m].label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-sm text-ink-muted">{METRICS[metric].note}</p>
        <ol className="mt-6 grid gap-2.5">
          {sorted.map((r) => {
            const v = value(r, metric);
            return (
              <li key={r.id} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr_9rem]">
                <span className="text-sm">{r.shortAr}</span>
                <span className="h-5 rounded-e-md" style={{ width: `${Math.max(1.5, (v / max) * 100)}%`, background: r.accent }} aria-hidden />
                <span className="num col-start-2 text-sm text-ink-muted sm:col-start-auto">{fmt(v)} {METRICS[metric].unit}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="cmp-h" className="rounded-2xl border border-line bg-paper p-5 sm:p-8">
        <h2 id="cmp-h" className="font-display text-2xl font-bold text-green-deep">قارن بين منطقتين</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[{ v: a, set: setA, id: "cmp-a" }, { v: b, set: setB, id: "cmp-b" }].map((s, i) => (
            <label key={s.id} htmlFor={s.id} className="grid gap-1.5 text-sm text-ink-muted">
              {i === 0 ? "المنطقة الأولى" : "المنطقة الثانية"}
              <select id={s.id} value={s.v} onChange={(e) => s.set(e.target.value)} className="h-11 rounded-lg border border-line bg-ivory px-3 text-base text-charcoal">
                {[...regions].sort((x, y) => x.shortAr.localeCompare(y.shortAr, "ar")).map((r) => (
                  <option key={r.id} value={r.id}>{r.shortAr}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <table className="mt-6 w-full text-start">
          <caption className="sr-only">مقارنة {ra.shortAr} و{rb.shortAr}</caption>
          <thead>
            <tr className="border-b border-line text-sm text-ink-muted">
              <th scope="col" className="py-2 text-start font-medium">المؤشر</th>
              <th scope="col" className="py-2 text-start font-display font-bold text-charcoal">{ra.shortAr}</th>
              <th scope="col" className="py-2 text-start font-display font-bold text-charcoal">{rb.shortAr}</th>
            </tr>
          </thead>
          <tbody className="num">
            {(["population", "areaKm2", "density"] as Metric[]).map((m) => {
              const va = value(ra, m), vb = value(rb, m);
              const f = (n: number) => (m === "density" ? n.toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 1 }) : formatNumber(Math.round(n)));
              return (
                <tr key={m} className="border-b border-line/60">
                  <th scope="row" className="py-3 text-start text-sm font-normal text-ink-muted">{METRICS[m].label}{m !== "population" && " (تقريبية)"}</th>
                  <td className={`py-3 ${va > vb ? "font-bold text-green-deep" : ""}`}>{f(va)}</td>
                  <td className={`py-3 ${vb > va ? "font-bold text-green-deep" : ""}`}>{f(vb)}</td>
                </tr>
              );
            })}
            <tr>
              <th scope="row" className="py-3 text-start text-sm font-normal text-ink-muted">المحافظات</th>
              <td className="py-3">{ra.governorates ?? "بحاجة للتحقق"}</td>
              <td className="py-3">{rb.governorates ?? "بحاجة للتحقق"}</td>
            </tr>
          </tbody>
        </table>
        {a === b && <p className="mt-3 text-sm text-[#8A6A2E]">اخترت المنطقة نفسها مرتين. غيّر إحدى القائمتين لترى الفرق.</p>}
      </section>
    </div>
  );
}
