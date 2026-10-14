import type { Metadata, Viewport } from "next";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/almarai/300.css";
import "@fontsource/almarai/400.css";
import "@fontsource/almarai/700.css";
import "@fontsource/almarai/800.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "منصة معرفية تفاعلية عن المملكة العربية السعودية: أطلس للمناطق الثلاث عشرة، وتراث موثق من قوائم اليونسكو، وأرقام من مصادرها الرسمية.",
  authors: [{ name: "ديما فهد الردادي" }],
  openGraph: { type: "website", locale: "ar_SA", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#103B32",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="paper flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-2"
        >
          تخطَّ إلى المحتوى
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
