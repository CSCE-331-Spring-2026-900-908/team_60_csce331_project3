import { useEffect, useState } from "react";

const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2];

const TEXT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, span, button, a, label, li, td, th, div";

function getReadableText(element) {
  if (!element) return "";

  const raw = (element.innerText || element.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw) return "";
  if (raw.length > 220) return `${raw.slice(0, 217)}...`;

  return raw;
}

function findTextElement(target) {
  if (!(target instanceof Element)) return null;

  const candidate = target.closest(TEXT_SELECTOR);
  if (!candidate) return null;

  const text = getReadableText(candidate);
  if (!text) return null;

  return candidate;
}

export default function Zoom() {
  const [zoomIndex, setZoomIndex] = useState(() => {
    const saved = localStorage.getItem("textZoomIndex");
    return saved !== null ? Number(saved) : 0;
  });

  const [overlayOpen, setOverlayOpen] = useState(() => {
    return localStorage.getItem("zoomOverlayOpen") === "true";
  });

  const [magnifierMode, setMagnifierMode] = useState(() => {
    return localStorage.getItem("magnifierMode") === "true";
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("highContrastMode") === "true";
  });

  const [lens, setLens] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    style: {},
  });

  useEffect(() => {
    const scale = ZOOM_LEVELS[zoomIndex] || 1;
    document.documentElement.style.setProperty("--text-scale", String(scale));
    localStorage.setItem("textZoomIndex", String(zoomIndex));
  }, [zoomIndex]);

  useEffect(() => {
    localStorage.setItem("zoomOverlayOpen", String(overlayOpen));
  }, [overlayOpen]);

  useEffect(() => {
    localStorage.setItem("magnifierMode", String(magnifierMode));

    if (!magnifierMode) {
      setLens((prev) => ({ ...prev, visible: false }));
    }
  }, [magnifierMode]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast-mode");
    } else {
      document.body.classList.remove("high-contrast-mode");
    }

    localStorage.setItem("highContrastMode", String(highContrast));

    return () => {
      document.body.classList.remove("high-contrast-mode");
    };
  }, [highContrast]);

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

  useEffect(() => {
    if (!magnifierMode) return;

    function handleMouseMove(e) {
      const target = e.target;

      if (!(target instanceof Element)) return;

      if (target.closest(".zoom-widget") || target.closest(".live-lens")) {
        setLens((prev) => ({ ...prev, visible: false }));
        return;
      }

      const textElement = findTextElement(target);

      if (!textElement) {
        setLens((prev) => ({ ...prev, visible: false }));
        return;
      }

      const computed = window.getComputedStyle(textElement);
      const text = getReadableText(textElement);

      const fontSize = parseFloat(computed.fontSize || "16");
      const lensX = Math.min(e.clientX + 26, window.innerWidth - 210);
      const lensY = Math.min(e.clientY - 30, window.innerHeight - 210);

      setLens({
        visible: true,
        x: Math.max(12, lensX),
        y: Math.max(12, lensY),
        text,
        style: {
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          color: computed.color,
          letterSpacing: computed.letterSpacing,
          textTransform: computed.textTransform,
          textAlign: computed.textAlign,
          fontSize: `${Math.min(Math.max(fontSize * 1.5, 18), 42)}px`,
          lineHeight: "1.35",
        },
      });
    }

    function handleMouseLeave() {
      setLens((prev) => ({ ...prev, visible: false }));
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [magnifierMode]);

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
    <>
      <div className="zoom-widget" role="region" aria-label="Accessibility controls">
        {overlayOpen && (
          <div className="zoom-toolbar">
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

              <button
                type="button"
                className={`zoom-btn contrast-btn ${highContrast ? "active" : ""}`}
                onClick={() => setHighContrast((prev) => !prev)}
                aria-pressed={highContrast}
                aria-label="Toggle high contrast mode"
              >
                {highContrast ? "Contrast On" : "High Contrast"}
              </button>
            </div>

            <div className="magnifier-row">
              <button
                type="button"
                className={`magnifier-toggle ${magnifierMode ? "active" : ""}`}
                onClick={() => setMagnifierMode((prev) => !prev)}
                aria-pressed={magnifierMode}
                aria-label="Toggle live magnifier lens"
                title="Toggle live magnifier lens"
              >
                🔍
              </button>

              <span className="magnifier-status">
                {magnifierMode ? "Lens On" : "Lens Off"}
              </span>
            </div>

            <div className="zoom-hint">M toggles the lens. Esc turns it off.</div>
          </div>
        )}

        <button
          type="button"
          className="zoom-fab"
          onClick={() => setOverlayOpen((prev) => !prev)}
          aria-label={
            overlayOpen ? "Hide accessibility controls" : "Show accessibility controls"
          }
          title={
            overlayOpen ? "Hide accessibility controls" : "Show accessibility controls"
          }
        >
          🔍
        </button>
      </div>

      {magnifierMode && lens.visible && (
        <div
          className="live-lens"
          aria-hidden="true"
          style={{
            left: `${lens.x}px`,
            top: `${lens.y}px`,
          }}
        >
          <div className="live-lens-inner">
            <div className="live-lens-text" style={lens.style}>
              {lens.text}
            </div>
          </div>
        </div>
      )}
    </>
  );
}