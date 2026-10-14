import Link from "next/link";
import { Logo } from "./Logo";
import { Parapet } from "./Parapet";
import { CONTENT_LAST_REVIEW, NAV, SITE_TAGLINE } from "@/lib/site";
import { formatDate } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-28">
      <Parapet color="#0F5F6E" />
      <div className="footer-plate text-white">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-6 max-w-sm font-display text-2xl leading-[1.6] text-[#FFD08A]">{SITE_TAGLINE}</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
              منصة معرفية مستقلة، لا تتبع جهة حكومية ولا مؤسسة تعليمية، ولا تحمل اعتمادًا رسميًا.
            </p>
          </div>
          <nav aria-label="روابط التذييل">
            <ul className="grid gap-2.5 text-[0.95rem]">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link className="text-white/85 hover:text-[#FFD08A]" href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm leading-7 text-white/75">
            <p className="font-display text-xl text-white">المصادر والمراجع — آخر تحديث</p>
            <p className="mt-2">آخر مراجعة للمحتوى: {formatDate(CONTENT_LAST_REVIEW)}</p>
            <p>
              لكل رقم في المنصة مصدر وسنة مرجعية.{" "}
              <Link href="/sources" className="text-[#FFD08A] underline underline-offset-4">قائمة المصادر</Link>
            </p>
            <p className="mt-3 text-xs text-white/55">
              الحدود المعروضة مرحلية من Natural Earth (ملكية عامة)، وتُستبدل بحدود الهيئة العامة للمساحة والمعلومات الجيومكانية عند اعتمادها.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
