import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ReligiousSection } from "@/components/ReligiousSection";

export const metadata: Metadata = {
  title: "السياحة الدينية",
  description: "المسجد الحرام والمشاعر المقدسة في مكة المكرمة، والمسجد النبوي ومعالم المدينة المنورة، مع روابط الخدمات الرسمية لضيوف الرحمن.",
};

export default function ReligiousTourismPage() {
  return (
    <>
      <PageHero
        kicker="ضيوف الرحمن"
        title="السياحة الدينية في مكة المكرمة والمدينة المنورة"
        lead="الحرمان الشريفان والمشاعر المقدسة والمساجد والمعالم التاريخية والمتاحف، مع روابط المنصات الرسمية لتصاريح العمرة وزيارة الروضة الشريفة."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#religious-makkah" className="btn-gold">مكة المكرمة</a>
          <a href="#religious-madinah" className="btn-ghost">المدينة المنورة</a>
        </div>
      </PageHero>
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 pt-12 sm:px-8">
        <ReligiousSection city="makkah" showServices={false} />
        <ReligiousSection city="madinah" />
        <p className="text-sm text-ink-muted">
          للمزيد عن المنطقتين: <Link href="/regions/makkah" className="text-sea underline underline-offset-4">منطقة مكة المكرمة</Link>،{" "}
          <Link href="/regions/madinah" className="text-sea underline underline-offset-4">منطقة المدينة المنورة</Link>.
        </p>
      </div>
    </>
  );
}
