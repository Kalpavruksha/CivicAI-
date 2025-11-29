// pages/_app.js
import "../styles/globals.css";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/cyberpunk-map.css";
import "../styles/heatmap.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}