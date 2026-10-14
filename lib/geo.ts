import "server-only";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import geojson from "@/data/geo/sa-regions.geojson.json";
import { regions } from "./data";

export interface MapRegionShape {
  id: string;
  d: string;
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
  seat: [number, number] | null;
}

export const MAP_W = 900;
export const MAP_H = 760;

const fc = geojson as unknown as FeatureCollection<Geometry, { id: string; iso: string }>;

let cache: MapRegionShape[] | null = null;

/** تُحسب المسارات على الخادم وقت البناء، فيصل إلى المتصفح SVG جاهز دون مكتبة خرائط ثقيلة */
export function getMapShapes(): MapRegionShape[] {
  if (cache) return cache;
  const projection = geoMercator().fitExtent([[24, 24], [MAP_W - 24, MAP_H - 24]], fc);
  const path = geoPath(projection);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  cache = fc.features.map((f: Feature<Geometry, { id: string; iso: string }>) => {
    const region = regions.find((r) => r.id === f.properties.id);
    const seat = region?.seat ? projection(region.seat) : null;
    const b = path.bounds(f);
    const c = path.centroid(f);
    return {
      id: f.properties.id,
      d: path.digits(1)(f) ?? "",
      bounds: [[r1(b[0][0]), r1(b[0][1])], [r1(b[1][0]), r1(b[1][1])]],
      centroid: [r1(c[0]), r1(c[1])],
      seat: seat ? [r1(seat[0]), r1(seat[1])] : null,
    };
  });
  return cache;
}
