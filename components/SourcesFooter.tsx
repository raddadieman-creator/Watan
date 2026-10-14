import { getSource } from "@/lib/data";
import { formatDate } from "@/lib/format";

/** «المصادر والمراجع — آخر تحديث» أسفل كل صفحة محتوى */
export function SourcesFooter({ ids, title = "المصادر والمراجع — آخر تحديث" }: { ids: string[]; title?: string }) {
  return (
    <section aria-labelledby="sources-h" className="mt-16 border-t border-line pt-8">
      <h2 id="sources-h" className="font-display text-2xl text-ink">{title}</h2>
      <ol className="mt-4 grid gap-3 text-sm">
        {ids.map((id) => {
          const s = getSource(id);
          return (
            <li key={id} className="grid gap-0.5 sm:grid-cols-[1fr_auto] sm:gap-6">
              <span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-emerald underline decoration-line underline-offset-4 hover:decoration-sand">
                  {s.title}
                </a>
                <span className="text-ink-muted"> — {s.publisher}</span>
                {s.refYear && <span className="block text-xs text-ink-muted">السنة المرجعية: {s.refYear}</span>}
                {s.note && <span className="block text-xs text-ink-muted">{s.note}</span>}
                {s.secondaryUrl && (
                  <span className="block text-xs text-ink-muted">
                    {s.secondaryNote}:{" "}
                    <a href={s.secondaryUrl} target="_blank" rel="noopener noreferrer" className="text-emerald underline underline-offset-2">رابط الجدول</a>
                  </span>
                )}
              </span>
              <span className="text-xs text-ink-muted">آخر تحقق: {formatDate(s.verified)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
