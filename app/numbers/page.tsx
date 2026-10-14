import type { Metadata } from "next";
import { RegionCompare } from "@/components/RegionCompare";
import { SourcesFooter } from "@/components/SourcesFooter";
import { PageHero } from "@/components/PageHero";
import { NATIONAL_POPULATION_2022, regions } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "المملكة بالأرقام",
  description: "سكان المناطق الإدارية في تعداد 2022 ومساحاتها التقريبية، مع أداة للمقارنة بين منطقتين.",
};

export default function NumbersPage() {
  const data = regions.map((r) => ({
    id: r.id, shortAr: r.shortAr, accent: r.accent,
    population: r.population.value, areaKm2: r.areaKm2.value, governorates: r.governorates.count,
  }));
  const sum = regions.reduce((s, r) => s + r.population.value, 0);
  return (
    <>
    <PageHero kicker="المملكة بالأرقام" title="وطن في أرقام" lead="مؤشرات السكان والمساحة على مستوى المناطق. لا تُقارن هنا أرقام من سنوات أو تعريفات مختلفة، وكل قيمة مشتقة موسومة بأنها تقريبية." />
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <p className="mt-10 text-sm text-ink-muted">
        فحص اتساق: مجموع سكان المناطق <span className="num">{formatNumber(sum)}</span>
        {sum === NATIONAL_POPULATION_2022 ? " يطابق " : " لا يطابق "}
        إجمالي التعداد <span className="num">{formatNumber(NATIONAL_POPULATION_2022)}</span>.
      </p>
      <div className="mt-10">
        <RegionCompare regions={data} />
      </div>
      <SourcesFooter ids={["gastat-census-2022", "saudipedia-provinces"]} />
    </div>
    </>
  );
}
