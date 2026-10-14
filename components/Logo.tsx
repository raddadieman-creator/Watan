/** الشعار: «وطن» بخط نسخي، تعلوه شُرفة نجدية صغيرة */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const ink = tone === "dark" ? "text-ink" : "text-white";
  return (
    <span className={`inline-flex items-center gap-2.5 ${ink}`}>
      <span className="relative inline-flex flex-col items-center">
        <svg width="22" height="11" viewBox="0 0 30 16" aria-hidden className="mb-[-6px]">
          <path d="M2 16 V12 H5 V8 H8 V4 H11 V1 H19 V4 H22 V8 H25 V12 H28 V16 Z M15 6 L12.5 12 H17.5 Z" fill="#F28C38" fillRule="evenodd" />
        </svg>
        <span className={`font-display text-[2rem] font-bold leading-[1.3] ${tone === "dark" ? "hero-title" : "hero-title-light"}`}>وطن</span>
      </span>
      <span className="hidden h-7 w-px bg-current opacity-20 sm:block" aria-hidden />
      <span className="hidden text-[0.68rem] leading-4 opacity-70 sm:block">
        <span className="block" lang="en" dir="ltr">WATAN</span>
        <span className="block">أطلس المملكة التفاعلي</span>
      </span>
    </span>
  );
}
