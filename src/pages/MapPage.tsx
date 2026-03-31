import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Crosshair,
  AlertTriangle,
  Construction,
  Waves,
  Car,
  X,
  ChevronUp,
  LocateFixed,
  MessageSquare,
  Navigation,
  Search,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  mockIncidents,
  Incident,
  Severity,
  IncidentType,
} from '../data/mockData';
import { fetchIncidents, geocodePlace, getRoute } from '../utils/api';

const BKK_CENTER: [number, number] = [100.5018, 13.7563];
const LOCATION_STORAGE_KEY = 'user-location';

const typeIcons: Record<IncidentType, React.ElementType> = {
  accident: AlertTriangle,
  construction: Construction,
  flood: Waves,
  congestion: Car,
};

const severityDotColors: Record<Severity, string> = {
  critical: '#ef4444',
  major: '#f97316',
  moderate: '#eab308',
  minor: '#22c55e',
};

const getTomTomLanguage = (language: string) => {
  return language === 'th' ? 'th-TH' : 'en-GB';
};

const loadStoredLocation = (): [number, number] | null => {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      typeof parsed[0] === 'number' &&
      typeof parsed[1] === 'number'
    ) {
      return [parsed[0], parsed[1]];
    }

    return null;
  } catch {
    return null;
  }
};

export function MapPage() {
  const { t, language } = useLanguage();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const mapRef = useRef<tt.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const incidentMarkersRef = useRef<tt.Marker[]>([]);
  const userMarkerRef = useRef<tt.Marker | null>(null);
  const routeMarkersRef = useRef<tt.Marker[]>([]);
  const mapLoadedRef = useRef(false);

  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(() =>
    loadStoredLocation()
  );
  const [isLocating, setIsLocating] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [destination, setDestination] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents()
      .then((data) => { if (data.length > 0) setIncidents(data); })
      .catch(() => { /* keep mock data on error */ });
  }, []);

  const tomtomKey = import.meta.env.VITE_TOMTOM_API_KEY;
  const mapLanguage = useMemo(() => getTomTomLanguage(language), [language]);

  const locateButtonText =
    language === 'th' ? 'ใช้ตำแหน่งของฉัน' : 'Use My Location';

  const locatingText =
    language === 'th' ? 'กำลังค้นหาตำแหน่ง...' : 'Locating...';

  const stopShowingLocationText =
    language === 'th' ? 'หยุดแสดงตำแหน่ง' : 'Stop Showing Location';

  const locationPopupText =
    language === 'th' ? 'ตำแหน่งของคุณ' : 'Your location';

  const backToListText =
    language === 'th' ? 'กลับไปยังรายการ' : 'Back to list';

  const createIncidentMarkerElement = (severity: Severity) => {
    const markerEl = document.createElement('div');
    markerEl.className = 'custom-incident-marker';
    markerEl.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${severityDotColors[severity]};
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: white;
        "></div>
      </div>
    `;
    return markerEl;
  };

  const createUserMarkerElement = () => {
    const markerEl = document.createElement('div');
    markerEl.className = 'custom-user-marker';
    markerEl.innerHTML = `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(8, 145, 178, 0.25);
          transform: scale(1.6);
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #0891b2;
          border: 4px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        "></div>
      </div>
    `;
    return markerEl;
  };

  const createPopupHTML = (incident: Incident) => {
    return `
      <div style="
        width: 300px;
        padding: 14px 16px;
        font-family: system-ui, -apple-system, sans-serif;
        color: #0f172a;
        box-sizing: border-box;
      ">

        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${
              incident.severity === 'critical'
                ? '#fee2e2'
                : incident.severity === 'major'
                ? '#ffedd5'
                : incident.severity === 'moderate'
                ? '#fef9c3'
                : '#dcfce7'
            };
            color: ${
              incident.severity === 'critical'
                ? '#dc2626'
                : incident.severity === 'major'
                ? '#ea580c'
                : incident.severity === 'moderate'
                ? '#ca8a04'
                : '#16a34a'
            };
            font-weight: 700;
            font-size: 16px;
          ">!</div>

          <div>
            <div style="font-weight: 700; font-size: 15px;">
              ${t(`type.${incident.type}`)}
            </div>
            <div style="font-size: 12px; color: #64748b;">
              ${t(`severity.${incident.severity}`)}
            </div>
          </div>
        </div>

        <div style="
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        ">
          ${incident.location[language]}
        </div>

        <div style="
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 12px;
        ">
          ${incident.description[language]}
        </div>

        <div style="
          height: 1px;
          background: #e2e8f0;
          margin: 10px 0;
        "></div>

        <div style="
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
        ">
          <span style="font-weight: 600;">
            ${t('alerts.clearance')}
          </span>
          <span style="color: #0f172a; font-weight: 500;">
            ${incident.clearanceTime}
          </span>
        </div>

        <button
          onclick="if(window.__bkkNavigateToChat)window.__bkkNavigateToChat('${incident.location.en.replace(/'/g, "\\'")}')"
          style="
            width: 100%;
            padding: 10px;
            background: #0891b2;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          "
        >
          💬 ${language === 'th' ? 'ถามในแชท' : 'Ask in Chat'}
        </button>
      </div>
    `;
  };

  const flyToCoordinates = (coords: [number, number], zoom = 13) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: coords, zoom, speed: 0.9 });
  };

  const createRoutePin = (label: string, color: string) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        display: flex; flex-direction: column; align-items: center; gap: 0;
      ">
        <div style="
          width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${color}; border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white; font-size: 12px; font-weight: 800; line-height: 1;
          ">${label}</span>
        </div>
      </div>
    `;
    return el;
  };

  const drawRoute = (routePoints: [number, number][], summary?: { travel_time_mins: number; length_km: number; traffic_delay_mins: number }) => {
    const map = mapRef.current;
    if (!map || routePoints.length === 0) return;
    // GeoJSON uses [lng, lat]
    const coords = routePoints.map(([lat, lng]) => [lng, lat]);
    const geoJson: any = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
    };
    try {
      if ((map as any).getSource('bkk-route')) {
        ((map as any).getSource('bkk-route') as any).setData(geoJson);
      } else {
        (map as any).addSource('bkk-route', { type: 'geojson', data: geoJson });
        (map as any).addLayer({
          id: 'bkk-route-outline',
          type: 'line',
          source: 'bkk-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.7 },
        });
        (map as any).addLayer({
          id: 'bkk-route',
          type: 'line',
          source: 'bkk-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#1d4ed8', 'line-width': 5, 'line-opacity': 0.95 },
        });
      }

      // Remove old A/B markers
      routeMarkersRef.current.forEach((m) => m.remove());
      routeMarkersRef.current = [];

      const start = coords[0] as [number, number];
      const end = coords[coords.length - 1] as [number, number];

      const startMarker = new tt.Marker({ element: createRoutePin('A', '#16a34a'), anchor: 'bottom' })
        .setLngLat(start)
        .addTo(map);
      const endMarker = new tt.Marker({ element: createRoutePin('B', '#dc2626'), anchor: 'bottom' })
        .setLngLat(end)
        .addTo(map);

      // Midpoint popup with travel time
      const midCoord = coords[Math.floor(coords.length / 2)] as [number, number];
      const popupHtml = summary
        ? `<div style="font-size:13px; font-weight:700; color:#1d4ed8; white-space:nowrap;">
            🕐 ${summary.travel_time_mins} min &nbsp;·&nbsp; ${summary.length_km} km
            ${summary.traffic_delay_mins > 0 ? `<br/><span style="color:#f97316; font-size:11px;">+${summary.traffic_delay_mins} min delay</span>` : ''}
           </div>`
        : '';
      const midPopup = new tt.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setLngLat(midCoord)
        .setHTML(popupHtml)
        .addTo(map);
      routeMarkersRef.current = [startMarker, endMarker, midPopup as any];

      // Fit map bounds to the full route
      const lnglats = coords as [number, number][];
      const bounds = lnglats.reduce(
        (b, c) => { b.extend(c); return b; },
        new tt.LngLatBounds(lnglats[0], lnglats[0])
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 14, speed: 0.9 });
      setHasRoute(true);
    } catch (e) {
      console.warn('[map] Could not draw route:', e);
    }
  };

  const clearRoute = () => {
    const map = mapRef.current;
    if (!map) return;
    try {
      if ((map as any).getLayer('bkk-route'))         (map as any).removeLayer('bkk-route');
      if ((map as any).getLayer('bkk-route-outline')) (map as any).removeLayer('bkk-route-outline');
      if ((map as any).getSource('bkk-route'))        (map as any).removeSource('bkk-route');
    } catch (e) { /* ignore */ }
    routeMarkersRef.current.forEach((m) => m.remove());
    routeMarkersRef.current = [];
    setHasRoute(false);
  };

  const addOrUpdateUserMarker = (coords: [number, number]) => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const popup = new tt.Popup({ offset: 18 }).setHTML(
      `<div style="font-size:14px; font-weight:600;">${locationPopupText}</div>`
    );

    userMarkerRef.current = new tt.Marker({
      element: createUserMarkerElement(),
    })
      .setLngLat(coords)
      .setPopup(popup)
      .addTo(mapRef.current);
  };

  const removeUserMarker = () => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  };

  const handleRouteTo = async () => {
    if (!destination.trim()) return;
    if (!userLocation) {
      setRouteError(language === 'th' ? 'กรุณาเปิดตำแหน่งของคุณก่อน' : 'Enable your location first');
      return;
    }
    setIsRouting(true);
    setRouteError(null);
    try {
      const dest = await geocodePlace(destination.trim());
      if (!dest) {
        setRouteError(language === 'th' ? 'ไม่พบสถานที่นี้' : `Could not find "${destination}"`);
        return;
      }
      // userLocation is [lng, lat] (TomTom format)
      const result = await getRoute(userLocation[1], userLocation[0], dest.lat, dest.lng, destination.trim());
      if (result && result.route_points.length > 0) {
        const tryDraw = () => {
          const map = mapRef.current;
          if (!map || !map.isStyleLoaded()) { setTimeout(tryDraw, 200); return; }
          drawRoute(result.route_points, result.summary);
        };
        tryDraw();
        setDestination('');
      } else {
        setRouteError(language === 'th' ? 'ไม่สามารถคำนวณเส้นทางได้' : 'Could not calculate route. Try again.');
      }
    } catch {
      setRouteError(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Error calculating route. Try again.');
    } finally {
      setIsRouting(false);
    }
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert(
        language === 'th'
          ? 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
          : 'Geolocation is not supported by this browser.'
      );
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        setUserLocation(coords);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
        flyToCoordinates(coords, 14);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert(
          language === 'th'
            ? 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง'
            : 'Unable to access your location. Please allow location permission.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleHideUserLocation = () => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setUserLocation(null);
    removeUserMarker();
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!tomtomKey) {
      console.error('Missing VITE_TOMTOM_API_KEY');
      return;
    }

    const map = tt.map({
      key: tomtomKey,
      container: mapContainerRef.current,
      center: userLocation ?? BKK_CENTER,
      zoom: userLocation ? 14 : 12,
      language: mapLanguage,
    });

    mapRef.current = map;
    map.addControl(new tt.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapLoadedRef.current = true;
      incidents.forEach((incident) => {
        const markerElement = createIncidentMarkerElement(incident.severity);
        const popup = new tt.Popup({ offset: 24 }).setHTML(createPopupHTML(incident));

        const marker = new tt.Marker({ element: markerElement })
          .setLngLat([incident.lng, incident.lat])
          .setPopup(popup)
          .addTo(map);

        marker.getElement().addEventListener('click', () => {
          setSelectedIncident(incident);
          flyToCoordinates([incident.lng, incident.lat], 13);

          if (window.innerWidth < 768) {
            setIsBottomSheetOpen(true);
          }
        });

        incidentMarkersRef.current.push(marker);
      });

      if (userLocation) {
        addOrUpdateUserMarker(userLocation);
      }
    });

    return () => {
      incidentMarkersRef.current.forEach((marker) => marker.remove());
      incidentMarkersRef.current = [];

      removeUserMarker();

      map.remove();
      mapRef.current = null;
    };
  }, [tomtomKey]);

  // Handle navigation state from chat: "View on Map" or "View Route on Map"
  useEffect(() => {
    const state = routerLocation.state as {
      focus_lat?: number;
      focus_lng?: number;
      route_points?: [number, number][];
      route_summary?: { travel_time_mins: number; length_km: number; traffic_delay_mins: number };
    } | null;
    if (!state) return;

    const applyState = () => {
      console.log('[map] applyState called, route_points:', state.route_points?.length);
      if (state.route_points && state.route_points.length > 0) {
        drawRoute(state.route_points, state.route_summary);
      } else if (state.focus_lat && state.focus_lng) {
        flyToCoordinates([state.focus_lng!, state.focus_lat!], 15);
      }
    };
    const tryApply = () => {
      console.log('[map] tryApply: map=', !!mapRef.current, 'loaded=', mapLoadedRef.current);
      if (!mapRef.current) { setTimeout(tryApply, 200); return; }
      if (mapLoadedRef.current) {
        applyState();
      } else {
        setTimeout(tryApply, 200);
      }
    };
    tryApply();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.state]);

  // Expose a global helper so TomTom popup HTML buttons can trigger React navigation
  useEffect(() => {
    (window as any).__bkkNavigateToChat = (roadName: string) => {
      navigate('/chat', { state: { road_query: roadName } });
    };
    return () => {
      delete (window as any).__bkkNavigateToChat;
    };
  }, [navigate]);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.setLanguage(mapLanguage);

    incidentMarkersRef.current.forEach((marker) => marker.remove());
    incidentMarkersRef.current = [];

    incidents.forEach((incident) => {
      const markerElement = createIncidentMarkerElement(incident.severity);
      const popup = new tt.Popup({ offset: 24 }).setHTML(createPopupHTML(incident));

      const marker = new tt.Marker({ element: markerElement })
        .setLngLat([incident.lng, incident.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      marker.getElement().addEventListener('click', () => {
        setSelectedIncident(incident);
        flyToCoordinates([incident.lng, incident.lat], 13);

        if (window.innerWidth < 768) {
          setIsBottomSheetOpen(true);
        }
      });

      incidentMarkersRef.current.push(marker);
    });

    if (userLocation) {
      addOrUpdateUserMarker(userLocation);
    } else {
      removeUserMarker();
    }
  }, [language, incidents]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation) {
      addOrUpdateUserMarker(userLocation);
    } else {
      removeUserMarker();
    }
  }, [userLocation, language]);

  const IncidentDetails = ({ incident }: { incident: Incident }) => {
    const Icon = typeIcons[incident.type];

    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`p-2 rounded-lg ${
              incident.severity === 'critical'
                ? 'bg-red-100 text-red-600'
                : incident.severity === 'major'
                ? 'bg-orange-100 text-orange-600'
                : incident.severity === 'moderate'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t(`type.${incident.type}`)}</h3>
            <span className="text-xs font-medium text-slate-500">
              {t(`severity.${incident.severity}`)}
            </span>
          </div>
        </div>

        <h4 className="font-semibold text-slate-800 mb-1">
          {incident.location[language]}
        </h4>

        <p className="text-sm text-slate-600 mb-3">
          {incident.description[language]}
        </p>

        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
          <span className="font-medium">{t('alerts.clearance')}</span>{' '}
          {incident.clearanceTime}
        </div>

        <button
          onClick={() => navigate('/chat', { state: { road_query: incident.location.en } })}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors"
        >
          <MessageSquare size={15} />
          {language === 'th' ? 'ถามในแชท' : 'Ask in Chat'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] pt-16 relative overflow-hidden bg-slate-100">

      {/* Destination search bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] w-full max-w-sm px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setRouteError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleRouteTo()}
              placeholder={language === 'th' ? 'ไปที่ไหน?' : 'Where to?'}
              className="bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none w-full"
            />
            {destination && (
              <button onClick={() => { setDestination(''); setRouteError(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={handleRouteTo}
            disabled={isRouting || !destination.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-3 py-2 flex items-center gap-1.5 text-sm font-semibold transition-colors flex-shrink-0"
          >
            {isRouting ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
            {language === 'th' ? 'นำทาง' : 'Go'}
          </button>
        </div>
        {routeError && (
          <p className="text-xs text-red-500 mt-1.5 text-center font-medium">{routeError}</p>
        )}
        {!userLocation && (
          <p className="text-xs text-amber-600 mt-1.5 text-center font-medium">
            {language === 'th' ? '⚠ เปิดตำแหน่งของคุณเพื่อใช้การนำทาง' : '⚠ Enable your location to use navigation'}
          </p>
        )}
      </div>

      <div className="hidden md:flex absolute top-36 left-4 z-[400] w-80 bg-white rounded-2xl shadow-xl border border-slate-200 flex-col max-h-[calc(100vh-9rem)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <MapPin size={20} className="text-cyan-600" />
            {t('map.incidents')}
          </h2>
        </div>

        <div className="overflow-y-auto p-2 space-y-2">
          {incidents.map((incident) => {
            const Icon = typeIcons[incident.type];

            return (
              <button
                key={incident.id}
                onClick={() => {
                  setSelectedIncident(incident);
                  flyToCoordinates([incident.lng, incident.lat], 13);
                }}
                className={`w-full text-left p-3 rounded-xl transition-colors border ${
                  selectedIncident?.id === incident.id
                    ? 'bg-cyan-50 border-cyan-200'
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className="text-slate-500" />
                  <span className="font-semibold text-sm text-slate-800 truncate">
                    {incident.location[language]}
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {incident.description[language]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 w-full relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute top-24 right-6 z-[400] flex flex-col items-end gap-3">
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            className="bg-white text-slate-700 border border-slate-200 rounded-full px-4 py-2 shadow-lg hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
          >
            <LocateFixed size={18} />
            {isLocating ? locatingText : locateButtonText}
          </button>

          {userLocation && (
            <button
              onClick={handleHideUserLocation}
              className="bg-white text-slate-600 border border-slate-200 rounded-full px-4 py-2 shadow-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
            >
              {stopShowingLocationText}
            </button>
          )}

          {hasRoute && (
            <button
              onClick={clearRoute}
              className="bg-violet-600 text-white border border-violet-500 rounded-full px-4 py-2 shadow-lg hover:bg-violet-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Navigation size={15} />
              {language === 'th' ? 'ล้างเส้นทาง' : 'Clear Route'}
            </button>
          )}
        </div>

        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className="absolute bottom-24 right-6 z-[400] bg-white p-3 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
          title={locateButtonText}
        >
          <LocateFixed size={22} />
        </button>

        <button
          onClick={() => flyToCoordinates(userLocation ?? BKK_CENTER, 12)}
          className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700"
          title={t('map.recenter')}
        >
          <Crosshair size={24} />
        </button>
      </div>

      <div className="md:hidden absolute bottom-0 left-0 right-0 z-[400] bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-slate-200 p-4 pb-safe">
        <button
          onClick={() => setIsBottomSheetOpen(true)}
          className="w-full flex flex-col items-center justify-center gap-2 text-slate-500"
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1"></div>
          <div className="flex items-center gap-2 font-medium">
            <ChevronUp size={20} />
            {t('map.drag_up')}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isBottomSheetOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className="md:hidden absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh]"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-bold text-lg text-slate-900">
                {t('map.incidents')}
              </h2>
              <button
                onClick={() => {
                  setIsBottomSheetOpen(false);
                  setSelectedIncident(null);
                }}
                className="p-2 bg-slate-100 rounded-full text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 pb-safe">
              {selectedIncident ? (
                <div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="text-sm text-cyan-600 font-medium mb-4 flex items-center gap-1"
                  >
                    &larr; {backToListText}
                  </button>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100">
                    <IncidentDetails incident={selectedIncident} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {incidents.map((incident) => {
                    const Icon = typeIcons[incident.type];

                    return (
                      <button
                        key={incident.id}
                        onClick={() => {
                          setSelectedIncident(incident);
                          flyToCoordinates([incident.lng, incident.lat], 13);
                        }}
                        className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex gap-3 items-start"
                      >
                        <div
                          className={`p-2 rounded-xl mt-1 ${
                            incident.severity === 'critical'
                              ? 'bg-red-50 text-red-600'
                              : incident.severity === 'major'
                              ? 'bg-orange-50 text-orange-600'
                              : incident.severity === 'moderate'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-green-50 text-green-600'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm mb-1">
                            {incident.location[language]}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {incident.description[language]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}