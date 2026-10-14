import type { Metadata } from "next";
import Link from "next/link";
import { SourcesFooter } from "@/components/SourcesFooter";
import { PageHero } from "@/components/PageHero";
import { intangible, intangibleNotes, regions, worldHeritage } from "@/lib/data";

export const metadata: Metadata = {
  title: "تراثنا في اليونسكو",
  description: "مواقع التراث العالمي السعودية وعناصر التراث الثقافي غير المادي المدرجة لدى اليونسكو، بسنوات التسجيل وروابطها الرسمية.",
};

const LEVELS = [
  { name: "تراث محلي", text: "ممارسات وفنون حية في المجتمعات المحلية، ولا يعني وجودها أي تسجيل رسمي." },
  { name: "القائمة الوطنية", text: "عناصر يسجلها الحصر الوطني للتراث. لم تُدمج بياناتها في المنصة بعد." },
  { name: "مدرج لدى اليونسكو", text: "عناصر اعتمدتها لجنة اليونسكو رسميًا. هذه وحدها ما تعرضه الصفحة." },
  { name: "ملف ترشيح", text: "ملفات قُدمت ولم تُعتمد بعد. لا تُعرض بوصفها مسجلة." },
];

export default function HeritagePage() {
  const ichSorted = [...intangible].sort((a, b) => a.year - b.year);
  const years = [...new Set(ichSorted.map((e) => e.year))];
  return (
    <>
    <PageHero kicker="ذاكرة وطن" title="تراثنا في قوائم اليونسكو" lead="هذه الصفحة تعرض ما سُجّل رسميًا فقط، ولا تخلط بين نوعين مختلفين: مواقع التراث العالمي (أماكن)، والتراث الثقافي غير المادي (ممارسات ومعارف)." />
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">

      <section aria-labelledby="levels-h" className="mt-12">
        <h2 id="levels-h" className="sr-only">مستويات التوثيق</h2>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {LEVELS.map((l, i) => (
            <li key={l.name} className={`p-6 ${i === 2 ? "bg-gradient-to-l from-sea to-turq text-white" : "bg-white"}`}>
              <p className={`font-display text-xl ${i === 2 ? "text-[#FFE0A6]" : "text-ink"}`}>{l.name}</p>
              <p className={`mt-1 text-sm leading-7 ${i === 2 ? "text-white/85" : "text-ink-muted"}`}>{l.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="world" aria-labelledby="world-h" className="mt-16 scroll-mt-24">
        <h2 id="world-h" className="font-display text-[2.4rem] text-ink">مواقع التراث العالمي</h2>
        <p className="mt-2 text-ink-muted"><span className="num">{worldHeritage.length}</span> مواقع: <span className="num">{worldHeritage.filter((s) => s.category === "ثقافي").length}</span> ثقافية و<span className="num">{worldHeritage.filter((s) => s.category === "طبيعي").length}</span> طبيعي.</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {worldHeritage.map((s) => {
            const region = regions.find((r) => r.id === s.region);
            return (
              <li key={s.id} id={s.id} className="museum scroll-mt-24 p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="num text-2xl font-extrabold text-sun-deep">{s.year}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${s.category === "طبيعي" ? "bg-[#E4EEDF] text-[#335A2A]" : "bg-ivory text-ink"}`}>{s.category}</span>
                </div>
                <h3 className="mt-2 font-display text-[1.6rem] leading-[1.6] text-ink">{s.nameAr}</h3>
                <p className="text-sm text-ink-muted" lang="en" dir="ltr">{s.nameEn}</p>
                <p className="mt-3 text-sm">
                  {region ? (
                    <Link href={`/regions/${region.id}`} className="text-emerald underline underline-offset-4">{region.nameAr}</Link>
                  ) : (
                    <span className="text-[#8A6A2E]">المنطقة الإدارية بحاجة للتحقق</span>
                  )}
                  {s.regionNote && <span className="text-ink-muted"> — {s.regionNote}</span>}
                </p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-emerald underline decoration-line underline-offset-4">
                  صفحة الموقع لدى اليونسكو
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="intangible" aria-labelledby="ich-h" className="mt-20 scroll-mt-24">
        <h2 id="ich-h" className="font-display text-[2.4rem] text-ink">التراث الثقافي غير المادي</h2>
        <p className="mt-2 text-ink-muted"><span className="num">{intangible.length}</span> عنصرًا في القائمة التمثيلية، مرتبة حسب سنة الإدراج.</p>
        <ul className="mt-4 grid max-w-3xl gap-1.5 text-sm text-ink-muted">
          {intangibleNotes.map((n) => <li key={n} className="ps-4 -indent-4">— {n}</li>)}
        </ul>

        <div className="mt-8 grid gap-8">
          {years.map((y) => (
            <div key={y} className="grid gap-4 border-t border-line pt-5 md:grid-cols-[7rem_1fr]">
              <p className="num text-3xl font-extrabold text-sun-deep">{y}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {ichSorted.filter((e) => e.year === y).map((e) => (
                  <li key={e.id} id={e.id} className="museum scroll-mt-24 p-5">
                    <h3 className="font-display text-[1.3rem] leading-[1.6] text-ink">{e.nameAr}</h3>
                    <p className="mt-1 text-xs text-ink-muted" lang="en" dir="ltr">{e.nameEn}</p>
                    {e.areaNote && (
                      <p className="mt-2 text-sm">
                        {e.regions.length > 0 ? (
                          e.regions.map((rid) => {
                            const r = regions.find((x) => x.id === rid)!;
                            return <Link key={rid} href={`/regions/${rid}`} className="me-2 text-emerald underline underline-offset-4">{r.shortAr}</Link>;
                          })
                        ) : null}
                        <span className="text-ink-muted">{e.areaNote}</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <SourcesFooter ids={["unesco-whc-sa", "unesco-ich-sa"]} />
    </div>
    </>
  );
}
