import { useEffect, useState } from "react";

const ZOOM_LEVELS = [1, 1.1, 1.2, 1.3, 1.45];

export default function Zoom() {
  const [zoomIndex, setZoomIndex] = useState(() => {
    const saved = localStorage.getItem("textZoomIndex");
    return saved !== null ? Number(saved) : 0;
  });

  useEffect(() => {
    const scale = ZOOM_LEVELS[zoomIndex] || 1;
    document.documentElement.style.setProperty("--text-scale", String(scale));
    localStorage.setItem("textZoomIndex", String(zoomIndex));
  }, [zoomIndex]);

  function increaseZoom() {
    setZoomIndex((prev) => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
  }

  function decreaseZoom() {
    setZoomIndex((prev) => Math.max(prev - 1, 0));
  }

  function resetZoom() {
    setZoomIndex(0);
  }

  const currentPercent = Math.round((ZOOM_LEVELS[zoomIndex] || 1) * 100);

  return (
    <div className="zoom-toolbar" role="region" aria-label="Zoom controls">
      <div className="zoom-label">Text Size</div>
      <div className="zoom-percent">{currentPercent}%</div>

      <div className="zoom-buttons">
        <button
          type="button"
          className="zoom-btn"
          onClick={decreaseZoom}
          aria-label="Decrease text size"
        >
          A-
        </button>

        <button
          type="button"
          className="zoom-btn"
          onClick={increaseZoom}
          aria-label="Increase text size"
        >
          A+
        </button>

        <button
          type="button"
          className="zoom-btn reset"
          onClick={resetZoom}
          aria-label="Reset text size"
        >
          Reset
        </button>
      </div>
    </div>
  );
}