import { useEffect, useState } from "react";

const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2];

export default function Zoom() {
  const [zoomIndex, setZoomIndex] = useState(() => {
    const saved = localStorage.getItem("textZoomIndex");
    return saved !== null ? Number(saved) : 0;
  });

  const [magnifierMode, setMagnifierMode] = useState(() => {
    return localStorage.getItem("magnifierMode") === "true";
  });

  useEffect(() => {
    const scale = ZOOM_LEVELS[zoomIndex] || 1;
    document.documentElement.style.setProperty("--text-scale", String(scale));
    localStorage.setItem("textZoomIndex", String(zoomIndex));
  }, [zoomIndex]);

  useEffect(() => {
    if (magnifierMode) {
      document.body.classList.add("magnifier-mode");
    } else {
      document.body.classList.remove("magnifier-mode");
    }

    localStorage.setItem("magnifierMode", String(magnifierMode));

    return () => {
      document.body.classList.remove("magnifier-mode");
    };
  }, [magnifierMode]);

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;

      if (isTyping) return;

      if (e.key.toLowerCase() === "m") {
        setMagnifierMode((prev) => !prev);
      }

      if (e.key === "Escape") {
        setMagnifierMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="zoom-toolbar" role="region" aria-label="Accessibility controls">
      <div className="zoom-label">Accessibility</div>
      <div className="zoom-percent">Text Size: {currentPercent}%</div>

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

      <div className="magnifier-section">
        <button
          type="button"
          className={`zoom-btn magnifier-btn ${magnifierMode ? "active" : ""}`}
          onClick={() => setMagnifierMode((prev) => !prev)}
          aria-pressed={magnifierMode}
          aria-label="Toggle magnifier mode"
          title="Toggle magnifier mode"
        >
          🔍
        </button>
      </div>

      <div className="zoom-hint">Press M to toggle lens. Esc turns it off.</div>
    </div>
  );
}