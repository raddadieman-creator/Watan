import { ExternalLink } from "./ExternalLink";
import { religious } from "@/lib/data";

const KIND_COLORS: Record<string, string> = {
  "حرم": "#23A887",
  "مشعر": "#1DB4C8",
  "مسجد تاريخي": "#2E8FD9",
  "معلم تاريخي": "#F28C38",
  "متحف ومعرض": "#8C6BDB",
};

/** السياحة الدينية في مكة المكرمة أو المدينة المنورة */
export function ReligiousSection({ city, showServices = true, headingLevel = 2 }: { city: "makkah" | "madinah"; showServices?: boolean; headingLevel?: 2 | 3 }) {
  const c = religious[city];
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <section id={`religious-${city}`} className="scroll-mt-24" aria-labelledby={`rel-${city}-h`}>
      <div className="relative overflow-hidden rounded-[1.8rem] p-7 sm:p-9" style={{ background: "linear-gradient(135deg,#E9F8F4 0%,#FFF6E6 60%,#FFE9D2 100%)" }}>
        <div className="pointer-events-none absolute -end-10 -top-10 size-48 rounded-full bg-[#FFD58A]/40 blur-3xl" aria-hidden />
        <p className="flex items-center gap-3 text-sm font-bold text-mint">
          <span className="inline-block h-[3px] w-10 rounded-full bg-mint" aria-hidden />
          السياحة الدينية
        </p>
        <H id={`rel-${city}-h`} className="mt-1 font-display text-[clamp(2rem,4vw,3rem)] text-ink">{c.title}</H>
        <p className="mt-2 max-w-3xl text-[1.05rem] leading-9 text-ink/80">
          {c.intro}{" "}
          <ExternalLink href={c.introSource} className="text-sm text-sea underline underline-offset-4">المصدر</ExternalLink>
        </p>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {c.sites.map((s) => (
            <li key={s.nameAr} className="flex flex-col rounded-2xl bg-white p-5 shadow-[0_18px_40px_-30px_rgba(30,111,134,0.6)] ring-1 ring-ink/5">
              <span className="self-start rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: KIND_COLORS[s.kind] ?? "#1E6F86" }}>{s.kind}</span>
              <h4 className="mt-3 font-display text-[1.35rem] leading-[1.6] text-ink">{s.nameAr}</h4>
              <p className="mt-1 flex-1 text-[0.95rem] leading-8 text-ink/75">{s.descAr}</p>
              <ExternalLink href={s.url} className="mt-3 text-sm font-bold text-sea underline decoration-turq/40 underline-offset-4 hover:decoration-turq">اقرأ المزيد</ExternalLink>
            </li>
          ))}
        </ul>

        {c.facts.length > 0 && (
          <ul className="mt-6 grid gap-2">
            {c.facts.map((f) => (
              <li key={f.textAr} className="rounded-xl bg-white/70 px-4 py-3 text-[0.95rem] leading-8 text-ink">
                {f.textAr} <ExternalLink href={f.url} className="text-sm text-sea underline underline-offset-4">({f.source})</ExternalLink>
              </li>
            ))}
          </ul>
        )}

        {showServices && (
          <div className="mt-7">
            <p className="font-display text-xl text-ink">خدمات رسمية لضيوف الرحمن</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {religious.services.map((s) => (
                <li key={s.url}>
                  <ExternalLink href={s.url} className="group block h-full rounded-2xl bg-sea p-4 text-white transition hover:-translate-y-0.5 hover:bg-turq">
                    <span className="block font-bold">{s.nameAr}</span>
                    <span className="mt-1 block text-sm leading-7 text-white/85">{s.descAr}</span>
                    <span className="mt-2 block text-xs text-white/70" dir="ltr">{s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
