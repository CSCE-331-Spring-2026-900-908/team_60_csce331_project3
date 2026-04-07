import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMenu, placeOrder } from "../services/api";
import Weather from '../components/Weather';

export default function CustomerPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Modal State
  const [showToppings, setShowToppings] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await fetchMenu();
        setMenuItems(data);
      } catch (err) {
        console.error(err);
        setMessage("failed to load menu.");
      }
    }
    loadMenu();
  }, []);

  const getCleanCat = (item) => item.category ? item.category.toString().trim().toLowerCase() : "";

  const toppingsOptions = useMemo(() => 
    menuItems.filter(item => getCleanCat(item) === 'topping'), 
  [menuItems]);

  const categories = useMemo(() => {
    const rawCats = [...new Set(menuItems.map(item => getCleanCat(item)))];
    return ["all", "recommended",  ...rawCats.filter(c => c !== 'topping' && c !== "")];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const drinks = menuItems.filter(item => getCleanCat(item) !== 'topping');
    if (activeCategory === "all") return drinks;
    if(activeCategory == "recommended") return drinks; //temporary 
    return drinks.filter(item => getCleanCat(item) === activeCategory);
  }, [menuItems, activeCategory]);

  // Total Quantity logic
  const totalItemsCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0), 
  [cart]);

  const totalAmount = useMemo(() => 
    cart.reduce((sum, item) => {
      const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
      return sum + (item.price + toppingTotal) * item.quantity;
    }, 0), 
  [cart]);

  // --- MODAL LOGIC ---
  function openToppings(item) {
    setPendingItem(item);
    setSelectedToppings([]); // Reset selections
    setShowToppings(true);
  }

  function toggleTopping(topping) {
    setSelectedToppings(prev => 
      prev.find(t => t.menu_item_id === topping.menu_item_id)
        ? prev.filter(t => t.menu_item_id !== topping.menu_item_id)
        : [...prev, { menu_item_id: topping.menu_item_id, name: topping.name, price: Number(topping.base_price) }]
    );
  }

  function confirmAddToCart() {
    const cartId = `${pendingItem.menu_item_id}-${selectedToppings.map(t => t.menu_item_id).sort().join('-')}`;
    
    setCart((prev) => {
      const existing = prev.find(x => x.cartId === cartId);
      if (existing) {
        return prev.map(x => x.cartId === cartId ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...prev, {
        cartId,
        menu_item_id: pendingItem.menu_item_id,
        name: pendingItem.name,
        price: Number(pendingItem.base_price),
        quantity: 1,
        toppings: selectedToppings
      }];
    });

    setShowToppings(false);
    setPendingItem(null);
  }

  // --- CART ACTIONS ---
  function changeQuantity(cartId, delta) {
    setCart(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, quantity: item.quantity + delta } : item
    ).filter(item => item.quantity > 0));
  }

  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    try {
      // Flatten cart for the backend: each drink and topping becomes its own order item
      const flattenedItems = [];
      cart.forEach(cartItem => {
        // Add the drink itself multiple times based on quantity
        for(let i=0; i < cartItem.quantity; i++) {
          flattenedItems.push({ menu_item_id: cartItem.menu_item_id, price: cartItem.price });
          cartItem.toppings.forEach(t => {
            flattenedItems.push({ menu_item_id: t.menu_item_id, price: t.price });
          });
        }
      });

      const payload = { items: flattenedItems, total_amount: Number(totalAmount.toFixed(2)) };
      const result = await placeOrder(payload);
      setMessage(`success! order #${result.order_id} is being prepared.`);
      setCart([]);
      setTimeout(() => setMessage(""), 5000); 
    } catch (err) {
      setMessage("failed to place order.");
    }
  }

  return (
    <div style={auraContainer}>
      {/* Modal: Select Multiple Toppings */}
      {showToppings && (
        <div style={modalOverlay}>
          <div style={auraModal}>
            <h2 style={itemTitle}>customize {pendingItem?.name.toLowerCase()}</h2>
            <div style={toppingGrid}>
              {toppingsOptions.map(t => {
                const isSelected = selectedToppings.find(st => st.menu_item_id === t.menu_item_id);
                return (
                  <button 
                    key={t.menu_item_id} 
                    style={{...toppingBtn, background: isSelected ? '#2d6a4f' : '#f1f8f1', color: isSelected ? 'white' : '#2d6a4f'}} 
                    onClick={() => toggleTopping(t)}
                  >
                    {t.name.toLowerCase()} (+${Number(t.base_price).toFixed(2)})
                  </button>
                );
              })}
            </div>
            <button style={auraAddBtnLarge} onClick={confirmAddToCart}>
              add to order — ${ (Number(pendingItem.base_price) + selectedToppings.reduce((s,t)=>s+t.price,0)).toFixed(2) }
            </button>
            <button style={{border:'none', background:'none', marginTop:'15px', color:'#64748b', cursor:'pointer'}} onClick={()=>setShowToppings(false)}>cancel</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={auraHeader}>
        <div style={headerContent}>
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={backButtonStyle}>← portal</Link>
            <div><h1 style={logoStyle}>aura <span style={{fontWeight:'300'}}>kiosk</span></h1><p style={subtitleStyle}>steeped in nature</p></div>
      
          </div>
          <div style={weatherCapsule}><Weather /></div>
        </div>
      </header>

      {message && <div style={auraNotification}>{message}</div>}

      <div style={tabContainer}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={tabStyle(activeCategory === cat)}>{cat}</button>
        ))}
      </div>

      <div style={mainLayout}>
        <section style={menuGrid}>
          {filteredItems.map((item) => (
            <div key={item.menu_item_id} style={auraItemCard}>
              <div style={imageCircle}>🧋</div>
              <h3 style={itemTitle}>{item.name.toLowerCase()}</h3>
              <p style={itemDescription}>{item.description}</p>
              <div style={priceActionRow}>
                <span style={priceText}>${Number(item.base_price).toFixed(2)}</span>
                <button style={auraAddBtn} onClick={() => openToppings(item)}>customize +</button>
              </div>
            </div>
          ))}
        </section>

        <aside style={glassCart}>
          <div style={cartTop}><h2 style={{ margin: 0, fontSize: '1.2rem' }}>your order</h2><span style={countBadge}>{totalItemsCount}</span></div>
          <div style={cartScrollArea}>
            {cart.length === 0 ? <p style={emptyText}>basket is empty.</p> : cart.map((item) => (
              <div key={item.cartId} style={auraCartItem}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: '0.9rem' }}>{item.name.toLowerCase()}</div>
                  {item.toppings.map(t => <div key={t.menu_item_id} style={{fontSize:'0.75rem', color:'#64748b'}}>+ {t.name.toLowerCase()}</div>)}
                </div>
                <div style={auraQtyControls}>
                  <button style={auraQtyBtn} onClick={() => changeQuantity(item.cartId, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button style={auraQtyBtn} onClick={() => changeQuantity(item.cartId, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div style={checkoutArea}>
              <div style={auraTotalRow}><span>total</span><span>${totalAmount.toFixed(2)}</span></div>
              <button style={auraCheckoutBtn} onClick={handlePlaceOrder}>checkout</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// --- STYLES ---
const auraAddBtnLarge = { width:'100%', padding:'1.2rem', background:'#1b4332', color:'white', border:'none', borderRadius:'50px', fontWeight:'700', cursor:'pointer', fontSize:'1rem' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(27, 67, 50, 0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const auraModal = { background: 'white', padding: '3rem', borderRadius: '40px', width: '500px', maxWidth: '90%', textAlign: 'center' };
const toppingGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '2rem 0' };
const toppingBtn = { padding: '1rem', border: '1px solid #c8e6c9', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' };
const auraContainer = { backgroundColor: "#e8f5e9", color: "#1e293b", minHeight: "100vh", padding: "2rem" };
const auraHeader = { marginBottom: "3rem" };
const headerContent = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' };
const logoStyle = { margin: 0, fontSize: "3.5rem", fontWeight: "800", color: "#1b4332" };
const subtitleStyle = { color: "#2d6a4f", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", fontSize: "0.7rem", margin: 0, opacity: 0.6 };
const backButtonStyle = { color: '#2d6a4f', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(45, 106, 79, 0.2)', padding: '8px 20px', borderRadius: '50px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(5px)', display: 'inline-flex', alignItems: 'center' };
const weatherCapsule = { background: 'rgba(255, 255, 255, 0.5)', padding: '4px 16px', borderRadius: '50px', border: '1px solid #c8e6c9', backdropFilter: 'blur(5px)' };
const tabContainer = { display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' };
const tabStyle = (isActive) => ({ padding: "8px 20px", borderRadius: "50px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", border: "1px solid", borderColor: isActive ? "#2d6a4f" : "rgba(45, 106, 79, 0.1)", background: isActive ? "#2d6a4f" : "rgba(255, 255, 255, 0.4)", color: isActive ? "white" : "#2d6a4f", backdropFilter: "blur(5px)" });
const mainLayout = { display: "grid", gridTemplateColumns: "1fr 320px", gap: "3rem", maxWidth: "1400px", margin: "0 auto", alignItems: "start" };
const menuGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" };
const auraItemCard = { background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)", borderRadius: "32px", padding: "2rem", border: "1px solid rgba(255, 255, 255, 0.3)", textAlign: 'center' };
const imageCircle = { height: "100px", width: "100px", backgroundColor: "#f1f8f1", borderRadius: "50%", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" };
const itemTitle = { fontSize: '1.25rem', fontWeight: '700', color: '#1b4332' };
const itemDescription = { fontSize: "0.85rem", color: "#64748b", height: "45px", overflow: "hidden", margin: '0 0 1.5rem 0' };
const priceActionRow = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const priceText = { fontSize: "1.1rem", fontWeight: "700", color: "#2d6a4f" };
const auraAddBtn = { backgroundColor: "#2d6a4f", color: "white", border: "none", borderRadius: "50px", padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: "700" };
const glassCart = { background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderRadius: "32px", padding: "2rem", position: "sticky", top: "2rem", border: "1px solid rgba(255, 255, 255, 0.5)", maxHeight: "80vh", display: "flex", flexDirection: "column" };
const cartTop = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" };
const countBadge = { backgroundColor: "#2d6a4f", color: 'white', padding: "2px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" };
const cartScrollArea = { flexGrow: 1, overflowY: "auto", margin: "1rem 0" };
const auraCartItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px dashed #e2e8f0" };
const auraQtyControls = { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f1f8f1", padding: "4px 8px", borderRadius: "50px" };
const auraQtyBtn = { background: "none", border: "none", color: "#2d6a4f", fontSize: "1rem", cursor: "pointer", fontWeight: "bold" };
const checkoutArea = { paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" };
const auraTotalRow = { display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.5rem", color: '#1b4332' };
const auraCheckoutBtn = { width: "100%", padding: "1rem", backgroundColor: "#1b4332", color: "white", border: "none", borderRadius: "50px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" };
const emptyText = { textAlign: "center", color: "#94a3b8", marginTop: "2rem", fontSize: '0.9rem' };
const auraNotification = { position: "fixed", top: "30px", right: "30px", backgroundColor: "#1b4332", color: "white", padding: "1rem 2rem", borderRadius: "50px", zIndex: 1000, fontWeight: "700" };
