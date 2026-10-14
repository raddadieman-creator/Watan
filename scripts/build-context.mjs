// يبني طبقات السياق الجغرافي للأطلس من Natural Earth (ملكية عامة):
// اليابسة المحيطة، والمعالم الطبيعية (الصحارى والجبال والسهول)، وأسماء البحار، والقمم.
// الاستخدام: node scripts/build-context.mjs <مجلد ملفات Natural Earth الخام>
// الملفات المطلوبة: ne_10m_land.geojson, ne_10m_geography_regions_polys.geojson,
//                    ne_10m_geography_marine_polys.geojson, ne_10m_geography_regions_elevation_points.geojson
import fs from "node:fs";
import path from "node:path";
import { geoIdentity } from "d3-geo";
import { geoProject } from "d3-geo-projection";

const dir = process.argv[2];
if (!dir) { console.error("حدّد مجلد ملفات Natural Earth"); process.exit(1); }
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const r3 = (n) => Math.round(n * 1000) / 1000;
const roundCoords = (c) => (typeof c[0] === "number" ? [r3(c[0]), r3(c[1])] : c.map(roundCoords));
const BOX = [[18, -2], [82, 46]]; // lon/lat

// تبسيط دوغلاس–بوكر للحلقات: يكفي لليابسة المحيطة تفصيل أقل من حدود المناطق
function simplifyRing(ring, tol) {
  if (ring.length < 5) return ring;
  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  // الحلقة مغلقة (أولها = آخرها)، فتُقسم أولًا عند أبعد نقطة عن البداية
  let far = 1, farD = -1;
  for (let i = 1; i < ring.length - 1; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > farD) { farD = d; far = i; }
  }
  keep[far] = 1;
  const stack = [[0, far], [far, ring.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [x1, y1] = ring[a], [x2, y2] = ring[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-12;
    let maxD = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * ring[i][0] - dx * ring[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  const out = ring.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : null;
}
const simplifyGeom = (g, tol) => {
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  const res = polys
    .map((poly) => poly.map((r) => simplifyRing(r, tol)).filter(Boolean))
    .filter((poly) => poly.length);
  return { type: "MultiPolygon", coordinates: res };
};

// قصّ اليابسة على نطاق شبه الجزيرة وما حولها
const clip = geoIdentity().clipExtent(BOX);
const land = read("ne_10m_land.geojson");
const clipped = geoProject(land, clip);
const landFeatures = clipped.features
  .filter((f) => f.geometry && f.geometry.coordinates.length)
  .map((f) => ({ type: "Feature", properties: {}, geometry: simplifyGeom({ type: f.geometry.type, coordinates: roundCoords(f.geometry.coordinates) }, 0.02) }))
  .filter((f) => f.geometry.coordinates.length);

// المعالم الطبيعية المختارة — الأسماء العربية من Natural Earth مع تصحيح ما يلزم
const PHYS = {
  "RUB’ AL KHALI": { id: "rub-al-khali", kind: "desert", label: "الربع الخالي" },
  "An Nafud Desert": { id: "nafud", kind: "desert", label: "النفود الكبير" },
  "Tuwayq Mts.": { id: "tuwaiq", kind: "mountain", label: "جبال طويق" },
  "HEJAZ MTS.": { id: "hejaz", kind: "mountain", label: "جبال الحجاز" },
  "ASIR MTS.": { id: "asir-mts", kind: "mountain", label: "جبال عسير" },
  "Tihāmah": { id: "tihamah", kind: "plain", label: "تهامة" },
  "Hasa Plain": { id: "hasa", kind: "plain", label: "سهل الأحساء" },
};
const phys = read("ne_10m_geography_regions_polys.geojson").features
  .filter((f) => PHYS[f.properties.NAME])
  .map((f) => ({
    type: "Feature",
    properties: { ...PHYS[f.properties.NAME], sourceName: f.properties.NAME_EN },
    geometry: simplifyGeom({ type: f.geometry.type, coordinates: roundCoords(f.geometry.coordinates) }, 0.01),
  }));
if (phys.length !== Object.keys(PHYS).length) throw new Error(`معالم ناقصة: ${phys.length}`);

// مواضع أسماء البحار: مركز المضلع البحري من Natural Earth
const centroidOf = (g) => {
  const pts = [];
  const walk = (c) => (typeof c[0] === "number" ? pts.push(c) : c.forEach(walk));
  walk(g.coordinates);
  return [r3(pts.reduce((s, p) => s + p[0], 0) / pts.length), r3(pts.reduce((s, p) => s + p[1], 0) / pts.length)];
};
const SEAS = { "Red Sea": "البحر الأحمر", "Persian Gulf": "الخليج العربي" };
const seas = read("ne_10m_geography_marine_polys.geojson").features
  .filter((f) => SEAS[f.properties.name])
  .map((f) => ({ label: SEAS[f.properties.name], at: centroidOf(f.geometry) }));

// القمم داخل المملكة أو على أطرافها
const PEAKS = { "Jabal Sawdā": "جبل السودة", "Jabal al Lawz": "جبل اللوز" };
const peaks = read("ne_10m_geography_regions_elevation_points.geojson").features
  .filter((f) => PEAKS[f.properties.name])
  .map((f) => ({ label: PEAKS[f.properties.name], elevation: f.properties.elevation, at: roundCoords(f.geometry.coordinates) }));

const out = {
  metadata: {
    source: "Natural Earth: ne_10m_land, ne_10m_geography_regions_polys, ne_10m_geography_marine_polys, ne_10m_geography_regions_elevation_points",
    sourceUrl: "https://github.com/nvkelso/natural-earth-vector",
    license: "Public Domain",
    note: "حدود المعالم الطبيعية تقريبية كما في Natural Earth، وتُستخدم لأغراض الإيضاح الكارتوغرافي",
    generated: new Date().toISOString().slice(0, 10),
  },
  land: { type: "FeatureCollection", features: landFeatures },
  physical: { type: "FeatureCollection", features: phys },
  seas,
  peaks,
};
fs.writeFileSync("data/geo/context.json", JSON.stringify(out));
console.log(`تم: ${landFeatures.length} يابسة، ${phys.length} معالم، ${seas.length} بحار، ${peaks.length} قمم → data/geo/context.json`);
