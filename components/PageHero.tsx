import { Parapet } from "./Parapet";

/** رأس الصفحات الداخلية: لوحة داكنة بعنوان نسخي كبير وحافة شُرَف نجدية */
export function PageHero({ title, lead, kicker, children }: { title: string; lead?: string; kicker?: string; children?: React.ReactNode }) {
  return (
    <>
      <header className="contour-plate relative overflow-hidden text-ivory">
        <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-14 sm:px-8 lg:pb-20 lg:pt-20">
          {kicker && (
            <p className="flex items-center gap-3 text-sm text-sand">
              <span className="inline-block h-px w-10 bg-sand" aria-hidden />
              {kicker}
            </p>
          )}
          <h1 className="hero-title mt-1 max-w-4xl font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[1.35]">{title}</h1>
          {lead && <p className="mt-3 max-w-[44rem] text-[1.1rem] leading-9 text-ivory/78">{lead}</p>}
          {children}
        </div>
      </header>
      <Parapet color="#F8F5ED" className="relative z-10 -mt-[22px]" />
    </>
  );
}
