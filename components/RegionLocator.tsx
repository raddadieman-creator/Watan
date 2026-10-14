import { getAtlas } from "@/lib/geo";
import { regions } from "@/lib/data";

/** خريطة موقع مصغرة تُبرز منطقة واحدة؛ كل منطقة رابط إلى صفحتها */
export function RegionLocator({ highlight, accent }: { highlight: string; accent: string }) {
  const atlas = getAtlas();
  const [x, y, w, h] = atlas.ksaBox;
  const pad = 12;
  const current = atlas.regions.find((s) => s.id === highlight);
  return (
    <svg viewBox={`${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`} className="block h-auto w-full" role="group" aria-label="موقع المنطقة على خريطة المملكة">
      {atlas.regions.map((s) => {
        const r = regions.find((q) => q.id === s.id)!;
        const on = s.id === highlight;
        return (
          <a key={s.id} href={`/regions/${s.id}`} aria-label={r.nameAr} aria-current={on ? "page" : undefined}>
            <title>{r.nameAr}</title>
            <path
              d={s.d}
              fill={on ? accent : "#FFF1D9"}
              stroke={on ? "#FFFFFF" : "#E3CFA6"}
              strokeWidth={on ? 2 : 1}
              className={on ? "" : "transition-colors hover:fill-[#FFE2B0]"}
            />
          </a>
        );
      })}
      {current?.seat && (
        <rect x={current.seat[0] - 6} y={current.seat[1] - 6} width={12} height={12} transform={`rotate(45 ${current.seat[0]} ${current.seat[1]})`} fill="#FFFFFF" stroke="#1E2B28" strokeWidth={2} pointerEvents="none" />
      )}
    </svg>
  );
}
