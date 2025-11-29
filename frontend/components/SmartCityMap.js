"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function SmartCityMap({ complaints }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [75.1239, 15.3647], // Hubli
      zoom: 12.5,
      pitch: 55,
      bearing: -15,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add complaints as markers
      complaints.forEach((c) => {
        new maplibregl.Marker({
          color:
            c.urgency === "High"
              ? "#ff0033"
              : c.urgency === "Medium"
              ? "#ffaa00"
              : "#00ff66",
        })
          .setLngLat([c.longitude, c.latitude])
          .setPopup(
            new maplibregl.Popup().setHTML(`
              <div style="color:white;">
                <b>${c.category}</b><br>
                Urgency: ${c.urgency}<br>
                ${c.area}<br>
                <small>${c.text}</small>
              </div>
            `)
          )
          .addTo(map);
      });
    });

    // Clean up map instance
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [complaints]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[600px] rounded-xl overflow-hidden shadow-neon"
    ></div>
  );
}