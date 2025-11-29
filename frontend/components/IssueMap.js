"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Marker icons for categories
const icons = {
  pothole: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  garbage: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  drainage: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  hazard: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
};

export default function IssueMap() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // In a real implementation, this would fetch from your backend
    // For now, we'll use mock data
    const mockIssues = [
      {
        id: 1,
        lat: 15.3647,
        lng: 75.1239,
        category: "pothole",
        urgency: "High",
        area: "Hubli Central",
        image: null
      },
      {
        id: 2,
        lat: 15.3547,
        lng: 75.1339,
        category: "garbage",
        urgency: "Medium",
        area: "Dharwad East",
        image: null
      },
      {
        id: 3,
        lat: 15.3747,
        lng: 75.1139,
        category: "drainage",
        urgency: "High",
        area: "Hubli West",
        image: null
      },
      {
        id: 4,
        lat: 15.3847,
        lng: 75.1439,
        category: "hazard",
        urgency: "Critical",
        area: "Dharwad Central",
        image: null
      }
    ];
    setIssues(mockIssues);
  }, []);

  return (
    <div className="w-full h-[600px] rounded-lg shadow-md overflow-hidden">
      <MapContainer
        center={[15.3647, 75.1239]} // Hubli–Dharwad center
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={icons[issue.category] || icons.hazard}
          >
            <Popup>
              <div className="space-y-2">
                <h2 className="font-bold text-lg capitalize">
                  {issue.category}
                </h2>
                <p><strong>Urgency:</strong> {issue.urgency}</p>
                <p><strong>Area:</strong> {issue.area}</p>

                {issue.image && (
                  <img
                    src={`data:image/png;base64,${issue.image}`}
                    className="w-full rounded-md mt-2"
                    alt="Issue"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}