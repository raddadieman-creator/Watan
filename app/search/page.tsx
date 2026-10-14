import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";

export const metadata: Metadata = { title: "البحث", robots: { index: false } };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      <h1 className="font-display text-5xl leading-[1.4] text-ink">البحث في وطن</h1>
      <Suspense fallback={<p className="mt-6 text-ink-muted">جارٍ تحميل البحث…</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
