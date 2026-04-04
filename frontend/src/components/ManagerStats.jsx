import { useEffect, useState } from "react";
import { fetchSalesSummary, fetchProductUsage } from "../services/api";

export default function ManagerStats() {
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Adjusted default dates to ensure data shows up for 2026
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const loadData = async () => {
    setLoading(true);
    try {
      const [sales, usage] = await Promise.all([
        fetchSalesSummary(),
        fetchProductUsage(startDate, endDate)
      ]);
      setStats(sales);
      setUsageData(usage || []); // Ensure it defaults to empty array if null
    } catch (err) {
      console.error("Failed to load manager data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: "1rem", color: "white" }}>
      {/* Top Cards Section */}
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <h3 style={labelStyle}>Total Revenue</h3>
          <p style={moneyStyle}>
            ${Number(stats.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div style={cardStyle}>
          <h3 style={labelStyle}>Total Orders</h3>
          <p style={numberStyle}>{stats.total_orders}</p>
        </div>
      </div>

      <hr style={{ margin: "3rem 0", borderColor: "#2e303a" }} />

      {/* Product Usage Section */}
      <section style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "white", marginBottom: "1.5rem", fontSize: "2rem" }}>
          Product Usage Report
        </h2>
        
        {/* Date Controls */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem", alignItems: "center" }}>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            style={inputStyle}
          />
          <span style={{ color: "#9ca3af" }}>to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            style={inputStyle}
          />
          <button onClick={loadData} style={buttonStyle}>Update Report</button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#aa3bff" }}>Updating usage data...</p>
        ) : (
          <div style={{ backgroundColor: "#1f2028", borderRadius: "12px", overflow: "hidden", border: "1px solid #2e303a" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: "#2e303a" }}>
                  <th style={thStyle}>Inventory Item</th>
                  <th style={thStyle}>Total Used</th>
                  <th style={thStyle}>Usage Visualization</th>
                </tr>
              </thead>
              <tbody>
                {usageData.length > 0 ? (
                  usageData.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #2e303a" }}>
                      <td style={tdStyle}>{item.inventory_item}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "bold", color: "#aa3bff" }}>{item.total_usage}</span> 
                        <span style={{ color: "#9ca3af", fontSize: "0.85rem", marginLeft: "5px" }}>({item.unit})</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{
                          height: "10px",
                          background: "linear-gradient(90deg, #aa3bff, #6b21a8)",
                          borderRadius: "5px",
                          width: `${Math.min((item.total_usage / 100) * 100, 100)}%`, // Better scaling logic
                          boxShadow: "0 0 8px rgba(170, 59, 255, 0.4)"
                        }}></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...tdStyle, textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                      No usage data found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// --- Styles Overhaul ---
const tableStyle = { 
  width: "100%", 
  borderCollapse: "collapse", 
  color: "white" 
};

const thStyle = { 
  padding: "16px", 
  textAlign: "left", 
  color: "#aa3bff", 
  textTransform: "uppercase", 
  fontSize: "0.85rem", 
  letterSpacing: "1px" 
};

const tdStyle = { 
  padding: "16px", 
  textAlign: "left",
  fontSize: "1rem"
};

const inputStyle = {
  padding: "0.6rem",
  borderRadius: "8px",
  border: "1px solid #2e303a",
  backgroundColor: "#1f2028",
  color: "white",
  outline: "none"
};

const buttonStyle = { 
  padding: "0.6rem 1.5rem", 
  backgroundColor: "#aa3bff", 
  color: "white", 
  border: "none", 
  borderRadius: "8px", 
  cursor: "pointer",
  fontWeight: "bold",
  transition: "opacity 0.2s"
};

const cardStyle = { 
  border: "1px solid #2e303a", 
  padding: "2rem", 
  borderRadius: "16px", 
  background: "#1f2028", 
  minWidth: "280px", 
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
};

const labelStyle = { margin: "0 0 10px 0", color: "#9ca3af", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" };
const moneyStyle = { margin: 0, fontSize: "2.5rem", fontWeight: "bold", color: "#2ecc71" };
const numberStyle = { margin: 0, fontSize: "2.5rem", fontWeight: "bold", color: "#aa3bff" };