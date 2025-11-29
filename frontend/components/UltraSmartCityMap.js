import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function UltraSmartCityMap({ complaints }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const radarInterval = useRef(null);

  useEffect(() => {
    if (map.current) return;

    // Initialize map with better styling
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [75.124, 15.364], // Hubli-Dharwad center
      zoom: 12,
      pitch: 45,
      bearing: 0,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add geolocate control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      "top-right"
    );

    map.current.on("load", () => {
      // Add 3D terrain if available
      if (map.current.getTerrain()) {
        map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      }

      // Add complaints as markers with different colors based on urgency
      // Remove existing markers first
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      complaints.forEach((p) => {
        // Validate coordinates
        const longitude = parseFloat(p.Longitude);
        const latitude = parseFloat(p.Latitude);
        
        // Skip if coordinates are invalid
        if (isNaN(longitude) || isNaN(latitude)) {
          return;
        }

        // Create marker based on urgency
        let markerColor = "#00ff00"; // Green for low
        if (p.Urgency === "High") {
          markerColor = "#ff0000"; // Red for high
        } else if (p.Urgency === "Medium") {
          markerColor = "#ffff00"; // Yellow for medium
        }

        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = markerColor;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        el.style.cursor = 'pointer';

        // Add pulse animation for high urgency
        if (p.Urgency === "High") {
          el.style.animation = 'pulse 2s infinite';
        }

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([longitude, latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 25 })
              .setHTML(`
                <div style="color: #fff; background: rgba(15, 23, 42, 0.9); padding: 10px; border-radius: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #60a5fa;">${p.Category}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">${p.ComplaintText}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: ${p.Urgency === 'High' ? '#ef4444' : p.Urgency === 'Medium' ? '#f59e0b' : '#10b981'}; color: white;">
                      ${p.Urgency} Priority
                    </span>
                    <span style="font-size: 12px; color: #94a3b8;">${p.Area || 'Unknown Area'}</span>
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markers.current.push(marker);
      });

      // Add radar expanding wave effect
      createExpandingRadar(map.current);
    });

    // Clean up map instance
    return () => {
      if (radarInterval.current) {
        clearInterval(radarInterval.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [complaints]);

  // Radar effect (expanding pulse)
  function createExpandingRadar(mapInstance) {
    if (!mapInstance || !mapInstance.getStyle()) return;
    
    let radius = 500;
    let maxR = 3000;
    let circleId = 0;

    const animate = () => {
      // Check if map is still valid
      if (!mapInstance || !mapInstance.getStyle()) return;
      
      radius += 100;

      if (radius > maxR) {
        radius = 500;
      }

      // Create a new circle for each pulse
      const circleSourceId = `radar-source-${circleId}`;
      const circleLayerId = `radar-wave-${circleId}`;

      try {
        // Remove old circle if it exists
        if (mapInstance.getSource && mapInstance.getSource(circleSourceId)) {
          if (mapInstance.getLayer(circleLayerId)) {
            mapInstance.removeLayer(circleLayerId);
          }
          mapInstance.removeSource(circleSourceId);
        }

        // Add new circle
        mapInstance.addSource(circleSourceId, {
          type: "geojson",
          data: circleGeoJSON(radius)
        });

        mapInstance.addLayer({
          id: circleLayerId,
          type: "fill",
          source: circleSourceId,
          paint: {
            "fill-color": "rgba(0, 200, 255, 0.1)",
            "fill-outline-color": "rgba(0, 200, 255, 0.5)"
          }
        });
      } catch (error) {
        console.warn("Error updating radar effect:", error);
      }

      circleId = (circleId + 1) % 5; // Keep only 5 circles max
    };

    // Start animation
    radarInterval.current = setInterval(animate, 200);
  }

  function circleGeoJSON(r) {
    const center = [75.124, 15.364];
    const points = 64;
    const coords = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = (r / 111320) * Math.cos(angle);
      const dy = (r / 111320) * Math.sin(angle);
      coords.push([center[0] + dx, center[1] + dy]);
    }

    coords.push(coords[0]);

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [coords] }
        }
      ]
    };
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-xl overflow-hidden relative"
      style={{ minHeight: '400px' }}
    >
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }
        
        .marker {
          position: relative;
        }
        
        .marker::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: inherit;
          z-index: -1;
          filter: blur(4px);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}