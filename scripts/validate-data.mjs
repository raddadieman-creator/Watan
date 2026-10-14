// فحص سلامة البيانات قبل النشر: يُشغَّل تلقائيًا قبل كل بناء (prebuild)
import fs from "node:fs";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const regions = read("data/regions.json");
const sources = read("data/sources.json");
const heritage = read("data/heritage.json");
const geo = read("data/geo/sa-regions.geojson.json");
const universities = read("data/universities.json");
const folkArts = read("data/folk-arts.json");
const guide = read("data/region-guide.json");
const religious = read("data/religious.json");
const markers = read("data/region-markers.json");
const videos = read("data/videos.json");

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

if (universities.items.length !== universities.count) fail(`عدد الجامعات ${universities.items.length} لا يطابق ${universities.count}`);
for (const u of universities.items) {
  if (!ids.has(u.region)) fail(`جامعة بمنطقة غير معروفة: ${u.nameAr}`);
  if (!/^https:\/\//.test(u.url)) fail(`رابط جامعة غير صالح: ${u.nameAr}`);
}
for (const a of folkArts) {
  if (!a.sourceUrl) fail(`فن بلا مصدر: ${a.nameAr}`);
  a.regions.forEach((r) => { if (!ids.has(r)) fail(`فن بمنطقة غير معروفة: ${a.nameAr}`); });
}
for (const id of ids) if (!guide[id]) fail(`لا يوجد دليل للمنطقة ${id}`);
for (const city of ["makkah", "madinah"]) for (const s of religious[city].sites) if (!s.url) fail(`موقع ديني بلا رابط: ${s.nameAr}`);
for (const r of regions) if (!r.seat) fail(`المنطقة ${r.id} بلا إحداثيات مقر`);
for (const [rid, list] of Object.entries(markers)) {
  if (!ids.has(rid)) fail(`علامات لمنطقة غير معروفة ${rid}`);
  for (const m of list) {
    if (!(m.lat > 15 && m.lat < 33 && m.lon > 34 && m.lon < 56)) fail(`إحداثيات خارج المملكة: ${m.nameAr}`);
    if (!m.coordSource) fail(`علامة بلا مصدر إحداثيات: ${m.nameAr}`);
    if (!["religious", "heritage", "nature", "leisure", "museum"].includes(m.category)) fail(`تصنيف غير معروف: ${m.nameAr}`);
  }
}
for (const group of ["ich", "whs", "arts"]) for (const [k, v] of Object.entries(videos[group])) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(v)) fail(`معرّف فيديو غير صالح: ${k}`);
  if (!videos.channels[v]) fail(`فيديو بلا قناة: ${k}`);
}

if (errors.length) {
  console.error("✗ فشل فحص البيانات:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`✓ البيانات سليمة: 13 منطقة، ${universities.count} جامعة، ${folkArts.length} فنًّا شعبيًا، ${Object.values(markers).flat().length} مكانًا على الخرائط، ${new Set([...Object.values(videos.ich), ...Object.values(videos.whs), ...Object.values(videos.arts)]).size} فيديو، ${heritage.worldHeritage.length} مواقع تراث عالمي، ${heritage.intangible.length} عنصرًا غير مادي، ${Object.keys(sources).length} مصدرًا. مجموع السكان يطابق التعداد.`);
