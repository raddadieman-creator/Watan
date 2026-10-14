import { regions, worldHeritage, intangible } from "./data";

export type SearchKind = "منطقة" | "محافظة" | "تراث عالمي" | "تراث غير مادي" | "جامعة" | "صفحة";

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
  /** نص إضافي يدخل في المطابقة ولا يُعرض */
  terms: string;
}

/**
 * توحيد الكتابة العربية للبحث:
 * يزيل التشكيل والتطويل، ويوحّد الهمزات (أ إ آ ٱ → ا، ؤ → و، ئ → ي)، والتاء المربوطة،
 * والألف المقصورة، ويحذف "ال" التعريف من بدايات الكلمات، ويطبّع الحروف اللاتينية.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[‘’'`ʿʾ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.startsWith("ال") ? w.slice(2) : w))
    .join(" ");
}

const docs: SearchDoc[] = [];

for (const r of regions) {
  docs.push({
    id: `region-${r.id}`,
    kind: "منطقة",
    title: r.nameAr,
    subtitle: `المقر: ${r.seatAr}`,
    href: `/regions/${r.id}`,
    terms: `${r.shortAr} ${r.nameEn} ${r.seatAr}`,
  });
  for (const g of r.governorates.names) {
    docs.push({
      id: `gov-${r.id}-${g}`,
      kind: "محافظة",
      title: `محافظة ${g}`,
      subtitle: r.nameAr,
      href: `/regions/${r.id}#governorates`,
      terms: g,
    });
  }
  for (const u of r.universities) {
    docs.push({
      id: `uni-${u.url}`,
      kind: "جامعة",
      title: u.nameAr,
      subtitle: `${u.type} — ${r.nameAr}`,
      href: `/regions/${r.id}#universities`,
      terms: u.url,
    });
  }
}

for (const s of worldHeritage) {
  const region = regions.find((r) => r.id === s.region);
  docs.push({
    id: `whs-${s.id}`,
    kind: "تراث عالمي",
    title: s.nameAr,
    subtitle: `${s.year} — ${region ? region.nameAr : "المنطقة بحاجة للتحقق"}`,
    href: `/heritage#${s.id}`,
    terms: `${s.nameEn} ${s.regionNote ?? ""}`,
  });
}

for (const e of intangible) {
  docs.push({
    id: `ich-${e.id}`,
    kind: "تراث غير مادي",
    title: e.nameAr,
    subtitle: `اليونسكو ${e.year}`,
    href: `/heritage#${e.id}`,
    terms: e.nameEn,
  });
}

const pages: Array<[string, string, string]> = [
  ["/regions", "المناطق الإدارية الثلاث عشرة", "مناطق امارات اطلس خريطه"],
  ["/heritage", "التراث في قوائم اليونسكو", "يونسكو تراث عالمي غير مادي"],
  ["/numbers", "المملكة بالأرقام", "سكان تعداد احصاء ارقام مساحه"],
  ["/sources", "المصادر والمراجع", "مراجع مصادر توثيق"],
  ["/about", "عن وطن", "فكره اهداف منصه"],
];
for (const [href, title, terms] of pages) {
  docs.push({ id: `page-${href}`, kind: "صفحة", title, href, terms });
}

const prepared = docs.map((d) => ({
  doc: d,
  title: normalize(d.title),
  all: normalize(`${d.title} ${d.subtitle ?? ""} ${d.terms}`),
}));

const kindWeight: Record<SearchKind, number> = {
  "منطقة": 6, "تراث عالمي": 5, "تراث غير مادي": 5, "جامعة": 4, "محافظة": 3, "صفحة": 2,
};

export function search(query: string, limit = 20): SearchDoc[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ");
  const scored: Array<{ doc: SearchDoc; score: number }> = [];
  for (const p of prepared) {
    let score = 0;
    let all = true;
    for (const t of tokens) {
      if (p.title.split(" ").some((w) => w.startsWith(t))) score += 10;
      else if (p.title.includes(t)) score += 6;
      else if (p.all.includes(t)) score += 3;
      else { all = false; break; }
    }
    if (!all) continue;
    if (p.title === q) score += 20;
    scored.push({ doc: p.doc, score: score + kindWeight[p.doc.kind] });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.doc);
}

export const searchDocCount = docs.length;
