import { Link } from "react-router-dom";
import Weather from "../components/Weather";
import ChatBot from "../components/ChatBot";

export default function PortalPage() {
  const cardStyle = {
    background: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
    backdropFilter: "blur(12px)",         // Glass effect
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
  };

  const titleStyle = {
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    fontWeight: "600",
    textTransform: "lowercase",
    color: "#2d6a4f", // Deep forest green for titles
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
      backgroundColor: "#e8f5e9", // The Mint Green background
      fontFamily: "var(--sans)", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative"
    }}>
      
      {/* Weather Widget */}
      <div style={{ 
        position: "absolute", 
        top: "2rem", 
        right: "2rem",
        background: "rgba(255, 255, 255, 0.5)",
        padding: "0.5rem 1.2rem",
        borderRadius: "50px",
        backdropFilter: "blur(5px)"
      }}>
        <Weather />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ 
          fontSize: "4.5rem", 
          margin: "0", 
          fontWeight: "800", 
          letterSpacing: "-0.05em",
          color: "#1b4332" 
        }}>
          aura <span style={{fontWeight:'300'}}>boba</span>
        </h1>
        <p style={{ 
          color: "#2d6a4f", 
          fontSize: "0.75rem", 
          marginTop: "10px", 
          textTransform: "uppercase",
          letterSpacing: "0.6rem",
          opacity: 0.6
        }}>
          est. 2026
        </p>
      </div>

      {/* The Restored Grid of 5 Cards */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "2rem", 
        justifyContent: "center", 
        maxWidth: "1000px" 
      }}>
        
        <Link to="/customer" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>kiosk</h2>
          <p style={descStyle}>self-service ordering</p>
        </Link>

        <Link to="/cashierpage" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>cashier</h2>
          <p style={descStyle}>in-store processing</p>
        </Link>

        <Link to="/kitchen" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>kitchen</h2>
          <p style={descStyle}>order fulfillment queue</p>
        </Link>

        <Link to="/manager" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>manager</h2>
          <p style={descStyle}>stats and inventory</p>
        </Link>

        <Link to="/menuboard" style={cardStyle} className="hover-lift">
          <h2 style={titleStyle}>menu</h2>
          <p style={descStyle}>digital storefront display</p>
        </Link>

      </div>

      <ChatBot />

      {/* Small hover effect logic (Internal CSS) */}
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