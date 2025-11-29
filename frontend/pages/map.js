import Layout from "../components/Layout";

export default function Map() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">3D City Globe</h1>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-cyan-500/10 mb-6">
                <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">3D Globe Visualization</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                The 3D city globe visualization is currently unavailable. Please visit the dashboard to view the 2D map visualization of civic issues.
              </p>
              <a 
                href="/dashboard" 
                className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}