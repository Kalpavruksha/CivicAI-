import Layout from "../components/Layout";
import LoadingScanner from "../components/LoadingScanner";
import { useState } from "react";

export default function Vision() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function detect() {
    if (!image) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("http://localhost:8003/detect", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Detection error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      {loading && <LoadingScanner />}
      
      <div className="holo p-6">
        <h2 className="text-neon-blue text-2xl mb-4 glow">AI Vision Scanner</h2>

        <input
          type="file"
          className="mb-4"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button 
          onClick={detect} 
          className="holo p-3 bg-neon-blue/20"
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan Image"}
        </button>
      </div>
    </Layout>
  );
}