"use client";
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Custom SVG markers ──────────────────────────────────────────────────────

const driverIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:44px;height:44px;border-radius:50%;
    background:#2563eb;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(37,99,235,0.3),0 4px 12px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
    animation:pulse-blue 2s infinite;
  ">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:38px;height:38px;border-radius:50%;
    background:#10b981;border:3px solid #fff;
    box-shadow:0 4px 12px rgba(16,185,129,0.4);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm2-9h-4V5h4v2z"/>
    </svg>
  </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:38px;height:38px;border-radius:50%;
    background:#8b5cf6;border:3px solid #fff;
    box-shadow:0 4px 12px rgba(139,92,246,0.4);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// ── Inject CSS animation ────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-blue {
      0%   { box-shadow: 0 0 0 4px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3); }
      50%  { box-shadow: 0 0 0 10px rgba(37,99,235,0.1), 0 4px 12px rgba(0,0,0,0.3); }
      100% { box-shadow: 0 0 0 4px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3); }
    }
  `;
  document.head.appendChild(style);
}

// ── Geocode delivery address → [lat, lng] via Nominatim ────────────────────
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

// ── Reverse geocode [lat,lng] → address string ─────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return data.display_name?.split(',').slice(0, 3).join(',') ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {}
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// ── Fetch real road route from OSRM ────────────────────────────────────────
async function fetchRoute(from: [number, number], to: [number, number]): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
    }
  } catch {}
  return [from, to];
}

// ── Auto-pan map to driver position ────────────────────────────────────────
function MapFollower({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.panTo(pos, { animate: true, duration: 1 });
  }, [pos, map]);
  return null;
}

// ── Main component ──────────────────────────────────────────────────────────
interface Props {
  pickup: { lat: number; lng: number };
  deliveryAddress?: string | null;
  isActive?: boolean;
}

export default function MapLayer({ pickup, deliveryAddress, isActive = false }: Props) {
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [dropoffPos, setDropoffPos] = useState<[number, number] | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [eta, setEta] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const watchRef = useRef<number | null>(null);

  const pickupPos: [number, number] = [pickup.lat, pickup.lng];

  // Geocode delivery address
  useEffect(() => {
    if (!deliveryAddress) return;
    geocodeAddress(deliveryAddress).then(coords => {
      if (coords) setDropoffPos(coords);
    });
  }, [deliveryAddress]);

  // Reverse geocode pickup
  useEffect(() => {
    reverseGeocode(pickup.lat, pickup.lng).then(setPickupAddress);
  }, [pickup.lat, pickup.lng]);

  // Start GPS watch when active
  useEffect(() => {
    if (!isActive || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      pos => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [isActive]);

  // Fetch road route whenever driver or dropoff changes
  useEffect(() => {
    const origin = driverPos ?? pickupPos;
    const dest = dropoffPos ?? pickupPos;
    fetchRoute(origin, dest).then(path => {
      setRoutePath(path);
      // Rough ETA: assume 40 km/h avg city speed
      const d = haversineKm(origin, dest);
      setDistance(`${d.toFixed(1)} km`);
      const mins = Math.round((d / 40) * 60);
      setEta(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`);
    });
  }, [driverPos, dropoffPos]);

  const center: [number, number] = driverPos ?? pickupPos;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Pickup marker */}
        <Marker position={pickupPos} icon={pickupIcon} />

        {/* Dropoff marker */}
        {dropoffPos && <Marker position={dropoffPos} icon={dropoffIcon} />}

        {/* Driver live position */}
        {driverPos && (
          <>
            <Circle center={driverPos} radius={80} pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.15, weight: 0 }} />
            <Marker position={driverPos} icon={driverIcon} />
            <MapFollower pos={driverPos} />
          </>
        )}

        {/* Road route polyline */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
          />
        )}
      </MapContainer>

      {/* HUD overlay — Swiggy-style bottom card */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl p-4 pointer-events-auto border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {isActive && driverPos ? 'Live Tracking' : 'Route Preview'}
              </span>
            </div>
            {eta && (
              <div className="flex items-center gap-3 text-sm">
                <span className="font-black text-gray-900">{eta}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 font-medium">{distance}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{pickupAddress || 'Loading address…'}</p>
              </div>
            </div>
            <div className="ml-1.5 w-px h-4 bg-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deliver To</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{deliveryAddress || 'No address set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPS unavailable notice */}
      {isActive && !driverPos && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
          Waiting for GPS signal…
        </div>
      )}
    </div>
  );
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
