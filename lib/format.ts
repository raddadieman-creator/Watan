const nf = new Intl.NumberFormat("ar-SA-u-nu-latn");

export function formatNumber(n: number): string {
  return nf.format(n);
}

/** صيغة مختصرة للأعداد الكبيرة: 8.59 مليون */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 2 })} مليون`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 0 })} ألف`;
  return formatNumber(n);
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("ar-SA-u-nu-latn-ca-gregory", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}
