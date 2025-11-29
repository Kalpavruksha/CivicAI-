import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="holo p-8 text-center">
        <h1 className="text-neon-blue text-4xl font-bold glow mb-4">Civic AI — Hubli & Dharwad</h1>
        <p className="text-xl mb-8">RAG-powered Action Recommendations & Complaint Assistant</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="holo p-6 animate-float">
            <h2 className="text-neon-blue text-2xl mb-3">Dashboard</h2>
            <p className="mb-4">City intelligence panel with live metrics</p>
          </div>
          
          <div className="holo p-6 animate-float">
            <h2 className="text-neon-blue text-2xl mb-3">Smart Map</h2>
            <p className="mb-4">3D globe visualization of city issues</p>
          </div>
          
          <div className="holo p-6 animate-float">
            <h2 className="text-neon-blue text-2xl mb-3">AI Vision</h2>
            <p className="mb-4">YOLO detection for potholes, garbage, and hazards</p>
          </div>
          
          <div className="holo p-6 animate-float">
            <h2 className="text-neon-blue text-2xl mb-3">Heatmap</h2>
            <p className="mb-4">Complaint density visualization with urgency alerts</p>
          </div>
          
          <div className="holo p-6 animate-float">
            <h2 className="text-neon-blue text-2xl mb-3">History</h2>
            <p className="mb-4">Past detections with YOLO bounding boxes</p>
          </div>
          
          <div className="holo p-6 animate-float">
            <h2 className="text-neon-blue text-2xl mb-3">RAG Insights</h2>
            <p className="mb-4">AI-powered recommendations from municipal documents</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}