import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegionLocator } from "@/components/RegionLocator";
import { RegionPlate } from "@/components/RegionPlate";
import { Parapet } from "@/components/Parapet";
import { SourceRef } from "@/components/SourceRef";
import { ExternalLink } from "@/components/ExternalLink";
import { ReligiousSection } from "@/components/ReligiousSection";
import { RegionWeather } from "@/components/RegionWeather";
import { SourcesFooter } from "@/components/SourcesFooter";
import {
  folkArtsInRegion, getRegion, intangibleInRegion, journeyNeighbors, NATIONAL_POPULATION_2022,
  regionGuide, regions, sitesInRegion, sourcesForRegion, universitiesInRegion,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = getRegion(id);
  if (!r) return {};
  return {
    title: r.nameAr,
    description: r.lead ?? `${r.nameAr}: المقر الإداري ${r.seatAr}، وعدد السكان ${formatNumber(r.population.value)} نسمة وفق تعداد 2022.`,
  };
}

export default async function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getRegion(id);
  if (!r) notFound();

  const sites = sitesInRegion(r.id);
  const ich = intangibleInRegion(r.id);
  const { prev, next, index, total } = journeyNeighbors(r.id);
  const share = (r.population.value / NATIONAL_POPULATION_2022) * 100;
  const guide = regionGuide[r.id];
  const arts = folkArtsInRegion(r.id);
  const unis = universitiesInRegion(r.id);

  return (
    <article>
      {/* رأس المنطقة: لوحة داكنة، والمنطقة قطعة مرفوعة بتضاريسها */}
      <header className="atlas-plate relative overflow-hidden text-ink">
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(55% 70% at 25% 55%, ${r.accent}66, transparent 70%)` }} aria-hidden />
        <div className="relative mx-auto grid max-w-[1400px] gap-8 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:pb-20">
          <div>
            <nav aria-label="مسار التنقل" className="text-sm text-ink/60">
              <ol className="flex flex-wrap gap-2">
                <li><Link href="/" className="hover:text-coral">الرئيسية</Link></li>
                <li aria-hidden>/</li>
                <li><Link href="/regions" className="hover:text-coral">مناطقنا</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-ink">{r.shortAr}</li>
              </ol>
            </nav>
            <p className="mt-10 flex items-center gap-3 text-sm text-sun-deep">
              <span className="inline-block h-px w-10 bg-sun" aria-hidden />
              <span className="num">المحطة {index} من {total}</span> في رحلة المناطق
            </p>
            <h1 className="hero-title mt-1 font-display text-[clamp(3rem,7vw,5.6rem)] leading-[1.3]">{r.nameAr}</h1>
            {r.lead && <p className="mt-3 max-w-[38rem] text-[1.12rem] leading-9 text-ink/80">{r.lead}</p>}
            <dl className="mt-10 grid grid-cols-2 border-y border-ink/10 sm:grid-cols-4">
              <Fact label="المقر الإداري" value={r.seatAr} />
              <Fact
                label="السكان، تعداد 2022"
                value={formatNumber(r.population.value)}
                note={`${share.toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 1 })}% من سكان المملكة`}
                sources={[r.population.source]}
              />
              <Fact label={r.areaKm2.approx ? "المساحة (تقريبية)" : "المساحة"} value={`${formatNumber(r.areaKm2.value)} كم²`} sources={[r.areaKm2.source]} />
              <Fact label="المحافظات" value={String(r.governorates.count ?? r.governorates.names.length)} sources={[r.governorates.source]} />
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <RegionPlate id={r.id} accent={r.accent} size={600} />
            <figure className="glass-panel absolute -bottom-4 start-0 w-36 rounded-xl p-2 sm:w-44">
              <RegionLocator highlight={r.id} accent={r.accent} />
              <figcaption className="mt-1 text-center text-[0.65rem] text-ink/60">موقعها في المملكة</figcaption>
            </figure>
          </div>
        </div>
      </header>
      <Parapet color="#FFFBF4" className="relative z-10 -mt-[22px]" />

      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {r.sections.map((sec) => (
            <section key={sec.key} id={sec.key} className="mb-12 scroll-mt-24" aria-labelledby={`${sec.key}-h`}>
              <h2 id={`${sec.key}-h`} className="font-display text-[2rem] text-ink">{sec.title}</h2>
              <ul className="mt-4 grid max-w-[46rem] gap-4">
                {sec.items.map((it, i) => (
                  <li key={i} className="border-s-[3px] ps-5 text-[1.05rem] leading-9" style={{ borderColor: r.accent }}>
                    {it.text}
                    <SourceRef ids={it.sources} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {(r.id === "makkah" || r.id === "madinah") && (
            <div className="mb-14">
              <ReligiousSection city={r.id} />
            </div>
          )}

          {guide.places.length > 0 && (
            <section id="places" className="mb-14 scroll-mt-24" aria-labelledby="places-h">
              <h2 id="places-h" className="font-display text-[2rem] text-ink">أماكن تستحق الزيارة</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {guide.places.map((p) => (
                  <li key={p.nameAr} className="flex flex-col rounded-2xl bg-white p-5 shadow-[0_18px_40px_-30px_rgba(30,111,134,0.55)] ring-1 ring-ink/5">
                    <span className="mb-3 h-1.5 w-12 rounded-full" style={{ background: r.accent }} aria-hidden />
                    <h3 className="font-display text-[1.35rem] leading-[1.6] text-ink">{p.nameAr}</h3>
                    <p className="mt-1 flex-1 text-[0.95rem] leading-8 text-ink/75">{p.descAr}</p>
                    {p.url && (
                      <ExternalLink href={p.url} className="mt-3 self-start text-sm font-bold text-sea underline decoration-turq/40 underline-offset-4 hover:decoration-turq">
                        اقرأ المزيد
                      </ExternalLink>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-muted">المصادر: سعوديبيديا، وروح السعودية، وصفحات اليونسكو.</p>
            </section>
          )}

          {arts.length > 0 && (
            <section id="folk-arts" className="mb-14 scroll-mt-24" aria-labelledby="arts-h">
              <h2 id="arts-h" className="font-display text-[2rem] text-ink">الفنون الشعبية والعرضات</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {arts.map((a) => (
                  <li key={a.id} className="relative flex flex-col overflow-hidden rounded-2xl p-5 ring-1 ring-ink/5" style={{ background: `linear-gradient(160deg, ${r.accent}1F, #FFFFFF 60%)` }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[1.35rem] leading-[1.6] text-ink">{a.nameAr}</h3>
                      {a.unesco && <span className="rounded-full bg-sea px-2 py-0.5 text-[0.7rem] font-bold text-white">في قائمة اليونسكو</span>}
                    </div>
                    {a.areaAr && <p className="text-xs font-bold" style={{ color: r.accent }}>{a.areaAr}</p>}
                    <p className="mt-1 flex-1 text-[0.95rem] leading-8 text-ink/75">{a.descAr}</p>
                    <ExternalLink href={a.sourceUrl} className="mt-3 self-start text-sm font-bold text-sea underline decoration-turq/40 underline-offset-4 hover:decoration-turq">
                      اقرأ عن {a.nameAr.replace(/^رقصة |^فن /, "")}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="heritage-list" className="mb-12 scroll-mt-24" aria-labelledby="her-h">
            <h2 id="her-h" className="font-display text-[2rem] text-ink">في قوائم اليونسكو</h2>
            {sites.length === 0 && ich.length === 0 ? (
              <p className="mt-4 max-w-[44rem] text-[0.95rem] leading-8 text-ink-muted">
                عناصر التراث غير المادي الوطنية المشتركة بين المناطق، مثل القهوة العربية والسدو والصقارة، معروضة في{" "}
                <Link href="/heritage" className="text-sea underline underline-offset-4">صفحة التراث</Link>.
              </p>
            ) : (
              <ul className="mt-4 grid max-w-[46rem] gap-3">
                {sites.map((s) => (
                  <li key={s.id} className="museum p-5">
                    <p className="text-xs font-bold text-mint">موقع تراث عالمي ({s.category}) — {s.year}</p>
                    <p className="mt-1 font-display text-xl leading-9">
                      <ExternalLink href={s.url} className="hover:text-coral">{s.nameAr}</ExternalLink>
                    </p>
                    {s.regionNote && <p className="text-sm text-ink-muted">{s.regionNote}</p>}
                  </li>
                ))}
                {ich.map((e) => (
                  <li key={e.id} className="museum p-5">
                    <p className="text-xs font-bold text-mint">تراث ثقافي غير مادي — القائمة التمثيلية {e.year}</p>
                    <p className="mt-1 font-display text-xl leading-9">
                      <Link href={`/heritage#${e.id}`} className="hover:text-coral">{e.nameAr}</Link>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="governorates" className="mb-12 scroll-mt-24" aria-labelledby="gov-h">
            <h2 id="gov-h" className="font-display text-[2rem] text-ink">المحافظات</h2>
            <ul className="mt-4 flex max-w-[48rem] flex-wrap gap-2">
              {r.governorates.names.map((g) => (
                <li key={g} className="rounded-full bg-white px-3.5 py-1.5 text-sm ring-1 ring-ink/10">{g}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              <span className="num">{r.governorates.names.length}</span> محافظة إضافة إلى {r.seatAr} مقرًا للإمارة.
              <SourceRef ids={[r.governorates.source]} />
            </p>
          </section>

          <section id="universities" className="mb-12 scroll-mt-24" aria-labelledby="uni-h">
            <h2 id="uni-h" className="font-display text-[2rem] text-ink">الجامعات الحكومية</h2>
            <ul className="mt-4 grid max-w-[46rem] gap-2">
              {unis.map((u) => (
                <li key={u.url} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-ink/5">
                  <span>
                    <span className="block font-bold text-ink">{u.nameAr}</span>
                    <span className="block text-xs text-ink-muted">{u.cityAr}{u.note ? ` — ${u.note}` : ""}</span>
                  </span>
                  <ExternalLink href={u.url} className="rounded-full bg-cream px-3 py-1 text-sm text-sea hover:bg-turq hover:text-white">
                    <span dir="ltr">{u.url.replace("https://", "")}</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              من قائمة الجامعات الحكومية الثلاثين في المملكة. <Link href="/universities" className="text-sea underline underline-offset-4">كل الجامعات</Link>
            </p>
          </section>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-24 lg:self-start" aria-label="معلومات سريعة">
          {r.seat && <RegionWeather id={r.id} seatAr={r.seatAr} seat={r.seat} accent={r.accent} />}
          <nav aria-label="روابط المنطقة" className="rounded-[1.4rem] bg-white p-5 ring-1 ring-ink/5">
            <p className="font-display text-xl text-ink">روابط {r.shortAr}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {guide.visitSaudi && (
                <li><ExternalLink href={guide.visitSaudi} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2.5 font-bold text-ink hover:bg-sun hover:text-white">{r.shortAr} على «روح السعودية»<span aria-hidden>↖</span></ExternalLink></li>
              )}
              {guide.extraLinks?.map((l) => (
                <li key={l.url}><ExternalLink href={l.url} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2.5 font-bold text-ink hover:bg-sun hover:text-white">{l.label}<span aria-hidden>↖</span></ExternalLink></li>
              ))}
              <li><ExternalLink href={guide.article} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2.5 font-bold text-ink hover:bg-sun hover:text-white">{r.nameAr} في سعوديبيديا<span aria-hidden>↖</span></ExternalLink></li>
            </ul>
            <ul className="mt-4 grid gap-1 border-t border-ink/10 pt-3 text-sm">
              {[["places","أماكن تستحق الزيارة"],["folk-arts","الفنون الشعبية"],["universities","الجامعات"],["governorates","المحافظات"]].map(([k,l]) => (
                <li key={k}><a href={`#${k}`} className="text-ink-muted hover:text-coral">{l}</a></li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      {/* الرحلة بين المناطق */}
      <nav aria-label="التنقل بين المناطق" className="mx-auto mt-6 max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-3 border-y border-line py-6 sm:grid-cols-2">
          {prev ? (
            <Link href={`/regions/${prev.id}`} className="group rounded-xl p-3 hover:bg-paper">
              <span className="text-xs text-ink-muted">المحطة السابقة</span>
              <span className="block font-display text-2xl leading-10 text-charcoal group-hover:text-emerald">{prev.nameAr}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/regions/${next.id}`} className="group rounded-xl p-3 text-end hover:bg-paper">
              <span className="text-xs text-ink-muted">المحطة التالية</span>
              <span className="block font-display text-2xl leading-10 text-charcoal group-hover:text-emerald">{next.nameAr}</span>
            </Link>
          ) : (
            <Link href="/regions" className="group rounded-xl p-3 text-end hover:bg-paper">
              <span className="text-xs text-ink-muted">اكتملت الرحلة</span>
              <span className="block font-display text-2xl leading-10 text-charcoal group-hover:text-emerald">العودة إلى كل المناطق</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SourcesFooter ids={sourcesForRegion(r)} />
      </div>
    </article>
  );
}

function Fact({ label, value, note, sources }: { label: string; value: string | null; note?: string; sources?: string[] }) {
  return (
    <div className="border-ink/10 py-4 pe-3 odd:border-e sm:border-e sm:last:border-e-0 sm:[&:not(:first-child)]:ps-4">
      <dt className="text-xs text-ink/60">{label}</dt>
      <dd className="mt-1">
        <span className="num text-xl font-extrabold text-ink">{value}</span>
        {note && <span className="block text-xs text-ink/60">{note}</span>}
        {sources && <span className="mt-1.5 block opacity-90"><SourceRef ids={sources} /></span>}
      </dd>
    </div>
  );
}
