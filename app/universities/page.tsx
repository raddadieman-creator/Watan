import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero } from "@/components/PageHero";
import { SourcesFooter } from "@/components/SourcesFooter";
import { regions, universities, UNIVERSITY_COUNT } from "@/lib/data";

export const metadata: Metadata = {
  title: "الجامعات الحكومية",
  description: "الجامعات الحكومية الثلاثون في المملكة العربية السعودية موزعة على المناطق، مع مواقعها الرسمية.",
};

export default function UniversitiesPage() {
  const byRegion = regions
    .map((r) => ({ r, list: universities.filter((u) => u.region === r.id) }))
    .filter((x) => x.list.length)
    .sort((a, b) => b.list.length - a.list.length);
  return (
    <>
      <PageHero kicker="المعرفة تصنع المستقبل" title="الجامعات الحكومية" lead={`${UNIVERSITY_COUNT} جامعة حكومية موزعة على المناطق الثلاث عشرة، ولكل جامعة رابط موقعها الرسمي.`} />
      <div className="mx-auto max-w-[1400px] px-5 pt-12 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {byRegion.map(({ r, list }) => (
            <section key={r.id} className="rounded-[1.4rem] bg-white p-6 ring-1 ring-ink/5" aria-labelledby={`u-${r.id}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 id={`u-${r.id}`} className="font-display text-2xl text-ink">
                  <Link href={`/regions/${r.id}#universities`} className="hover:text-coral">{r.shortAr}</Link>
                </h2>
                <span className="num rounded-full px-3 py-0.5 text-sm font-bold text-white" style={{ background: r.accent }}>{list.length}</span>
              </div>
              <ul className="mt-4 grid gap-2">
                {list.map((u) => (
                  <li key={u.url} className="rounded-xl bg-cream/60 px-3 py-2.5">
                    <span className="block font-bold text-ink">{u.nameAr}</span>
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                      <span>{u.cityAr}{u.note ? ` — ${u.note}` : ""}</span>
                      <ExternalLink href={u.url} className="text-sea underline underline-offset-2"><span dir="ltr">{u.url.replace("https://", "")}</span></ExternalLink>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <SourcesFooter ids={["saudipedia-universities"]} />
      </div>
    </>
  );
}
