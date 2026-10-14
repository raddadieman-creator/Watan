import "server-only";
import { geoBounds, geoCentroid, geoGraticule, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";
import geojson from "@/data/geo/sa-regions.geojson.json";
import context from "@/data/geo/context.json";
import { regions } from "./data";

type RegionFeature = Feature<Polygon | MultiPolygon, { id: string; iso: string }>;
type PhysProps = { id: string; kind: "desert" | "mountain" | "plain"; label: string };

const fc = geojson as unknown as FeatureCollection<Polygon | MultiPolygon, { id: string; iso: string }>;
const land = context.land as unknown as FeatureCollection<Geometry>;
const physical = context.physical as unknown as FeatureCollection<Polygon | MultiPolygon, PhysProps>;

export interface MapRegionShape {
  id: string;
  d: string;
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
  seat: [number, number] | null;
}

export interface PhysShape {
  id: string;
  kind: PhysProps["kind"];
  label: string;
  d: string;
  labelAt: [number, number];
}

export interface AtlasData {
  width: number;
  height: number;
  regions: MapRegionShape[];
  land: string;
  physical: PhysShape[];
  seas: Array<{ label: string; at: [number, number]; angle: number }>;
  peaks: Array<{ label: string; elevation: number; at: [number, number] }>;
  graticule: string;
  /** حدود المملكة على اللوحة، لقصّ خرائط الموقع المصغرة */
  ksaBox: [number, number, number, number];
}

export const MAP_W = 1200;
export const MAP_H = 940;

const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (p: [number, number] | null | undefined): [number, number] | null => (p ? [r1(p[0]), r1(p[1])] : null);

/** موضع تسمية المعلم: مركز أكبر مضلع فيه، لأن بعض المعالم متعددة الأجزاء */
function labelPoint(f: Feature<Polygon | MultiPolygon>, projection: GeoProjection): [number, number] {
  if (f.geometry.type === "MultiPolygon") {
    let best = f.geometry.coordinates[0];
    let bestArea = 0;
    for (const poly of f.geometry.coordinates) {
      const b = geoBounds({ type: "Polygon", coordinates: poly });
      const area = (b[1][0] - b[0][0]) * (b[1][1] - b[0][1]);
      if (area > bestArea) { bestArea = area; best = poly; }
    }
    return pt(projection(geoCentroid({ type: "Polygon", coordinates: best }) as [number, number]))!;
  }
  return pt(projection(geoCentroid(f) as [number, number]))!;
}

let atlasCache: AtlasData | null = null;

/** الأطلس الكامل: يُحسب على الخادم وقت البناء، فيصل إلى المتصفح SVG جاهز */
export function getAtlas(): AtlasData {
  if (atlasCache) return atlasCache;
  const W = MAP_W, H = MAP_H;
  const projection = geoMercator()
    // تُزاح المملكة إلى يسار اللوحة لتتسع البداية (اليمين) لعنوان الصفحة ولوحة الملخص
    .fitExtent([[40, 60], [W - 400, H - 50]], fc)
    .clipExtent([[-400, -400], [W + 400, H + 400]]);
  const path = geoPath(projection).digits(1);

  const shapes: MapRegionShape[] = fc.features.map((f: RegionFeature) => {
    const region = regions.find((r) => r.id === f.properties.id);
    const b = path.bounds(f);
    return {
      id: f.properties.id,
      d: path(f) ?? "",
      bounds: [[r1(b[0][0]), r1(b[0][1])], [r1(b[1][0]), r1(b[1][1])]],
      centroid: pt(path.centroid(f) as [number, number])!,
      seat: pt(region?.seat ? (projection(region.seat) as [number, number]) : null),
    };
  });

  const seaAngle = (a: [number, number], b: [number, number]) => {
    const p = projection(a)!, q = projection(b)!;
    return r1((Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI);
  };

  atlasCache = {
    width: W,
    height: H,
    regions: shapes,
    land: path(land) ?? "",
    physical: physical.features.map((f) => ({
      id: f.properties.id,
      kind: f.properties.kind,
      label: f.properties.label,
      d: path(f) ?? "",
      labelAt: labelPoint(f, projection),
    })),
    seas: (context.seas as Array<{ label: string; at: [number, number] }>).map((s) => ({
      label: s.label,
      at: pt(projection(s.at) as [number, number])!,
      // اتجاه الكتابة يتبع محور البحر
      angle: s.label === "البحر الأحمر" ? seaAngle([42.5, 15], [35, 27.5]) : seaAngle([56, 25.6], [48.5, 29.2]),
    })),
    peaks: (context.peaks as Array<{ label: string; elevation: number; at: [number, number] }>).map((p) => ({
      label: p.label,
      elevation: p.elevation,
      at: pt(projection(p.at) as [number, number])!,
    })),
    ksaBox: (() => {
      const xs = shapes.flatMap((s) => [s.bounds[0][0], s.bounds[1][0]]);
      const ys = shapes.flatMap((s) => [s.bounds[0][1], s.bounds[1][1]]);
      const x0 = Math.min(...xs), y0 = Math.min(...ys);
      return [r1(x0), r1(y0), r1(Math.max(...xs) - x0), r1(Math.max(...ys) - y0)] as [number, number, number, number];
    })(),
    graticule: path(geoGraticule().step([5, 5]).extent([[20, 0], [70, 45]])()) ?? "",
  };
  return atlasCache;
}

/** خريطة المنطقة المنفردة (للبطاقات ورأس الصفحة) مع المعالم الطبيعية المقصوصة عليها */
export interface RegionPlate {
  id: string;
  size: number;
  d: string;
  physical: Array<{ id: string; kind: PhysProps["kind"]; d: string }>;
  seat: [number, number] | null;
}

const plateCache = new Map<string, RegionPlate>();

export function getRegionPlate(id: string, size = 400, pad = 0.08): RegionPlate {
  const key = `${id}-${size}-${pad}`;
  const cached = plateCache.get(key);
  if (cached) return cached;
  const f = fc.features.find((x) => x.properties.id === id);
  if (!f) throw new Error(`Unknown region ${id}`);
  const m = size * pad;
  const projection = geoMercator()
    .fitExtent([[m, m], [size - m, size - m]], f)
    .clipExtent([[-20, -20], [size + 20, size + 20]]);
  const path = geoPath(projection).digits(size >= 500 ? 1 : 0);
  const region = regions.find((r) => r.id === id);
  // المعالم التي يتقاطع نطاقها مع نطاق المنطقة فقط
  const [[rx0, ry0], [rx1, ry1]] = geoBounds(f);
  const overlaps = (p: Feature<Polygon | MultiPolygon>) => {
    const [[px0, py0], [px1, py1]] = geoBounds(p);
    return px0 <= rx1 && px1 >= rx0 && py0 <= ry1 && py1 >= ry0;
  };
  const plate: RegionPlate = {
    id,
    size,
    d: path(f) ?? "",
    physical: physical.features
      .filter(overlaps)
      .map((p) => ({ id: p.properties.id, kind: p.properties.kind, d: path(p) ?? "" }))
      .filter((p) => p.d.length > 0),
    seat: pt(region?.seat ? (projection(region.seat) as [number, number]) : null),
  };
  plateCache.set(key, plate);
  return plate;
}

/** للتوافق مع خريطة الموقع المصغرة */
export function getMapShapes(): MapRegionShape[] {
  return getAtlas().regions;
}

/** خريطة المنطقة التفاعلية: المنطقة وجيرانها والسياق، ونقاط الأماكن مُسقطة على اللوحة */
export interface RegionMapData {
  id: string;
  width: number;
  height: number;
  region: string;
  neighbors: Array<{ id: string; d: string }>;
  land: string;
  physical: Array<{ id: string; kind: PhysProps["kind"]; d: string }>;
  seat: [number, number] | null;
  markers: Array<{ nameAr: string; x: number; y: number; category: string; descAr: string; url: string | null }>;
}

export function getRegionMap(id: string, markers: Array<{ nameAr: string; lat: number; lon: number; category: string; descAr: string; url: string | null }>): RegionMapData {
  const W = 1000, H = 720;
  const f = fc.features.find((x) => x.properties.id === id)!;
  const projection = geoMercator()
    .fitExtent([[70, 60], [W - 70, H - 60]], f)
    .clipExtent([[-60, -60], [W + 60, H + 60]]);
  const path = geoPath(projection).digits(1);
  const region = regions.find((r) => r.id === id);
  const seat = region?.seat ? projection(region.seat) : null;
  return {
    id,
    width: W,
    height: H,
    region: path(f) ?? "",
    neighbors: fc.features
      .filter((x) => x.properties.id !== id)
      .map((x) => ({ id: x.properties.id, d: path(x) ?? "" }))
      .filter((x) => x.d.length > 0),
    land: path(land) ?? "",
    physical: physical.features.map((p) => ({ id: p.properties.id, kind: p.properties.kind, d: path(p) ?? "" })).filter((p) => p.d.length > 0),
    seat: seat ? [r1(seat[0]), r1(seat[1])] : null,
    markers: markers.map((m) => {
      const p = projection([m.lon, m.lat])!;
      return { nameAr: m.nameAr, x: r1(p[0]), y: r1(p[1]), category: m.category, descAr: m.descAr, url: m.url };
    }),
  };
}
