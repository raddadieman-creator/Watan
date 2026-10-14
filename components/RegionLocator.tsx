import { getMapShapes, MAP_H, MAP_W } from "@/lib/geo";
import { regions } from "@/lib/data";

/** خريطة موقع ثابتة تُبرز منطقة واحدة؛ كل منطقة رابط إلى صفحتها */
export function RegionLocator({ highlight, accent }: { highlight: string; accent: string }) {
  const shapes = getMapShapes();
  const current = shapes.find((s) => s.id === highlight);
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full" role="group" aria-label="موقع المنطقة على خريطة المملكة">
      {shapes.map((s) => {
        const r = regions.find((x) => x.id === s.id)!;
        const on = s.id === highlight;
        return (
          <a key={s.id} href={`/regions/${s.id}`} aria-label={r.nameAr} aria-current={on ? "page" : undefined}>
            <title>{r.nameAr}</title>
            <path
              d={s.d}
              fill={on ? accent : "#EDE6D6"}
              stroke={on ? "#103B32" : "#C9BB9C"}
              strokeWidth={on ? 1.6 : 0.8}
              className={on ? "" : "transition-colors hover:fill-[#E0D3B6]"}
              style={{ vectorEffect: "non-scaling-stroke" }}
            />
          </a>
        );
      })}
      {current?.seat && (
        <g pointerEvents="none">
          <circle cx={current.seat[0]} cy={current.seat[1]} r={7} fill="#F8F5ED" stroke="#103B32" strokeWidth={2} />
        </g>
      )}
    </svg>
  );
}
