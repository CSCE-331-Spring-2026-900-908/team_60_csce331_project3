import { Link } from "react-router-dom";
import Weather from "../components/Weather";
import ChatBot from "../components/ChatBot";

export default function PortalPage() {
  const cardStyle = {
    background: "#1f2028",
    border: "1px solid #2e303a",
    borderRadius: "16px",
    padding: "2rem",
    width: "280px", 
    textAlign: "center",
    textDecoration: "none",
    color: "white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "transform 0.2s ease, background 0.2s ease",
  };

  const titleStyle = {
    margin: "0 0 12px 0",
    fontSize: "1.6rem",
    fontWeight: "bold",
  };

  const descStyle = {
    color: "#9ca3af",
    fontSize: "0.95rem",
    margin: 0,
    lineHeight: "1.5",
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#16171d",
      color: "white",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative" // Added to help with weather placement
    }}>
      
      {/* Weather Section - Positioned at the top */}
      <div style={{ 
        position: "absolute", 
        top: "2rem", 
        right: "2rem" 
      }}>
        <Weather />
      </div>

      {/* Header Section */}
      <div style={{ textAlign: "center", marginBottom: "5rem" }}>
        <h1 style={{ 
          fontSize: "5rem", 
          margin: "0", 
          fontWeight: "900", 
          letterSpacing: "-3px",
          lineHeight: "0.9" 
        }}>
          Boba Tea
        </h1>
        <p style={{ 
          color: "#aa3bff", 
          fontSize: "1.1rem", 
          marginTop: "20px", 
          fontWeight: "800", 
          textTransform: "uppercase",
          letterSpacing: "4px" 
        }}>
          System Portal
        </p>
      </div>

      {/* Grid of 5 Clickable Cards */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "2.5rem", 
        justifyContent: "center", 
        maxWidth: "1100px" 
      }}>
        
        <Link to="/customer" style={{ ...cardStyle, borderTop: "6px solid #aa3bff" }}>
          <h2 style={titleStyle}>Customer Kiosk</h2>
          <p style={descStyle}>Self-service drink browsing and ordering</p>
        </Link>

        <Link to="/cashierpage" style={{ ...cardStyle, borderTop: "6px solid #3498db" }}>
          <h2 style={titleStyle}>Cashier</h2>
          <p style={descStyle}>Process in-store orders and payments</p>
        </Link>

        <Link to="/kitchen" style={{ ...cardStyle, borderTop: "6px solid #2ecc71" }}>
          <h2 style={titleStyle}>Kitchen View</h2>
          <p style={descStyle}>Manage the active order queue</p>
        </Link>

        <Link to="/manager" style={{ ...cardStyle, borderTop: "6px solid #e74c3c" }}>
          <h2 style={titleStyle}>Manager</h2>
          <p style={descStyle}>View analytics, sales, and inventory</p>
        </Link>

        <Link to="/menuboard" style={{ ...cardStyle, borderTop: "6px solid #f1c40f" }}>
          <h2 style={titleStyle}>Menu Board</h2>
          <p style={descStyle}>Digital signage for customer display</p>
        </Link>

      </div>
      <ChatBot />
    </div>
  );
}