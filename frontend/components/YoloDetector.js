"use client";
import { useState, useRef } from "react";

export default function YoloDetector() {
  const [imageURL, setImageURL] = useState(null);
  const [renderedImage, setRenderedImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const canvasRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const localURL = URL.createObjectURL(file);
    setImageURL(localURL);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8001/yolo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setDetections(data.detections);
    setRenderedImage(`data:image/png;base64,${data.rendered_image}`);

    drawCanvasBoxes(localURL, data.detections, data.width, data.height);
  };

  const drawCanvasBoxes = (imgURL, boxes, imgW, imgH) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = imgURL;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      boxes.forEach((b) => {
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;

        ctx.strokeRect(
          b.x - b.width / 2,
          b.y - b.height / 2,
          b.width,
          b.height
        );

        ctx.fillStyle = "lime";
        ctx.font = "20px Arial";
        ctx.fillText(b.class, b.x - b.width / 2, b.y - b.height / 2 - 5);
      });
    };
  };

  return (
    <div className="p-8 flex flex-col gap-4">
      <input type="file" onChange={handleUpload} />

      {/* CANVAS DRAW OUTPUT */}
      <canvas ref={canvasRef} className="border shadow-md" />

      {/* FALLBACK: RENDERED IMAGE */}
      {renderedImage && (
        <div>
          <h3 className="font-bold mt-6">Rendered fallback:</h3>
          <img src={renderedImage} alt="rendered" />
        </div>
      )}
    </div>
  );
}