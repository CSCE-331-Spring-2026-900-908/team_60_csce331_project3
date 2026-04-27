import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProductUsage, fetchSalesSummary } from '../services/api';

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [usageData, setUsageData] = useState([]);
    const [salesData, setSalesData] = useState({ total_revenue: 0, total_orders: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default dates for CSCE 331 project scope
    const [startDate, setStartDate] = useState("2026-01-01");
    const [endDate, setEndDate] = useState("2026-12-31");

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // These calls use the "credentials: include" fix from api.js
            const [usage, sales] = await Promise.all([
                fetchProductUsage(startDate, endDate),
                fetchSalesSummary()
            ]);
            
            setUsageData(usage);
            setSalesData(sales);
            setError(null);
        } catch (err) {
            console.error("Dashboard Load Error:", err);
            setError("Session expired or connection failed.");
            // Optional: If auth fails, kick them back to portal
            // navigate('/'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const colors = {
        forest: '#1b4332',
        mint: '#e8f5e9',
        accent: '#52b788',
        text: '#1b4332',
        glass: 'rgba(255, 255, 255, 0.7)'
    };

    if (loading) return <div style={auraContainer}>Updating Aura Stats...</div>;

    return (
        <div style={auraContainer}>
            <Link 
		to="/" 
		style={backBtnStyle}
		aria-label = {"Return to portal button."}
		onClick={(e) => {
			e.preventDefault();	
			window.narrate("Returning to Home Portal page");
			setTimeout = (() => {
				window.location.href = "/";
			}, 300);
		
		}}
	    >
		← portal
	    
	    </Link>

            <header style={auraHeader}>
                <div>
                    <h1 style={logoStyle}>aura <span style={{fontWeight: '300'}}>stats</span></h1>
                    <p style={subtitleStyle}>inventory & revenue insights</p>
                </div>
            </header>

            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <div style={statGrid}>
                <div style={glassCard}>
                    <p style={statLabel}>total revenue</p>
                    <h2 style={statValue}>
                        ${Number(salesData.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </h2>
                </div>
                <div style={glassCard}>
                    <p style={statLabel}>total orders</p>
                    <h2 style={{ ...statValue, color: colors.accent }}>
                        {Number(salesData.total_orders || 0).toLocaleString()}
                    </h2>
                </div>
            </div>

            <hr style={divider} />

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
                    <button onClick={loadDashboardData} style={updateBtn}>Update Report</button>
                </div>
            </div>

            <div style={tableContainer}>
                <table style={auraTable}>
                    <thead>
                        <tr style={tableHeaderRow}>
                            <th style={thStyle}>Inventory Item</th>
                            <th style={thStyle}>Total Used</th>
                            <th style={thStyle}>Usage Visualization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usageData.length > 0 ? usageData.map((row, i) => (
                            <tr key={i} style={trStyle}>
                                <td style={tdStyle}>{row.name}</td>
                                <td style={{ ...tdStyle, fontWeight: '800', color: colors.forest }}>
                                    {Number(row.value).toLocaleString()}
                                </td>
                                <td style={tdStyle}>
                                    <div style={progressBarBg}>
                                        <div style={{ ...progressBarFill, width: `${row.percent || 0}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" style={{...tdStyle, textAlign: 'center'}}>No data found for these dates.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// STYLES
const auraContainer = { background: '#e8f5e9', minHeight: '100vh', padding: '2rem 4rem', fontFamily: '"Inter", sans-serif', color: '#1b4332', position: 'relative' };
const backBtnStyle = { position: 'absolute', top: '30px', left: '40px', zIndex: 100, textDecoration: 'none', color: '#1b4332', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', padding: '10px 22px', borderRadius: '50px', border: '1px solid rgba(27, 67, 50, 0.1)' };
const auraHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', marginTop: '40px' };
const logoStyle = { fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1px', margin: 0 };
const subtitleStyle = { margin: 0, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px' };
const statGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' };
const glassCard = { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', padding: '2.5rem', borderRadius: '30px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.3)' };
const statLabel = { textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: '700', opacity: 0.5, marginBottom: '10px' };
const statValue = { fontSize: '3rem', fontWeight: '900', margin: 0, color: '#1b4332' };
const divider = { border: 'none', borderTop: '1px solid rgba(27,67,50,0.1)', margin: '3rem 0' };
const filterBar = { display: 'flex', justifyContent: 'center', marginBottom: '2rem' };
const datePickerGroup = { background: 'white', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const dateInput = { border: 'none', outline: 'none', fontFamily: 'inherit', fontWeight: '600', color: '#1b4332' };
const updateBtn = { background: '#1b4332', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' };
const tableContainer = { background: 'white', borderRadius: '30px', overflow: 'hidden', border: '1px solid #c8e6c9', marginBottom: '2rem' };
const auraTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { background: '#f1f8f1' };
const thStyle = { padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 };
const tdStyle = { padding: '1.2rem', borderBottom: '1px solid #f1f8f1', fontSize: '1rem' };
const trStyle = { transition: 'background 0.2s' };
const progressBarBg = { background: '#e8f5e9', height: '12px', borderRadius: '10px', width: '100%', overflow: 'hidden' };
const progressBarFill = { background: '#52b788', height: '100%', borderRadius: '10px' };
