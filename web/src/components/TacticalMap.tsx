import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ShieldCheck, AlertTriangle, Route, Info } from 'lucide-react';
import { Shelter, AssistanceRequest, RouteCandidate, HazardZone } from '../types';

interface TacticalMapProps {
  shelters: Shelter[];
  requests: AssistanceRequest[];
  routes: RouteCandidate[];
  hazardZones: HazardZone[];
  onSelectRequest: (req: AssistanceRequest) => void;
  onSelectShelter: (shelter: Shelter) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  shelters,
  requests,
  routes,
  hazardZones,
  onSelectRequest,
  onSelectShelter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Basemap & Layer toggles
  const [basemap, setBasemap] = useState<'osm' | 'satellite'>('osm');
  const [showHazards, setShowHazards] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // Basemap tile reference
  const baseTileRef = useRef<L.TileLayer | null>(null);

  // Layer groups references
  const hazardLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const shelterLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const requestLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const routeLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map centered on Puri coastal district
    const map = L.map(mapContainerRef.current, {
      center: [19.805, 85.825],
      zoom: 14,
      zoomControl: true,
    });

    // Official OpenStreetMap Standard Daylight Cartography (100% Free, Zero API Keys Required)
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    streetLayer.addTo(map);
    baseTileRef.current = streetLayer;

    // Multiple invalidateSize ticks to ensure full tile rendering on large monitors & laptops
    [50, 150, 300, 600, 1000].forEach(delay => {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, delay);
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Add layer groups
    hazardLayerRef.current.addTo(map);
    shelterLayerRef.current.addTo(map);
    requestLayerRef.current.addTo(map);
    routeLayerRef.current.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      baseTileRef.current = null;
    };
  }, []);

  // Update Basemap Tiles (Street vs Satellite vs Esri)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
    }

    if (basemap === 'satellite') {
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      });
      satLayer.addTo(map);
      baseTileRef.current = satLayer;
    } else {
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      osmLayer.addTo(map);
      baseTileRef.current = osmLayer;
    }
  }, [basemap]);

  // Update Hazard Inundation Polygons
  useEffect(() => {
    const group = hazardLayerRef.current;
    group.clearLayers();

    if (!showHazards) return;

    hazardZones.forEach(zone => {
      if (zone.geometry_geojson && zone.geometry_geojson.coordinates) {
        const latLngs = (zone.geometry_geojson.coordinates[0] as number[][]).map(
          ([lon, lat]) => [lat, lon] as [number, number]
        );

        const polygon = L.polygon(latLngs, {
          color: '#DC2626',
          weight: 2.5,
          fillColor: '#EF4444',
          fillOpacity: 0.25,
          dashArray: '5, 5'
        });

        polygon.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0F172A; line-height: 1.5;">
            <strong style="color: #DC2626; font-size: 13px;">⚠ ${zone.zone_name}</strong><br/>
            Water Depth: <strong>${zone.water_depth_cm} cm</strong><br/>
            <span style="color: #64748B;">${zone.notes}</span>
          </div>
        `);

        polygon.addTo(group);
      }
    });
  }, [hazardZones, showHazards]);

  // Update Shelter Markers
  useEffect(() => {
    const group = shelterLayerRef.current;
    group.clearLayers();

    if (!showShelters) return;

    shelters.forEach(shelter => {
      const hasRamp = shelter.features.find(f => f.feature_key === 'step_free_access')?.value === 'YES';
      const color = hasRamp ? '#059669' : '#DC2626';

      const icon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div style="
            background: #FFFFFF;
            border: 2px solid ${color};
            border-radius: 8px;
            padding: 3px 8px;
            color: #0F172A;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>🏠</span>
            <span>${shelter.code}</span>
            <span style="color: ${color}; font-size: 9px; font-weight: 800;">${hasRamp ? '✓ Ramp' : '✗ No Ramp'}</span>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 14]
      });

      const marker = L.marker([shelter.latitude, shelter.longitude], { icon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; line-height: 1.5;">
          <strong style="font-size: 13px; color: #2563EB;">${shelter.name}</strong><br/>
          Code: <span style="font-family: monospace; font-weight: bold;">${shelter.code}</span><br/>
          Capacity: <strong>${shelter.capacity_occupied} / ${shelter.capacity_total}</strong> spaces<br/>
          Step-Free Entrance: <strong style="color: ${hasRamp ? '#059669' : '#DC2626'}">${hasRamp ? 'YES (Verified)' : 'NO (Stairs Only)'}</strong><br/>
          Review Status: <strong style="color: #D97706;">${shelter.review_status}</strong><br/>
          Address: <span style="color: #64748B;">${shelter.address}</span>
        </div>
      `);

      marker.addTo(group);
    });
  }, [shelters, showShelters]);

  // Update Assistance Request Pins
  useEffect(() => {
    const group = requestLayerRef.current;
    group.clearLayers();

    if (!showRequests) return;

    requests.forEach(req => {
      const isCritical = req.urgency === 'CRITICAL' || req.urgency === 'HIGH';
      const ringColor = isCritical ? '#DC2626' : '#D97706';

      const icon = L.divIcon({
        className: 'custom-request-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${ringColor}; opacity: 0.25; animation: pulse-ring 2s infinite ease-in-out;"></div>
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #FFFFFF;
              border: 2px solid ${ringColor};
              color: ${ringColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            ">
              ♿
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([req.latitude, req.longitude], { icon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; line-height: 1.5;">
          <strong style="color: #DC2626; font-size: 13px;">${req.public_ref}</strong> (${req.urgency} Urgency)<br/>
          Address: <span style="color: #334155;">${req.approximate_address}</span><br/>
          Requirements: <strong style="color: #2563EB;">${req.requirements.join(', ').toUpperCase()}</strong><br/>
          People: <strong>${req.number_of_people}</strong><br/>
          Notes: <span style="color: #64748B;">${req.operational_notes}</span>
        </div>
      `);

      marker.addTo(group);
    });
  }, [requests, showRequests]);

  // Update Candidate Routes
  useEffect(() => {
    const group = routeLayerRef.current;
    group.clearLayers();

    if (!showRoutes) return;

    routes.forEach(route => {
      if (route.geometry_geojson && route.geometry_geojson.coordinates) {
        const latLngs = route.geometry_geojson.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);

        let color = '#2563EB'; // default blue
        let dashArray = undefined;
        let outcomeLabel = 'ROUTE CANDIDATE';

        if (route.candidate_code === 'ROUTE-DEMO-01') {
          color = '#D97706'; // Amber - shelter fails
          dashArray = '6, 6';
          outcomeLabel = 'Shelter has no ramp (UNSUITABLE)';
        } else if (route.candidate_code === 'ROUTE-DEMO-02') {
          color = '#DC2626'; // Red - flooded
          dashArray = '5, 5';
          outcomeLabel = 'Segment flooded 35cm (UNSUITABLE)';
        } else if (route.candidate_code === 'ROUTE-DEMO-03') {
          color = '#059669'; // Green - clear elevated
          outcomeLabel = 'All checks pass (FEASIBLE)';
        }

        const polyline = L.polyline(latLngs, {
          color,
          weight: 4.5,
          opacity: 0.9,
          dashArray
        });

        polyline.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0F172A; line-height: 1.5;">
            <strong style="color: ${color}; font-size: 13px;">${route.candidate_code}: ${route.title}</strong><br/>
            Destination: <strong>${route.destination_shelter_detail?.name || 'Shelter'}</strong><br/>
            Distance: <strong>${route.distance_km} km</strong> (~${route.estimated_time_minutes} min)<br/>
            Feasibility Status: <strong style="color: ${color};">${outcomeLabel}</strong>
          </div>
        `);

        polyline.addTo(group);
      }
    });
  }, [routes, showRoutes]);

  return (
    <div className="relative w-full h-[calc(100vh-220px)] min-h-[640px] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
      {/* Tactical Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Tactical Layer Control Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2.5 min-w-[210px]">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Tactical Layers</span>
        </div>

        {/* Basemap Switcher (100% Free Open Maps) */}
        <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setBasemap('osm')}
            className={`flex-1 py-1 px-2 text-[10.5px] font-bold rounded-md transition ${
              basemap === 'osm'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => setBasemap('satellite')}
            className={`flex-1 py-1 px-2 text-[10.5px] font-bold rounded-md transition ${
              basemap === 'satellite'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
        </div>

        <label className="flex items-center justify-between text-slate-700 cursor-pointer hover:text-slate-900 font-medium text-xs">
          <span className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-red-500 border border-red-600" />
            <span>Hazard Flooding</span>
          </span>
          <input
            type="checkbox"
            checked={showHazards}
            onChange={(e) => setShowHazards(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-slate-700 cursor-pointer hover:text-slate-900 font-medium text-xs">
          <span className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-600" />
            <span>Shelters ({shelters.length})</span>
          </span>
          <input
            type="checkbox"
            checked={showShelters}
            onChange={(e) => setShowShelters(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-slate-700 cursor-pointer hover:text-slate-900 font-medium text-xs">
          <span className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-600" />
            <span>Distress Pins ({requests.length})</span>
          </span>
          <input
            type="checkbox"
            checked={showRequests}
            onChange={(e) => setShowRequests(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-slate-700 cursor-pointer hover:text-slate-900 font-medium text-xs">
          <span className="flex items-center space-x-2">
            <span className="w-3 h-1 rounded bg-gradient-to-r from-emerald-500 to-red-500" />
            <span>Routes ({routes.length})</span>
          </span>
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={(e) => setShowRoutes(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Floating Tactical Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-xl text-xs text-slate-700 space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-900 flex items-center space-x-1.5 pb-1 border-b border-slate-100 text-[11px] uppercase">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Tactical Map Legend</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Grand Road: <strong>FEASIBLE</strong> (Ramp &amp; Clear)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Marine Drive: <strong>UNSUITABLE</strong> (35cm Flooded)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Puri High School: <strong>UNSUITABLE</strong> (Stairs Only)</span>
        </div>
      </div>
    </div>
  );
};
