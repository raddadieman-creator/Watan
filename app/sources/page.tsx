import type { Metadata } from "next";
import { SourcesFooter } from "@/components/SourcesFooter";
import { PageHero } from "@/components/PageHero";
import { sources } from "@/lib/data";

export const metadata: Metadata = { title: "المصادر والمراجع", description: "قائمة المصادر التي تعتمد عليها منصة وطن، مع تاريخ آخر تحقق لكل مصدر." };

export default function SourcesPage() {
  return (
    <>
    <PageHero kicker="التوثيق" title="المصادر والمراجع" />
    <div className="mx-auto max-w-4xl px-5 sm:px-8">
      <div className="mt-10 grid max-w-2xl gap-3 text-[1.02rem] leading-8 text-ink-muted">
        <p>تعتمد المنصة على مصادر رسمية ومرجعية، وتحفظ لكل معلومة رقمية مصدرها وسنتها المرجعية وتاريخ آخر تحقق.</p>
        <p>وجود مصدر في هذه القائمة لا يعني إذنًا بنسخ صوره أو نصوصه؛ تُراجع شروط الاستخدام قبل إدراج أي صورة أو بيانات.</p>
      </div>
      <SourcesFooter ids={Object.keys(sources)} title="القائمة الكاملة" />
    </div>
    </>
  );
}
