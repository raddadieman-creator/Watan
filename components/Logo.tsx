/** شعار نصي: كلمة «وطن» مع نقطة رملية تمثّل موقعًا على الخريطة */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const ink = tone === "dark" ? "text-green-deep" : "text-ivory";
  return (
    <span className={`inline-flex items-baseline gap-2 ${ink}`}>
      <span className="font-display text-[1.65rem] font-extrabold leading-none tracking-tight">وطن</span>
      <span aria-hidden className="inline-block size-2 translate-y-[-0.35rem] rounded-full bg-sand" />
      <span className="font-display text-[0.7rem] font-medium tracking-[0.2em] opacity-70" lang="en" dir="ltr">
        WATAN
      </span>
    </span>
  );
}
