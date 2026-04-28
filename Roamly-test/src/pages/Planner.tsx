import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InteractiveJourneyMap from '../components/InteractiveJourneyMap';
import { saveTrip, savePlanData, getPlanData, getTrips, saveChecklist, getChecklist } from '../services/tripStorage';
import { useToast } from '../context/ToastContext';

const SAFETY_DATA: Record<string, { score: number; label: string }> = {
    'jaipur': { score: 89, label: 'Very Safe' }, 'goa': { score: 85, label: 'Safe' },
    'north goa': { score: 85, label: 'Safe' }, 'south goa': { score: 88, label: 'Safe' },
    'kerala': { score: 92, label: 'Very Safe' }, 'manali': { score: 90, label: 'Very Safe' },
    'udaipur': { score: 91, label: 'Very Safe' }, 'varanasi': { score: 84, label: 'Moderate' },
    'mumbai': { score: 84, label: 'Moderate' }, 'delhi': { score: 80, label: 'Moderate' },
    'shimla': { score: 92, label: 'Very Safe' }, 'rishikesh': { score: 88, label: 'Safe' },
    'darjeeling': { score: 88, label: 'Safe' }, 'agra': { score: 85, label: 'Safe' },
    'coorg': { score: 92, label: 'Very Safe' }, 'ooty': { score: 91, label: 'Very Safe' },
    'jodhpur': { score: 87, label: 'Safe' }, 'jaisalmer': { score: 86, label: 'Safe' },
    'leh': { score: 87, label: 'Safe' }, 'leh ladakh': { score: 87, label: 'Safe' },
    'kolkata': { score: 85, label: 'Safe' }, 'hyderabad': { score: 87, label: 'Safe' },
    'bangalore': { score: 83, label: 'Moderate' }, 'bengaluru': { score: 83, label: 'Moderate' },
};

const HIGHLIGHTS_DATA: Record<string, string[]> = {
    'jaipur': ['Forts', 'Palaces', 'Bazaars', 'Street Food'],
    'goa': ['Beaches', 'Nightlife', 'Churches', 'Seafood'],
    'north goa': ['Beaches', 'Nightlife', 'Water Sports', 'Shacks'],
    'kerala': ['Backwaters', 'Houseboats', 'Ayurveda', 'Tea Gardens'],
    'manali': ['Snow', 'Trekking', 'Temples', 'Adventure Sports'],
    'udaipur': ['Lakes', 'Palaces', 'Boat Rides', 'Sunsets'],
    'varanasi': ['Ghats', 'Ganga Aarti', 'Temples', 'Silk Sarees'],
    'rishikesh': ['Yoga', 'River Rafting', 'Cafes', 'Ashrams'],
    'darjeeling': ['Tea Estates', 'Toy Train', 'Tiger Hill', 'Views'],
    'agra': ['Taj Mahal', 'Agra Fort', 'Petha', 'Sunrise Views'],
    'shimla': ['Mall Road', 'Toy Train', 'Colonial Charm', 'Snow'],
    'coorg': ['Coffee', 'Waterfalls', 'Forests', 'Homestays'],
    'ooty': ['Botanical Garden', 'Toy Train', 'Tea', 'Lakes'],
    'leh': ['Monasteries', 'Pangong Lake', 'High Passes', 'Stargazing'],
    'leh ladakh': ['Monasteries', 'Pangong Lake', 'High Passes', 'Stargazing'],
    'jodhpur': ['Mehrangarh Fort', 'Blue City', 'Bazaars', 'Desert'],
    'jaisalmer': ['Desert Safari', 'Camel Rides', 'Golden Fort', 'Camping'],
};

const WEATHER_CODES: Record<number, string> = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '❄️', 73: '❄️', 75: '❄️',
    80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WMO_DESCRIPTIONS: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Freezing fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snowfall', 75: 'Heavy snow',
    80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Hailstorm',
};

const Planner: React.FC = () => {
    const location = useLocation();
    const { showToast } = useToast();

    const [step, setStep] = useState<'form' | 'loading' | 'itinerary'>('form');

    const [formData, setFormData] = useState({
        origin: '',
        destination: location.state?.destination || '',
        travelers: '2 adults',
        transportMode: 'cab',
        startDate: '',
        endDate: '',
        budget: '',
        vibe: location.state?.vibe || '',
        group: 'solo',
        gemsMode: 'classic',
        routeOpt: 'enabled',
    });

    const [selectedVibes, setSelectedVibes] = useState<string[]>(
        location.state?.vibe ? [location.state.vibe] : []
    );

    const [planData, setPlanData] = useState<any>(null);
    const [checkedEvents, setCheckedEvents] = useState<Set<string>>(new Set());
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [mapSizeVersion, setMapSizeVersion] = useState(0);
    const [safetyInfo, setSafetyInfo] = useState<{ score: number; label: string; details: string } | null>(null);
    const [dailyWeather, setDailyWeather] = useState<Record<string, { maxTemp: number; minTemp: number; code: number; description: string; precipitation: number }>>({});
    const [localPhrases, setLocalPhrases] = useState<{ native: string; romanized: string; meaning: string; emoji: string }[]>([]);
    const [translateInput, setTranslateInput] = useState('');
    const [translateResult, setTranslateResult] = useState<{ native: string; romanized: string; language: string } | null>(null);
    const [translateLoading, setTranslateLoading] = useState(false);
    const [replanningIds, setReplanningIds] = useState<Set<string>>(new Set());
    const [budgetEstimate, setBudgetEstimate] = useState<{
        transport: number; accommodation: number; food: number;
        activities: number; miscellaneous: number; totalEstimated: number;
        assessment: 'tight' | 'comfortable' | 'generous'; tips: string[];
    } | null>(null);
    const [budgetEstimateLoading, setBudgetEstimateLoading] = useState(false);

    const toggleMapFullscreen = () => {
        setIsMapFullscreen(prev => {
            setMapSizeVersion(v => v + 1);
            return !prev;
        });
    };

    // Expense logger state
    const [expenses, setExpenses] = useState<{ desc: string; amount: number; cat: string }[]>([]);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [newExpense, setNewExpense] = useState({ desc: '', amount: 0, cat: 'Food' });

    // Load/save expenses per planId
    useEffect(() => {
        if (!planData?.planId) return;
        try {
            const raw = localStorage.getItem(`roamly_expenses_${planData.planId}`);
            if (raw) setExpenses(JSON.parse(raw));
        } catch { /* ignore */ }
    }, [planData?.planId]);

    const saveExpenses = (list: typeof expenses) => {
        if (!planData?.planId) return;
        localStorage.setItem(`roamly_expenses_${planData.planId}`, JSON.stringify(list));
    };

    const addExpense = () => {
        if (!newExpense.desc || newExpense.amount <= 0) return;
        const updated = [...expenses, { ...newExpense }];
        setExpenses(updated);
        saveExpenses(updated);
        setNewExpense({ desc: '', amount: 0, cat: 'Food' });
        setShowExpenseForm(false);
    };

    // Pre-generation map card dynamic state
    const [previewWeather, setPreviewWeather] = useState<string[]>([]);
    const [previewSafety, setPreviewSafety] = useState<{ score: number; label: string }>({ score: 0, label: 'N/A' });
    const [previewHighlights, setPreviewHighlights] = useState<string[]>(['Forts', 'Heritage', 'Local Food', 'Bazaars', '+more']);
    interface RouteOption {
        id: string; emoji: string; label: string; desc: string;
        time: string; cost: string; comfort: number; tag?: string;
        apiMode: string; geoMode: string;
    }
    const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string>('');
    const [routeKm, setRouteKm] = useState<number | null>(null);

    const haversineKm = (la1: number, lo1: number, la2: number, lo2: number): number => {
        const R = 6371, toR = Math.PI / 180;
        const dLa = (la2 - la1) * toR, dLo = (lo2 - lo1) * toR;
        const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toR) * Math.cos(la2 * toR) * Math.sin(dLo / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const fmtTime = (h: number) => {
        const hrs = Math.floor(h), mins = Math.round((h - hrs) * 60);
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };
    const fmtCost = (lo: number, hi: number) => {
        const r = (n: number) => Math.round(n / 100) * 100;
        return `₹${r(lo).toLocaleString('en-IN')}–₹${r(hi).toLocaleString('en-IN')}`;
    };

    // Real route data fetched from backend (null = not yet loaded / route not in table)
    const [realRoute, setRealRoute] = useState<{
        distanceKm: number;
        busMin: number; busMax: number;
        cabMin: number; cabMax: number;
        flightMin: number; flightMax: number;
        driveTimeH: number; busTimeH: number; flightTimeH: number;
    } | null>(null);

    const buildRouteOptions = (km: number, r: typeof realRoute): RouteOption[] => {
        const opts: RouteOption[] = [];
        const driveH = r ? r.driveTimeH : km / 55;
        const busH   = r ? r.busTimeH   : km / 42;
        const flyH   = r ? r.flightTimeH + 2.5 : km / 820 + 2.5;

        // cost helpers — prefer real data, fall back to per-km estimates
        const cabCost  = r && r.cabMin > 0  ? fmtCost(r.cabMin,    r.cabMax)    : fmtCost(km * 12, km * 18);
        const busCost  = r                  ? fmtCost(r.busMin,    r.busMax)    : fmtCost(km * 1.2, km * 4);
        const flyCost  = r && r.flightMin > 0 ? fmtCost(r.flightMin, r.flightMax) : fmtCost(3500, km > 1000 ? 12000 : 8000);
        // self-drive adds fuel + toll ≈ ₹8–₹12/km on top of rental ~₹1500/day
        const rentalKmCost = r && r.cabMin > 0 ? fmtCost(Math.round(r.cabMin * 0.65), Math.round(r.cabMax * 0.8)) : fmtCost(km * 8, km * 13);

        // ── Car / Cab ──────────────────────────────────────────
        if (km <= 1400) {
            opts.push({
                id: 'car', emoji: '🚗', label: 'Car / Cab',
                desc: 'Door-to-door, full flexibility, no fixed schedule',
                time: fmtTime(driveH), cost: cabCost,
                comfort: 5, tag: km < 350 ? 'Fastest' : undefined,
                apiMode: 'cab', geoMode: 'drive',
            });
        }

        // ── Bus ────────────────────────────────────────────────
        opts.push({
            id: 'bus', emoji: '🚌', label: 'Bus',
            desc: km > 500 ? 'Overnight sleeper bus, budget-friendly' : 'Frequent departures, cheapest option',
            time: fmtTime(busH), cost: `${busCost}/person`,
            comfort: 2, tag: 'Cheapest',
            apiMode: 'bus', geoMode: 'drive',
        });

        // ── Self-drive Rental ──────────────────────────────────
        if (km <= 800) {
            opts.push({
                id: 'rental', emoji: '🚙', label: 'Self-drive Rental',
                desc: 'Rent a car, drive at your own pace',
                time: fmtTime(driveH * 1.1), cost: rentalKmCost,
                comfort: 5, tag: km <= 300 ? 'Most Scenic' : undefined,
                apiMode: 'cab', geoMode: 'drive',
            });
        }

        // ── Flight ─────────────────────────────────────────────
        if (km > 350 && (!r || r.flightMin > 0)) {
            opts.push({
                id: 'flight', emoji: '✈️', label: 'Flight',
                desc: 'Fastest by far — fly direct, land fresh',
                time: fmtTime(flyH), cost: `${flyCost}/person`,
                comfort: 4, tag: km > 700 ? 'Fastest' : undefined,
                apiMode: 'plane', geoMode: 'drive',
            });
        }

        // ── Cab + Flight ───────────────────────────────────────
        if (km > 500 && (!r || r.flightMin > 0)) {
            const lo = r ? r.cabMin + r.flightMin : Math.round(km * 6);
            const hi = r ? r.cabMax + r.flightMax : Math.round(km * 14);
            opts.push({
                id: 'cab+flight', emoji: '🚗✈️', label: 'Cab → Flight',
                desc: 'Cab to nearest airport, fly, cab to hotel',
                time: fmtTime((r?.flightTimeH ?? km / 820) + 4),
                cost: fmtCost(lo, hi),
                comfort: 4, apiMode: 'cab then plane', geoMode: 'drive',
            });
        }

        // ── Bus + Flight ───────────────────────────────────────
        if (km > 600 && (!r || r.flightMin > 0)) {
            const lo = r ? r.busMin + r.flightMin : Math.round(km * 4);
            const hi = r ? r.busMax + r.flightMax : Math.round(km * 11);
            opts.push({
                id: 'bus+flight', emoji: '🚌✈️', label: 'Bus → Flight',
                desc: 'Budget bus to airport, then fly',
                time: fmtTime((r?.flightTimeH ?? km / 820) + 5),
                cost: `${fmtCost(lo, hi)}/person`,
                comfort: 3, tag: km > 800 ? 'Best Value' : undefined,
                apiMode: 'bus then plane', geoMode: 'drive',
            });
        }

        // ── Cab + Bus ──────────────────────────────────────────
        if (km > 200 && km <= 900) {
            const lo = r ? Math.round(r.cabMin * 0.4 + r.busMin) : Math.round(km * 4);
            const hi = r ? Math.round(r.cabMax * 0.5 + r.busMax) : Math.round(km * 9);
            opts.push({
                id: 'cab+bus', emoji: '🚗🚌', label: 'Cab → Bus',
                desc: 'Drive to bus hub, take express bus',
                time: fmtTime(busH * 0.85), cost: fmtCost(lo, hi),
                comfort: 3, apiMode: 'cab then bus', geoMode: 'drive',
            });
        }

        // ── Scenic Road Trip (multi-day) ───────────────────────
        if (km > 500) {
            const lo = r && r.cabMin > 0 ? Math.round(r.cabMin * 1.2) : Math.round(km * 14);
            const hi = r && r.cabMax > 0 ? Math.round(r.cabMax * 1.5) : Math.round(km * 22);
            opts.push({
                id: 'roadtrip', emoji: '🛣️', label: 'Scenic Road Trip',
                desc: 'Multi-day drive with overnight stays',
                time: `${Math.ceil(driveH / 8)} days`, cost: fmtCost(lo, hi),
                comfort: 5, tag: 'Most Adventurous',
                apiMode: 'cab', geoMode: 'drive',
            });
        }

        return opts;
    };

    useEffect(() => {
        const dest = formData.destination.trim();
        if (!dest) {
            setPreviewWeather([]);
            setPreviewSafety({ score: 0, label: 'N/A' });
            setPreviewHighlights(['Forts', 'Heritage', 'Local Food', 'Bazaars', '+more']);
            setRouteOptions([]); setSelectedRouteId(''); setRouteKm(null);
            return;
        }
        const timer = setTimeout(async () => {
            setPreviewHighlights(HIGHLIGHTS_DATA[dest.toLowerCase()] || ['Sightseeing', 'Local Food', 'Culture', '+more']);
            fetch(`http://localhost:8080/api/safety?destination=${encodeURIComponent(dest)}`)
                .then(r => r.ok ? r.json() : null)
                .then(s => { if (s?.score) setPreviewSafety({ score: s.score, label: s.label }); })
                .catch(() => {});
            try {
                // Geocode destination (and origin if set) to compute distance + auto mode
                const geoPromises = [
                    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dest)},India&format=json&limit=1`).then(r => r.json()),
                ];
                const origin = formData.origin.trim();
                if (origin) {
                    geoPromises.push(
                        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origin)},India&format=json&limit=1`).then(r => r.json())
                    );
                }
                const [destGeo, origGeo] = await Promise.all(geoPromises);
                if (!destGeo?.length) return;
                const { lat: dLat, lon: dLon } = destGeo[0];

                // Build all route options from distance
                if (origGeo?.length) {
                    const { lat: oLat, lon: oLon } = origGeo[0];
                    const km = Math.round(haversineKm(+oLat, +oLon, +dLat, +dLon));
                    setRouteKm(km);

                    // Fetch real route cost data from backend, fall back to null (uses per-km estimates)
                    let realRouteData: typeof realRoute = null;
                    try {
                        const rc = await fetch(`http://localhost:8080/api/route-costs?origin=${encodeURIComponent(formData.origin)}&destination=${encodeURIComponent(dest)}`);
                        if (rc.ok) {
                            const { route } = await rc.json();
                            if (route) realRouteData = route;
                        }
                    } catch { /* use fallback per-km estimates */ }
                    setRealRoute(realRouteData);

                    const opts = buildRouteOptions(km, realRouteData);
                    setRouteOptions(opts);
                    const best = opts.find(o => o.tag === 'Fastest') ?? opts[0];
                    setSelectedRouteId(best.id);
                    setFormData(prev => ({ ...prev, transportMode: best.apiMode }));
                }

                // Weather forecast for destination
                const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${dLat}&longitude=${dLon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=4`);
                const wData = await wRes.json();
                if (wData.daily) {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const today = new Date().getDay();
                    const strings = wData.daily.temperature_2m_max.map((maxTemp: number, i: number) => {
                        const code = wData.daily.weathercode[i];
                        const emoji = WEATHER_CODES[code] || '☀️';
                        const minTemp = Math.round(wData.daily.temperature_2m_min[i]);
                        const dayName = days[(today + i) % 7];
                        return `${dayName} ${emoji} ${Math.round(maxTemp)}°/${minTemp}°`;
                    });
                    setPreviewWeather(strings);
                }
            } catch { /* keep defaults on network error */ }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.destination, formData.origin]);

    useEffect(() => {
        const { viewPlanId, destination, vibe, origin } = location.state || {};

        // Restore a previously generated plan from localStorage
        if (viewPlanId) {
            const stored = getPlanData(viewPlanId);
            if (stored) {
                setPlanData(stored);
                setStep('itinerary');
                setCheckedEvents(new Set(getChecklist(viewPlanId)));
                setSafetyInfo(null);
                fetch(`http://localhost:8080/api/safety?destination=${encodeURIComponent(stored.destination)}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(s => { if (s?.score) setSafetyInfo(s); })
                    .catch(() => {});
                // Also restore form metadata from the saved trip record so budget bar etc. work
                const savedTrip = getTrips().find(t => t.planId === viewPlanId);
                if (savedTrip) {
                    setFormData(prev => ({
                        ...prev,
                        origin: savedTrip.origin,
                        destination: savedTrip.destination,
                        startDate: savedTrip.startDate,
                        endDate: savedTrip.endDate,
                        travelers: savedTrip.travelers,
                        budget: savedTrip.budget,
                    }));
                    if (savedTrip.vibe) setSelectedVibes([savedTrip.vibe]);
                    fetchTripWeather(savedTrip.destination, savedTrip.startDate, savedTrip.endDate);
                    fetchLocalPhrases(savedTrip.destination);
                    fetchBudgetEstimate(savedTrip.planId, savedTrip.budget, savedTrip.travelers || '2 adults');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        if (destination || vibe) {
            setFormData(prev => ({
                ...prev,
                destination: destination || prev.destination,
                origin: origin || prev.origin,
            }));
            if (vibe) setSelectedVibes([vibe]);
        }
    }, [location.state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const getWeatherEmoji = (info: string): string => {
        if (!info) return '⛅';
        const lower = info.toLowerCase();
        if (lower.includes('rain') || lower.includes('shower') || lower.includes('drizzle')) return '🌧️';
        if (lower.includes('storm') || lower.includes('thunder')) return '⛈️';
        if (lower.includes('snow') || lower.includes('blizzard')) return '❄️';
        if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return '🌫️';
        if (lower.includes('cloud') || lower.includes('overcast')) return '⛅';
        if (lower.includes('wind')) return '🌬️';
        if (lower.includes('sun') || lower.includes('clear') || lower.includes('hot')) return '☀️';
        return '⛅';
    };

    const parseTravelers = (t: string) => {
        const adults   = parseInt(t.match(/(\d+)\s+adult/i)?.[1] ?? '1');
        const children = parseInt(t.match(/(\d+)\s+child/i)?.[1] ?? '0');
        const hasBaby  = /baby|infant/i.test(t);
        return { adults, children, hasBaby, total: adults + children + (hasBaby ? 1 : 0) };
    };

    const fetchBudgetEstimate = async (planId: string, budget: string, travelers: string) => {
        if (!planId || !budget) return;
        setBudgetEstimateLoading(true);
        try {
            const p = new URLSearchParams({ planId, budget, travelers });
            const r = await fetch(`http://localhost:8080/api/budget-estimate?${p}`);
            if (r.ok) setBudgetEstimate(await r.json());
        } catch { /* silent */ }
        finally { setBudgetEstimateLoading(false); }
    };

    const fetchLocalPhrases = async (destination: string) => {
        try {
            const r = await fetch(`http://localhost:8080/api/phrases?destination=${encodeURIComponent(destination)}`);
            if (r.ok) setLocalPhrases(await r.json());
        } catch { /* silently skip */ }
    };

    const fetchTripWeather = async (destination: string, startDate: string, endDate: string) => {
        if (!destination || !startDate || !endDate) return;
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)},India&format=json&limit=1`);
            const geoData = await geoRes.json();
            if (!geoData || geoData.length === 0) return;
            const { lat, lon } = geoData[0];
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&start_date=${startDate}&end_date=${endDate}`);
            const wData = await wRes.json();
            if (!wData.daily?.time) return;
            const map: Record<string, { maxTemp: number; minTemp: number; code: number; description: string; precipitation: number }> = {};
            wData.daily.time.forEach((date: string, i: number) => {
                const code = wData.daily.weathercode[i];
                map[date] = {
                    maxTemp: Math.round(wData.daily.temperature_2m_max[i]),
                    minTemp: Math.round(wData.daily.temperature_2m_min[i]),
                    code,
                    description: WMO_DESCRIPTIONS[code] ?? 'Mixed weather',
                    precipitation: Math.round((wData.daily.precipitation_sum[i] ?? 0) * 10) / 10,
                };
            });
            setDailyWeather(map);
        } catch { /* silently use AI weather as fallback */ }
    };

    const toggleVibe = (v: string) => {
        setSelectedVibes(prev =>
            prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
        );
    };

    const setGroup = (g: string) => setFormData(prev => ({ ...prev, group: g }));

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setStep('loading');
        setLoadingStep('Preparing your trip…');

        const STEP_LABELS: Record<string, string> = {
            locating:   '📍 Locating destination…',
            weather:    '⛅ Fetching weather forecast…',
            generating: '✨ AI is crafting your itinerary…',
        };

        try {
            const vibeToSend = selectedVibes.length > 0 ? selectedVibes.join(',') : 'balanced';
            const res = await fetch('http://localhost:8080/api/generate-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: formData.origin,
                    destination: formData.destination,
                    transportMode: formData.transportMode,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    budget: formData.budget,
                    vibe: vibeToSend,
                    group: formData.group,
                    gemsMode: formData.gemsMode,
                    travelers: formData.travelers,
                }),
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // SSE events are delimited by double newlines
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';

                for (const part of parts) {
                    const dataLine = part.split('\n').find(l => l.startsWith('data: '));
                    if (!dataLine) continue;
                    let event: any;
                    try { event = JSON.parse(dataLine.slice(6)); } catch { continue; }

                    if (STEP_LABELS[event.status]) {
                        setLoadingStep(STEP_LABELS[event.status]);
                    } else if (event.status === 'complete') {
                        const data = event.plan;
                        setPlanData(data);
                        setCheckedEvents(new Set());
                        setSafetyInfo(null);
                        setDailyWeather({});
                        setLocalPhrases([]);

                        setStep('itinerary');
                        // Fetch real safety score, per-day weather, and local phrases in background
                        fetch(`http://localhost:8080/api/safety?destination=${encodeURIComponent(data.destination)}`)
                            .then(r => r.ok ? r.json() : null)
                            .then(s => { if (s?.score) setSafetyInfo(s); })
                            .catch(() => {});
                        fetchTripWeather(formData.destination, formData.startDate, formData.endDate);
                        fetchLocalPhrases(data.destination);
                        setBudgetEstimate(null);
                        fetchBudgetEstimate(data.planId, formData.budget, formData.travelers || '2 adults');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        savePlanData(data.planId, data);
                        saveTrip({
                            planId: data.planId,
                            destination: formData.destination,
                            origin: formData.origin,
                            startDate: formData.startDate,
                            endDate: formData.endDate,
                            travelers: formData.travelers,
                            budget: formData.budget,
                            totalEstimatedCost: data.totalEstimatedCost || 0,
                            vibe: selectedVibes[0] || 'balanced',
                            status: 'upcoming',
                            createdAt: new Date().toISOString(),
                        });
                    } else if (event.status === 'error') {
                        showToast('Generation Error: ' + (event.error || 'Unknown error'), 'error');
                        setStep('form');
                    }
                }
            }
        } catch {
            showToast('Network Error: Could not connect to backend at http://localhost:8080', 'error');
            setStep('form');
        }
    };

    const handleReplan = async (eventIdToReplace: string) => {
        if (!planData?.planId) return;
        setReplanningIds(prev => new Set(prev).add(eventIdToReplace));
        try {
            const res = await fetch('http://localhost:8080/api/replan-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: planData.planId, eventIdToReplace }),
            });
            const data = await res.json();
            if (res.ok) {
                setPlanData(data.fullPlan);
                showToast('✨ Activity replanned!', 'success');
                fetchBudgetEstimate(data.fullPlan.planId, formData.budget, formData.travelers || '2 adults');
            } else {
                showToast('Replan Error: ' + JSON.stringify(data.error), 'error');
            }
        } catch {
            showToast('Network Error: Could not connect to backend at http://localhost:8080', 'error');
        } finally {
            setReplanningIds(prev => { const n = new Set(prev); n.delete(eventIdToReplace); return n; });
        }
    };

    const handleTranslate = async () => {
        if (!translateInput.trim() || !planData?.destination) return;
        setTranslateLoading(true);
        setTranslateResult(null);
        try {
            const r = await fetch('http://localhost:8080/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: translateInput.trim(), destination: planData.destination }),
            });
            if (r.ok) setTranslateResult(await r.json());
        } finally {
            setTranslateLoading(false);
        }
    };

    const toggleCheck = (id: string) => {
        setCheckedEvents(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            if (planData?.planId) saveChecklist(planData.planId, Array.from(next));
            return next;
        });
    };

    const getDayProgress = (day: any): number => {
        if (!day.events) return 0;
        const activities = day.events.filter((e: any) => e.type !== 'transport');
        if (activities.length === 0) return 0;
        const checked = activities.filter((e: any) => checkedEvents.has(e.id || e.title)).length;
        return Math.round((checked / activities.length) * 100);
    };

    const destDisplay = formData.destination || 'Your Destination';
    const tripDays = formData.startDate && formData.endDate
        ? Math.max(1, Math.round((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 86400000))
        : 5;

    const vibes = [
        { key: 'adventure', emoji: '🏔️', label: 'Adventure' },
        { key: 'foodie', emoji: '🍜', label: 'Foodie' },
        { key: 'balanced', emoji: '🌅', label: 'Relaxed' },
        { key: 'culture', emoji: '🏛️', label: 'Cultural' },
        { key: 'romantic', emoji: '💕', label: 'Romantic' },
        { key: 'chill', emoji: '🎒', label: 'Backpacker' },
    ];

    const groups = [
        { key: 'solo', label: '🧍 Solo' },
        { key: 'couple', label: '💑 Couple' },
        { key: 'family', label: '👨‍👩‍👧 Family' },
        { key: 'friends', label: '👥 Friends' },
        { key: 'senior', label: '🧓 Senior' },
    ];


    const today = new Date().toISOString().split('T')[0];
    const spent = (() => {
        if (!planData?.days) return planData?.totalEstimatedCost ?? 0;
        const tm = planData.transportMode || formData.transportMode || '';
        let transportLow: number | null = null;
        if (realRoute) {
            if (/plane|flight/i.test(tm) && realRoute.flightMin > 0) transportLow = realRoute.flightMin;
            else if (/^bus$/i.test(tm.trim()) && realRoute.busMin > 0) transportLow = realRoute.busMin;
            else if (realRoute.cabMin > 0) transportLow = realRoute.cabMin;
        }
        let total = 0;
        let hasTransportEvent = false;
        for (const day of planData.days) {
            for (const ev of (day.events || []) as any[]) {
                if (ev.type === 'transport') {
                    total += transportLow ?? (ev.estimatedCost ?? 0);
                    hasTransportEvent = true;
                } else {
                    total += ev.estimatedCost ?? 0;
                }
            }
        }
        const lastDayHasReturn = planData.days[planData.days.length - 1]?.events?.some((e: any) => e.type === 'transport');
        if (hasTransportEvent && !lastDayHasReturn) total += transportLow ?? 0;
        return total;
    })();
    const budgetNum = Number(formData.budget) || 1;
    const spentPct = Math.min(100, Math.round((spent / budgetNum) * 100));

    const { adults, children, hasBaby, total: travelerCount } = parseTravelers(formData.travelers || '2 adults');
    const perPersonBudget = travelerCount > 0 ? Math.round(budgetNum / travelerCount) : budgetNum;
    const perPersonSpent = travelerCount > 0 ? Math.round(spent / travelerCount) : spent;
    const minRealisticBudget = travelerCount * tripDays * 1500;
    const budgetTooLow = formData.budget && Number(formData.budget) < minRealisticBudget;
    const budgetVeryLow = formData.budget && Number(formData.budget) < travelerCount * tripDays * 800;

    return (
        <React.Fragment>
            {/* ── LOADING OVERLAY ── */}
            {step === 'loading' && (
                <div className="ai-loading-overlay">
                    <div className="loading-content">
                        <div className="spinner"></div>
                        <h2>Crafting your itinerary…</h2>
                        <p>{loadingStep || 'Preparing your trip…'}</p>
                        <div className="progress-slide-track" style={{ marginTop: '24px' }}>
                            <div className="progress-slide-fill"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── FORM ── */}
            {step === 'form' && (
                <React.Fragment>
                    <div className="planner-hero">
                        <h1>Design your <span className="gradient-text">perfect trip</span></h1>
                        <p>Tell us where, when, and how you like to travel. AI handles the rest.</p>
                    </div>

                    <div className="planner-grid">
                        {/* LEFT: FORM CARD */}
                        <div className="form-card">
                            <form onSubmit={handleSubmit}>
                                {/* Row 1: Origin + Destination */}
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>📍 Starting from</label>
                                        <div className="input-field">
                                            <span>🗺️</span>
                                            <input
                                                type="text"
                                                id="origin"
                                                placeholder="e.g. Delhi"
                                                required
                                                value={formData.origin}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>🌍 Where to?</label>
                                        <div className="input-field">
                                            <span>🗺️</span>
                                            <input
                                                type="text"
                                                id="destination"
                                                placeholder="City or region"
                                                required
                                                value={formData.destination}
                                                onChange={handleInputChange}
                                                list="destSuggestions"
                                            />
                                            <datalist id="destSuggestions">
                                                {['Jaipur','Goa','Kerala','Manali','Udaipur','Varanasi','Mumbai','Darjeeling','Shimla','Rishikesh','Leh Ladakh','Ooty','Coorg'].map(d => (
                                                    <option key={d} value={d} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Travelers + Budget */}
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>👥 Travelers</label>
                                        <div className="input-field">
                                            <span>👤</span>
                                            <select id="travelers" value={formData.travelers} onChange={handleInputChange}>
                                                <option>1 adult</option>
                                                <option>2 adults</option>
                                                <option>2 adults, 1 child</option>
                                                <option>2 adults, 2 children</option>
                                                <option>2 adults, 1 baby</option>
                                                <option>2 adults, 1 baby, 1 child</option>
                                                <option>2 adults, 1 baby, 2 children</option>
                                                <option>3 adults</option>
                                                <option>4 adults (friends)</option>
                                                <option>Group (5+)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>💰 Budget (₹) — total for group</label>
                                        <div className="input-field">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                id="budget"
                                                placeholder={String(minRealisticBudget || 25000)}
                                                required
                                                min="500"
                                                value={formData.budget}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        {budgetVeryLow && (
                                            <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                                                ⚠️ Very low for {travelerCount} traveler{travelerCount !== 1 ? 's' : ''} × {tripDays} days. Min ₹{(800 * travelerCount * tripDays).toLocaleString()} recommended.
                                            </p>
                                        )}
                                        {budgetTooLow && !budgetVeryLow && (
                                            <p style={{ fontSize: '12px', color: '#F59E0B', marginTop: '4px' }}>
                                                💡 Budget is tight — plan may suggest budget options. (₹{perPersonBudget.toLocaleString()}/person)
                                            </p>
                                        )}
                                        {formData.budget && !budgetTooLow && (
                                            <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>
                                                ≈ ₹{perPersonBudget.toLocaleString()} per person
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Row 3: Dates */}
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>📅 Start Date</label>
                                        <div className="input-field">
                                            <span>📅</span>
                                            <input
                                                type="date"
                                                id="startDate"
                                                required
                                                min={today}
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>📅 End Date</label>
                                        <div className="input-field">
                                            <span>📅</span>
                                            <input
                                                type="date"
                                                id="endDate"
                                                required
                                                min={formData.startDate || today}
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Route picker */}
                                {routeOptions.length > 0 && (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <h3 style={{ margin: 0 }}>🛣️ Choose your route</h3>
                                            <span style={{ fontSize: '13px', color: '#64748B' }}>~{routeKm?.toLocaleString()} km</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {routeOptions.map(opt => {
                                                const isSelected = selectedRouteId === opt.id;
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => {
                                                            setSelectedRouteId(opt.id);
                                                            setFormData(prev => ({ ...prev, transportMode: opt.apiMode }));
                                                        }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '14px',
                                                            padding: '14px 16px', borderRadius: '18px', cursor: 'pointer',
                                                            border: isSelected ? '2px solid #6366F1' : '2px solid #E2E8F0',
                                                            background: isSelected ? '#F5F3FF' : '#FAFAFA',
                                                            transition: 'all 0.18s',
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '26px', minWidth: '36px', textAlign: 'center' }}>{opt.emoji}</span>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontWeight: 700, fontSize: '15px' }}>{opt.label}</span>
                                                                {opt.tag && (
                                                                    <span style={{ fontSize: '11px', fontWeight: 600, background: '#6366F1', color: '#fff', borderRadius: '20px', padding: '2px 8px' }}>{opt.tag}</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{opt.desc}</div>
                                                            <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>⏱ {opt.time}</span>
                                                                <span style={{ fontSize: '13px', color: '#64748B' }}>💰 {opt.cost}</span>
                                                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{'★'.repeat(opt.comfort)}{'☆'.repeat(5 - opt.comfort)}</span>
                                                            </div>
                                                        </div>
                                                        {isSelected && <span style={{ fontSize: '18px', color: '#6366F1', flexShrink: 0 }}>✓</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Vibe Grid */}
                                <h3 style={{ margin: '20px 0 12px' }}>✨ Choose your vibe(s)</h3>
                                <div className="vibe-grid">
                                    {vibes.map(v => (
                                        <div
                                            key={v.key}
                                            className={`vibe-card${selectedVibes.includes(v.key) ? ' selected' : ''}`}
                                            onClick={() => toggleVibe(v.key)}
                                        >
                                            <span className="vibe-emoji">{v.emoji}</span>
                                            {v.label}
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" className="btn-primary generate-btn">
                                    ✨ Generate Itinerary
                                </button>
                            </form>
                        </div>

                        {/* RIGHT: MAP PREVIEW CARD */}
                        <div className="map-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3>🗺️ Interactive Route Preview</h3>
                                <span style={{ fontSize: '13px', background: '#E6FFFA', padding: '4px 12px', borderRadius: '40px' }}>
                                    ✅ Route optimized
                                </span>
                            </div>

                            <div style={{ height: '280px', borderRadius: '28px', overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: '20px', position: 'relative' }}>
                                <InteractiveJourneyMap
                                    origin={formData.origin}
                                    destination={formData.destination}
                                    days={[]}
                                    transportMode={formData.transportMode}
                                />
                                {!formData.destination && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 500 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.85)', padding: '10px 20px', borderRadius: '40px', fontSize: '13px', color: '#64748B', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                                            Enter a destination to preview route
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ margin: '20px 0' }}>
                                <h4>⛅ 4‑Day Forecast ({destDisplay})</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '14px' }}>
                                    {(previewWeather.length > 0
                                        ? previewWeather
                                        : ['Mon ☀️ 33°', 'Tue ⛅ 31°', 'Wed 🌧️ 28°', 'Thu ☀️ 34°']
                                    ).map(d => (
                                        <div key={d} style={{ background: '#F8FAFC', padding: '8px', borderRadius: '12px', fontSize: '13px', textAlign: 'center' }}>{d}</div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#F0FDF4', borderRadius: '20px', padding: '16px', borderLeft: '4px solid #10B981', marginBottom: '20px' }}>
                                <strong>🛡️ Safety Score:</strong> {previewSafety.score > 0 ? `${previewSafety.score}/100 (${previewSafety.label})` : '— / 100 (enter destination)'}<br />
                                <span style={{ fontSize: '13px' }}>Emergency: 100 · Tourist Helpline: 1363</span>
                            </div>

                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '10px' }}>✨ Nearby highlights:</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {previewHighlights.map(h => (
                                        <span key={h} className="chip" style={{ padding: '8px 16px' }}>{h}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )}

            {/* ── ITINERARY RESULT ── */}
            {step === 'itinerary' && planData && (
                <React.Fragment>
                    {/* Trip Header */}
                    <div className="trip-header">
                        <div className="trip-title-detail">
                            <h1>{planData.destination} <span className="gradient-text">Adventure</span></h1>
                            <div className="trip-meta-detail">
                                <span className="chip">📅 {formData.startDate} – {formData.endDate}</span>
                                <span className="chip">👥 {formData.travelers}</span>
                                {selectedVibes.length > 0 && (
                                    <span className="chip">✨ {selectedVibes.join(', ')}</span>
                                )}
                                <span className="chip">🛡️ Safety {safetyInfo ? `${safetyInfo.score}/100` : '…'}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                <span>💰 Budget</span>
                                <strong>₹{spent.toLocaleString()} / ₹{Number(formData.budget).toLocaleString()}</strong>
                            </div>
                            <div className="budget-bar">
                                <div className="budget-fill" style={{ width: `${spentPct}%` }}></div>
                            </div>
                            <p style={{ fontSize: '13px', marginTop: '6px', color: '#64748B' }}>
                                ₹{Math.max(0, budgetNum - spent).toLocaleString()} remaining
                            </p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn-share"
                                    onClick={() => {
                                        const url = `${window.location.origin}/shared/${planData.planId}`;
                                        navigator.clipboard.writeText(url);
                                        showToast('🔗 Share link copied to clipboard!', 'success');
                                    }}
                                >
                                    🔗 Share Journey
                                </button>
                                <button className="btn-secondary" onClick={() => { setStep('form'); setPlanData(null); }}>
                                    ← New Trip
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Journey Map */}
                    {(() => {
                        const logistics = planData.transportLogistics || planData.transport_logistics || {};
                        return (
                            <div className="map-preview" style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                    <h3>🗺️ Journey Map</h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ color: '#2563EB', fontSize: '14px' }}>
                                            📍 {formData.origin} → {planData.destination}{logistics.estimatedTime ? ` · ${logistics.estimatedTime}` : ''}
                                        </span>
                                        <button
                                            onClick={toggleMapFullscreen}
                                            style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}
                                        >
                                            ⛶ Fullscreen
                                        </button>
                                    </div>
                                </div>

                                {/* Fullscreen overlay */}
                                {isMapFullscreen && (
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#fff' }}>
                                        <button
                                            onClick={toggleMapFullscreen}
                                            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10000, background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '22px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Exit fullscreen"
                                        >✕</button>
                                        <InteractiveJourneyMap
                                            origin={formData.origin}
                                            destination={planData.destination}
                                            days={planData.days}
                                            transportMode={planData.transportMode || formData.transportMode}
                                            fetchAmenities={true}
                                            sizeVersion={mapSizeVersion}
                                        />
                                    </div>
                                )}

                                <div style={{ position: 'relative' }}>
                                    <div style={{ height: '260px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                        <InteractiveJourneyMap
                                            origin={formData.origin}
                                            destination={planData.destination}
                                            days={planData.days}
                                            transportMode={planData.transportMode || formData.transportMode}
                                            fetchAmenities={true}
                                            sizeVersion={mapSizeVersion}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                                    <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '14px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Transport</div>
                                        <div style={{ fontWeight: 700 }}>{routeOptions.find(o => o.id === selectedRouteId)?.label || formData.transportMode || '—'}</div>
                                    </div>
                                    <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '14px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Travel Time</div>
                                        <div style={{ fontWeight: 700 }}>{logistics.estimatedTime || '—'}</div>
                                    </div>
                                    <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '14px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Transport Cost</div>
                                        <div style={{ fontWeight: 700, color: '#2563EB' }}>
                                            {(() => {
                                                const tm = planData.transportMode || formData.transportMode || '';
                                                if (realRoute) {
                                                    if (/plane|flight/i.test(tm) && realRoute.flightMin > 0)
                                                        return fmtCost(realRoute.flightMin, realRoute.flightMax) + '/person';
                                                    if (/^bus$/i.test(tm.trim()) && realRoute.busMin > 0)
                                                        return fmtCost(realRoute.busMin, realRoute.busMax) + '/person';
                                                    if (realRoute.cabMin > 0)
                                                        return fmtCost(realRoute.cabMin, realRoute.cabMax);
                                                }
                                                // Fallback: use the first transport event's cost (more accurate than transportLogistics.estimatedPrice)
                                                const firstTransportEvent = planData.days?.flatMap((d: any) => d.events ?? []).find((e: any) => e.type === 'transport' && (e.estimatedCost ?? 0) > 0);
                                                if (firstTransportEvent) return `~₹${Number(firstTransportEvent.estimatedCost).toLocaleString('en-IN')}`;
                                                return logistics.estimatedPrice ? `~₹${Number(logistics.estimatedPrice).toLocaleString('en-IN')}` : '—';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Day Cards */}
                    {planData.days?.map((day: any, dIdx: number) => {
                        const progress = getDayProgress(day);
                        return (
                            <div className="day-card" key={dIdx}>
                                <div className="day-header">
                                    <h2>Day {day.dayNumber} · {day.date || ''}</h2>
                                    {(() => {
                                        const w = dailyWeather[day.date];
                                        if (w) {
                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F0F9FF', borderRadius: '16px', padding: '8px 14px', border: '1px solid #BAE6FD' }}>
                                                    <span style={{ fontSize: '28px', lineHeight: 1 }}>{WEATHER_CODES[w.code] || '⛅'}</span>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#0369A1' }}>{w.description}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                                                            {w.maxTemp}° / {w.minTemp}°C
                                                            {w.precipitation > 0 && <span style={{ marginLeft: '6px' }}>💧 {w.precipitation}mm</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return <span className="weather-chip">{getWeatherEmoji(day.weatherInfo)} {day.weatherInfo || 'Clear Sky'}</span>;
                                    })()}
                                </div>
                                <div className="progress-indicator">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>

                                {day.events?.map((ev: any, eIdx: number) => {
                                    const evId = ev.id || `${dIdx}-${eIdx}`;
                                    if (ev.type === 'transport') {
                                        const tm = planData.transportMode || formData.transportMode || '';
                                        let loPrice: number | null = null;
                                        if (realRoute) {
                                            if (/plane|flight/i.test(tm) && realRoute.flightMin > 0) loPrice = realRoute.flightMin;
                                            else if (/^bus$/i.test(tm.trim()) && realRoute.busMin > 0) loPrice = realRoute.busMin;
                                            else if (realRoute.cabMin > 0) loPrice = realRoute.cabMin;
                                        }
                                        const icon = /plane|flight/i.test(tm) ? '✈️' : /^bus$/i.test(tm.trim()) ? '🚌' : '🚗';
                                        const rawCost = ev.estimatedCost ?? 0;
                                        const costStr = loPrice != null ? `₹${loPrice.toLocaleString('en-IN')}` : rawCost > 0 ? `₹${Number(rawCost).toLocaleString('en-IN')}` : '';
                                        return (
                                            <div className="transport-row" key={evId}>
                                                {icon} {ev.description || ev.title} — {costStr}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="activity-item" key={evId}>
                                            <input
                                                type="checkbox"
                                                className="activity-check"
                                                checked={checkedEvents.has(evId)}
                                                onChange={() => toggleCheck(evId)}
                                            />
                                            <span className="activity-time">{ev.time}</span>
                                            <div className="activity-info">
                                                <span className="activity-name">{ev.title}</span>
                                                <span className="activity-desc"> · {ev.durationMinutes} mins</span>
                                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{ev.description}</div>
                                            </div>
                                            <span className="activity-cost">{(ev.estimatedCost ?? 0) === 0 ? 'Free' : `₹${Number(ev.estimatedCost).toLocaleString('en-IN')}`}</span>
                                            <div className="activity-actions">
                                                <button
                                                    className="btn-replan"
                                                    onClick={() => handleReplan(ev.id)}
                                                    disabled={replanningIds.has(ev.id)}
                                                    style={{ opacity: replanningIds.has(ev.id) ? 0.7 : 1, minWidth: '80px' }}
                                                >
                                                    {replanningIds.has(ev.id) ? '⏳ Replanning…' : '🔁 Re‑plan'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Return trip row on last day */}
                                {dIdx === planData.days.length - 1 && !day.events?.some((e: any) => e.type === 'transport') && planData.days.some((d: any) => d.events?.some((e: any) => e.type === 'transport')) && (() => {
                                    const tm = planData.transportMode || formData.transportMode || '';
                                    let loPrice: number | null = null;
                                    if (realRoute) {
                                        if (/plane|flight/i.test(tm) && realRoute.flightMin > 0) loPrice = realRoute.flightMin;
                                        else if (/^bus$/i.test(tm.trim()) && realRoute.busMin > 0) loPrice = realRoute.busMin;
                                        else if (realRoute.cabMin > 0) loPrice = realRoute.cabMin;
                                    }
                                    if (loPrice == null) return null;
                                    const icon = /plane|flight/i.test(tm) ? '✈️' : /^bus$/i.test(tm.trim()) ? '🚌' : '🚗';
                                    return (
                                        <div className="transport-row" key="return-trip">
                                            {icon} Return to {formData.origin} — ₹{loPrice.toLocaleString('en-IN')}
                                        </div>
                                    );
                                })()}

                            </div>
                        );
                    })}

                    {/* Bottom: Safety + Expense */}
                    <div className="bottom-grid">
                        <div className="info-card">
                            <h3>🛡️ Safety &amp; Emergency</h3>
                            <div style={{ margin: '16px 0' }}>
                                <span style={{ fontSize: '36px', fontWeight: 700, color: safetyInfo && safetyInfo.score >= 70 ? '#10B981' : safetyInfo && safetyInfo.score >= 57 ? '#F59E0B' : '#EF4444' }}>
                                    {safetyInfo ? `${safetyInfo.score}/100` : '…'}
                                </span>
                                <span style={{ color: '#64748B', marginLeft: '8px' }}>{safetyInfo?.label ?? ''}</span>
                            </div>
                            <p>Police: 100 · Ambulance: 108 · Tourist Helpline: 1363</p>
                            {safetyInfo?.details && (
                                <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748B' }}>{safetyInfo.details}</p>
                            )}
                        </div>
                        <div className="info-card">
                            <h3>🗣️ Local Phrases</h3>
                            {localPhrases.length === 0 ? (
                                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '12px' }}>Loading local phrases…</p>
                            ) : (
                                <ul style={{ listStyle: 'none', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {localPhrases.map((p, i) => (
                                        <li key={i} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <span style={{ fontSize: '18px' }}>{p.emoji}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{p.native}</div>
                                                    <div style={{ fontSize: '13px', color: '#6366F1', fontStyle: 'italic' }}>{p.romanized}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748B' }}>{p.meaning}</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* Translator */}
                            <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>🔤 Translate anything</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={translateInput}
                                        onChange={e => setTranslateInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleTranslate()}
                                        placeholder="Type in English…"
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                                    />
                                    <button
                                        onClick={handleTranslate}
                                        disabled={translateLoading || !translateInput.trim()}
                                        style={{ padding: '8px 14px', borderRadius: '12px', background: '#6366F1', color: 'white', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', opacity: translateLoading ? 0.7 : 1 }}
                                    >
                                        {translateLoading ? '…' : 'Go'}
                                    </button>
                                </div>
                                {translateResult && (
                                    <div style={{ marginTop: '10px', background: '#F8FAFC', borderRadius: '12px', padding: '10px 14px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{translateResult.native}</div>
                                        <div style={{ fontSize: '13px', color: '#6366F1', fontStyle: 'italic' }}>{translateResult.romanized}</div>
                                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{translateResult.language}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="expense-logger">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>💰 Budget Tracker</h3>
                            <button className="btn-outline" onClick={() => setShowExpenseForm(v => !v)}>+ Log expense</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <div>
                                <span style={{ color: '#64748B' }}>Estimated (group)</span><br />
                                <span style={{ fontSize: '26px', fontWeight: 700 }}>₹{spent.toLocaleString()}</span>
                                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>≈ ₹{perPersonSpent.toLocaleString()}/person</div>
                            </div>
                            <div>
                                <span style={{ color: '#64748B' }}>Your budget (group)</span><br />
                                <span style={{ fontSize: '26px', fontWeight: 700 }}>₹{budgetNum.toLocaleString()}</span>
                                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>≈ ₹{perPersonBudget.toLocaleString()}/person</div>
                            </div>
                        </div>
                        <div style={{ margin: '12px 0 4px', background: '#F1F5F9', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                            <div style={{ width: `${spentPct}%`, height: '100%', background: spentPct > 100 ? '#EF4444' : spentPct > 85 ? '#F59E0B' : '#10B981', borderRadius: '8px', transition: 'width 0.4s' }} />
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                            {spentPct}% of budget used · ₹{Math.max(0, budgetNum - spent).toLocaleString()} remaining
                        </div>
                        {spent > budgetNum && (
                            <div style={{ background: '#FEF3C7', padding: '12px 16px', borderRadius: '20px' }}>
                                ⚠️ Estimated cost exceeds budget by ₹{(spent - budgetNum).toLocaleString()}. Consider replanning some activities.
                            </div>
                        )}

                        {/* Groq AI Budget Breakdown */}
                        {budgetEstimateLoading && (
                            <div style={{ textAlign: 'center', padding: '14px 0', color: '#6366F1', fontSize: '13px', fontWeight: 600 }}>
                                🤖 Analysing your budget…
                            </div>
                        )}
                        {!budgetEstimateLoading && budgetEstimate && (() => {
                            const cats = [
                                { label: 'Transport',     key: 'transport'     as const, emoji: '🚗' },
                                { label: 'Stay',          key: 'accommodation' as const, emoji: '🏨' },
                                { label: 'Food',          key: 'food'          as const, emoji: '🍽️' },
                                { label: 'Activities',    key: 'activities'    as const, emoji: '🎭' },
                                { label: 'Misc',          key: 'miscellaneous' as const, emoji: '🛍️' },
                            ];
                            const aColor = budgetEstimate.assessment === 'generous' ? '#10B981' : budgetEstimate.assessment === 'comfortable' ? '#6366F1' : '#F59E0B';
                            const aLabel = budgetEstimate.assessment === 'generous' ? '✅ Budget looks great!' : budgetEstimate.assessment === 'comfortable' ? '👍 Comfortable' : '⚠️ Budget tight';
                            return (
                                <div style={{ marginTop: '14px', background: '#F8FAFC', borderRadius: '20px', padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '13px' }}>🤖 AI Budget Breakdown</span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: aColor, background: aColor + '20', borderRadius: '20px', padding: '3px 10px' }}>{aLabel}</span>
                                    </div>
                                    {cats.map(c => {
                                        const amt = budgetEstimate[c.key];
                                        const pct = budgetEstimate.totalEstimated > 0 ? Math.round((amt / budgetEstimate.totalEstimated) * 100) : 0;
                                        return (
                                            <div key={c.key} style={{ marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                                                    <span>{c.emoji} {c.label}</span>
                                                    <span style={{ fontWeight: 600 }}>₹{amt.toLocaleString()} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({pct}%)</span></span>
                                                </div>
                                                <div style={{ background: '#E2E8F0', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: '#6366F1', borderRadius: '4px' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#64748B' }}>AI Total (within your cap)</span>
                                        <span style={{ fontWeight: 700 }}>₹{budgetEstimate.totalEstimated.toLocaleString()}</span>
                                    </div>
                                    {budgetEstimate.tips?.length > 0 && (
                                        <div style={{ background: '#EEF2FF', borderRadius: '14px', padding: '12px 14px', marginTop: '12px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1', marginBottom: '6px' }}>💡 Save money at {planData?.destination}</div>
                                            {budgetEstimate.tips.map((tip, i) => (
                                                <div key={i} style={{ fontSize: '12px', color: '#334155', marginBottom: i < budgetEstimate.tips.length - 1 ? '4px' : 0 }}>• {tip}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {showExpenseForm && (
                            <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="What did you spend on?"
                                    value={newExpense.desc}
                                    onChange={e => setNewExpense(p => ({ ...p, desc: e.target.value }))}
                                    style={{ padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '20px', fontSize: '14px' }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="number"
                                        placeholder="₹ Amount"
                                        value={newExpense.amount || ''}
                                        onChange={e => setNewExpense(p => ({ ...p, amount: Number(e.target.value) }))}
                                        style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '20px', fontSize: '14px' }}
                                    />
                                    <select
                                        value={newExpense.cat}
                                        onChange={e => setNewExpense(p => ({ ...p, cat: e.target.value }))}
                                        style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '20px', fontSize: '14px' }}
                                    >
                                        {['Food', 'Transport', 'Hotel', 'Shopping', 'Activity', 'Other'].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button className="btn-primary" style={{ padding: '10px 24px', alignSelf: 'flex-start' }} onClick={addExpense}>Save</button>
                            </div>
                        )}
                        {expenses.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                {expenses.map((ex, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                                        <span>{ex.desc}</span>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span className="chip" style={{ padding: '4px 12px', fontSize: '12px' }}>{ex.cat}</span>
                                            <span style={{ fontWeight: 700 }}>₹{ex.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: '12px', fontWeight: 700, textAlign: 'right' }}>
                                    Total Logged: ₹{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', margin: '20px 0 40px' }}>
                        <button className="btn-primary" onClick={() => showToast('🔔 Reminder set!', 'success')}>🔔 Set Reminder</button>
                        <button className="btn-outline" onClick={() => showToast('📅 Calendar sync coming soon!', 'info')}>📅 Sync Calendar</button>
                        <button
                            className="btn-outline"
                            onClick={() => {
                                const url = `${window.location.origin}/shared/${planData.planId}`;
                                navigator.clipboard.writeText(url);
                                showToast('🔗 Share link copied to clipboard!', 'success');
                            }}
                        >
                            🔗 Share Trip
                        </button>
                        <button className="btn-secondary" onClick={() => { setStep('form'); setPlanData(null); }}>← Plan Another Trip</button>
                    </div>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default Planner;
