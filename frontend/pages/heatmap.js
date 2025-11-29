import Layout from "../components/Layout";
import LoadingScanner from "../components/LoadingScanner";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// dynamic import because Next SSR + leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(mod => mod.CircleMarker), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:8005";

// helper color scale (count + urgency influence)
function colorFor(count, urgencyLabel) {
  // base by count
  if (count >= 25) return "#ef4444"; // red
  if (count >= 12) return "#f97316"; // orange
  if (count >= 6) return "#eab308";  // yellow
  if (count >= 3) return "#22c55e";  // green
  return "#3b82f6";                  // blue
}

function radiusFor(count) {
  // radius in pixels (adjust)
  return Math.min(40, 8 + Math.log2(count + 1) * 4);
}

export default function HeatmapPage() {
  const [hotspots, setHotspots] = useState([]);
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [zoomCenter, setZoomCenter] = useState([15.3647, 75.1239]); // Hubli center
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/hotspots`)
      .then(r => r.json())
      .then(d => {
        // Filter out hotspots with invalid coordinates
        const validHotspots = (d.hotspots || []).filter(h => {
          const lat = parseFloat(h.lat);
          const lng = parseFloat(h.lng);
          return !isNaN(lat) && !isNaN(lng);
        });
        setHotspots(validHotspots);
        setLoading(false);
      })
      .catch(err => {
        console.error("hotspots error", err);
        setLoading(false);
      });
  }, []);

  function filtered() {
    if (filterUrgency === "All") return hotspots;
    return hotspots.filter(h => h.avg_urgency_label === filterUrgency);
  }

  async function requestRag(area, sample_text) {
    // ask /analyze to get RAG action for the area (we craft a question)
    const question = `There are ${area} with many complaints: ${sample_text}. What should authorities do?`;
    const res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: question, top_k: 3 })
    });
    const data = await res.json();
    return data;
  }

  return (
    <Layout>
      {loading && <LoadingScanner />}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Complaints Heatmap
            </h1>
            <p className="text-gray-300">Density visualization of civic issues across Hubli-Dharwad region</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400">Complaint Density Map</h2>
                <p className="text-gray-400">Areas with high concentration of complaints. Click on markers for AI recommendations.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="font-medium text-gray-300 mb-2">Filter by Urgency</div>
                  <select 
                    className="bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={filterUrgency} 
                    onChange={e=>setFilterUrgency(e.target.value)}
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="font-medium text-gray-300 mb-2">Legend</div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-xs text-gray-300">Severe</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                      <span className="text-xs text-gray-300">High</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-xs text-gray-300">Medium</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-300">Low</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-xs text-gray-300">Minimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[70vh] rounded-xl overflow-hidden border border-gray-700">
              <MapContainer
                center={zoomCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {filtered().map((h, idx) => {
                  const color = colorFor(h.count, h.avg_urgency_label);
                  const radius = radiusFor(h.count);
                  const isHigh = h.avg_urgency_label === "High";

                  // For pulsing: create DivIcon for high severity
                  if (isHigh) {
                    const html = `
                      <div class="relative">
                        <div class="w-4 h-4 bg-red-500 rounded-full animate-ping absolute opacity-75"></div>
                        <div class="w-4 h-4 bg-red-500 rounded-full relative"></div>
                      </div>
                    `;
                    const icon = L.divIcon({
                      html,
                      className: "",
                      iconSize: [16, 16],
                      iconAnchor: [8, 8]
                    });

                    return (
                      <Marker key={idx} position={[h.lat, h.lng]} icon={icon}>
                        <Popup>
                          <div className="min-w-[280px] bg-gray-800 rounded-lg p-4 border border-cyan-500/30">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-cyan-400 text-lg">{h.area}</h3>
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                                HIGH PRIORITY
                              </span>
                            </div>
                            <div className="text-gray-300 text-sm mb-3">
                              <div className="flex justify-between">
                                <span>Complaints:</span>
                                <span className="font-medium">{h.count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Urgency:</span>
                                <span className="font-medium">{h.avg_urgency_label}</span>
                              </div>
                            </div>
                            <div className="bg-gray-700/50 rounded p-3 mb-3">
                              <p className="text-gray-200 text-sm">{h.sample_text}</p>
                            </div>
                            <button 
                              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium"
                              onClick={async (e)=>{
                                e.preventDefault();
                                const popup = e.target.closest(".leaflet-popup-content");
                                const existingResult = popup.querySelector(".rag_result");
                                if (existingResult) existingResult.remove();
                                
                                const loadingEl = document.createElement("div");
                                loadingEl.className = "rag_result text-center py-3 text-gray-400";
                                loadingEl.innerHTML = '<div class="flex justify-center"><div class="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>';
                                popup.appendChild(loadingEl);
                                
                                try {
                                  const res = await requestRag(h.area, h.sample_text);
                                  const result = res.recommended_action || res.answer || JSON.stringify(res, null, 2);
                                  loadingEl.innerHTML = `
                                    <div class="bg-gray-700/50 rounded p-3">
                                      <h4 class="font-bold text-cyan-400 mb-2">AI Recommendation</h4>
                                      <p class="text-gray-200 text-sm">${result}</p>
                                    </div>
                                  `;
                                  loadingEl.className = "rag_result";
                                } catch (err) {
                                  loadingEl.innerHTML = `<div class="text-red-400">Error fetching recommendation</div>`;
                                }
                              }}
                            >
                              Get AI Recommendation
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }

                  // Normal weighted circle marker
                  return (
                    <CircleMarker
                      key={idx}
                      center={[h.lat, h.lng]}
                      radius={radius}
                      fillOpacity={0.6}
                      stroke={true}
                      weight={1}
                      color="#ffffff"
                      fillColor={color}
                    >
                      <Popup>
                        <div className="min-w-[280px] bg-gray-800 rounded-lg p-4 border border-cyan-500/30">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-cyan-400 text-lg">{h.area}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              h.avg_urgency_label === 'High' ? 'bg-red-500/20 text-red-400' :
                              h.avg_urgency_label === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {h.avg_urgency_label} PRIORITY
                            </span>
                          </div>
                          <div className="text-gray-300 text-sm mb-3">
                            <div className="flex justify-between">
                              <span>Complaints:</span>
                              <span className="font-medium">{h.count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Urgency:</span>
                              <span className="font-medium">{h.avg_urgency_label}</span>
                            </div>
                          </div>
                          <div className="bg-gray-700/50 rounded p-3 mb-3">
                            <p className="text-gray-200 text-sm">{h.sample_text}</p>
                          </div>
                          <button 
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium"
                            onClick={async (e)=>{
                              e.preventDefault();
                              const popup = e.target.closest(".leaflet-popup-content");
                              const existingResult = popup.querySelector(".rag_result");
                              if (existingResult) existingResult.remove();
                              
                              const loadingEl = document.createElement("div");
                              loadingEl.className = "rag_result text-center py-3 text-gray-400";
                              loadingEl.innerHTML = '<div class="flex justify-center"><div class="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>';
                              popup.appendChild(loadingEl);
                              
                              try {
                                const res = await requestRag(h.area, h.sample_text);
                                const result = res.recommended_action || res.answer || JSON.stringify(res, null, 2);
                                loadingEl.innerHTML = `
                                  <div class="bg-gray-700/50 rounded p-3">
                                    <h4 class="font-bold text-cyan-400 mb-2">AI Recommendation</h4>
                                    <p class="text-gray-200 text-sm">${result}</p>
                                  </div>
                                `;
                                loadingEl.className = "rag_result";
                              } catch (err) {
                                loadingEl.innerHTML = `<div class="text-red-400">Error fetching recommendation</div>`;
                              }
                            }}
                          >
                            Get AI Recommendation
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-red-500/20 mr-3">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">High Priority Areas</p>
                    <p className="text-xl font-bold text-red-400">
                      {hotspots.filter(h => h.avg_urgency_label === "High").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-500/20 mr-3">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Complaints</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {hotspots.reduce((sum, h) => sum + h.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-500/20 mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Areas Monitored</p>
                    <p className="text-xl font-bold text-green-400">
                      {hotspots.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}