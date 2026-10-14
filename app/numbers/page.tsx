import type { Metadata } from "next";
import { RegionCompare } from "@/components/RegionCompare";
import { SourcesFooter } from "@/components/SourcesFooter";
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
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold text-green-deep">وطن في أرقام</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-ink-muted">
        المرحلة الحالية تعرض مؤشرات السكان والمساحة على مستوى المناطق. لا تُقارن هنا أرقام من سنوات أو تعريفات مختلفة، وكل قيمة مشتقة موسومة بأنها تقريبية.
      </p>
      <p className="mt-4 text-sm text-ink-muted">
        فحص اتساق: مجموع سكان المناطق <span className="num">{formatNumber(sum)}</span>
        {sum === NATIONAL_POPULATION_2022 ? " يطابق " : " لا يطابق "}
        إجمالي التعداد <span className="num">{formatNumber(NATIONAL_POPULATION_2022)}</span>.
      </p>
      <div className="mt-10">
        <RegionCompare regions={data} />
      </div>
      <SourcesFooter ids={["gastat-census-2022", "saudipedia-provinces"]} />
    </div>
  );
}
