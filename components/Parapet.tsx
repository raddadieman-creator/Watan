/**
 * حافة «الشُّرَف» النجدية: صف من الشرفات المتدرجة المثقوبة بمثلث،
 * مستمد من أعالي جدران العمارة الطينية في نجد. يُستخدم حدًّا بين لوحتين.
 */
export function Parapet({ color, className = "", flip = false }: { color: string; className?: string; flip?: boolean }) {
  const id = `parapet-${color.replace("#", "")}${flip ? "-f" : ""}`;
  return (
    <svg aria-hidden className={`block h-[22px] w-full ${className}`} preserveAspectRatio="none" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <defs>
        <pattern id={id} width="34" height="22" patternUnits="userSpaceOnUse">
          <path
            d="M3 22 V16 H6 V11 H9 V6 H12 V2 H22 V6 H25 V11 H28 V16 H31 V22 Z M17 9 L13.5 17 H20.5 Z"
            fill={color}
            fillRule="evenodd"
          />
        </pattern>
      </defs>
      <rect width="100%" height="22" fill={`url(#${id})`} />
    </svg>
  );
}

/** فاصل ذهبي رفيع بشرفة صغيرة في وسطه */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-sand/60 to-sand" />
      <svg width="30" height="16" viewBox="0 0 30 16">
        <path d="M2 16 V12 H5 V8 H8 V4 H11 V1 H19 V4 H22 V8 H25 V12 H28 V16 Z M15 6 L12.5 12 H17.5 Z" fill="#C5A46D" fillRule="evenodd" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-sand/60 to-sand" />
    </div>
  );
}
