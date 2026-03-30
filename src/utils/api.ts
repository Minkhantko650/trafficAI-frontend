import { Incident, IncidentType, Severity } from '../data/mockData';

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// --- Mapping helpers ---

function mapType(backendType: string): IncidentType {
  const map: Record<string, IncidentType> = {
    accident: 'accident',
    construction: 'construction',
    road_blockage: 'accident',
    event_congestion: 'congestion',
    high_traffic_demand: 'congestion',
    weather_disruption: 'flood',
  };
  return map[backendType] ?? 'congestion';
}

function mapSeverity(backendSeverity: string): Severity {
  const map: Record<string, Severity> = {
    low: 'minor',
    medium: 'moderate',
    high: 'major',
    critical: 'critical',
  };
  return map[backendSeverity] ?? 'minor';
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

interface BackendIncident {
  id: number;
  type: string;
  severity: string;
  location: string;
  location_en?: string;
  description: string;
  estimated_clearance?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

function mapIncident(b: BackendIncident): Incident {
  return {
    id: String(b.id),
    type: mapType(b.type),
    severity: mapSeverity(b.severity),
    location: {
      en: b.location_en ?? b.location,
      th: b.location,
    },
    description: {
      en: b.description,
      th: b.description,
    },
    lat: b.latitude ?? 13.7563,
    lng: b.longitude ?? 100.5018,
    clearanceTime: b.estimated_clearance ?? 'Unknown',
    timestamp: relativeTime(b.created_at),
  };
}

// --- Road (flow_sync /roads/ endpoint) → Incident ---

interface BackendRoad {
  name: string;       // e.g. "Sukhumvit Road"
  lat: number;
  lng: number;
  current_speed: number;
  free_flow_speed: number;
  congestion: string; // "flowing freely" | "slightly congested" | etc.
  road_closure: boolean;
}

function congestionToSeverity(congestion: string, roadClosure: boolean): Severity {
  if (roadClosure) return 'critical';
  if (congestion === 'severely congested') return 'critical';
  if (congestion === 'moderately congested') return 'major';
  if (congestion === 'slightly congested') return 'moderate';
  return 'minor'; // flowing freely / unknown
}

function mapRoadToIncident(r: BackendRoad, index: number): Incident {
  const isClosed = r.road_closure;
  const type: IncidentType = isClosed ? 'accident' : 'congestion';
  const hasFlow = r.current_speed > 0 && r.free_flow_speed > 0;
  const desc = isClosed
    ? `Road closure on ${r.name}.`
    : hasFlow
      ? `Traffic at ${r.current_speed} km/h (normal ${r.free_flow_speed} km/h) — ${r.congestion}.`
      : `Live data pending for ${r.name}.`;

  return {
    id: `road-${index}`,
    type,
    severity: congestionToSeverity(r.congestion, isClosed),
    location: { en: r.name, th: r.name },
    description: { en: desc, th: desc },
    lat: r.lat,
    lng: r.lng,
    clearanceTime: 'Live',
    timestamp: 'Live',
  };
}

// --- Prediction zone (flow_sync) → Incident (kept for backwards compat) ---

interface PredictionZone {
  name: string;
  lat: number;
  lng: number;
  level: string;   // "low" | "moderate" | "high" | "critical"
  current_speed: number;
  free_flow_speed: number;
  road_closure: boolean;
}

function flowLevelToSeverity(level: string): Severity {
  const map: Record<string, Severity> = {
    low: 'minor',
    moderate: 'moderate',
    high: 'major',
    critical: 'critical',
  };
  return map[level] ?? 'minor';
}

function mapPredictionZone(z: PredictionZone, index: number): Incident {
  const isClosed = z.road_closure;
  const type: IncidentType = isClosed ? 'accident' : 'congestion';
  const desc = isClosed
    ? `Road closure on ${z.name}.`
    : `Traffic moving at ${z.current_speed} km/h (normal ${z.free_flow_speed} km/h).`;

  return {
    id: `flow-${index}`,
    type,
    severity: flowLevelToSeverity(z.level),
    location: { en: z.name, th: z.name },
    description: { en: desc, th: desc },
    lat: z.lat,
    lng: z.lng,
    clearanceTime: 'Live',
    timestamp: 'Live',
  };
}

// --- Public fetch functions ---

export async function fetchIncidents(): Promise<Incident[]> {
  const results: Incident[] = [];

  // Fetch real incidents (accidents, construction, road blockages)
  try {
    const res = await fetch(`${API_BASE}/incidents/?status=active`);
    if (res.ok) {
      const data: BackendIncident[] = await res.json();
      results.push(...data.filter((i) => i.latitude && i.longitude).map(mapIncident));
    }
  } catch (e) {
    console.warn('[api] /incidents/ failed:', e);
  }

  // Fetch all 25 Bangkok roads from flow_sync cache (shows every road as a dot)
  try {
    const res = await fetch(`${API_BASE}/roads/`);
    if (res.ok) {
      const { roads }: { roads: BackendRoad[] } = await res.json();
      console.log('[api] roads:', roads.length, roads.map(r => `${r.name}:${r.congestion}`));
      results.push(...roads.map(mapRoadToIncident));
    } else {
      // Fallback: use prediction endpoint if /roads/ isn't ready yet
      const predRes = await fetch(`${API_BASE}/prediction/`);
      if (predRes.ok) {
        const { zones }: { zones: PredictionZone[] } = await predRes.json();
        results.push(...zones.map(mapPredictionZone));
      }
    }
  } catch (e) {
    console.warn('[api] /roads/ failed:', e);
  }

  return results;
}

export interface QueryResult {
  answer: string;
  intent?: string;
  used_live_data: boolean;
  focus_lat?: number;
  focus_lng?: number;
  route_points?: [number, number][];
  route_summary?: { travel_time_mins: number; length_km: number; traffic_delay_mins: number };
  suggested_roads?: string[];
}

export async function getRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  destName = ''
): Promise<{ route_points: [number, number][]; summary: { travel_time_mins: number; length_km: number; traffic_delay_mins: number } } | null> {
  try {
    const res = await fetch(
      `${API_BASE}/route/?from_lat=${fromLat}&from_lon=${fromLng}&to_lat=${toLat}&to_lon=${toLng}&dest_name=${encodeURIComponent(destName)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.points || data.points.length === 0) return null;
    return { route_points: data.points, summary: data.summary };
  } catch {
    return null;
  }
}

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

export async function geocodePlace(name: string): Promise<{ lat: number; lng: number } | null> {
  const queries = [`${name} Bangkok`, `${name} Bangkok Thailand`, name];
  for (const q of queries) {
    try {
      // Fuzzy search
      const r = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(q)}.json?key=${TOMTOM_KEY}&limit=1&countrySet=TH&lat=13.7563&lon=100.5018&radius=50000`
      );
      if (r.ok) {
        const results = (await r.json()).results ?? [];
        if (results.length > 0) {
          const pos = results[0].position;
          return { lat: pos.lat, lng: pos.lon };
        }
      }
    } catch { /* continue */ }
  }
  // POI search fallback
  try {
    const r = await fetch(
      `https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(name)}.json?key=${TOMTOM_KEY}&limit=1&countrySet=TH&lat=13.7563&lon=100.5018&radius=50000`
    );
    if (r.ok) {
      const results = (await r.json()).results ?? [];
      if (results.length > 0) {
        const pos = results[0].position;
        return { lat: pos.lat, lng: pos.lon };
      }
    }
  } catch { /* ignore */ }
  return null;
}

export async function sendQuery(
  question: string,
  language: string,
  userCoords?: { lat: number; lng: number }
): Promise<QueryResult> {
  let url = `${API_BASE}/query/`;
  if (userCoords) {
    url += `?lat=${userCoords.lat}&lon=${userCoords.lng}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, language }),
  });
  if (!res.ok) throw new Error('Failed to query backend');
  return res.json();
}
