"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { search, searchDocCount } from "@/lib/search";

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  useEffect(() => setQ(initial), [initial]);
  const results = useMemo(() => search(q, 50), [q]);

  return (
    <div className="mt-6">
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); router.replace(`/search?q=${encodeURIComponent(q.trim())}`); }}
      >
        <label htmlFor="q" className="sr-only">كلمة البحث</label>
        <input
          id="q"
          type="search"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          placeholder="مثال: المدينه، الاحساء، القط العسيري"
          className="h-13 w-full rounded-xl border border-line bg-paper px-4 py-3 text-lg focus:border-sand focus:outline-none"
        />
      </form>
      <p className="mt-3 text-sm text-ink-muted" role="status">
        {q.trim()
          ? `${results.length} نتيجة`
          : `البحث يشمل ${searchDocCount} مدخلًا: المناطق والمحافظات ومواقع التراث والجامعات. يتجاهل اختلاف الهمزات والتاء المربوطة و«ال».`}
      </p>
      {q.trim() && results.length === 0 && (
        <p className="mt-6 rounded-xl border border-line bg-paper p-4 text-ink-muted">
          لا نتائج لـ«{q}». جرّب كلمة أقصر، أو اسم المنطقة بدل المدينة.
        </p>
      )}
      <ul className="mt-6 divide-y divide-line">
        {results.map((r) => (
          <li key={r.id}>
            <Link href={r.href} className="group flex items-baseline justify-between gap-4 py-4">
              <span>
                <span className="block font-display text-lg text-charcoal group-hover:text-emerald">{r.title}</span>
                {r.subtitle && <span className="block text-sm text-ink-muted">{r.subtitle}</span>}
              </span>
              <span className="shrink-0 text-xs text-emerald">{r.kind}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
