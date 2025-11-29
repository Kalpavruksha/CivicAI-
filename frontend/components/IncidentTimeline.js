import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function IncidentTimeline({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");

    // Neon Glow Shadow Plugin
    const neonShadow = {
      id: "neonShadow",
      beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.shadowColor = "#0ff";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      },
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.restore();
      }
    };

    chartRef.current = new Chart(ctx, {
      type: "line",
      plugins: [neonShadow],
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Potholes",
            data: data.potholes,
            borderColor: "#00eaff",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#00eaff",
            pointGlow: true
          },
          {
            label: "Garbage",
            data: data.garbage,
            borderColor: "#b100ff",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#b100ff"
          },
          {
            label: "Electricity",
            data: data.electricity,
            borderColor: "#ff00d4",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#ff00d4"
          }
        ]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1200
        },
        scales: {
          x: {
            ticks: { color: "#6ee7ff" },
            grid: { color: "rgba(0, 255, 255, 0.1)" }
          },
          y: {
            ticks: { color: "#6ee7ff" },
            grid: { color: "rgba(0, 255, 255, 0.1)" }
          }
        },
        plugins: {
          legend: {
            labels: { color: "#ffffff", font: { size: 12 } }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="bg-[#0a0f19] p-4 rounded-lg shadow-neon w-full">
      <h2 className="text-neon-blue text-xl mb-3">Incident Timeline</h2>
      <canvas ref={canvasRef} height={120}></canvas>
    </div>
  );
}