import { AtlasPatterns } from "./AtlasDefs";
import { getRegionPlate } from "@/lib/geo";

/** المنطقة منفردة كقطعة على لوحة: سطح ورقي، وتضاريس مقصوصة عليها، وظل يمنحها سماكة */
export function RegionPlate({ id, accent, size = 400, className = "", seat = true }: { id: string; accent: string; size?: number; className?: string; seat?: boolean }) {
  const p = getRegionPlate(id, size, 0.1);
  const pre = `pl-${id}-${size}`;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`block h-auto w-full ${className}`} aria-hidden>
      <defs>
        <AtlasPatterns prefix={pre} />
        <clipPath id={`${pre}-clip`}><path d={p.d} /></clipPath>
        <linearGradient id={`${pre}-tint`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <g filter={`url(#${pre}-slab)`}>
        <path d={p.d} fill="#D9B77A" transform={`translate(0 ${size * 0.022})`} />
        <path d={p.d} fill="#EBD2A0" transform={`translate(0 ${size * 0.011})`} />
      </g>
      <path d={p.d} fill="#FFF7E6" />
      <path d={p.d} fill={`url(#${pre}-tint)`} />
      <g clipPath={`url(#${pre}-clip)`}>
        {p.physical.map((ph) => <path key={ph.id} d={ph.d} fill={`url(#${pre}-${ph.kind})`} />)}
      </g>
      <path d={p.d} fill="none" stroke="#FFFFFF" strokeWidth={size / 150} />
      {seat && p.seat && (
        <rect x={p.seat[0] - size / 70} y={p.seat[1] - size / 70} width={size / 35} height={size / 35}
          transform={`rotate(45 ${p.seat[0]} ${p.seat[1]})`} fill="#FFFFFF" stroke="#1E2B28" strokeWidth={size / 200} />
      )}
    </svg>
  );
}
