import React, { useState, useEffect, useMemo } from 'react';
import { Link } from "react-router-dom";
import '../App.css'; 

const CashierPage = () => {
    const [menu, setMenu] = useState([]); 
    const [order, setOrder] = useState([]); 
    const [total, setTotal] = useState(0);
    const [selectedDrinkIdx, setSelectedDrinkIdx] = useState(null);
    const logoStyle = { 
        fontSize: '3.5rem', 
        fontWeight: '800', // This makes "aura" thick
        letterSpacing: '-1px', 
        margin: 0,
        color: '#1b4332',
        textTransform: 'lowercase' 
    };

    useEffect(() => { 
        fetch('http://localhost:8080/api/menu')
            .then(res => res.json())
            .then(data => setMenu(data))
            .catch(err => console.error("Error fetching menu:", err));
    }, []);



    const drinks = useMemo(() => menu.filter(item => item.category?.toLowerCase().trim() !== 'topping'), [menu]);
    const toppingsOptions = useMemo(() => menu.filter(item => item.category?.toLowerCase().trim() === 'topping'), [menu]);

    // Update the global total whenever the order array changes
    useEffect(() => {
        const newTotal = order.reduce((acc, item) => {
            const drinkBase = parseFloat(item.base_price) * item.quantity;
            const toppingsSum = item.toppings.reduce((tAcc, t) => tAcc + parseFloat(t.base_price), 0) * item.quantity;
            return acc + drinkBase + toppingsSum;
        }, 0);
        setTotal(newTotal);
    }, [order]);

    const addToOrder = (item) => {
        const newItem = { 
            ...item, 
            order_uid: Date.now() + Math.random(), 
            toppings: [],
            quantity: 1
        };
        const newOrder = [...order, newItem];
        setOrder(newOrder);
        setSelectedDrinkIdx(newOrder.length - 1);
    };

    const toggleTopping = (topping) => {
        if (selectedDrinkIdx === null || !order[selectedDrinkIdx]) return;
        const updatedOrder = [...order];
        const currentDrink = updatedOrder[selectedDrinkIdx];
        const existingIdx = currentDrink.toppings.findIndex(t => t.menu_item_id === topping.menu_item_id);

        if (existingIdx > -1) {
            currentDrink.toppings.splice(existingIdx, 1);
        } else {
            currentDrink.toppings.push(topping);
        }
        setOrder(updatedOrder);
    };

    const updateQuantity = (idx, delta) => {
        const updatedOrder = [...order];
        const newQty = updatedOrder[idx].quantity + delta;
        if (newQty > 0) {
            updatedOrder[idx].quantity = newQty;
            setOrder(updatedOrder);
        } else {
            removeItem(idx);
        }
    };

    const removeItem = (idx) => {
        const updatedOrder = order.filter((_, i) => i !== idx);
        setOrder(updatedOrder);
        if (selectedDrinkIdx === idx) setSelectedDrinkIdx(null);
        else if (selectedDrinkIdx > idx) setSelectedDrinkIdx(selectedDrinkIdx - 1);
    };

    const submitOrder = async () => {
        if (order.length === 0) return;
        const flattenedItems = [];
        order.forEach(drink => {
            for (let i = 0; i < drink.quantity; i++) {
                flattenedItems.push({ menu_item_id: drink.menu_item_id, price: drink.base_price });
                drink.toppings.forEach(t => {
                    flattenedItems.push({ menu_item_id: t.menu_item_id, price: t.base_price });
                });
            }
        });

        const orderData = {
            customer_id: 1, 
            employee_id: 1, 
            total_amount: parseFloat(total.toFixed(2)),
            items: flattenedItems
        };

        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (response.ok) {
                alert("Order finalized.");
                setOrder([]);
                setSelectedDrinkIdx(null);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div style={auraContainer}>
            {/* Standardized Absolute Back Button - Matches Customer Page exactly */}
            <Link to="/" style={backBtnStyle}>← portal</Link>

            <header style={auraHeader}>
                <div style={{ display:'flex', alignItems:'center' }}>
                    <h1 style={logoStyle}>aura <span style={{fontWeight: '300'}}>cashier</span></h1>
                </div>
            </header>

            <div style={mainLayout}>
                {/* 1. Drinks */}
                <div style={glassPanel}>
                    <h2 style={panelTitle}>Beverages</h2>
                    <div style={grid}>
                        {drinks.map(item => (
                            <button key={item.menu_item_id} onClick={() => addToOrder(item)} style={drinkCard}>
                                {item.name.toLowerCase()}
                                <div style={cardPrice}>${item.base_price}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Toppings */}
                <div style={glassPanel}>
                    <h2 style={panelTitle}>Add-ons</h2>
                    <p style={selectionLabel}>
                        {selectedDrinkIdx !== null ? `modifying item #${selectedDrinkIdx + 1}` : "select item to customize"}
                    </p>
                    <div style={grid}>
                        {toppingsOptions.map(t => {
                            const isSelected = order[selectedDrinkIdx]?.toppings.find(st => st.menu_item_id === t.menu_item_id);
                            return (
                                <button 
                                    key={t.menu_item_id} 
                                    onClick={() => toggleTopping(t)} 
                                    style={isSelected ? activeToppingCard : toppingCard}
                                    disabled={selectedDrinkIdx === null}
                                >
                                    {t.name.toLowerCase()}
                                    <div style={{fontSize:'0.7rem', opacity:0.8}}>{isSelected ? "added" : `+$${t.base_price}`}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Basket with Qty & Delete */}
                <div style={cartPanel}>
                    <div style={{padding:'20px', flex:1, overflowY:'auto'}}>
                        <h2 style={{...panelTitle, color:'white'}}>Basket</h2>
                        {order.map((item, idx) => (
                            <div 
                                key={item.order_uid} 
                                onClick={() => setSelectedDrinkIdx(idx)}
                                style={idx === selectedDrinkIdx ? activeReceiptItem : receiptItem}
                            >
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    <div style={{fontWeight:'700'}}>{item.name.toLowerCase()}</div>
                                    <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} style={deleteIcon}>✕</button>
                                </div>
                                
                                {item.toppings.map((t, tIdx) => (
                                    <div key={tIdx} style={receiptTopping}>+ {t.name.toLowerCase()}</div>
                                ))}

                                <div style={qtyControls}>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(idx, -1); }} style={qtyBtn}>-</button>
                                    <span style={{fontWeight:'700', fontSize:'0.9rem'}}>{item.quantity}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(idx, 1); }} style={qtyBtn}>+</button>
                                    <span style={{marginLeft:'auto', fontWeight:'700'}}>${((parseFloat(item.base_price) + item.toppings.reduce((acc, t) => acc + parseFloat(t.base_price), 0)) * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={checkoutFooter}>
                        <div style={totalDisplay}><span>${total.toFixed(2)}</span></div>
                        <button onClick={submitOrder} style={auraSubmitBtn}>FINALIZE ORDER</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---
const auraContainer = { background:'#e8f5e9', height:'100vh', padding:'2rem', fontFamily:'"Inter", sans-serif', color:'#1b4332', display:'flex', flexDirection:'column', position: 'relative' };
const auraHeader = { marginBottom: "3rem", marginTop: "40px" };
const logoStyle = { fontSize:'3.5rem', fontWeight:'800', letterSpacing:'-1px', margin: 0 };

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

const mainLayout = { display:'grid', gridTemplateColumns:'1fr 1fr 400px', gap:'20px', flex:1, overflow:'hidden', paddingBottom:'20px' };
const glassPanel = { background:'rgba(255,255,255,0.4)', backdropFilter:'blur(10px)', borderRadius:'30px', padding:'25px', border:'1px solid rgba(255,255,255,0.3)', overflowY:'auto' };
const panelTitle = { fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'2px', opacity:0.5, marginBottom:'20px' };
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'12px' };
const drinkCard = { background:'white', border:'none', borderRadius:'20px', padding:'15px', cursor:'pointer', textAlign:'left', fontWeight:'700', color:'#1b4332', boxShadow:'0 4px 6px rgba(0,0,0,0.02)' };
const toppingCard = { background:'rgba(255,255,255,0.6)', border:'none', borderRadius:'18px', padding:'12px', cursor:'pointer', textAlign:'left', fontWeight:'600', color:'#2d6a4f' };
const activeToppingCard = { background:'#2d6a4f', border:'none', borderRadius:'18px', padding:'12px', cursor:'pointer', textAlign:'left', fontWeight:'600', color:'white' };
const cardPrice = { fontSize:'0.75rem', opacity:0.5, marginTop:'4px' };
const cartPanel = { background:'#1b4332', borderRadius:'35px', display:'flex', flexDirection:'column', color:'white', boxShadow:'0 20px 40px rgba(27,67,50,0.1)' };
const selectionLabel = { fontSize:'0.75rem', marginBottom:'15px', padding:'8px 12px', background:'rgba(255,255,255,0.2)', borderRadius:'10px', fontWeight:'700' };
const receiptItem = { padding:'15px', borderRadius:'20px', marginBottom:'10px', cursor:'pointer', background:'rgba(255,255,255,0.05)' };
const activeReceiptItem = { padding:'15px', borderRadius:'20px', marginBottom:'10px', cursor:'pointer', background:'rgba(255,255,255,0.12)', boxShadow:'inset 0 0 0 2px #52b788' };
const receiptTopping = { fontSize:'0.7rem', opacity:0.6, paddingLeft:'8px', marginTop:'2px' };
const deleteIcon = { background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'1rem' };
const qtyControls = { display:'flex', alignItems:'center', gap:'12px', marginTop:'12px', paddingTop:'10px', borderTop:'1px solid rgba(255,255,255,0.1)' };
const qtyBtn = { background:'rgba(255,255,255,0.1)', border:'none', color:'white', width:'24px', height:'24px', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800' };
const checkoutFooter = { padding:'25px', background:'rgba(0,0,0,0.15)', borderBottomLeftRadius:'35px', borderBottomRightRadius:'35px' };
const totalDisplay = { fontSize:'2.2rem', fontWeight:'800', marginBottom:'15px', textAlign:'right' };
const auraSubmitBtn = { width:'100%', padding:'18px', background:'#52b788', color:'#1b4332', border:'none', borderRadius:'20px', fontWeight:'800', fontSize:'1rem', cursor:'pointer' };

export default CashierPage;