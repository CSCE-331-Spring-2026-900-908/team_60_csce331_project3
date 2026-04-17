import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Use the fixed connector from api.js
import { fetchSalesReport } from "../services/api"; 

export default function AdminPage() {
  const [salesData, setSalesData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    startDay: "2026-01-01",
    endDay: new Date().toISOString().split('T')[0], 
    startTime: "08:00:00",
    endTime: "22:00:00"
  });

  const runSalesReport = async () => {
    setLoading(true);
    setMessage("");
    try {
      // This call now utilizes the "credentials: include" from api.js
      const data = await fetchSalesReport(form);
      setSalesData(data);
    } catch (err) {
      console.error(err);
      setMessage("Session expired or connection error. Please log in via Portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSalesReport();
  }, []);

  const grandTotal = salesData.reduce((sum, item) => sum + Number(item.revenue), 0);

  return (
    <div style={auraContainer}>
      <Link to="/" style={backButtonStyle}>← portal</Link>

      <header style={auraHeader}>
        
        <div>
          <h1 style={logoStyle}>aura <span style={{fontWeight: '300'}}>admin</span></h1>
          <p style={subtitleStyle}>managerial reports & analytics</p>
        </div>
      </header>

      {/* Tabs */}
      <div style={tabContainer}>
        <button style={activeTabStyle}>Sales Report</button>
        <button style={disabledTabStyle} disabled>Inventory Usage</button>
        <button style={disabledTabStyle} disabled>X/Z Reports</button>
      </div>

      {/* Controls */}
      <div style={glassCard}>
        <div style={filterBar}>
          <div style={inputGroup}>
            <label style={labelStyle}>Dates</label>
            <input type="date" style={dateInput} value={form.startDay} onChange={e => setForm({...form, startDay: e.target.value})} />
            <span style={{opacity: 0.5}}>-</span>
            <input type="date" style={dateInput} value={form.endDay} onChange={e => setForm({...form, endDay: e.target.value})} />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Time</label>
            <input type="time" step="1" style={dateInput} value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            <span style={{opacity: 0.5}}>-</span>
            <input type="time" step="1" style={dateInput} value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
          </div>

          <button style={updateBtn} onClick={runSalesReport} disabled={loading}>
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </div>

      {message && <p style={errorText}>{message}</p>}

      {/* Table Section */}
      <div style={tableContainer}>
        <table style={auraTable}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Qty Sold</th>
              <th style={thStyle}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesData.length === 0 && !loading && (
              <tr><td colSpan="3" style={emptyRow}>No sales records found for this timeframe.</td></tr>
            )}
            {salesData.map((item, index) => (
              <tr key={index} style={trStyle}>
                <td style={tdStyle}>{item.name.toLowerCase()}</td>
                <td style={tdStyle}>{item.qty}</td>
                <td style={{ ...tdStyle, fontWeight: '800', color: '#1b4332' }}>${Number(item.revenue).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={footerTotal}>
          <span style={{opacity: 0.6, fontSize: '0.9rem'}}>PERIOD TOTAL:</span>
          <span style={{fontSize: '1.8rem', marginLeft: '15px'}}>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// --- STYLING (Aura Standard) ---
const auraContainer = { background: '#e8f5e9', minHeight: '100vh', padding: '2rem 4rem', fontFamily: '"Inter", sans-serif', color: '#1b4332', position: 'relative' };
const backBtnStyle = { position: 'absolute', top: '30px', left: '40px', zIndex: 100, textDecoration: 'none', color: '#1b4332', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', padding: '10px 22px', borderRadius: '50px', border: '1px solid rgba(27, 67, 50, 0.1)' };
const auraHeader = { marginBottom: '3rem', marginTop: '40px' };
const logoStyle = { fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1px', margin: 0, color: '#1b4332', textTransform: 'lowercase' };
const subtitleStyle = { margin: 0, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px' };
const glassCard = { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', padding: '1.5rem 2rem', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.3)', marginBottom: '2rem' };
const filterBar = { display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '8px 20px', borderRadius: '50px' };
const labelStyle = { fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.4, marginRight: '5px' };
const dateInput = { border: 'none', outline: 'none', fontWeight: '600', color: '#1b4332', fontFamily: 'inherit' };
const updateBtn = { background: '#1b4332', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' };
const tabContainer = { display: 'flex', gap: '1rem', marginBottom: '1.5rem' };
const activeTabStyle = { background: '#2d6a4f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: '600', fontSize: '0.8rem' };
const disabledTabStyle = { background: 'rgba(255,255,255,0.4)', color: '#1b4332', opacity: 0.4, border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: '600', fontSize: '0.8rem' };
const tableContainer = { background: 'white', borderRadius: '30px', overflow: 'hidden', border: '1px solid #c8e6c9' };
const auraTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { background: '#f1f8f1' };
const thStyle = { padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 };
const tdStyle = { padding: '1.2rem', borderBottom: '1px solid #f1f8f1' };
const trStyle = { transition: 'background 0.2s' };
const emptyRow = { textAlign: 'center', padding: '4rem', opacity: 0.4, fontWeight: '600' };
const footerTotal = { padding: '2rem', textAlign: 'right', fontWeight: '900', color: '#1b4332', background: '#f1f8f1' };
const errorText = { color: '#d9534f', fontWeight: '700', textAlign: 'center', marginBottom: '1rem' };