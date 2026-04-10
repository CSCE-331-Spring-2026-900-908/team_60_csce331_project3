import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function ManagerDashboard() {
    const [inventory, setInventory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([
        { id: 1, text: "Restock Oolong Tea Pearls", completed: true },
        { id: 2, text: "Update Employee Whitelist", completed: true },
        { id: 3, text: "Verify weekend inventory shipment", completed: false },
        { id: 4, text: "Prepare quarterly revenue report", completed: false }
    ]);

    // 1. Fetch Data on Mount
    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        fetch("http://localhost:8080/api/inventory")
            .then(res => res.json())
            .then(data => {
                // Safety check: Ensure data is an array to prevent crash
                if (Array.isArray(data)) setInventory(data);
                else setInventory([]);
            })
            .catch(err => {
                console.error("Inventory fetch error:", err);
                setInventory([]); // Default to empty list on error
            });

        fetch("http://localhost:8080/api/employees")
            .then(res => res.json())
            .then(data => {
                // Safety check: Ensure data is an array
                if (Array.isArray(data)) setEmployees(data);
                else setEmployees([]);
            })
            .catch(err => {
                console.error("Employee fetch error:", err);
                setEmployees([]); // Default to empty list on error
            });
    };

    // 2. Hire Employee Logic (Matches HomeView.java functionality)
    const hireEmployee = async () => {
        const name = prompt("Enter new employee's full name:");
        const role = prompt("Enter role (manager/cashier):")?.toLowerCase();
        
        if (name && (role === 'manager' || role === 'cashier')) {
            const response = await fetch("http://localhost:8080/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, role })
            });
            if (response.ok) refreshData();
        } else {
            alert("Invalid input. Please provide a name and a valid role.");
        }
    };

    // 3. Process Inventory for Chart (numeric to float conversion)
    const lowStockData = (inventory || [])
        .slice(0, 10)
        .map(item => ({
            ...item,
            quantity: item.quantity ? parseFloat(item.quantity) : 0
    }));

    return (
        <div style={containerStyle}>
            {/* --- DASHBOARD HEADER --- */}
            <header style={headerSection}>
                <div>
                    <h1 style={titleStyle}>Aura <span style={{fontWeight:'300'}}>Manager</span></h1>
                    <p style={subtitleStyle}>Real-time supply chain & team overview</p>
                </div>
                <div style={dateBox}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </header>

            <div style={dashboardGrid}>
                
                {/* --- 1. INVENTORY BAR CHART (From InventoryView.java) --- */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Low Stock Alerts</h3>
                        <span style={badgeStyle}>Top 10 Critical</span>
                    </div>
                    <div style={{height: '300px', marginTop: '20px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lowStockData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={100} 
                                    style={{fontSize: '12px', fontWeight: '600', fill: '#64748b'}} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                />
                                <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={20}>
                                    {lowStockData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.quantity < 20 ? '#ef4444' : '#10b981'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={footerNote}>Items turn <span style={{color:'#ef4444', fontWeight:'bold'}}>red</span> below 20 units.</p>
                </div>

                {/* --- 2. TEAM DIRECTORY (From HomeView.java) --- */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Team Directory</h3>
                        <button onClick={hireEmployee} style={addBtnStyle}>+ Hire Staff</button>
                    </div>
                    <div style={listScrollSection}>
                        {employees.map((emp) => (
                            <div key={emp.employee_id} style={listItemStyle}>
                                <div>
                                    <div style={{fontWeight: '700', color: '#1e293b'}}>{emp.name}</div>
                                    <div style={{fontSize: '12px', color: '#64748b'}}>ID: #{emp.employee_id}</div>
                                </div>
                                <span style={emp.role === 'manager' ? managerBadge : cashierBadge}>
                                    {emp.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- 3. DAILY AGENDA (From HomeView.java) --- */}
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
                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button style={secondaryBtn}>Edit Agenda</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

/** --- AURA STYLES --- **/
const containerStyle = { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '800', color: '#1b4332', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '1.1rem', margin: '5px 0 0 0' };
const dateBox = { backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontWeight: '600', color: '#1b4332' };

const dashboardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f8fafc', paddingBottom: '15px' };

const listScrollSection = { maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f8fafc' };

const badgeStyle = { fontSize: '11px', fontWeight: '700', backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' };
const addBtnStyle = { backgroundColor: '#1b4332', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const secondaryBtn = { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };

const managerBadge = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' };
const cashierBadge = { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' };

const checkStyle = { width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' };
const uncheckStyle = { width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #cbd5e1' };
const strikeText = { color: '#94a3b8', textDecoration: 'line-through' };
const regularText = { color: '#334155', fontWeight: '500' };
const footerNote = { fontSize: '12px', color: '#94a3b8', marginTop: '15px', textAlign: 'center' };