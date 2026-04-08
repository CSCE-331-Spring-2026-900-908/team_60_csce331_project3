import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSalesSummary, fetchProductUsage } from "../services/api";

export default function ManagerStats() {
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Adjusted default dates for the 2026 project scope
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
      setUsageData(usage || []); 
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
    <div style={auraContainer}>
      {/* 1. STANDARDIZED BACK BUTTON - Absolute position matches Kiosk/Cashier/Kitchen */}
      <Link to="/" style={backBtnStyle}>← portal</Link>

      {/* 2. HEADER */}
      <header style={auraHeader}>
        <div>
          <h1 style={logoStyle}>aura <span style={{fontWeight: '300'}}>stats</span></h1>
          <p style={subtitle}>performance & inventory tracking</p>
        </div>
      </header>

      {/* 3. TOP STAT CARDS */}
      <div style={statGrid}>
        <div style={glassCard}>
          <h3 style={labelStyle}>Total Revenue</h3>
          <p style={moneyStyle}>
            ${Number(stats.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div style={glassCard}>
          <h3 style={labelStyle}>Total Orders</h3>
          <p style={numberStyle}>{stats.total_orders.toLocaleString()}</p>
        </div>
      </div>

      <hr style={divider} />

      {/* 4. PRODUCT USAGE SECTION */}
      <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={sectionTitle}>Product Usage Report</h2>
        
        {/* Date Controls */}
        <div style={filterBar}>
            <div style={datePickerGroup}>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    style={dateInput}
                />
                <span style={{ opacity: 0.5 }}>to</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    style={dateInput}
                />
                <button onClick={loadData} style={updateBtn}>Update Report</button>
            </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#2d6a4f", fontWeight: '700' }}>steeping usage data...</p>
        ) : (
          <div style={tableWrapper}>
            <table style={auraTable}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={thStyle}>Inventory Item</th>
                  <th style={thStyle}>Total Used</th>
                  <th style={thStyle}>Usage Visualization</th>
                </tr>
              </thead>
              <tbody>
                {usageData.length > 0 ? (
                  usageData.map((item, index) => (
                    <tr key={index} style={trStyle}>
                      <td style={tdStyle}>{item.inventory_item.toLowerCase()}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "800", color: "#1b4332" }}>{item.total_usage}</span> 
                        <span style={{ color: "#64748b", fontSize: "0.8rem", marginLeft: "5px" }}>{item.unit}</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={progressBarBg}>
                          <div style={{
                            height: "100%",
                            background: "#52b788",
                            borderRadius: "10px",
                            width: `${Math.min((item.total_usage / 100) * 100, 100)}%`,
                          }}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={emptyCell}>
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

// --- AURA MANAGER STYLES ---
const auraContainer = { 
    background: '#e8f5e9', 
    minHeight: '100vh', 
    padding: '2rem 4rem', 
    fontFamily: '"Inter", sans-serif', 
    color: '#1b4332', 
    position: 'relative' 
};

const auraHeader = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '3rem', 
    marginTop: '40px' 
};

const logoStyle = { fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1px', margin: 0 };
const subtitle = { margin: 0, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px' };

const backBtnStyle = {
    position: 'absolute',
    top: '30px',
    left: '40px',
    zIndex: 100,
    textDecoration: 'none',
    color: '#1b4332',
    fontSize: '0.75rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    padding: '10px 22px',
    borderRadius: '50px',
    border: '1px solid rgba(27, 67, 50, 0.1)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
};

const statGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' };
const glassCard = { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', padding: '2.5rem', borderRadius: '30px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' };

const labelStyle = { margin: "0 0 10px 0", color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "2px", fontWeight: '700' };
const moneyStyle = { margin: 0, fontSize: "3rem", fontWeight: "900", color: "#1b4332" };
const numberStyle = { margin: 0, fontSize: "3rem", fontWeight: "900", color: "#52b788" };

const divider = { border: 'none', borderTop: '1px solid rgba(27, 67, 50, 0.1)', margin: '3rem 0' };
const sectionTitle = { textAlign: "center", color: "#1b4332", marginBottom: "2rem", fontSize: "1.8rem", fontWeight: '800' };

const filterBar = { display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' };
const datePickerGroup = { background: 'white', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const dateInput = { border: 'none', outline: 'none', fontFamily: 'inherit', fontWeight: '600', color: '#1b4332', background: 'transparent' };
const updateBtn = { background: '#1b4332', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' };

const tableWrapper = { background: 'white', borderRadius: '30px', overflow: 'hidden', border: '1px solid #c8e6c9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const auraTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { background: '#f1f8f1' };
const thStyle = { padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, color: '#1b4332' };
const tdStyle = { padding: '1.2rem', borderBottom: '1px solid #f1f8f1', fontSize: '1rem', color: '#1b4332' };
const trStyle = { transition: 'background 0.2s' };

const progressBarBg = { background: '#e8f5e9', height: '12px', borderRadius: '10px', width: '100%', overflow: 'hidden' };
const emptyCell = { padding: "4rem", textAlign: "center", color: "#94a3b8", fontWeight: '600' };