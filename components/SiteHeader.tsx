"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { NAV } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-sand/25 bg-[#F8F5ED]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="وطن — الصفحة الرئيسية" className="shrink-0 rounded">
          <Logo />
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 text-[0.95rem] transition-colors ${
                    isActive(item.href)
                      ? "font-bold text-green-deep after:absolute after:inset-x-3 after:-bottom-[15px] after:h-[3px] after:rounded-full after:bg-sand"
                      : "text-ink-muted hover:text-green-deep"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto hidden w-72 lg:block">
          <SearchBox />
        </div>

        <button
          type="button"
          className="ms-auto inline-flex size-11 items-center justify-center rounded-md text-green-deep lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-ivory px-4 pb-5 pt-3 lg:hidden">
          <SearchBox />
          <nav aria-label="التنقل الرئيسي" className="mt-3">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-md px-3 py-3 text-base ${
                      isActive(item.href) ? "bg-paper font-semibold text-green-deep" : "text-charcoal"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
