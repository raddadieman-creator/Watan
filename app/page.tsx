import Link from "next/link";
import { AtlasMap } from "@/components/AtlasMap";
import { Reveal } from "@/components/Reveal";
import { PendingTag, SourceRef } from "@/components/SourceRef";
import { SourcesFooter } from "@/components/SourcesFooter";
import { getMapShapes, MAP_H, MAP_W } from "@/lib/geo";
import { indicators, journeyOrder, NATIONAL_POPULATION_2022, regions, worldHeritage } from "@/lib/data";
import { formatCompact, formatNumber } from "@/lib/format";

export default function HomePage() {
  const shapes = getMapShapes();
  const mapRegions = regions.map((r) => ({
    id: r.id,
    nameAr: r.nameAr,
    shortAr: r.shortAr,
    seatAr: r.seatAr,
    population: r.population.value,
    areaKm2: r.areaKm2.value,
    governorates: r.governorates.count,
    detailLevel: r.detailLevel,
  }));
  const byPop = [...regions].sort((a, b) => b.population.value - a.population.value);
  const maxPop = byPop[0].population.value;
  const sites = [...worldHeritage].sort((a, b) => a.year - b.year);

  return (
    <>
      {/* المشهد الافتتاحي: الخريطة هي العنصر الرئيسي */}
      <section className="contour-plate text-ivory" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12 lg:pb-20 lg:pt-16">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <h1 id="hero-title" className="font-display text-[clamp(4.5rem,13vw,9.5rem)] font-extrabold leading-[0.95] tracking-tight text-ivory">
                وطن
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 font-display text-[clamp(1.35rem,2.6vw,1.9rem)] font-medium leading-snug text-sand">
                المملكة كما لم تكتشفها من قبل
              </p>
              <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-8 text-ivory/80">
                من جبال السروات إلى رمال الربع الخالي، ومن شواطئ البحر الأحمر إلى الخليج العربي… اكتشف وطنًا تتنوع أرضه وتتجدد منجزاته.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/regions/${journeyOrder[0]}`} className="inline-flex h-12 items-center rounded-full bg-sand px-6 font-display text-[0.95rem] font-medium text-green-deep hover:bg-sand-soft">
                  ابدأ رحلة الاستكشاف
                </Link>
                <Link href="/regions" className="inline-flex h-12 items-center rounded-full border border-ivory/30 px-5 text-[0.95rem] text-ivory hover:border-sand hover:text-sand">
                  استكشف المناطق
                </Link>
                <Link href="/heritage" className="inline-flex h-12 items-center rounded-full border border-ivory/30 px-5 text-[0.95rem] text-ivory hover:border-sand hover:text-sand">
                  اكتشف تراثنا
                </Link>
                <Link href="/numbers" className="inline-flex h-12 items-center rounded-full border border-ivory/30 px-5 text-[0.95rem] text-ivory hover:border-sand hover:text-sand">
                  المملكة بالأرقام
                </Link>
              </div>
              <p className="mt-8 text-sm text-ivory/60">
                اختر منطقة على الخريطة لترى ملخصها، ثم افتح صفحتها. على الهاتف: المس المنطقة.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <AtlasMap shapes={shapes} regions={mapRegions} width={MAP_W} height={MAP_H} />
          </Reveal>
        </div>
      </section>

      {/* المؤشرات: سجل أطلسي مع مصدر وسنة لكل سطر */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6" aria-labelledby="facts-h">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <div>
            <h2 id="facts-h" className="font-display text-3xl font-bold text-green-deep">المملكة في ستة أسطر</h2>
            <p className="mt-3 text-[0.95rem] leading-7 text-ink-muted">
              كل رقم هنا مرتبط بمصدره وسنته. وما لم يُتحقق منه بعد يظهر بوسم واضح بدل رقم تقديري.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {indicators.map((ind) => (
              <div key={ind.id} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr_auto] sm:items-baseline sm:gap-6">
                <dt className="text-[0.95rem] text-ink-muted">{ind.label}</dt>
                <dd className="order-first sm:order-none">
                  {ind.status === "verified" ? (
                    <span className="num font-display text-[clamp(1.6rem,3vw,2.3rem)] font-bold text-charcoal">{ind.value}</span>
                  ) : (
                    <PendingTag />
                  )}
                  <span className="mt-1 block text-sm text-ink-muted">{ind.detail}</span>
                </dd>
                <dd className="flex flex-wrap items-center gap-2 text-sm">
                  <SourceRef ids={ind.sources} />
                  {ind.href && (
                    <Link href={ind.href} className="text-emerald underline decoration-line underline-offset-4 hover:decoration-sand">
                      التفاصيل
                    </Link>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* المناطق مرتبة بعدد السكان */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-labelledby="regions-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="regions-h" className="font-display text-3xl font-bold text-green-deep">ثلاث عشرة منطقة، وطن واحد</h2>
            <p className="mt-2 text-[0.95rem] text-ink-muted">
              مرتبة حسب السكان في تعداد 2022. مجموع المناطق يطابق إجمالي التعداد: {formatNumber(NATIONAL_POPULATION_2022)} نسمة.
            </p>
          </div>
          <Link href="/regions" className="text-emerald underline decoration-line underline-offset-4 hover:decoration-sand">كل المناطق</Link>
        </div>
        <ol className="mt-8 grid gap-x-10 md:grid-cols-2">
          {byPop.map((r) => (
            <li key={r.id} className="border-b border-line">
              <Link href={`/regions/${r.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-4">
                <span className="font-display text-lg font-medium text-charcoal group-hover:text-emerald">
                  {r.shortAr}
                  {r.detailLevel === "full" && <span className="ms-2 align-middle text-xs font-normal text-emerald">صفحة مفصلة</span>}
                </span>
                <span className="num text-sm text-ink-muted" title={formatNumber(r.population.value)}>{formatCompact(r.population.value)}</span>
                <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-line/60" aria-hidden>
                  <span className="block h-full rounded-full transition-colors" style={{ width: `${(r.population.value / maxPop) * 100}%`, background: r.accent }} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink-muted">المصدر: الهيئة العامة للإحصاء، تعداد السعودية 2022.</p>
      </section>

      {/* التراث العالمي على خط زمني فعلي */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-labelledby="whs-h">
        <h2 id="whs-h" className="font-display text-3xl font-bold text-green-deep"><span className="num">{sites.length}</span> مواقع في قائمة التراث العالمي</h2>
        <p className="mt-2 max-w-2xl text-[0.95rem] text-ink-muted">
          بترتيب سنة التسجيل لدى اليونسكو، من الحِجر عام 2008 إلى الفاو عام 2024.
        </p>
        <ol className="mt-10 grid gap-6 border-t-2 border-sand pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {sites.map((s) => {
            const region = regions.find((r) => r.id === s.region);
            return (
              <li key={s.id} className="relative">
                <span className="absolute -top-[1.95rem] start-0 size-3 rounded-full border-2 border-sand bg-ivory" aria-hidden />
                <p className="num font-display text-2xl font-bold text-sand">{s.year}</p>
                <h3 className="mt-1 font-display text-base font-medium leading-7 text-charcoal">
                  <Link href={`/heritage#${s.id}`} className="hover:text-emerald">{s.nameAr}</Link>
                </h3>
                <p className="text-sm text-ink-muted">
                  {s.category} — {region ? region.shortAr : "المنطقة بحاجة للتحقق"}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SourcesFooter ids={["gastat-census-2022", "saudipedia-provinces", "saudipedia-geography", "unesco-whc-sa", "unesco-ich-sa", "moe", "natural-earth"]} />
      </div>
    </>
  );
}
