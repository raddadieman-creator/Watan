"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { search } from "@/lib/search";

export function SearchBox({ autoFocus = false, initial = "" }: { autoFocus?: boolean; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(q, 7), [q]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && results[active]) return go(results[active].href);
        if (q.trim()) {
          setOpen(false);
          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">ابحث في وطن</label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder="ابحث عن منطقة أو محافظة أو تراث"
        value={q}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
          if (e.key === "Escape") { setOpen(false); setActive(-1); }
        }}
        className="h-11 w-full rounded-full border border-line bg-paper pe-4 ps-10 text-[0.95rem] text-charcoal placeholder:text-ink-muted/70 focus:border-sand focus:outline-none"
      />
      <svg className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" strokeLinecap="round" />
      </svg>

      {open && q.trim() && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-xl border border-line bg-paper p-1.5 shadow-[0_18px_40px_-20px_rgba(16,59,50,0.45)]"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-muted">لا نتائج لـ«{q}». جرّب اسم منطقة أو مدينة أو عنصر تراثي.</li>
          ) : (
            results.map((r, i) => (
              <li
                key={r.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); go(r.href); }}
                className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-lg px-3 py-2 ${i === active ? "bg-ivory" : "hover:bg-ivory"}`}
              >
                <span>
                  <span className="block text-[0.95rem] text-charcoal">{r.title}</span>
                  {r.subtitle && <span className="block text-xs text-ink-muted">{r.subtitle}</span>}
                </span>
                <span className="shrink-0 text-[0.7rem] text-emerald">{r.kind}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
