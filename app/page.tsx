import Link from "next/link";
import { AtlasMap } from "@/components/AtlasMap";
import { Ornament, Parapet } from "@/components/Parapet";
import { RegionPlate } from "@/components/RegionPlate";
import { SourceRef } from "@/components/SourceRef";
import { SourcesFooter } from "@/components/SourcesFooter";
import { LiveNow } from "@/components/LiveNow";
import { getAtlas } from "@/lib/geo";
import { getRegion, indicators, journeyOrder, NATIONAL_POPULATION_2022, regions, religious, worldHeritage } from "@/lib/data";
import { formatCompact, formatNumber } from "@/lib/format";

function SectionTitle({ title, lead, tone = "light" }: { title: string; lead?: string; tone?: "light" | "dark" }) {
  return (
    <div className="max-w-2xl">
      <h2 className={`font-display text-[clamp(2.1rem,4vw,3.2rem)] ${tone === "dark" ? "text-white" : "text-ink"}`}>{title}</h2>
      {lead && <p className={`mt-2 text-[1.02rem] leading-8 ${tone === "dark" ? "text-white/75" : "text-ink-muted"}`}>{lead}</p>}
    </div>
  );
}

export default function HomePage() {
  const atlas = getAtlas();
  const mapRegions = regions.map((r) => ({
    id: r.id, nameAr: r.nameAr, shortAr: r.shortAr, seatAr: r.seatAr, accent: r.accent,
    population: r.population.value, areaKm2: r.areaKm2.value, governorates: r.governorates.count, detailLevel: r.detailLevel, seat: r.seat,
  }));
  const byPop = [...regions].sort((a, b) => b.population.value - a.population.value);
  const maxPop = byPop[0].population.value;
  const sites = [...worldHeritage].sort((a, b) => a.year - b.year);

  const intro = (
    <div>
      <p className="flex items-center gap-3 text-sm font-bold text-sun-deep">
        <span className="inline-block h-[3px] w-10 rounded-full bg-gradient-to-l from-coral to-sun" aria-hidden />
        منصة معرفية تفاعلية عن المملكة العربية السعودية
      </p>
      <h1 className="hero-title mt-2 font-display text-[clamp(5.5rem,12vw,10.5rem)] leading-[1.25]">وطن</h1>
      <p className="-mt-2 font-display text-[clamp(1.6rem,2.8vw,2.3rem)] leading-[1.5] text-coral">المملكة كما لم تكتشفها من قبل</p>
      <p className="mt-4 max-w-[30rem] text-[1.05rem] leading-8 text-ink/75">
        من جبال السروات إلى رمال الربع الخالي، ومن شواطئ البحر الأحمر إلى الخليج العربي… اكتشف وطنًا تتنوع أرضه وتتجدد منجزاته.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/regions/${journeyOrder[0]}`} className="btn-gold">ابدأ رحلة الاستكشاف</Link>
        <Link href="/regions" className="btn-ghost">استكشف المناطق</Link>
        <Link href="/heritage" className="btn-ghost">اكتشف تراثنا</Link>
        <Link href="/numbers" className="btn-ghost">المملكة بالأرقام</Link>
      </div>
      <p className="mt-7 text-sm text-ink/55">اختر منطقة على الخريطة لترى ملخصها، ثم افتح صفحتها.</p>
    </div>
  );

  return (
    <>
      <AtlasMap atlas={atlas} regions={mapRegions} intro={intro} />
      <Parapet color="#FFFBF4" className="-mt-[22px] relative z-10" />

      <LiveNow regions={regions.filter((r) => r.seat).map((r) => ({ id: r.id, shortAr: r.shortAr, seatAr: r.seatAr, accent: r.accent, seat: r.seat! }))} />

      {/* السياحة الدينية */}
      <section className="mx-auto max-w-[1400px] px-5 pt-24 sm:px-8" aria-labelledby="rel-h">
        <div className="relative overflow-hidden rounded-[2rem] p-7 sm:p-10" style={{ background: "linear-gradient(120deg,#0F5F6E 0%,#16839A 45%,#23A887 100%)" }}>
          <div className="pointer-events-none absolute -end-20 -top-24 size-80 rounded-full bg-[#FFD58A]/30 blur-3xl" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
            <div className="text-white">
              <p className="text-sm font-bold text-[#FFD58A]">ضيوف الرحمن</p>
              <h2 id="rel-h" className="mt-1 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.4]">السياحة الدينية</h2>
              <p className="mt-2 max-w-xl text-[1.05rem] leading-9 text-white/85">
                المسجد الحرام والمشاعر المقدسة في مكة المكرمة، والمسجد النبوي ومساجد المدينة المنورة ومعالمها ومتاحفها، مع روابط تصاريح العمرة وزيارة الروضة الشريفة.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/religious-tourism#religious-makkah" className="btn-gold">مكة المكرمة</Link>
                <Link href="/religious-tourism#religious-madinah" className="inline-flex h-12 items-center rounded-full bg-white px-6 font-bold text-sea hover:bg-cream">المدينة المنورة</Link>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[...religious.makkah.sites.slice(0, 2), ...religious.madinah.sites.slice(0, 2)].map((s) => (
                <li key={s.nameAr} className="rounded-2xl bg-white/12 p-4 text-white ring-1 ring-white/20 backdrop-blur">
                  <p className="font-display text-xl leading-9">{s.nameAr}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-7 text-white/80">{s.descAr}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* المؤشرات */}
      <section className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8" aria-labelledby="facts-h">
        <div id="facts-h"><SectionTitle title="المملكة في ستة أسطر" lead="كل رقم هنا مرتبط بمصدره وسنته، ويمكن فتح المصدر مباشرة." /></div>
        <dl className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((ind) => (
            <div key={ind.id} className="museum flex flex-col p-7">
              <dt className="text-sm text-ink-muted">{ind.label}</dt>
              <dd className="mt-3 flex-1">
                <span className="num block text-[clamp(2rem,3.4vw,2.8rem)] font-extrabold leading-tight text-sea">{ind.value}</span>

                <span className="mt-2 block text-[0.95rem] leading-7 text-ink-muted">{ind.detail}</span>
              </dd>
              <dd className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-sm">
                <SourceRef ids={ind.sources} />
                {ind.href && <Link href={ind.href} className="text-emerald underline decoration-line underline-offset-4 hover:decoration-sand">التفاصيل</Link>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* رحلة المناطق */}
      <section className="pt-28" aria-labelledby="journey-h">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
          <div id="journey-h"><SectionTitle title="رحلة في ثلاث عشرة محطة" lead="كل منطقة بشكلها الحقيقي وتضاريسها. اسحب لتتنقل، واضغط لتدخل." /></div>
          <Link href="/regions" className="text-emerald underline decoration-line underline-offset-4 hover:decoration-sand">جدول المناطق</Link>
        </div>
        <ol className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:px-8 [scrollbar-width:thin]">
          {journeyOrder.map((id, i) => {
            const r = getRegion(id)!;
            return (
              <li key={id} className="snap-start">
                <Link href={`/regions/${id}`} className="group relative block w-[17rem] overflow-hidden rounded-[1.6rem] bg-white text-ink shadow-[0_30px_50px_-34px_rgba(30,111,134,0.55)] ring-1 ring-ink/5 transition-transform duration-300 hover:-translate-y-1 sm:w-[19rem]">
                  <div className="relative aspect-square p-5" style={{ background: `radial-gradient(85% 75% at 50% 45%, ${r.accent}38, ${r.accent}10 70%, transparent)` }}>
                    <RegionPlate id={id} accent={r.accent} size={300} className="transition-transform duration-500 ease-[var(--ease-atlas)] group-hover:-translate-y-1.5 group-hover:scale-[1.03]" />
                    <span className="num absolute start-5 top-4 rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: r.accent }}>المحطة {i + 1}</span>
                  </div>
                  <div className="px-5 pb-5 pt-1">
                    <h3 className="font-display text-[1.7rem] leading-[1.5] text-ink">{r.shortAr}</h3>
                    <p className="flex items-center justify-between text-sm text-ink/60">
                      <span>{r.seatAr}</span>
                      <span className="num" title={formatNumber(r.population.value)}>{formatCompact(r.population.value)} نسمة</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* السكان */}
      <section className="mx-auto max-w-[1400px] px-5 pt-24 sm:px-8" aria-labelledby="pop-h">
        <div className="grid gap-12 lg:grid-cols-[22rem_1fr]">
          <div id="pop-h">
            <SectionTitle title="أين يسكن الناس؟" lead={`ترتيب المناطق حسب السكان في تعداد 2022. مجموعها يطابق إجمالي التعداد: ${formatNumber(NATIONAL_POPULATION_2022)} نسمة.`} />
            <p className="mt-4 text-sm text-ink-muted">المصدر: الهيئة العامة للإحصاء، تعداد السعودية 2022.</p>
          </div>
          <ol className="grid gap-x-10 md:grid-cols-2">
            {byPop.map((r) => (
              <li key={r.id} className="border-b border-line">
                <Link href={`/regions/${r.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-4">
                  <span className="font-display text-xl leading-8 text-charcoal group-hover:text-emerald">{r.shortAr}</span>
                  <span className="num text-sm text-ink-muted" title={formatNumber(r.population.value)}>{formatCompact(r.population.value)}</span>
                  <span className="col-span-2 h-2 overflow-hidden rounded-full bg-line/50" aria-hidden>
                    <span className="block h-full rounded-full" style={{ width: `${(r.population.value / maxPop) * 100}%`, background: `linear-gradient(90deg, ${r.accent}, ${r.accent}AA)` }} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* التراث العالمي */}
      <section className="mt-28" aria-labelledby="whs-h">
        <Parapet color="#FFF4E4" />
        <div className="contour-plate pb-20 pt-16 text-ink">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <div id="whs-h">
              <SectionTitle title={`${sites.length} مواقع في قائمة التراث العالمي`} lead="بترتيب سنة التسجيل لدى اليونسكو، من الحِجر عام 2008 إلى الفاو عام 2024." />
            </div>
            <ol className="relative mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <span className="absolute inset-x-0 top-[0.65rem] hidden h-px bg-gradient-to-l from-turq via-sun to-coral lg:block" aria-hidden />
              {sites.map((s) => {
                const region = regions.find((r) => r.id === s.region);
                return (
                  <li key={s.id} className="relative">
                    <span className="relative z-10 block size-[1.3rem] rotate-45 rounded-[4px] border-[3px] border-white bg-sun shadow-md" aria-hidden />
                    <p className="num mt-5 text-3xl font-extrabold text-sun-deep">{s.year}</p>
                    <h3 className="mt-1 font-display text-[1.35rem] leading-[1.6]">
                      <Link href={`/heritage#${s.id}`} className="hover:text-coral">{s.nameAr}</Link>
                    </h3>
                    <p className="text-sm text-ink/60">{s.category}{region ? ` — ${region.shortAr}` : ""}</p>
                  </li>
                );
              })}
            </ol>
            <Ornament className="mt-16" />
            <p className="mt-6 text-center">
              <Link href="/heritage" className="btn-ghost">ذاكرة وطن: المواقع وعناصر التراث غير المادي</Link>
            </p>
          </div>
        </div>
        <Parapet color="#FFF4E4" flip />
      </section>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SourcesFooter ids={["gastat-census-2022", "saudipedia-provinces", "saudipedia-geography", "unesco-whc-sa", "unesco-ich-sa", "moe", "natural-earth"]} />
      </div>
    </>
  );
}
