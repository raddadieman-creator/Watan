// فحص سلامة البيانات قبل النشر: يُشغَّل تلقائيًا قبل كل بناء (prebuild)
import fs from "node:fs";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const regions = read("data/regions.json");
const sources = read("data/sources.json");
const heritage = read("data/heritage.json");
const geo = read("data/geo/sa-regions.geojson.json");

const errors = [];
const fail = (m) => errors.push(m);

if (regions.length !== 13) fail(`عدد المناطق ${regions.length} وليس 13`);
const ids = new Set(regions.map((r) => r.id));
const geoIds = new Set(geo.features.map((f) => f.properties.id));
for (const id of ids) if (!geoIds.has(id)) fail(`المنطقة ${id} لا حدود لها في ملف الخريطة`);
for (const id of geoIds) if (!ids.has(id)) fail(`حدود ${id} بلا بيانات في regions.json`);

const NATIONAL = 32175224;
const sum = regions.reduce((s, r) => s + r.population.value, 0);
if (sum !== NATIONAL) fail(`مجموع سكان المناطق ${sum} لا يطابق إجمالي التعداد ${NATIONAL}`);

const checkSource = (id, where) => { if (!sources[id]) fail(`مصدر غير معرّف "${id}" في ${where}`); };
for (const r of regions) {
  checkSource(r.population.source, `${r.id}.population`);
  checkSource(r.areaKm2.source, `${r.id}.areaKm2`);
  checkSource(r.governorates.source, `${r.id}.governorates`);
  for (const s of r.sections) for (const it of s.items) {
    if (!it.sources?.length) fail(`معلومة بلا مصدر في ${r.id}/${s.key}: ${it.text.slice(0, 40)}…`);
    it.sources?.forEach((x) => checkSource(x, `${r.id}/${s.key}`));
  }
  if (r.detailLevel === "full" && !r.lead) fail(`${r.id} مفصلة بلا مقدمة`);
}
for (const s of heritage.worldHeritage) {
  checkSource(s.source, `whs/${s.id}`);
  if (s.region && !ids.has(s.region)) fail(`موقع ${s.id} مرتبط بمنطقة غير موجودة ${s.region}`);
}
for (const e of heritage.intangible) for (const r of e.regions) if (!ids.has(r)) fail(`عنصر ${e.id} مرتبط بمنطقة غير موجودة ${r}`);
for (const [id, s] of Object.entries(sources)) {
  if (!/^https:\/\//.test(s.url)) fail(`رابط المصدر ${id} ليس https`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.verified)) fail(`تاريخ تحقق غير صالح في ${id}`);
}

if (errors.length) {
  console.error("✗ فشل فحص البيانات:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`✓ البيانات سليمة: 13 منطقة، ${heritage.worldHeritage.length} مواقع تراث عالمي، ${heritage.intangible.length} عنصرًا غير مادي، ${Object.keys(sources).length} مصادر. مجموع السكان يطابق التعداد.`);
