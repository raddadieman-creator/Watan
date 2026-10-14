import Link from "next/link";
import { Logo } from "./Logo";
import { CONTENT_LAST_REVIEW, NAV, SITE_TAGLINE } from "@/lib/site";
import { formatDate } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="contour-plate mt-24 text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-ivory/75">
            {SITE_TAGLINE}. منصة معرفية مستقلة، لا تتبع جهة حكومية ولا مؤسسة تعليمية، ولا تحمل اعتمادًا رسميًا.
          </p>
        </div>
        <nav aria-label="روابط التذييل">
          <ul className="grid gap-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link className="text-ivory/80 hover:text-sand" href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm text-ivory/75">
          <p className="font-display text-ivory">المصادر والمراجع — آخر تحديث</p>
          <p className="mt-2">آخر مراجعة للمحتوى: {formatDate(CONTENT_LAST_REVIEW)}</p>
          <p className="mt-2">
            لكل رقم في المنصة مصدر وسنة مرجعية.{" "}
            <Link href="/sources" className="text-sand underline underline-offset-4">قائمة المصادر</Link>
          </p>
          <p className="mt-2 text-xs text-ivory/60">
            الحدود المعروضة مرحلية من Natural Earth (ملكية عامة)، وتُستبدل بحدود الهيئة العامة للمساحة والمعلومات الجيومكانية عند اعتمادها.
          </p>
        </div>
      </div>
    </footer>
  );
}
