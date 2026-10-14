import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegionLocator } from "@/components/RegionLocator";
import { RegionPlate } from "@/components/RegionPlate";
import { Parapet } from "@/components/Parapet";
import { PendingTag, SourceRef } from "@/components/SourceRef";
import { SourcesFooter } from "@/components/SourcesFooter";
import {
  getRegion, intangibleInRegion, journeyNeighbors, NATIONAL_POPULATION_2022,
  regions, sitesInRegion, sourcesForRegion,
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

/** المحاور العشرة المطلوبة لكل منطقة وحالة توثيقها */
const TOPICS: Array<{ key: string; label: string }> = [
  { key: "admin", label: "الهوية الإدارية" },
  { key: "geography", label: "الجغرافيا والتضاريس" },
  { key: "climate", label: "المناخ" },
  { key: "population", label: "السكان" },
  { key: "culture", label: "الثقافة المحلية" },
  { key: "heritage", label: "التراث" },
  { key: "education", label: "التعليم" },
  { key: "economy", label: "الاقتصاد" },
  { key: "tourism", label: "السياحة" },
  { key: "development", label: "المستقبل والمشروعات" },
];

export default async function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getRegion(id);
  if (!r) notFound();

  const sites = sitesInRegion(r.id);
  const ich = intangibleInRegion(r.id);
  const { prev, next, index, total } = journeyNeighbors(r.id);
  const share = (r.population.value / NATIONAL_POPULATION_2022) * 100;
  const sectionKeys = new Set(r.sections.map((s) => s.key));
  const topicDone = (k: string) =>
    k === "admin" || k === "population" ? true
      : k === "heritage" ? sectionKeys.has("heritage") || sites.length > 0 || ich.length > 0
      : k === "education" ? r.universities.length > 0
      : sectionKeys.has(k);

  return (
    <article>
      {/* رأس المنطقة: لوحة داكنة، والمنطقة قطعة مرفوعة بتضاريسها */}
      <header className="atlas-plate relative overflow-hidden text-ivory">
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(55% 70% at 25% 55%, ${r.accent}66, transparent 70%)` }} aria-hidden />
        <div className="relative mx-auto grid max-w-[1400px] gap-8 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:pb-20">
          <div>
            <nav aria-label="مسار التنقل" className="text-sm text-ivory/60">
              <ol className="flex flex-wrap gap-2">
                <li><Link href="/" className="hover:text-sand">الرئيسية</Link></li>
                <li aria-hidden>/</li>
                <li><Link href="/regions" className="hover:text-sand">مناطقنا</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-ivory">{r.shortAr}</li>
              </ol>
            </nav>
            <p className="mt-10 flex items-center gap-3 text-sm text-sand">
              <span className="inline-block h-px w-10 bg-sand" aria-hidden />
              <span className="num">المحطة {index} من {total}</span> في رحلة المناطق
            </p>
            <h1 className="hero-title mt-1 font-display text-[clamp(3rem,7vw,5.6rem)] leading-[1.3]">{r.nameAr}</h1>
            {r.lead ? (
              <p className="mt-3 max-w-[38rem] text-[1.12rem] leading-9 text-ivory/80">{r.lead}</p>
            ) : (
              <p className="mt-3 max-w-[38rem] text-[1.02rem] leading-8 text-ivory/70">
                صفحة أساسية تعرض البيانات الموثقة المتاحة حاليًا. المحتوى التفصيلي للمنطقة قيد التوثيق، ولن يُنشر إلا بمصادره.
              </p>
            )}
            <dl className="mt-10 grid grid-cols-2 border-y border-sand/25 sm:grid-cols-4">
              <Fact label="المقر الإداري" value={r.seatAr} />
              <Fact
                label="السكان، تعداد 2022"
                value={formatNumber(r.population.value)}
                note={`${share.toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 1 })}% من سكان المملكة`}
                sources={[r.population.source]}
              />
              <Fact label={r.areaKm2.approx ? "المساحة (تقريبية)" : "المساحة"} value={`${formatNumber(r.areaKm2.value)} كم²`} sources={[r.areaKm2.source]} />
              <Fact label="المحافظات" value={r.governorates.count != null ? String(r.governorates.count) : null} sources={[r.governorates.source]} />
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <RegionPlate id={r.id} accent={r.accent} size={600} />
            <figure className="glass-panel absolute -bottom-4 start-0 w-36 rounded-xl p-2 sm:w-44">
              <RegionLocator highlight={r.id} accent={r.accent} />
              <figcaption className="mt-1 text-center text-[0.65rem] text-ivory/60">موقعها في المملكة</figcaption>
            </figure>
          </div>
        </div>
      </header>
      <Parapet color="#F8F5ED" className="relative z-10 -mt-[22px]" />

      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          {r.sections.map((sec) => (
            <section key={sec.key} id={sec.key} className="mb-12 scroll-mt-24" aria-labelledby={`${sec.key}-h`}>
              <h2 id={`${sec.key}-h`} className="font-display text-[2rem] text-green-deep">{sec.title}</h2>
              <ul className="mt-4 grid max-w-[44rem] gap-4">
                {sec.items.map((it, i) => (
                  <li key={i} className="border-s-2 ps-5 text-[1.05rem] leading-9" style={{ borderColor: r.accent }}>
                    {it.text}
                    <SourceRef ids={it.sources} />
                    {it.flag === "status-pending" && <span className="ms-2"><PendingTag>حالة الإنجاز غير مؤكدة</PendingTag></span>}
                    {it.flag === "climate-normals-pending" && <span className="ms-2"><PendingTag>المتوسطات المناخية الرسمية قيد الإضافة</PendingTag></span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section id="governorates" className="mb-12 scroll-mt-24" aria-labelledby="gov-h">
            <h2 id="gov-h" className="font-display text-[2rem] text-green-deep">المحافظات</h2>
            {r.governorates.names.length > 0 ? (
              <>
                <ul className="mt-4 flex max-w-[48rem] flex-wrap gap-2">
                  {r.governorates.names.map((g) => (
                    <li key={g} className="rounded-full border border-line bg-paper px-3 py-1 text-sm">{g}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-ink-muted">
                  إضافة إلى {r.seatAr} مقرًا للإمارة.{r.governorates.namesNote && ` ${r.governorates.namesNote}`}
                  <SourceRef ids={[r.governorates.source]} />
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">
                <PendingTag>قائمة المحافظات قيد التوثيق</PendingTag>
              </p>
            )}
          </section>

          <section id="heritage-list" className="mb-12 scroll-mt-24" aria-labelledby="her-h">
            <h2 id="her-h" className="font-display text-[2rem] text-green-deep">في قوائم اليونسكو</h2>
            {sites.length === 0 && ich.length === 0 ? (
              <p className="mt-4 max-w-[44rem] text-sm leading-7 text-ink-muted">
                لا يوجد في بيانات المنصة حاليًا موقع تراث عالمي أو عنصر تراث غير مادي مرتبط بهذه المنطقة تحديدًا. العناصر الوطنية المشتركة بين المناطق معروضة في{" "}
                <Link href="/heritage" className="text-emerald underline underline-offset-4">صفحة التراث</Link>.
              </p>
            ) : (
              <ul className="mt-4 grid max-w-[44rem] gap-3">
                {sites.map((s) => (
                  <li key={s.id} className="museum p-5">
                    <p className="text-xs text-emerald">موقع تراث عالمي ({s.category}) — {s.year}</p>
                    <p className="mt-1 font-display font-medium">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald">{s.nameAr}</a>
                    </p>
                    {s.regionNote && <p className="text-sm text-ink-muted">{s.regionNote}</p>}
                  </li>
                ))}
                {ich.map((e) => (
                  <li key={e.id} className="museum p-5">
                    <p className="text-xs text-emerald">تراث ثقافي غير مادي — القائمة التمثيلية {e.year}</p>
                    <p className="mt-1 font-display font-medium">
                      <Link href={`/heritage#${e.id}`} className="hover:text-emerald">{e.nameAr}</Link>
                    </p>
                    {e.areaNote && <p className="text-sm text-ink-muted">{e.areaNote}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="universities" className="mb-12 scroll-mt-24" aria-labelledby="uni-h">
            <h2 id="uni-h" className="font-display text-[2rem] text-green-deep">الجامعات</h2>
            {r.universities.length > 0 ? (
              <>
                <ul className="mt-4 grid max-w-[44rem] gap-2">
                  {r.universities.map((u) => (
                    <li key={u.url} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-3">
                      <span className="font-medium">{u.nameAr} <span className="text-sm font-normal text-ink-muted">({u.type})</span></span>
                      <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald underline underline-offset-4" dir="ltr">
                        {u.url.replace("https://", "")}
                      </a>
                    </li>
                  ))}
                </ul>
                {r.universitiesNote && <p className="mt-3 text-xs text-ink-muted">{r.universitiesNote}</p>}
              </>
            ) : (
              <p className="mt-4 text-sm"><PendingTag>قائمة الجامعات قيد التوثيق من وزارة التعليم</PendingTag></p>
            )}
          </section>
        </div>

        {/* حالة التوثيق للمحاور العشرة */}
        <aside className="museum p-6 lg:sticky lg:top-24 lg:self-start" aria-labelledby="cov-h">
          <h2 id="cov-h" className="font-display text-xl text-green-deep">حالة توثيق المحاور</h2>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {TOPICS.map((t) => {
              const done = topicDone(t.key);
              return (
                <li key={t.key} className="flex items-center justify-between gap-3 border-b border-line/70 py-1.5">
                  <span className={done ? "text-charcoal" : "text-ink-muted"}>{t.label}</span>
                  <span className={`text-xs ${done ? "text-emerald" : "text-[#8A6A2E]"}`}>{done ? "موثّق جزئيًا" : "قيد التوثيق"}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-6 text-ink-muted">«موثّق جزئيًا» يعني أن في الصفحة معلومات بمصادرها، لا أن المحور مكتمل.</p>
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
    <div className="border-sand/25 py-4 pe-3 odd:border-e sm:border-e sm:last:border-e-0 sm:[&:not(:first-child)]:ps-4">
      <dt className="text-xs text-ivory/60">{label}</dt>
      <dd className="mt-1">
        {value ? <span className="num text-xl font-extrabold text-ivory">{value}</span> : <PendingTag />}
        {note && <span className="block text-xs text-ivory/60">{note}</span>}
        {sources && <span className="mt-1.5 block opacity-90"><SourceRef ids={sources} /></span>}
      </dd>
    </div>
  );
}
