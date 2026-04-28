import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface POI {
    id: number | string;
    lat: number;
    lon: number;
    name: string;
}

interface Amenity {
    id: string;
    lat: number;
    lon: number;
    name: string;
    type: 'fuel' | 'hotel' | 'cafe' | 'bus_stop';
}

const INDIA_BOUNDS: L.LatLngBoundsExpression = [[4.0, 63.0], [38.0, 102.0]];
const GEOAPIFY_KEY = 'c2a58f61537f4adb85184ca7a6f01b6e';

const toGeoapifyMode = (transportMode: string): string => {
    if (transportMode === 'walk')    return 'walk';
    if (transportMode === 'bicycle') return 'bicycle';
    return 'drive';
};

const isFlightMode = (m: string) => /plane|flight/i.test(m);
const isBusOnlyMode = (m: string) => /^bus$/i.test(m.trim());
const isCarMode     = (m: string) => !isFlightMode(m) && !isBusOnlyMode(m);

const getIcon = (color: string, label?: string) =>
    new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color:${color};width:22px;height:22px;border-radius:50%;
            border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
            font-size:10px;color:white;font-weight:700;
        ">${label ?? ''}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

const getAmenityIcon = (emoji: string) =>
    new L.DivIcon({
        className: '',
        html: `<div style="font-size:17px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));cursor:pointer;">${emoji}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
        } else {
            map.setView([20.5937, 78.9629], 5);
        }
    }, [bounds, map]);
    return null;
};

const InvalidateSize = ({ trigger }: { trigger: number }) => {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 150);
        return () => clearTimeout(t);
    }, [trigger, map]);
    return null;
};

// Geoapify Routing API — returns actual road geometry for all waypoints
const fetchFullRoute = async (waypoints: [number, number][], mode = 'drive'): Promise<[number, number][]> => {
    if (waypoints.length < 2) return waypoints;
    try {
        const waypointStr = waypoints.map(([lat, lon]) => `${lat},${lon}`).join('|');
        const url = `https://api.geoapify.com/v1/routing?waypoints=${encodeURIComponent(waypointStr)}&mode=${mode}&apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        const data = await res.json();
        const geom = data.features?.[0]?.geometry;
        if (!geom) return waypoints;
        // GeoJSON uses [lon, lat] — swap to [lat, lon] for Leaflet
        if (geom.type === 'MultiLineString') {
            return (geom.coordinates as [number, number][][])
                .flat()
                .map(([lon, lat]) => [lat, lon] as [number, number]);
        }
        if (geom.type === 'LineString') {
            return (geom.coordinates as [number, number][])
                .map(([lon, lat]) => [lat, lon] as [number, number]);
        }
    } catch { /* fall through to straight-line fallback */ }
    return waypoints;
};

// Pick N evenly-spaced points; if the geometry is very sparse, linearly interpolate
// extra points so sampling covers the whole route even with minimal coordinate arrays.
const buildSamplePoints = (routePoints: [number, number][], targetCount: number): [number, number][] => {
    if (routePoints.length === 0) return [];

    // If Geoapify returned very few points (e.g. 2–3 for a straight line), interpolate
    let pts = routePoints;
    if (pts.length < targetCount) {
        const dense: [number, number][] = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const [la, lo] = pts[i];
            const [lb, lob] = pts[i + 1];
            const steps = Math.ceil(targetCount / pts.length);
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                dense.push([la + (lb - la) * t, lo + (lob - lo) * t]);
            }
        }
        pts = dense;
    }

    const step = Math.max(1, Math.floor(pts.length / targetCount));
    const sampled: [number, number][] = [];
    for (let i = 0; i < pts.length; i += step) sampled.push(pts[i]);
    const last = pts[pts.length - 1];
    if (sampled[sampled.length - 1] !== last) sampled.push(last);
    return sampled;
};

const overpassFetch = async (query: string): Promise<any> => {
    const body = 'data=' + encodeURIComponent(query);
    const mirrors = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
    ];
    for (const url of mirrors) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
                signal: AbortSignal.timeout(25000),
            });
            if (res.ok) return await res.json();
        } catch { /* try next mirror */ }
    }
    return { elements: [] };
};

const fetchFuelViaOverpass = async (samplePts: [number, number][]): Promise<Amenity[]> => {
    const coords = samplePts.flatMap(([lat, lon]) => [lat, lon]).join(',');
    const query = `[out:json][timeout:25];
(
  node["amenity"="fuel"](around:6000,${coords});
);
out 200;`;
    try {
        const data = await overpassFetch(query);
        const seen = new Set<number>();
        return (data.elements ?? [])
            .filter((el: any) => { if (seen.has(el.id)) return false; seen.add(el.id); return true; })
            .map((el: any): Amenity => ({
                id: String(el.id),
                lat: el.lat,
                lon: el.lon,
                name: el.tags?.name || el.tags?.brand || 'Petrol Pump',
                type: 'fuel',
            }));
    } catch {
        return [];
    }
};

const fetchBusStopsViaOverpass = async (samplePts: [number, number][]): Promise<Amenity[]> => {
    const coords = samplePts.flatMap(([lat, lon]) => [lat, lon]).join(',');
    const query = `[out:json][timeout:25];
(
  node["highway"="bus_stop"](around:5000,${coords});
  node["amenity"="bus_station"](around:5000,${coords});
);
out 80;`;
    try {
        const data = await overpassFetch(query);
        const seen = new Set<number>();
        return (data.elements ?? [])
            .filter((el: any) => { if (seen.has(el.id)) return false; seen.add(el.id); return true; })
            .map((el: any): Amenity => ({
                id: String(el.id),
                lat: el.lat,
                lon: el.lon,
                name: el.tags?.name || el.tags?.['name:en'] || 'Bus Stop',
                type: 'bus_stop',
            }));
    } catch {
        return [];
    }
};

const geoapifyQuery = (categories: string, lon: number, lat: number, radiusM: number, limit: number) =>
    fetch(
        `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radiusM}&limit=${limit}&apiKey=${GEOAPIFY_KEY}`,
        { signal: AbortSignal.timeout(10000) }
    )
        .then(r => r.json())
        .catch(() => ({ features: [] }));

// For car/cab: petrol pumps (Overpass) + cafes/hotels (Geoapify).
// For bus: bus stops (Overpass).
const fetchAmenitiesNearRoute = async (routePoints: [number, number][], transportMode: string): Promise<Amenity[]> => {
    if (routePoints.length === 0) return [];

    if (isBusOnlyMode(transportMode)) {
        const samples = buildSamplePoints(routePoints, Math.min(30, Math.max(10, routePoints.length)));
        const stops = await fetchBusStopsViaOverpass(samples);
        return stops.slice(0, 80);
    }

    // Car / cab / hybrid modes — fuel + cafes
    const fuelSamples  = buildSamplePoints(routePoints, Math.min(35, Math.max(12, routePoints.length)));
    const otherSamples = buildSamplePoints(routePoints, 12);

    const [fuelResults, otherResponses] = await Promise.all([
        fetchFuelViaOverpass(fuelSamples),
        Promise.all(otherSamples.map(([lat, lon]) =>
            geoapifyQuery('catering.cafe,catering.restaurant,accommodation.hotel', lon, lat, 3000, 10)
        )),
    ]);

    const seen = new Set<string>();
    const results: Amenity[] = [...fuelResults.map(f => { seen.add(f.id); return f; })];

    for (const response of otherResponses) {
        for (const feature of (response.features ?? [])) {
            const placeId: string = feature.properties?.place_id ?? String(Math.random());
            if (seen.has(placeId)) continue;
            seen.add(placeId);

            const cats: string[] = feature.properties?.categories ?? [];
            const [lon, lat] = feature.geometry?.coordinates ?? [0, 0];

            let type: Amenity['type'] | null = null;
            if (cats.some((c: string) => c.includes('hotel') || c.includes('accommodation'))) type = 'hotel';
            else if (cats.some((c: string) => c.includes('cafe') || c.includes('restaurant') || c.includes('catering'))) type = 'cafe';
            if (!type) continue;

            results.push({
                id: placeId, lat, lon,
                name: feature.properties?.name || feature.properties?.address_line1 || (type === 'hotel' ? 'Hotel' : 'Café'),
                type,
            });
        }
    }

    const fuel   = results.filter(a => a.type === 'fuel').slice(0, 100);
    const hotels = results.filter(a => a.type === 'hotel').slice(0, 15);
    const cafes  = results.filter(a => a.type === 'cafe').slice(0, 20);
    return [...fuel, ...hotels, ...cafes];
};

interface Props {
    origin: string;
    destination: string;
    days: any[];
    transportMode?: string;
    fetchAmenities?: boolean;
    sizeVersion?: number;
}

const AMENITY_META: Record<Amenity['type'], { emoji: string; label: string }> = {
    fuel:     { emoji: '⛽', label: 'Petrol Pump' },
    hotel:    { emoji: '🏨', label: 'Hotel' },
    cafe:     { emoji: '☕', label: 'Café / Restaurant' },
    bus_stop: { emoji: '🚌', label: 'Bus Stop' },
};

const InteractiveJourneyMap = ({
    origin,
    destination,
    days,
    transportMode = 'drive',
    fetchAmenities = false,
    sizeVersion = 0,
}: Props) => {
    const [bounds, setBounds]         = useState<L.LatLngBoundsExpression | null>(null);
    const [segments, setSegments]     = useState<[number, number][][]>([]);
    const [originPt, setOriginPt]     = useState<POI | null>(null);
    const [destPt, setDestPt]         = useState<POI | null>(null);
    const [activities, setActivities] = useState<POI[]>([]);
    const [amenities, setAmenities]   = useState<Amenity[]>([]);
    const [loading, setLoading]       = useState(false);
    const [showLegend, setShowLegend] = useState(true);

    const daysKey = useRef('');

    useEffect(() => {
        if (!destination) return;
        const thisKey = `${origin}|${destination}|${days?.length ?? 0}|${transportMode}|${fetchAmenities}`;
        if (thisKey === daysKey.current) return;
        daysKey.current = thisKey;

        const run = async () => {
            setLoading(true);
            try {
                const queries = [
                    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)},India&format=json&limit=1`),
                ];
                if (origin) {
                    queries.unshift(
                        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origin)},India&format=json&limit=1`)
                    );
                }
                const results = await Promise.all(queries);
                const jsons   = await Promise.all(results.map(r => r.json()));

                let oLat: number | undefined, oLon: number | undefined;
                let dLat: number | undefined, dLon: number | undefined;

                if (origin) {
                    const od = jsons[0]; const dd = jsons[1];
                    if (od?.length) { oLat = parseFloat(od[0].lat); oLon = parseFloat(od[0].lon); }
                    if (dd?.length) { dLat = parseFloat(dd[0].lat); dLon = parseFloat(dd[0].lon); }
                } else {
                    const dd = jsons[0];
                    if (dd?.length) { dLat = parseFloat(dd[0].lat); dLon = parseFloat(dd[0].lon); }
                }

                if (dLat == null || dLon == null) return;

                setDestPt({ id: 'dest', lat: dLat, lon: dLon, name: destination });
                if (oLat != null && oLon != null) {
                    setOriginPt({ id: 'origin', lat: oLat, lon: oLon, name: origin });
                }

                const acts: POI[] = [];
                days?.forEach(day => {
                    day.events?.forEach((ev: any) => {
                        if (ev.lat && ev.lon) {
                            acts.push({ id: ev.id, lat: parseFloat(ev.lat), lon: parseFloat(ev.lon), name: ev.title });
                        }
                    });
                });
                setActivities(acts);

                // All coords for map bounds (origin + activities + destination)
                const allCoords: [number, number][] = [];
                if (oLat != null && oLon != null) allCoords.push([oLat, oLon]);
                acts.forEach(a => allCoords.push([a.lat, a.lon]));
                allCoords.push([dLat, dLon]);

                // Route line uses only origin → destination (2 pts) so Geoapify never
                // hits waypoint limits and always returns proper road geometry.
                const routeEndpoints: [number, number][] = [];
                if (oLat != null && oLon != null) routeEndpoints.push([oLat, oLon]);
                routeEndpoints.push([dLat, dLon]);

                let routePoints: [number, number][];
                if (isFlightMode(transportMode)) {
                    // For flights draw a straight dashed line — no road routing
                    routePoints = routeEndpoints;
                } else {
                    const geoMode = toGeoapifyMode(transportMode);
                    routePoints = routeEndpoints.length >= 2
                        ? await fetchFullRoute(routeEndpoints, geoMode)
                        : routeEndpoints;
                }

                // Amenities are only relevant for ground transport (car/cab/bus), not flights
                const nearbyAmenities = fetchAmenities && !isFlightMode(transportMode)
                    ? await fetchAmenitiesNearRoute(routePoints, transportMode)
                    : [];

                setSegments([routePoints]);
                setAmenities(nearbyAmenities);
                setBounds(allCoords.length > 1 ? allCoords : [[dLat - 0.5, dLon - 0.5], [dLat + 0.5, dLon + 0.5]]);
            } catch (err) {
                console.error('Map pipeline failed', err);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [origin, destination, days, transportMode, fetchAmenities]);

    const hasFuel     = amenities.some(a => a.type === 'fuel');
    const hasHotels   = amenities.some(a => a.type === 'hotel');
    const hasCafes    = amenities.some(a => a.type === 'cafe');
    const hasBusStops = amenities.some(a => a.type === 'bus_stop');

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'inherit',
                }}>
                    <p style={{ fontWeight: 600, color: '#334155' }}>Loading route…</p>
                </div>
            )}

            {fetchAmenities && (amenities.length > 0 || hasBusStops) && showLegend && (
                <div style={{
                    position: 'absolute', bottom: '24px', left: '12px', zIndex: 1000,
                    background: 'rgba(255,255,255,0.95)', borderRadius: '12px',
                    padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    fontSize: '12px', lineHeight: '1.8',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Along Route</strong>
                        <button onClick={() => setShowLegend(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '14px', lineHeight: 1, padding: '0 0 0 8px' }}>×</button>
                    </div>
                    {isBusOnlyMode(transportMode)
                        ? <div>🚌 Bus Stops</div>
                        : <>
                            {hasFuel   && <div>⛽ Petrol Pumps</div>}
                            {hasHotels && <div>🏨 Hotels</div>}
                            {hasCafes  && <div>☕ Cafés &amp; Restaurants</div>}
                          </>
                    }
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', borderTop: '1px solid #F1F5F9', paddingTop: '4px' }}>
                        <div style={{ width: '20px', height: '3px', background: '#6366f1', borderRadius: '2px' }}></div>
                        <span>Route</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                minZoom={4}
                maxZoom={18}
                maxBounds={INDIA_BOUNDS}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap &copy; CARTO"
                />
                <FitBounds bounds={bounds} />
                <InvalidateSize trigger={sizeVersion} />

                {segments.map((seg, i) =>
                    isFlightMode(transportMode) ? (
                        <Polyline key={i} positions={seg} color="#6366f1" weight={3} opacity={0.8} dashArray="10 8" />
                    ) : (
                        <Polyline key={i} positions={seg} color="#6366f1" weight={4} opacity={0.85} />
                    )
                )}

                {originPt && (
                    <Marker position={[originPt.lat, originPt.lon]} icon={getIcon('#e11d48', 'A')}>
                        <Popup><strong>Start: {originPt.name}</strong></Popup>
                    </Marker>
                )}

                {activities.map((act, i) => (
                    <Marker key={act.id} position={[act.lat, act.lon]} icon={getIcon('#a855f7', String(i + 1))}>
                        <Popup><strong>{act.name}</strong></Popup>
                    </Marker>
                ))}

                {destPt && (
                    <Marker position={[destPt.lat, destPt.lon]} icon={getIcon('#10b981', 'B')}>
                        <Popup><strong>Destination: {destPt.name}</strong></Popup>
                    </Marker>
                )}

                {amenities.map(a => (
                    <Marker key={a.id} position={[a.lat, a.lon]} icon={getAmenityIcon(AMENITY_META[a.type].emoji)}>
                        <Popup>
                            <strong>{a.name}</strong><br />
                            <span style={{ fontSize: '12px', color: '#64748B' }}>{AMENITY_META[a.type].label}</span>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default InteractiveJourneyMap;
