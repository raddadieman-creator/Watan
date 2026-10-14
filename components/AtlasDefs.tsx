/**
 * أنماط كارتوغرافية مشتركة: كثبان للصحارى، وخطوط تضاريس للجبال، ونقاط للسهول.
 * تُعرّف مرة لكل SVG، والمعرّفات مسبوقة لتفادي التكرار بين خرائط الصفحة الواحدة.
 */
export function AtlasPatterns({ prefix, tone = "parchment", scale = 1 }: { prefix: string; tone?: "parchment" | "dark"; scale?: number }) {
  const st = scale === 1 ? "" : `scale(${scale})`;
  const sand = tone === "parchment" ? "#B08A50" : "#C5A46D";
  const ridge = tone === "parchment" ? "#7A5E38" : "#D9C08A";
  const dot = tone === "parchment" ? "#8F7A4E" : "#C5A46D";
  return (
    <>
      <pattern id={`${prefix}-desert`} width="26" height="13" patternUnits="userSpaceOnUse" patternTransform={`${st} rotate(-18)`}>
        <path d="M0 10 q6.5 -7 13 0 t13 0" fill="none" stroke={sand} strokeWidth="1.1" strokeOpacity="0.55" strokeLinecap="round" />
      </pattern>
      <pattern id={`${prefix}-mountain`} width="15" height="12" patternUnits="userSpaceOnUse" patternTransform={st || undefined}>
        <path d="M1.5 10.5 L7.5 3 L13.5 10.5" fill="none" stroke={ridge} strokeWidth="1.15" strokeOpacity="0.6" strokeLinejoin="round" />
        <path d="M7.5 3 L9.6 10.5" fill="none" stroke={ridge} strokeWidth="0.8" strokeOpacity="0.35" />
      </pattern>
      <pattern id={`${prefix}-plain`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform={st || undefined}>
        <circle cx="2" cy="2" r="0.95" fill={dot} fillOpacity="0.45" />
        <circle cx="6.5" cy="6.5" r="0.95" fill={dot} fillOpacity="0.3" />
      </pattern>
      <radialGradient id={`${prefix}-parchment`} cx="45%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#F6EFDD" />
        <stop offset="70%" stopColor="#EADCBC" />
        <stop offset="100%" stopColor="#DCC9A0" />
      </radialGradient>
      <filter id={`${prefix}-lift`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#04140F" floodOpacity="0.55" />
      </filter>
      <filter id={`${prefix}-slab`} x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#020B08" floodOpacity="0.6" />
      </filter>
    </>
  );
}
