import { useEffect, useState } from "react";
import { fetchSalesSummary } from "../services/api";

export default function ManagerStats() {
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchSalesSummary();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <p>Loading financial data...</p>;

  return (
    <div style={{ 
      display: "flex", 
      gap: "1.5rem", 
      justifyContent: "center", 
      margin: "2rem 0",
      flexWrap: "wrap"
    }}>
      <div style={cardStyle}>
        <h3 style={labelStyle}>Total Revenue</h3>
        <p style={moneyStyle}>${Number(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
      </div>
      <div style={cardStyle}>
        <h3 style={labelStyle}>Total Orders</h3>
        <p style={numberStyle}>{stats.total_orders}</p>
      </div>
    </div>
  );
}

// --- Local Styles ---
const cardStyle = {
  border: "2px solid #aa3bff",
  padding: "2rem",
  borderRadius: "16px",
  background: "rgba(170, 59, 255, 0.05)",
  minWidth: "250px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const labelStyle = { margin: "0 0 10px 0", color: "#6b6375", fontSize: "1rem" };
const moneyStyle = { margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#2ecc71" };
const numberStyle = { margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#aa3bff" };