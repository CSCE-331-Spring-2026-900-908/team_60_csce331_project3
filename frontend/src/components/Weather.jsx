import React, { useState, useEffect } from "react";

const Weather = () => {
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/weather")
      .then(res => res.json())
      .then(data => setTemp(data.temp))
      .catch(err => console.error("Frontend fetch failed:", err));
  }, []);

  // Aura loading state
  if (temp === null) return (
    <div style={weatherCapsule}>
      <span style={loadingText}>steeping weather...</span>
    </div>
  );

  // Simple icon logic for boba vibes
  const weatherIcon = temp > 80 ? "☀️" : "☁️";

  return (
    <div style={weatherCapsule}>
      <span style={tempStyle}>{weatherIcon} {temp}°</span>
      <div style={divider}></div>
      <span style={locationStyle}>CSTX</span>
    </div>
  );
};

// --- AURA WEATHER STYLES ---
const weatherCapsule = {
  background: "rgba(255, 255, 255, 0.4)", // Translucent white
  backdropFilter: "blur(10px)",
  padding: "8px 20px",
  borderRadius: "50px", // Pill shape
  border: "1px solid rgba(27, 67, 50, 0.1)", // Soft forest green border
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
  transition: "all 0.3s ease"
};

const tempStyle = {
  fontSize: "0.95rem",
  fontWeight: "800",
  color: "#1b4332", // Forest Green
  letterSpacing: "-0.5px"
};

const divider = {
  width: "1px",
  height: "14px",
  background: "#1b4332",
  opacity: 0.15
};

const locationStyle = {
  color: "#2d6a4f",
  fontSize: "0.7rem",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase",
  opacity: 0.6
};

const loadingText = {
  fontSize: "0.75rem",
  fontWeight: "600",
  color: "#2d6a4f",
  fontStyle: "italic"
};

export default Weather;