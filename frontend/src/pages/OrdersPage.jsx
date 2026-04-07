import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
    // Standard Aura colors
    const colors = {
        forest: '#1b4332',
        mint: '#e8f5e9',
        accent: '#52b788',
        text: '#1b4332',
        glass: 'rgba(255, 255, 255, 0.7)'
    };

    return (
        <div style={auraContainer}>
            {/* Header */}
            <header style={auraHeader}>
                <div>
                    <h1 style={logoStyle}>aura <span style={{ fontWeight: '300' }}>analytics</span></h1>
                    <p style={subtitleStyle}>inventory & revenue insights</p>
                </div>
                <Link to="/" style={backBtn}>← portal</Link>
            </header>

            {/* Top Stat Cards */}
            <div style={statGrid}>
                <div style={glassCard}>
                    <p style={statLabel}>total revenue</p>
                    <h2 style={statValue}>$1,558,552.20</h2>
                </div>
                <div style={glassCard}>
                    <p style={statLabel}>total orders</p>
                    <h2 style={{ ...statValue, color: colors.accent }}>106,862</h2>
                </div>
            </div>

            <hr style={divider} />

            {/* Date Picker Section */}
            <div style={filterBar}>
                <div style={datePickerGroup}>
                    <input type="date" defaultValue="2026-01-01" style={dateInput} />
                    <span style={{ opacity: 0.5 }}>to</span>
                    <input type="date" defaultValue="2026-12-31" style={dateInput} />
                    <button style={updateBtn}>Update Report</button>
                </div>
            </div>

            {/* Usage Table */}
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
                        {[
                            { name: 'Ice', value: '6,826,250.00', percent: 95 },
                            { name: 'Whole Milk', value: '3,446,680.00', percent: 70 },
                            { name: 'Sugar Syrup', value: '4,401,800.00', percent: 85 },
                            { name: 'Tapioca Pearls', value: '300,380.00', percent: 40 },
                            { name: 'Lychee Jelly', value: '176,190.00', percent: 25 },
                        ].map((row, i) => (
                            <tr key={i} style={trStyle}>
                                <td style={tdStyle}>{row.name}</td>
                                <td style={{ ...tdStyle, fontWeight: '800', color: colors.forest }}>{row.value}</td>
                                <td style={tdStyle}>
                                    <div style={progressBarBg}>
                                        <div style={{ ...progressBarFill, width: `${row.percent}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- AURA STYLING ---
const auraContainer = { background: '#e8f5e9', minHeight: '100vh', padding: '2rem 4rem', fontFamily: '"Inter", sans-serif', color: '#1b4332' };
const auraHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' };
const logoStyle = { fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', margin: 0 };
const subtitleStyle = { margin: 0, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px' };
const backBtn = { textDecoration: 'none', color: '#1b4332', fontWeight: '700', border: '1px solid rgba(27,67,50,0.2)', padding: '8px 20px', borderRadius: '50px' };

const statGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' };
const glassCard = { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', padding: '2.5rem', borderRadius: '30px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' };
const statLabel = { textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: '700', opacity: 0.5, marginBottom: '10px' };
const statValue = { fontSize: '3rem', fontWeight: '900', margin: 0, color: '#1b4332' };

const divider = { border: 'none', borderTop: '1px solid rgba(27,67,50,0.1)', margin: '3rem 0' };

const filterBar = { display: 'flex', justifyContent: 'center', marginBottom: '2rem' };
const datePickerGroup = { background: 'white', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const dateInput = { border: 'none', outline: 'none', fontFamily: 'inherit', fontWeight: '600', color: '#1b4332' };
const updateBtn = { background: '#1b4332', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' };

const tableContainer = { background: 'white', borderRadius: '30px', overflow: 'hidden', border: '1px solid #c8e6c9' };
const auraTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { background: '#f1f8f1' };
const thStyle = { padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 };
const tdStyle = { padding: '1.2rem', borderBottom: '1px solid #f1f8f1', fontSize: '1rem' };
const trStyle = { transition: 'background 0.2s' };

const progressBarBg = { background: '#e8f5e9', height: '12px', borderRadius: '10px', width: '100%', overflow: 'hidden' };
const progressBarFill = { background: '#52b788', height: '100%', borderRadius: '10px' };