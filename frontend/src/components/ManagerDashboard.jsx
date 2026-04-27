import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// --- API CONFIGURATION ---
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:8080" 
    : "https://auraboba-be.onrender.com";

export default function ManagerDashboard() {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('usage'); 
    const [inventory, setInventory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [usageData, setUsageData] = useState([]); 
    const [salesData, setSalesData] = useState([]); 
    const [xData, setXData] = useState([]);
    const [zOutput, setZOutput] = useState(null);
    const [isZDisabled, setIsZDisabled] = useState(false);
    const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
    
    const [startDate, setStartDate] = useState("2026-01-01");
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [menuForm, setMenuForm] = useState({
        name: '', category: '', base_price: '', small_price: '', medium_price: '', large_price: '', description: '', recipe_id: '', temperature: ''
    });

    useEffect(() => {
        refreshBaseData();
        checkZStatus();
    }, []);

    const refreshBaseData = async () => {
        fetch(`${API_BASE_URL}/api/inventory`)
            .then(res => res.json())
            .then(data => setInventory(Array.isArray(data) ? data : []));

        fetch(`${API_BASE_URL}/api/manager/employees`)
            .then(res => res.json())
            .then(data => setEmployees(Array.isArray(data) ? data : []));

        fetch(`${API_BASE_URL}/api/reports/sales-summary`)
            .then(res => res.json())
            .then(data => setStats(data || { total_orders: 0, total_revenue: 0 }));
            
        runUsageReport();
        runSalesReport();
    };

    const runUsageReport = () => {
        const url = `${API_BASE_URL}/api/reports/usage?startDay=${startDate}&endDay=${endDate}&startTime=00:00:00&endTime=23:59:59`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(item => ({
                    name: item.name, 
                    usage: item.usage,
                    unit: item.unit || 'units'
                }));
                setUsageData(formatted);
            })
            .catch(err => console.error("Usage Fetch Error:", err));
    };

    const runSalesReport = () => {
        const url = `${API_BASE_URL}/api/reports/sales?startDay=${startDate}&endDay=${endDate}&startTime=00:00:00&endTime=23:59:59`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(item => ({
                    name: item.name, 
                    qty: item.qty,
                    revenue: item.revenue
                }));
                setSalesData(formatted);
            })
            .catch(err => console.error("Sales Fetch Error:", err));
    };

    const runXReport = () => {
        fetch(`${API_BASE_URL}/api/reports/x-report`)
            .then(res => res.json())
            .then(data => setXData(data));
    };

    const checkZStatus = () => {
        fetch(`${API_BASE_URL}/api/reports/z-status`)
            .then(res => res.json())
            .then(data => setIsZDisabled(data.alreadyRunToday));
    };

    const runZReport = async () => {
        if (!window.confirm("Run Z-Report and reset daily totals? This cannot be undone.")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/reports/z-report`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setZOutput(data); 
                setIsZDisabled(true);
                setXData([]); 
            } else {
                alert(data.error || "Failed to run Z-Report");
                if (res.status === 400) setIsZDisabled(true);
            }
        } catch (err) {
            console.error("Z-Report failed:", err);
        }
    };

    const hireEmployee = async () => {
    const name = prompt("Enter employee name:");
    const role = prompt("Enter role (manager/cashier):")?.toLowerCase();
    
    if (name && (role === 'manager' || role === 'cashier')) {
        // ADDED /manager to the URL path below
        const res = await fetch(`${API_BASE_URL}/api/manager/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, role })
        });
        
        if (res.ok) {
            refreshBaseData(); // This will now trigger and show the new hire
        } else {
            const errorData = await res.json();
            alert("Error: " + errorData.error);
        }
    } else if (name) {
        alert("Invalid role. Please enter 'manager' or 'cashier'.");
    }
};

    const submitMenuItem = async () => {
        if(!menuForm.name || !menuForm.base_price) return alert("Fill required fields");
        try {
            const normalizedCategory = menuForm.category.trim().toLowerCase();
            const mediumPrice = parseFloat(menuForm.medium_price || menuForm.base_price);
            const payload = {
                ...menuForm,
                menu_item_id: Math.floor(Math.random() * 100000),
                base_price: mediumPrice
            };

            if (normalizedCategory !== 'topping') {
                payload.sizes = [
                    { size_name: 'small', price: parseFloat(menuForm.small_price || (mediumPrice - 0.5).toFixed(2)) },
                    { size_name: 'medium', price: mediumPrice },
                    { size_name: 'large', price: parseFloat(menuForm.large_price || (mediumPrice + 0.5).toFixed(2)) }
                ];
            }

            const res = await fetch(`${API_BASE_URL}/api/menu/menuitems`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Menu item added!");
                setMenuForm({ name: '', category: '', base_price: '', small_price: '', medium_price: '', large_price: '', description: '', recipe_id: '', temperature: '' });
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div style={containerStyle}>
            <header style={headerSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/')} style={backButtonStyle}>← Portal</button>
                    <div>
                        <h1 style={titleStyle}>Aura <span style={{fontWeight:'300'}}>Manager</span></h1>
                        <p style={subtitleStyle}>Unified supply chain & performance dashboard</p>
                    </div>
                </div>
                <div style={dateBox}>{new Date().toLocaleDateString()}</div>
            </header>

            <div style={dashboardGrid}>
                {/* Low Stock Alerts */}
                <div style={cardStyle}>
                    <div style={cardHeader}><h3>Low Stock Alerts</h3><span style={badgeStyle}>Critical Items</span></div>
                    <div style={{height: '300px', marginTop: '20px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventory.slice(0,10)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} fontSize={12} /><Tooltip />
                                <Bar dataKey="quantity">{(inventory.slice(0,10)).map((entry, i) => (<Cell key={i} fill={entry.quantity < 20 ? '#ef4444' : '#10b981'} />))}</Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Directory */}
                <div style={cardStyle}>
                    <div style={cardHeader}><h3>Team Directory</h3><button onClick={hireEmployee} style={addBtnStyle}>+ Hire</button></div>
                    <div style={listScrollSection}>{employees.map(emp => (<div key={emp.employee_id} style={listItemStyle}><div><div style={{fontWeight: '700'}}>{emp.name}</div><div style={{fontSize: '0.8rem', opacity: 0.6}}>ID: #{emp.employee_id}</div></div><span style={roleBadge}>{emp.role}</span></div>))}</div>
                </div>

                {/* Add Menu Items */}
                <div style={cardStyle}>
                    <h3>Add Menu Items</h3>
                    <div style={formGrid}>
                        <input placeholder="Item Name" value={menuForm.name} onChange={(e) => setMenuForm({...menuForm, name: e.target.value})} style={inputStyle} />
                        <input placeholder="Category" value={menuForm.category} onChange={(e) => setMenuForm({...menuForm, category: e.target.value})} style={inputStyle} />
                        <input placeholder="Base / medium price" value={menuForm.base_price} onChange={(e) => setMenuForm({...menuForm, base_price: e.target.value, medium_price: e.target.value})} style={inputStyle} />
                        <input placeholder="Small price" value={menuForm.small_price} onChange={(e) => setMenuForm({...menuForm, small_price: e.target.value})} style={inputStyle} />
                        <input placeholder="Medium price" value={menuForm.medium_price} onChange={(e) => setMenuForm({...menuForm, medium_price: e.target.value, base_price: e.target.value})} style={inputStyle} />
                        <input placeholder="Large price" value={menuForm.large_price} onChange={(e) => setMenuForm({...menuForm, large_price: e.target.value})} style={inputStyle} />
                        <select value={menuForm.temperature} onChange={(e) => setMenuForm({...menuForm, temperature: e.target.value})} style={inputStyle}><option value="">Temp</option><option value="C">Cold</option><option value="H">Hot</option></select>
                        <button onClick={submitMenuItem} style={{...addBtnStyle, gridColumn: 'span 2'}}>Add Item</button>
                    </div>
                </div>
            </div>

            {/* Reports Section */}
            <div style={{...cardStyle, marginTop: '30px'}}>
                <div style={tabHeader}>
                    <div style={tabGroup}>
                        <button onClick={() => {setActiveTab('usage'); runUsageReport();}} style={activeTab === 'usage' ? activeTabBtn : tabBtn}>Usage Report</button>
                        <button onClick={() => {setActiveTab('sales'); runSalesReport();}} style={activeTab === 'sales' ? activeTabBtn : tabBtn}>Sales Report</button>
                        <button onClick={() => {setActiveTab('xreport'); runXReport();}} style={activeTab === 'xreport' ? activeTabBtn : tabBtn}>X-Report</button>
                        <button onClick={() => setActiveTab('zreport')} style={activeTab === 'zreport' ? activeTabBtn : tabBtn}>Z-Report</button>
                    </div>
                    {(activeTab === 'usage' || activeTab === 'sales') && (
                        <div style={datePickerGroup}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateInput} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateInput} />
                            <button onClick={activeTab === 'usage' ? runUsageReport : runSalesReport} style={updateBtn}>Update</button>
                        </div>
                    )}
                </div>

                <div style={tableWrapper}>
                    {activeTab === 'usage' && (
                        <table style={auraTable}>
                            <thead><tr style={tableHeaderRow}><th style={thStyle}>Ingredient</th><th style={thStyle}>Amount Used</th><th style={thStyle}>Visualization</th></tr></thead>
                            <tbody>{usageData.map((item, i) => (<tr key={i}><td style={tdStyle}>{item.name}</td><td style={tdStyle}><strong>{item.usage}</strong> {item.unit}</td><td style={tdStyle}><div style={progressBarBg}><div style={{ height: "100%", background: "#52b788", width: `${Math.min(item.usage, 100)}%` }}></div></div></td></tr>))}</tbody>
                        </table>
                    )}
                    
                    {activeTab === 'sales' && (
                        <table style={auraTable}>
                            <thead><tr style={tableHeaderRow}><th style={thStyle}>Menu Item</th><th style={thStyle}>Qty Sold</th><th style={thStyle}>Revenue</th></tr></thead>
                            <tbody>
                                {salesData.length > 0 ? salesData.map((item, i) => (
                                    <tr key={i}>
                                        <td style={tdStyle}>{item.name}</td>
                                        <td style={tdStyle}>{item.qty}</td>
                                        <td style={tdStyle}>${parseFloat(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                )) : <tr><td colSpan="3" style={emptyCell}>No sales data for this period.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'xreport' && (
                        <div style={{height: '400px', padding: '20px'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={xData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hr" tickFormatter={(tick) => `${tick}:00`} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="rev" fill="#1b4332" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'zreport' && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <button onClick={runZReport} disabled={isZDisabled} style={isZDisabled ? { ...zBtnStyle, opacity: 0.5, cursor: 'not-allowed' } : zBtnStyle}>
                                {isZDisabled ? "Z-Report Already Run Today" : "Run Z-Report & Reset Day"}
                            </button>
                            {zOutput && (
                                <div style={zTapeStyle}>
                                    <pre style={monospaceStyle}>
{`========== REVEILLE BOBA Z-REPORT ==========
Date:      ${zOutput.date}
Time:      ${zOutput.timestamp}
--------------------------------------------
Gross Sales:     $${zOutput.sales.toFixed(2)}
Tax (8.25%):     $${zOutput.tax.toFixed(2)}
TOTAL REVENUE:   $${zOutput.total.toFixed(2)}
--------------------------------------------
Status: Daily Totals Reset Successfully.`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- STYLES ---
const containerStyle = { padding: '40px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const titleStyle = { fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 };
const subtitleStyle = { color: '#64748b', margin: 0 };
const dateBox = { backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px', height: 'fit-content', fontWeight: '700', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const backButtonStyle = { background: '#ffffff', border: '1px solid #cbd5e1', color: '#1b4332', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const dashboardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '25px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const listScrollSection = { maxHeight: '250px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const roleBadge = { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' };
const badgeStyle = { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
const addBtnStyle = { backgroundColor: '#1b4332', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: '600' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const tabHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' };
const tabGroup = { display: 'flex', gap: '10px' };
const tabBtn = { background: 'none', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '600' };
const activeTabBtn = { ...tabBtn, background: '#f1f5f9', color: '#1b4332' };
const datePickerGroup = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' };
const dateInput = { border: '1px solid #cbd5e1', borderRadius: '5px', padding: '5px' };
const updateBtn = { background: '#1b4332', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' };
const tableWrapper = { marginTop: '10px', border: '1px solid #f1f5f9', borderRadius: '15px', overflow: 'hidden' };
const auraTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { background: '#f8fafc' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' };
const progressBarBg = { background: '#f1f5f9', height: '8px', borderRadius: '10px', width: '100%', overflow: 'hidden' };
const zBtnStyle = { background: '#991b1b', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' };
const zTapeStyle = { marginTop: '30px', background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '2px dashed #cbd5e1' };
const monospaceStyle = { textAlign: 'left', fontSize: '14px', fontFamily: 'monospace', margin: 0 };
const emptyCell = { padding: '40px', textAlign: 'center', color: '#94a3b8' };
