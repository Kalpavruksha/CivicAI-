import Layout from "../components/Layout";
import LoadingScanner from "../components/LoadingScanner";
import IncidentTimeline from "../components/IncidentTimeline";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const UltraSmartCityMap = dynamic(
  () => import("../components/UltraSmartCityMap"),
  { ssr: false }
);

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [history, setHistory] = useState([]);
  const [inputText, setInputText] = useState("");
  const [stats, setStats] = useState({
    totalComplaints: 412,
    highPriority: 39,
    aiActions: 128,
    resolved: 287
  });

  useEffect(() => {
    // Fetch timeline data
    fetch("http://localhost:8005/timeline")
      .then(res => res.json())
      .then(data => setTimeline(data))
      .catch(err => console.error("Timeline fetch error:", err));
      
    // Fetch map data
    fetch("http://localhost:8005/complaints/map")
      .then(res => res.json())
      .then(data => setMapData(data.data))
      .catch(err => console.error("Map data fetch error:", err));
      
    // Load history from localStorage
    const h = localStorage.getItem("rag_history");
    if (h) setHistory(JSON.parse(h));
  }, []);

  async function simulateScan() {
    setLoading(true);
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 3000));
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8005/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      
      const result = await response.json();
      
      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        question: inputText,
        result: result,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)]; // Keep only last 10 items
      setHistory(updatedHistory);
      localStorage.setItem("rag_history", JSON.stringify(updatedHistory));
      
      // Clear input
      setInputText("");
    } catch (error) {
      console.error("Error submitting complaint:", error);
    } finally {
      setLoading(false);
    }
  }

  // Transform history data to match the expected format and filter out invalid entries
  const complaintData = history
    .map(h => ({
      Longitude: h.result?.location?.lng || 75.1239,
      Latitude: h.result?.location?.lat || 15.3647,
      Category: h.result?.category || "Unknown",
      ComplaintText: h.question || "No description",
      Urgency: h.result?.urgency || "Medium",
      Area: h.result?.area || "Unknown Area"
    }))
    .filter(p => {
      const longitude = parseFloat(p.Longitude);
      const latitude = parseFloat(p.Latitude);
      return !isNaN(longitude) && !isNaN(latitude);
    });

  // Filter mapData to ensure valid coordinates
  const validMapData = mapData.filter(p => {
    const longitude = parseFloat(p.longitude);
    const latitude = parseFloat(p.latitude);
    return !isNaN(longitude) && !isNaN(latitude);
  }).map(p => ({
    Longitude: p.longitude,
    Latitude: p.latitude,
    Category: p.category,
    ComplaintText: p.text,
    Urgency: p.urgency,
    Area: p.area
  }));

  return (
    <Layout>
      {loading && <LoadingScanner />}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 sm:p-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              City Intelligence Command Center
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">Real-time monitoring and analysis of civic issues</p>
          </div>

          {/* Main Input Section */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-4">Report a Civic Issue</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="w-full">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe your civic issue in detail (e.g., 'Large pothole on Station Road causing traffic delays and potential accidents' or 'Garbage not collected in Old Town for days creating health hazards')"
                  className="w-full px-4 py-3 sm:py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {loading ? "Analyzing..." : "Analyze Issue"}
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Enter a detailed description of any civic issue you've observed. Our AI will categorize it, assess urgency, and provide recommendations.
              </p>
            </form>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 255, 255, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Complaints</p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{stats.totalComplaints}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-cyan-500/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(168, 85, 247, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Priority</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-400">{stats.highPriority}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-purple-500/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-green-500/30 shadow-lg shadow-green-500/20"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(72, 187, 120, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Actions</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.aiActions}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-green-500/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-blue-500/30 shadow-lg shadow-blue-500/20"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Resolved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.resolved}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-500/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Map */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Live City Map</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-red-500/20 text-red-400 rounded-full text-xs sm:text-sm">High</span>
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm">Medium</span>
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">Low</span>
                  </div>
                </div>
                <div className="h-80 sm:h-96 rounded-xl overflow-hidden">
                  <UltraSmartCityMap complaints={complaintData.length > 0 ? complaintData : validMapData} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-400 mb-4 sm:mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Pothole detected near Station Road</h3>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">Reported 2 hours ago • Hubli Central</p>
                      <div className="flex items-center mt-2 flex-wrap gap-1">
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">High Priority</span>
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">Pothole</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Drainage issue reported in Old Town</h3>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">Reported 4 hours ago • Dharwad East</p>
                      <div className="flex items-center mt-2 flex-wrap gap-1">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Medium Priority</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Drainage</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Garbage collection completed</h3>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">Completed 6 hours ago • Hubli West</p>
                      <div className="flex items-center mt-2 flex-wrap gap-1">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Resolved</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Garbage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 sm:space-y-8">
              {/* Incident Timeline */}
              {timeline && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-green-500/30 shadow-lg shadow-green-500/10">
                  <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-4 sm:mb-6">Incident Timeline</h2>
                  <IncidentTimeline data={timeline} />
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mb-4 sm:mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <Link href="/detect" className="block">
                    <motion.div 
                      className="p-3 sm:p-4 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl border border-purple-500/30 hover:from-purple-600/50 hover:to-blue-600/50 transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-purple-500/20 mr-3 sm:mr-4">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Run YOLO Detection</h3>
                          <p className="text-gray-400 text-xs sm:text-sm">Analyze images for civic issues</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/map" className="block">
                    <motion.div 
                      className="p-3 sm:p-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-xl border border-cyan-500/30 hover:from-cyan-600/50 hover:to-blue-600/50 transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-cyan-500/20 mr-3 sm:mr-4">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">View Smart Map</h3>
                          <p className="text-gray-400 text-xs sm:text-sm">3D visualization of city issues</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/heatmap" className="block">
                    <motion.div 
                      className="p-3 sm:p-4 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-xl border border-red-500/30 hover:from-red-600/50 hover:to-orange-600/50 transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-red-500/20 mr-3 sm:mr-4">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Analyze Heatmap</h3>
                          <p className="text-gray-400 text-xs sm:text-sm">Complaint density visualization</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>

                  <button 
                    onClick={simulateScan} 
                    className="p-3 sm:p-4 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-xl border border-indigo-500/30 hover:from-indigo-600/50 hover:to-purple-600/50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-indigo-500/20 mr-3 sm:mr-4">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Run System Scan</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Perform comprehensive analysis</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}