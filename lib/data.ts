import regionsJson from "@/data/regions.json";
import sourcesJson from "@/data/sources.json";
import heritageJson from "@/data/heritage.json";
import universitiesJson from "@/data/universities.json";
import folkArtsJson from "@/data/folk-arts.json";
import guideJson from "@/data/region-guide.json";
import religiousJson from "@/data/religious.json";
import videosJson from "@/data/videos.json";
import markersJson from "@/data/region-markers.json";
import type { FolkArt, GovUniversity, Indicator, IntangibleElement, Region, RegionGuide, ReligiousCity, Source, WorldHeritageSite } from "./types";
import { formatNumber } from "./format";

export const regions = regionsJson as Region[];
export const sources = sourcesJson as Record<string, Source>;
export const worldHeritage = heritageJson.worldHeritage as WorldHeritageSite[];
export const intangible = heritageJson.intangible as IntangibleElement[];
export const intangibleNotes = heritageJson.intangibleNotes as string[];
export const universities = universitiesJson.items as GovUniversity[];
export const UNIVERSITY_COUNT = universitiesJson.count;
export const folkArts = folkArtsJson as FolkArt[];
export const regionGuide = guideJson as unknown as Record<string, RegionGuide>;
export const religious = religiousJson as unknown as { makkah: ReligiousCity; madinah: ReligiousCity; services: Array<{ nameAr: string; url: string; descAr: string }> };

export const videos = videosJson as { ich: Record<string, string>; whs: Record<string, string>; arts: Record<string, string>; channels: Record<string, string> };
export const regionMarkers = markersJson as unknown as Record<string, Array<{ nameAr: string; lat: number; lon: number; category: MarkerCategory; descAr: string; url: string | null; coordSource: string }>>;
export type MarkerCategory = "religious" | "heritage" | "nature" | "leisure" | "museum";

export const universitiesInRegion = (id: string) => universities.filter((u) => u.region === id);
export const folkArtsInRegion = (id: string) => folkArts.filter((a) => a.regions.includes(id));

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
  return worldHeritage.filter((s) => s.region === id || s.alsoRegion === id);
}

export function intangibleInRegion(id: string) {
  return intangible.filter((e) => e.regions.includes(id));
}

export function sourcesForRegion(r: Region): string[] {
  const ids = new Set<string>([r.population.source, r.areaKm2.source, r.governorates.source, "natural-earth"]);
  r.sections.forEach((s) => s.items.forEach((it) => it.sources.forEach((x) => ids.add(x))));
  if (sitesInRegion(r.id).length) ids.add("unesco-whc-sa");
  if (intangibleInRegion(r.id).length) ids.add("unesco-ich-sa");
  if (universitiesInRegion(r.id).length) ids.add("saudipedia-universities");
  if (folkArtsInRegion(r.id).length) ids.add("saudipedia-folk-arts");
  if (regionGuide[r.id]?.visitSaudi) ids.add("visitsaudi");
  ids.add("open-meteo");
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
    label: "الجامعات الحكومية",
    value: String(universitiesJson.count),
    detail: "موزعة على المناطق الثلاث عشرة",
    status: "verified",
    sources: ["saudipedia-universities"],
    href: "/universities",
  },
];
