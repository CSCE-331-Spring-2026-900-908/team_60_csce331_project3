import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// Use dynamic base to prevent fetch errors
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080"; 

export default function ManagerDashboard() {
    // --- STATE MANAGEMENT ---
    const [inventory, setInventory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
    const [isLoading, setIsLoading] = useState(true); // Prevents flickering
    const [tasks] = useState([
        { id: 1, text: "Restock Oolong Tea Pearls", completed: true },
        { id: 2, text: "Verify weekend inventory shipment", completed: false },
        { id: 3, text: "Update staff shift schedules", completed: false }
    ]);

    useEffect(() => {
        refreshDashboardData();
    }, []);

    const refreshDashboardData = async () => {
        setIsLoading(true); // Start loading
        try {
            // 1. Fetch Inventory
            const invRes = await fetch(`${API_BASE}/api/inventory`);
            const invData = await invRes.json();
            setInventory(Array.isArray(invData) ? invData : []);

            // 2. Fetch Employees (Check if route is /api/manager/employees or just /api/employees)
            const empRes = await fetch(`${API_BASE}/api/manager/employees`); 
            if (empRes.ok) {
                const empData = await empRes.json();
                setEmployees(Array.isArray(empData) ? empData : []);
            }

            // 3. Fetch high-level stats
            const statsRes = await fetch(`${API_BASE}/api/reports/sales-summary`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (err) {
            console.error("Dashboard refresh failed:", err);
        } finally {
            setIsLoading(false); // End loading regardless of success
        }
    };

        const hireEmployee = async () => {
            const name = prompt("Enter employee full name:");
            const role = prompt("Enter role (manager/cashier):")?.toLowerCase();
            
            if (name && (role === 'manager' || role === 'cashier')) {
                try {
                    const response = await fetch(`${API_BASE}/api/manager/employees`, { // Added /manager
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, role })
                    });

                    if (response.ok) {
                        console.log("Hire successful, refreshing...");
                        await refreshDashboardData(); // Await the refresh
                    } else {
                        alert("Failed to hire employee. Check server console.");
                    }
                } catch (err) {
                    console.error("Network error during hire:", err);
                }
            }
        };

    // Filter for ACTUAL low stock items to make the chart meaningful
    const lowStockData = inventory
        //.filter(item => parseFloat(item.quantity) < 1000) // Adjust threshold as needed
        .slice(0, 10)
        .map(item => ({
            ...item,
            quantity: item.quantity ? parseFloat(item.quantity) : 0
        }));

    // If loading, show a skeleton or message to prevent component flickering
    if (isLoading) {
        return <div style={emptyState}>Howdy! Fetching the latest Aura stats...</div>;
    }

    return (
        <div style={containerStyle}>
            <header style={headerSection}>
                <div>
                    <h1 style={titleStyle}>Aura <span style={{fontWeight:'300'}}>Manager</span></h1>
                    <p style={subtitleStyle}>Real-time shop performance and supply chain</p>
                </div>
                <div style={statGrid}>
                    <div style={statItem}>
                        <span style={statLabel}>Total Orders</span>
                        <span style={statValue}>{stats.total_orders || 0}</span>
                    </div>
                    <div style={statItem}>
                        <span style={statLabel}>Revenue</span>
                        <span style={statValue}>${parseFloat(stats.total_revenue || 0).toFixed(2)}</span>
                    </div>
                </div>
            </header>

            <div style={dashboardGrid}>
                {/* 1. LOW STOCK CHART */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Low Stock Alerts</h3>
                        <span style={badgeStyle}>Critical Items</span>
                    </div>
                    <div style={{height: '300px', marginTop: '20px'}}>
                        {lowStockData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={lowStockData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} style={yAxisStyle} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={tooltipStyle} />
                                    <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={20}>
                                        {lowStockData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.quantity < 20 ? '#ef4444' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={emptyState}>All stock levels healthy.</div>
                        )}
                    </div>
                </div>

                {/* 2. TEAM DIRECTORY */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Team Directory</h3>
                        <button onClick={hireEmployee} style={addBtnStyle}>+ Hire Staff</button>
                    </div>
                    <div style={listScrollSection}>
                        {employees.length > 0 ? (
                            employees.map((emp) => (
                                <div key={emp.employee_id} style={listItemStyle}>
                                    <div>
                                        <div style={{fontWeight: '700'}}>{emp.name}</div>
                                        <div style={{fontSize: '12px', color: '#64748b'}}>ID: #{emp.employee_id}</div>
                                    </div>
                                    <span style={emp.role === 'manager' ? managerBadge : cashierBadge}>{emp.role}</span>
                                </div>
                            ))
                        ) : (
                            <div style={emptyState}>No employee data found. Check /api/manager/employees</div>
                        )}
                    </div>
                </div>

                {/* 3. DAILY AGENDA */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Daily Agenda</h3>
                    </div>
                    <div style={listScrollSection}>
                        {tasks.map(task => (
                            <div key={task.id} style={listItemStyle}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={task.completed ? checkStyle : uncheckStyle}>
                                        {task.completed && "✓"}
                                    </div>
                                    <span style={task.completed ? strikeText : regularText}>{task.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** --- AURA STYLES (Keep existing styles) --- **/
const containerStyle = { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const titleStyle = { fontSize: '2.4rem', fontWeight: '800', color: '#1b4332', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '1rem', margin: '5px 0 0 0' };
const statGrid = { display: 'flex', gap: '20px' };
const statItem = { background: 'white', padding: '15px 25px', borderRadius: '15px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const statLabel = { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' };
const statValue = { fontSize: '1.2rem', fontWeight: '800', color: '#1b4332' };
const dashboardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '25px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const listScrollSection = { maxHeight: '350px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f8fafc' };
const badgeStyle = { fontSize: '11px', fontWeight: '700', backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '20px' };
const addBtnStyle = { backgroundColor: '#1b4332', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };
const yAxisStyle = { fontSize: '12px', fontWeight: '600', fill: '#64748b' };
const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' };
const managerBadge = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' };
const cashierBadge = { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' };
const checkStyle = { width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' };
const uncheckStyle = { width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #cbd5e1' };
const strikeText = { color: '#94a3b8', textDecoration: 'line-through' };
const regularText = { color: '#334155', fontWeight: '500' };
const emptyState = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '1.2rem', marginTop: '10%' };