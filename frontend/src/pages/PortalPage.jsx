import { Link } from "react-router-dom";
import Weather from "../components/Weather";
import ChatBot from "../components/ChatBot";

export default function PortalPage() {
  // Define the dynamic backend URL
  const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleProtectedLogin = (e) => {
    e.preventDefault();
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    // This must be window.location.href to jump to the backend!
    window.location.href = `${BACKEND_URL}/auth/google`; 
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.4)", 
    borderRadius: "32px",                 
    padding: "2.5rem 1.5rem",
    width: "240px", 
    textAlign: "center",
    textDecoration: "none",
    color: "#1e293b",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer" // Added for the buttons
  };

  const titleStyle = {
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    fontWeight: "600",
    textTransform: "lowercase",
    color: "#2d6a4f", 
  };

  const descStyle = {
    fontSize: "0.85rem",
    color: "#64748b",
    lineHeight: "1.4",
    margin: 0,
    opacity: 0.8
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#e8f5e9",
      fontFamily: "var(--sans)", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative"
    }}>
      
      {/* Weather Widget */}
      <div style={{ position: "absolute", top: "2rem", right: "2rem", background: "#2d6a4f", padding: "0.5rem 1.2rem", borderRadius: "50px" }}>
        <Weather />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "4.5rem", margin: "0", fontWeight: "800", color: "#1b4332" }}>
          aura <span style={{fontWeight:'300'}}>boba</span>
        </h1>
        <p style={{ color: "#2d6a4f", fontSize: "0.75rem", marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.6rem", opacity: 0.6 }}>
          est. 2026
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center", maxWidth: "1000px" }}>
        
        {/* PUBLIC ROUTES: Use standard Link */}
        <Link to="/customer" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>kiosk</h2>
          <p style={descStyle}>self-service ordering</p>
        </Link>

        {/* PROTECTED ROUTES: Redirect to Backend Google Auth */}
        <a href="#" onClick={handleProtectedLogin} style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>cashier</h2>
          <p style={descStyle}>in-store processing</p>
        </a>

        <a href="#" onClick={handleProtectedLogin} style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>kitchen</h2>
          <p style={descStyle}>order fulfillment queue</p>
        </a>

        <a href="#" onClick={handleProtectedLogin} style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>manager</h2>
          <p style={descStyle}>stats and inventory</p>
        </a>

        <Link to="/menuboard" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>menu</h2>
          <p style={descStyle}>digital storefront display</p>
        </Link>

      </div>

      <ChatBot />

      <style>{`
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}