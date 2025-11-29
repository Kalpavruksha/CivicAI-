/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: "#00eaff",
          purple: "#a855f7",
          dark: "#0a0f1f",
        }
      },
      boxShadow: {
        neon: "0 0 15px #00eaff, 0 0 30px #008fb3",
        neonPurple: "0 0 15px #a855f7, 0 0 30px #6d28d9",
      },
      backgroundImage: {
        "grid":
          "linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "50px 50px",
      },
      animation: {
        "pulse-slow": "pulse 3s infinite",
        "float": "float 4s ease-in-out infinite",
        "spin-slow": "spin 10s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};