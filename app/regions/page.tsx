import type { Metadata } from "next";
import Link from "next/link";
import { SourcesFooter } from "@/components/SourcesFooter";
import { PageHero } from "@/components/PageHero";
import { regions } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "مناطقنا",
  description: "المناطق الإدارية الثلاث عشرة في المملكة العربية السعودية: مقارها وسكانها ومساحاتها التقريبية وعدد محافظاتها.",
};

export default function RegionsIndex() {
  const sorted = [...regions].sort((a, b) => a.shortAr.localeCompare(b.shortAr, "ar"));
  return (
    <>
    <PageHero kicker="التقسيم الإداري" title="مناطقنا" lead="تنقسم المملكة إداريًا إلى ثلاث عشرة منطقة، لكل منها إمارة ومقر إداري ومحافظات تتبعه. الجدول مرتب أبجديًا، ويمكن فتح أي منطقة من اسمها." />
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">

      <div className="museum mt-12 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-start text-[0.95rem]">
          <caption className="sr-only">المناطق الإدارية وبياناتها الأساسية</caption>
          <thead>
            <tr className="border-b border-line text-start text-sm text-ink-muted">
              <th scope="col" className="px-4 py-3 text-start font-medium">المنطقة</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">المقر الإداري</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">السكان (2022)</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">المساحة التقريبية</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">المحافظات</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-line/70 last:border-0 hover:bg-ivory/60">
                <th scope="row" className="px-4 py-3 text-start font-medium">
                  <span className="me-2 inline-block size-2.5 rounded-full align-middle" style={{ background: r.accent }} aria-hidden />
                  <Link href={`/regions/${r.id}`} className="font-display text-xl text-green-deep underline decoration-line underline-offset-4 hover:decoration-sand">
                    {r.nameAr}
                  </Link>
                  {r.detailLevel === "full" && <span className="ms-2 text-xs font-normal text-emerald">مفصلة</span>}
                </th>
                <td className="px-4 py-3">{r.seatAr}</td>
                <td className="num px-4 py-3">{formatNumber(r.population.value)}</td>
                <td className="num px-4 py-3">{formatNumber(r.areaKm2.value)} كم²</td>
                <td className="num px-4 py-3">{r.governorates.count ?? <span className="text-xs text-[#8A6A2E]">بحاجة للتحقق</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-6 text-ink-muted">
        السكان من تعداد 2022 (الهيئة العامة للإحصاء). المساحات وأعداد المحافظات تقريبية كما وردت في سعوديبيديا، وتُراجع لاحقًا مع بيانات الهيئة العامة للمساحة والمعلومات الجيومكانية.
      </p>

      <SourcesFooter ids={["gastat-census-2022", "saudipedia-provinces"]} />
    </div>
    </>
  );
}
