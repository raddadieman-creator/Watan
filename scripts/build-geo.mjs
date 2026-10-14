// يحوّل ملف Natural Earth (admin-1) إلى ملف GeoJSON خفيف لمناطق المملكة الثلاث عشرة.
// الاستخدام:
//   node scripts/build-geo.mjs <path/to/ne_10m_admin_1_states_provinces.geojson>
// المصدر: https://github.com/nvkelso/natural-earth-vector (ملكية عامة / Public Domain)
// تنبيه: هذه حدود مرحلية. المرجع الرسمي للحدود هو الهيئة العامة للمساحة والمعلومات الجيومكانية،
// ويجب استبدال هذا الملف بحدودها عند الحصول على البيانات وفق شروط استخدامها.
import fs from "node:fs";

const src = process.argv[2];
if (!src) {
  console.error("حدّد مسار ملف Natural Earth admin-1 GeoJSON");
  process.exit(1);
}

const ISO_TO_SLUG = {
  "SA-01": "riyadh",
  "SA-02": "makkah",
  "SA-03": "madinah",
  "SA-04": "eastern",
  "SA-05": "qassim",
  "SA-06": "hail",
  "SA-07": "tabuk",
  "SA-08": "northern-borders",
  "SA-09": "jazan",
  "SA-10": "najran",
  "SA-11": "bahah",
  "SA-12": "jawf",
  "SA-14": "asir",
};

const round = (n) => Math.round(n * 1e4) / 1e4;
const roundCoords = (c) => (typeof c[0] === "number" ? [round(c[0]), round(c[1])] : c.map(roundCoords));

const data = JSON.parse(fs.readFileSync(src, "utf8"));
const features = data.features
  .filter((f) => f.properties.adm0_a3 === "SAU")
  .map((f) => {
    const iso = f.properties.iso_3166_2;
    const slug = ISO_TO_SLUG[iso];
    if (!slug) throw new Error(`رمز غير معروف: ${iso}`);
    return {
      type: "Feature",
      properties: { id: slug, iso },
      geometry: { type: f.geometry.type, coordinates: roundCoords(f.geometry.coordinates) },
    };
  });

if (features.length !== 13) throw new Error(`المتوقع 13 منطقة، وُجد ${features.length}`);

const out = {
  type: "FeatureCollection",
  metadata: {
    source: "Natural Earth 1:10m Admin 1 – States, Provinces",
    sourceUrl: "https://github.com/nvkelso/natural-earth-vector",
    license: "Public Domain",
    status: "interim — to be replaced with GEOSA official boundaries",
    generated: new Date().toISOString().slice(0, 10),
  },
  features,
};
fs.writeFileSync("data/geo/sa-regions.geojson.json", JSON.stringify(out));
console.log(`تم: ${features.length} منطقة → data/geo/sa-regions.geojson.json`);
