import Layout from "../components/Layout";
import LoadingScanner from "../components/LoadingScanner";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8004/history")
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("History fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      {loading && <LoadingScanner />}
      
      <div className="holo p-6">
        <h1 className="text-neon-blue text-3xl glow mb-4">Detection History</h1>
        <p className="text-gray-400 mb-6">Previously detected civic issues</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item.id} className="holo p-4 relative">
              <h2 className="text-neon-blue font-semibold text-lg capitalize mb-2">
                {item.category}
              </h2>
              <p className="text-sm text-gray-400 mb-1">{item.urgency} urgency</p>
              <p className="text-sm text-gray-400 mb-3">Area: {item.area}</p>

              {item.image ? (
                <img
                  src={`data:image/png;base64,${item.image}`}
                  className="rounded-md w-full mt-3"
                />
              ) : (
                <div className="bg-neon-blue/10 rounded-md w-full h-32 flex items-center justify-center mt-3">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              <details className="mt-3">
                <summary className="cursor-pointer font-medium text-neon-purple">
                  YOLO Boxes
                </summary>
                <pre className="text-xs mt-2 bg-neon-blue/10 p-2 rounded overflow-x-auto">
                  {JSON.stringify(item.yolo_boxes, null, 2)}
                </pre>
              </details>

              <p className="text-xs text-gray-500 mt-3">
                {item.timestamp}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}