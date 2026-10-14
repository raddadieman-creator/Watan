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
              fill={on ? accent : "rgba(248,245,237,0.1)"}
              stroke={on ? "#F3E3BC" : "rgba(197,164,109,0.55)"}
              strokeWidth={on ? 2 : 1}
              className={on ? "" : "transition-colors hover:fill-[rgba(197,164,109,0.3)]"}
            />
          </a>
        );
      })}
      {current?.seat && (
        <rect x={current.seat[0] - 6} y={current.seat[1] - 6} width={12} height={12} transform={`rotate(45 ${current.seat[0]} ${current.seat[1]})`} fill="#103B32" stroke="#F3E3BC" strokeWidth={2} pointerEvents="none" />
      )}
    </svg>
  );
}
