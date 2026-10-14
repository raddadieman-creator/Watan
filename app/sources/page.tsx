import type { Metadata } from "next";
import { SourcesFooter } from "@/components/SourcesFooter";
import { sources } from "@/lib/data";

export const metadata: Metadata = { title: "المصادر والمراجع", description: "قائمة المصادر التي تعتمد عليها منصة وطن، مع تاريخ آخر تحقق لكل مصدر." };

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold text-green-deep">المصادر والمراجع</h1>
      <div className="mt-4 grid max-w-2xl gap-3 text-[1.02rem] leading-8 text-ink-muted">
        <p>تعتمد المنصة على مصادر رسمية ومرجعية، وتحفظ لكل معلومة رقمية مصدرها وسنتها المرجعية وتاريخ آخر تحقق.</p>
        <p>وجود مصدر في هذه القائمة لا يعني إذنًا بنسخ صوره أو نصوصه؛ تُراجع شروط الاستخدام قبل إدراج أي صورة أو بيانات.</p>
      </div>
      <SourcesFooter ids={Object.keys(sources)} title="القائمة الكاملة" />
    </div>
  );
}
