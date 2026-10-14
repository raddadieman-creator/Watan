import regionsJson from "@/data/regions.json";
import sourcesJson from "@/data/sources.json";
import heritageJson from "@/data/heritage.json";
import type { Indicator, IntangibleElement, Region, Source, WorldHeritageSite } from "./types";
import { formatNumber } from "./format";

export const regions = regionsJson as Region[];
export const sources = sourcesJson as Record<string, Source>;
export const worldHeritage = heritageJson.worldHeritage as WorldHeritageSite[];
export const intangible = heritageJson.intangible as IntangibleElement[];
export const intangibleNotes = heritageJson.intangibleNotes as string[];

export const NATIONAL_POPULATION_2022 = 32175224;

export function getRegion(id: string): Region | undefined {
  return regions.find((r) => r.id === id);
}

export function getSource(id: string): Source {
  const s = sources[id];
  if (!s) throw new Error(`Unknown source id: ${id}`);
  return s;
}

/** ترتيب الرحلة عبر المناطق: يبدأ بالنماذج المفصلة ثم بقية المناطق */
export const journeyOrder = [
  "riyadh", "madinah", "asir", "makkah", "eastern", "qassim", "hail",
  "tabuk", "jawf", "northern-borders", "najran", "jazan", "bahah",
];

export function journeyNeighbors(id: string) {
  const i = journeyOrder.indexOf(id);
  const prev = i > 0 ? getRegion(journeyOrder[i - 1]) : undefined;
  const next = i < journeyOrder.length - 1 ? getRegion(journeyOrder[i + 1]) : undefined;
  return { prev, next, index: i + 1, total: journeyOrder.length };
}

export function sitesInRegion(id: string) {
  return worldHeritage.filter((s) => s.region === id);
}

export function intangibleInRegion(id: string) {
  return intangible.filter((e) => e.regions.includes(id));
}

export function sourcesForRegion(r: Region): string[] {
  const ids = new Set<string>([r.population.source, r.areaKm2.source, r.governorates.source, "natural-earth"]);
  r.sections.forEach((s) => s.items.forEach((it) => it.sources.forEach((x) => ids.add(x))));
  if (sitesInRegion(r.id).length) ids.add("unesco-whc-sa");
  if (intangibleInRegion(r.id).length) ids.add("unesco-ich-sa");
  if (r.universities.length || r.detailLevel === "basic") ids.add("moe");
  return [...ids];
}

export const indicators: Indicator[] = [
  {
    id: "regions",
    label: "المناطق الإدارية",
    value: "13",
    detail: "لكل منطقة إمارة ومقر إداري",
    status: "verified",
    sources: ["saudipedia-provinces"],
    href: "/regions",
  },
  {
    id: "population",
    label: "السكان",
    value: formatNumber(NATIONAL_POPULATION_2022),
    detail: "تعداد 2022",
    status: "verified",
    sources: ["gastat-census-2022"],
    href: "/numbers",
  },
  {
    id: "area",
    label: "المساحة",
    value: "أكثر من مليوني كم²",
    detail: "نحو 70% من شبه الجزيرة العربية",
    status: "verified",
    sources: ["saudipedia-geography"],
  },
  {
    id: "whs",
    label: "مواقع التراث العالمي",
    value: String(worldHeritage.length),
    detail: `آخرها ${Math.max(...worldHeritage.map((s) => s.year))}`,
    status: "verified",
    sources: ["unesco-whc-sa"],
    href: "/heritage#world",
  },
  {
    id: "ich",
    label: "عناصر التراث غير المادي لدى اليونسكو",
    value: String(intangible.length),
    detail: `من 2015 إلى ${Math.max(...intangible.map((e) => e.year))}`,
    status: "verified",
    sources: ["unesco-ich-sa"],
    href: "/heritage#intangible",
  },
  {
    id: "universities",
    label: "الجامعات",
    value: "بحاجة للتحقق",
    detail: "يُعتمد العدد بعد تحديد التعريف (حكومية، أهلية، أو كلتاهما) من قوائم وزارة التعليم",
    status: "pending",
    sources: ["moe"],
  },
];
