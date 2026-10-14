export type SourceId = string;

export interface Source {
  title: string;
  publisher: string;
  url: string;
  secondaryUrl?: string;
  secondaryNote?: string;
  refYear?: string;
  note?: string;
  verified: string;
}

export type ItemFlag = "status-pending" | "climate-normals-pending";

export interface SectionItem {
  text: string;
  sources: SourceId[];
  flag?: ItemFlag;
}

export interface RegionSection {
  key: string;
  title: string;
  items: SectionItem[];
}

export interface University {
  nameAr: string;
  url: string;
  type: string;
}

export interface Region {
  id: string;
  nameAr: string;
  shortAr: string;
  nameEn: string;
  seatAr: string;
  seat: [number, number] | null;
  seatSource?: string;
  accent: string;
  population: { value: number; source: SourceId };
  areaKm2: { value: number; approx: boolean; source: SourceId };
  governorates: { count: number | null; names: string[]; namesNote?: string; source: SourceId };
  detailLevel: "full" | "basic";
  lead: string | null;
  sections: RegionSection[];
}

export interface Place {
  nameAr: string;
  descAr: string;
  url: string | null;
}

export interface RegionGuide {
  article: string;
  visitSaudi: string | null;
  extraLinks?: Array<{ label: string; url: string }>;
  places: Place[];
}

export interface FolkArt {
  id: string;
  nameAr: string;
  descAr: string;
  regions: string[];
  areaAr: string | null;
  unesco?: boolean;
  sourceUrl: string;
}

export interface GovUniversity {
  nameAr: string;
  region: string;
  cityAr: string;
  url: string;
  note?: string;
}

export interface ReligiousSite {
  nameAr: string;
  descAr: string;
  url: string;
  kind: string;
}

export interface ReligiousCity {
  title: string;
  intro: string;
  introSource: string;
  sites: ReligiousSite[];
  facts: Array<{ textAr: string; source: string; url: string }>;
}

export interface WorldHeritageSite {
  id: string;
  nameAr: string;
  nameEn: string;
  year: number;
  category: "ثقافي" | "طبيعي";
  region: string | null;
  alsoRegion?: string;
  regionNote: string | null;
  url: string;
  source: SourceId;
}

export interface IntangibleElement {
  id: string;
  nameAr: string;
  nameEn: string;
  year: number;
  areaNote: string | null;
  regions: string[];
}

export interface Indicator {
  id: string;
  label: string;
  value: string;
  detail: string;
  status: "verified" | "pending";
  sources: SourceId[];
  href?: string;
}
