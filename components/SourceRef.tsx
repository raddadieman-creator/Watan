import { getSource } from "@/lib/data";

/** إحالة مصدر صغيرة قابلة للنقر بجوار المعلومة */
export function SourceRef({ ids }: { ids: string[] }) {
  return (
    <span className="ms-1 inline-flex flex-wrap gap-1 align-baseline">
      {ids.map((id) => {
        const s = getSource(id);
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-line bg-paper px-1.5 py-px text-[0.7rem] leading-5 text-emerald no-underline hover:border-sand"
            title={`${s.title} — ${s.publisher}`}
          >
            {s.publisher}
          </a>
        );
      })}
    </span>
  );
}
