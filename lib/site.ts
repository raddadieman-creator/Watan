export const SITE_NAME = "وطن";
export const SITE_NAME_EN = "WATAN";
export const SITE_TAGLINE = "المملكة كما لم تكتشفها من قبل";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/regions", label: "مناطقنا" },
  { href: "/heritage", label: "التراث" },
  { href: "/numbers", label: "المملكة بالأرقام" },
  { href: "/sources", label: "المصادر" },
  { href: "/about", label: "عن وطن" },
] as const;

export const CONTENT_LAST_REVIEW = "2026-10-14";
