import Image from "next/image";

/** شعارا وزارة التعليم والمتوسطة الثامنة والعشرين، على خلفية بيضاء ليظهرا بألوانهما الأصلية */
export function PartnerLogos({ size = "md" }: { size?: "sm" | "md" }) {
  const h = size === "sm" ? 40 : 64;
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center rounded-xl bg-white px-2.5 py-1.5 ring-1 ring-ink/10">
        <Image src="/logos/moe.png" alt="وزارة التعليم" width={Math.round(h * 1.32)} height={h} style={{ height: h, width: "auto" }} />
      </span>
      <span className="inline-flex items-center rounded-xl bg-white px-2.5 py-1.5 ring-1 ring-ink/10">
        <Image src="/logos/school-28.png" alt="شعار المتوسطة الثامنة والعشرين بالمدينة المنورة" width={Math.round(h * 1.39)} height={h} style={{ height: h, width: "auto" }} />
      </span>
    </div>
  );
}
