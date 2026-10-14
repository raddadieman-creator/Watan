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

export function PendingTag({ children = "بحاجة للتحقق" }: { children?: React.ReactNode }) {
  return (
    <span className="flag-pending inline-flex items-center rounded px-2 py-0.5 text-xs text-[#7A5A22]">{children}</span>
  );
}
