import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMenu, placeOrder } from "../services/api";
import Weather from '../components/Weather';
import { GoogleLogin } from '@react-oauth/google';
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const drinkImageMap = {
  "mango fruit tea": "/images/drinks/mango-fruit-tea.jpg",
  "passionfruit green tea": "/images/drinks/passionfruit-green-tea.jpg",
  "peach oolong tea": "/images/drinks/peach-oolong-tea.jpg",
  "strawberry fruit tea": "/images/drinks/strawberry-fruit-tea.jpg",
  "matcha latte": "/images/drinks/matcha-latte.jpg",
  "matcha (no tea)": "/images/drinks/matcha-no-tea.jpg",
  "taro (no tea)": "/images/drinks/taro-no-tea.jpg",
  "brown sugar milk (popping)": "/images/drinks/brown-sugar-milk-popping.jpg",
  "brown sugar milk tea": "/images/drinks/brown-sugar-milk-tea.jpg",
  "classic milk tea": "/images/drinks/classic-milk-tea.jpg",
  "classic milk tea (jelly)": "/images/drinks/classic-milk-tea-jelly.jpg",
  "classic milk tea (popping)": "/images/drinks/classic-milk-tea-popping.jpg",
  "cocoa milk tea": "/images/drinks/cocoa-milk-tea.jpg",
  "creamy baka milk tea": "/images/drinks/creamy-baka-milk-tea.jpg",
  "deliverable drink": "/images/drinks/default-boba.jpg",
  "jasmine milk tea": "/images/drinks/jasmine-milk-tea.jpg",
  "oolong milk tea": "/images/drinks/oolong-milk-tea.jpg",
  "taro milk tea": "/images/drinks/taro-milk-tea.jpg",
  "thai milk tea": "/images/drinks/thai-milk-tea.jpg",
  "thai tea (jelly)": "/images/drinks/thai-tea-jelly.jpg",
  "mango slush": "/images/drinks/mango-slush.jpg",
  "strawberry slush": "/images/drinks/strawberry-slush.jpg",
  "green tea": "/images/drinks/green-tea.jpg",
  "honey black tea": "/images/drinks/honey-black-tea.jpg",
  "honey green tea": "/images/drinks/honey-green-tea.jpg",
  "jasmine lemon (seasonal)": "/images/drinks/jasmine-lemon-seasonal.jpg",
  "oolong peach (seasonal)": "/images/drinks/oolong-peach-seasonal.jpg",
};

const SIZE_ORDER = ["small", "medium", "large"];

function getDrinkImage(item) {
  return (
    drinkImageMap[item.name?.toLowerCase()] ||
    "/images/drinks/thai-milk-tea.jpg"
  );
}

function getItemSizes(item) {
  const rawSizes = Array.isArray(item?.sizes) ? item.sizes : [];
  if (rawSizes.length > 0) {
    return [...rawSizes]
      .map((size) => ({
        size_name: size.size_name,
        price: Number(size.price),
      }))
      .sort((a, b) => SIZE_ORDER.indexOf(a.size_name) - SIZE_ORDER.indexOf(b.size_name));
  }

  return [{ size_name: "medium", price: Number(item?.base_price || 0) }];
}

function getDefaultSize(item) {
  const sizes = getItemSizes(item);
  return sizes.find((size) => size.size_name === "medium") || sizes[0];
}

function formatSizeName(sizeName) {
  if (!sizeName) return "";
  return `${sizeName[0].toUpperCase()}${sizeName.slice(1)}`;
}

export default function CustomerPage() {
  // --- DYNAMIC URL LOGIC ---
  const VITE_URL = import.meta.env.VITE_API_URL;
  const API_BASE = VITE_URL ? `${VITE_URL}/api` : "http://localhost:8080/api";

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null); 
  const [showToppings, setShowToppings] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [weatherTemp, setWeatherTemp] = useState(null); 
  const [gachaResult, setGachaResult] = useState(null);
  const [gachaRolls, setGachaRolls] = useState(3);
  const [gachaSpinning, setGachaSpinning] = useState(false);

  const tempInflectionPoint = 60; 

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

  useEffect(() => {
    fetch(`${API_BASE}/weather`)
      .then(res => res.json())
      .then(data => setWeatherTemp(data.temp))
      .catch(err => console.error("Weather fetch failed:", err));
  }, [API_BASE]);

  /**
   * FIXED: Google Login now correctly saves the stamp count returned by the new backend.
   */
  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Save to state so the UI updates and the order logic sees the ID
        setCurrentUser({
          name: data.name,
          customer_id: data.customer_id,
          role: data.role,
          stamps: data.stamps || 0 
        });
        setMessage(`welcome, ${data.name.toLowerCase()}! your stamps: ${data.stamps}/10`);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setMessage("login failed.");
    }
  };

  /**
   * FIXED: handlePlaceOrder now includes the customer_id and is_redemption flag.
   */
  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    
    // Determine if the user is using their 10 stamps for a free drink
    const isRedeeming = currentUser && currentUser.stamps >= 10;
    const finalAmount = isRedeeming ? 0 : Number(totalAmount.toFixed(2));

    try {
      const flattenedItems = [];
      cart.forEach(cartItem => {
        for(let i=0; i < cartItem.quantity; i++) {
          // If redeeming, items are effectively $0 for the order record
          flattenedItems.push({
            menu_item_id: cartItem.menu_item_id,
            price: isRedeeming ? 0 : cartItem.price,
            size_name: cartItem.size_name,
          });
          cartItem.toppings.forEach(t => flattenedItems.push({ menu_item_id: t.menu_item_id, price: isRedeeming ? 0 : t.price, size_name: null }));
        }
      });

      // Pass the finalCustomerId and redemption status to your updated orderRoutes.js
      const result = await placeOrder({ 
        items: flattenedItems, 
        total_amount: finalAmount, 
        customer_id: currentUser?.customer_id, // Pass Google ID
        is_redemption: isRedeeming
      });
      
      setCart([]);

      if (currentUser) {
        if (isRedeeming) {
          setMessage(`✨ REWARD REDEEMED! Order #${result.order_id} success! ✨`);
          // Optimistically update local state to reflect the 10-stamp deduction
          setCurrentUser(prev => ({ ...prev, stamps: Math.max(0, prev.stamps - 10) }));
        } else {
          // Update stamps based on the result from the backend (handles 20% bonus)
          const stampsGained = result.stamps_earned || 1;
          setMessage(`Order #${result.order_id} success! +${stampsGained} stamp(s) added.`);
          setCurrentUser(prev => ({ ...prev, stamps: (prev.stamps || 0) + stampsGained }));
        }
      } else {
        setMessage(`success! order #${result.order_id} is being prepared.`);
      }

      setTimeout(() => setMessage(""), 8000); 

    } catch (err) {
      console.error("Order error:", err);
      setMessage("failed to place order.");
    }
  }

  // --- HELPER LOGIC ---
  const getCleanCat = (item) => item.category ? item.category.toString().trim().toLowerCase() : "";
  const toppingsOptions = useMemo(() => {
    return menuItems
      .filter(item => getCleanCat(item) === 'topping')
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }));
  }, [menuItems]);
  const categories = useMemo(() => {
    const rawCats = [...new Set(menuItems.map(item => getCleanCat(item)))];
    return ["all", "surprise me", "recommended", ...rawCats.filter(c => c !== 'topping' && c !== "")];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const drinks = menuItems.filter(item => getCleanCat(item) !== 'topping');
    if (activeCategory === "all") return drinks;
    if(activeCategory === "recommended"){
      if(weatherTemp == null) return drinks;
      let tempRec = weatherTemp < tempInflectionPoint ? "H" : "C";
      return drinks.filter(item => item.temperature === tempRec);
    } 
    return drinks.filter(item => getCleanCat(item) === activeCategory);
  }, [menuItems, activeCategory, weatherTemp]);

  const totalItemsCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalAmount = useMemo(() => cart.reduce((sum, item) => {
      const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
      return sum + (item.price + toppingTotal) * item.quantity;
    }, 0), [cart]);

  // --- GACHA LOGIC ---
  const handleGachaRoll = () => {
    if (gachaRolls <= 0 || gachaSpinning) return;
    setGachaSpinning(true);
    setGachaResult(null);
    setTimeout(() => {
      const drinks = menuItems.filter(item => getCleanCat(item) !== 'topping');
      let pool = drinks;
      if (weatherTemp !== null) {
        const preferred = weatherTemp >= 70 ? 'C' : 'H';
        const biased = drinks.filter(d => d.temperature === preferred);
        pool = [...biased, ...biased, ...drinks];
      }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const rarityRoll = Math.random();
      const rarity = rarityRoll < 0.6 ? 'Common' : rarityRoll < 0.9 ? 'Rare' : 'Ultra Rare';
      const rarityColor = rarity === 'Ultra Rare' ? '#f59e0b' : rarity === 'Rare' ? '#8b5cf6' : '#2d6a4f';
      setGachaResult({ ...pick, rarity, rarityColor, price: getDefaultSize(pick).price });
      setGachaRolls(prev => prev - 1);
      setGachaSpinning(false);
    }, 1500);
  };

  function openToppings(item) {
    setPendingItem(item);
    setSelectedSize(getDefaultSize(item));
    setSelectedToppings([]);
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
    const chosenSize = selectedSize || getDefaultSize(pendingItem);
    const cartId = `${pendingItem.menu_item_id}-${chosenSize.size_name}-${selectedToppings.map(t => t.menu_item_id).sort().join('-')}`;
    setCart((prev) => {
      const existing = prev.find(x => x.cartId === cartId);
      if (existing) return prev.map(x => x.cartId === cartId ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, {
        cartId,
        menu_item_id: pendingItem.menu_item_id,
        name: pendingItem.name,
        size_name: chosenSize.size_name,
        price: Number(chosenSize.price),
        quantity: 1,
        toppings: selectedToppings
      }];
    });
    setShowToppings(false);
  }

  function changeQuantity(cartId, delta) {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  }

  return (
    <div style={auraContainer}>
      <Link to="/" style={backButtonStyle}>← portal</Link>

      {showToppings && (
        <div style={modalOverlay}>
          <div style={auraModal}>
            <h2 style={itemTitle}>customize {pendingItem?.name.toLowerCase()}</h2>
            <div style={sizePicker}>
              {getItemSizes(pendingItem).map((size) => {
                const isSelected = selectedSize?.size_name === size.size_name;
                return (
                  <button
                    key={size.size_name}
                    type="button"
                    style={isSelected ? activeSizeBtn : sizeBtn}
                    onClick={() => setSelectedSize(size)}
                  >
                    {formatSizeName(size.size_name)} ${Number(size.price).toFixed(2)}
                  </button>
                );
              })}
            </div>
            <div style={toppingGrid}>
              {toppingsOptions.map(t => {
                const isSelected = selectedToppings.find(st => st.menu_item_id === t.menu_item_id);
                return (
                  <button key={t.menu_item_id} 
                    style={{...toppingBtn, background: isSelected ? '#2d6a4f' : '#f1f8f1', color: isSelected ? 'white' : '#2d6a4f'}} 
                    onClick={() => toggleTopping(t)}>
                    {t.name.toLowerCase()} (+${Number(t.base_price).toFixed(2)})
                  </button>
                );
              })}
            </div>
            <button style={auraAddBtnLarge} onClick={confirmAddToCart}>
              add to order — ${ ((selectedSize?.price || Number(pendingItem?.base_price || 0)) + selectedToppings.reduce((s,t)=>s+t.price,0)).toFixed(2) }
            </button>
            <button style={cancelBtn} onClick={()=>setShowToppings(false)}>cancel</button>
          </div>
        </div>
      )}
      

      <header style={auraHeader}>
        <div style={headerContent}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={logoStyle}>aura <span style={{fontWeight:'300'}}>kiosk</span></h1>
            <p style={subtitleStyle}>steeped in nature</p>
          </div>
          <div style={{ position: "absolute", top: "2rem", right: "2rem", background: "#2d6a4f", padding: "0.5rem 1.2rem", borderRadius: "50px" }}>
        <Weather />
      </div>
        </div>
      </header>

      {message && <div style={auraNotification}>{message}</div>}

      <div 
	style={tabContainer}
	role = "tablist"
	aria-label = "Menu Categories"
      >
        {categories.map(cat => (
          <button
		key={cat} 
		onClick={() => setActiveCategory(cat)} 
		style={tabStyle(activeCategory === cat)}
		role = "tab"
		aria-selected={activeCategory === cat)}
		aria-label={`${cat} menu category`}
		>
		{cat}
	  </button>
        ))}
      </div>

      <div style={mainLayout}>
        {activeCategory === "recommended" && weatherTemp !== null && (
          <div style = {{ gridColumn: "1/ -1", textAlign: "center", marginBottom: "1rem" }}>
            <span style ={{ background: weatherTemp >= tempInflectionPoint ? "#e0f2fe" : "#fce7f3", color: weatherTemp >= 70 ? "#0369a1" : "#9d174d", padding: "8px 24px", borderRadius: "50px", fontWeight: "700", fontSize: "0.9rem" }}>
              {weatherTemp >= tempInflectionPoint ? `It's ${weatherTemp}°F outside - perfect weather for something cold 🧊` : `It's ${weatherTemp}°F outside - time to get something to warm up ☕! `}
            </span>
          </div>
        )}

        {activeCategory === "surprise me" ? (
          <section style={gachaContainer}>
            <div style={gachaCard}>
              <div style={gachaHeader}>
                <h2 style={itemTitle}>aura <span style={{fontWeight:'300'}}>surprise</span></h2>
                <p style={gachaSub}>let nature decide your drink</p>
              </div>
              {gachaResult ? (
                <div style={{...resultBox, borderColor: gachaResult.rarityColor}}>
                  <div style={imageCircle}>✨</div>
                  <h3 style={{...itemTitle, color: gachaResult.rarityColor}}>{gachaResult.rarity}!</h3>
                  <p style={{fontWeight:'700', fontSize:'1.3rem', color: '#1b4332'}}>{gachaResult.name.toLowerCase()}</p>
                  <button style={auraAddBtnLarge} onClick={() => openToppings(gachaResult)}>customize surprise — ${Number(gachaResult.price).toFixed(2)}</button>
                </div>
              ) : (
                <div style={emptyGacha}><div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎰</div><p>you have {gachaRolls} spins remaining</p></div>
              )}
              <button style={gachaSpinBtn(gachaRolls > 0)} onClick={handleGachaRoll} disabled={gachaSpinning || gachaRolls <= 0}>{gachaSpinning ? "🧋 spinning..." : gachaRolls > 0 ? `spin for surprise (${gachaRolls})` : "no spins left"}</button>
            </div>
          </section>
        ) : (
          <section style={menuGrid}>
            {filteredItems.map((item) => (
              <div key={item.menu_item_id} style={auraItemCard}>
                <div style={imageCircle}>
                  <img
                    src={getDrinkImage(item)}
                    alt={item.name}
                    style={drinkImageStyle}
                    onError={(e) => {
                    e.currentTarget.src = "/images/drinks/thai-milk-tea.jpg";
                    }}
                  />
                </div>
                <h3 style={itemTitle}>{item.name.toLowerCase()}</h3>
                <p style={itemDescription}>{item.description}</p>
                <div style={priceActionRow}>
                  <span style={priceText}>from ${Number(getItemSizes(item)[0]?.price || item.base_price).toFixed(2)}</span>
                  <button 
			style={auraAddBtn} 
			onClick={() => openToppings(item)}
			aria-label= {`Customize ${item.name}`}
			>	
			customize +
		</button>
			
                </div>
              </div>
            ))}
          </section>
        )}

        <aside style={glassCart}>
          <div style={cartTop}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>your order</h2>
            <span style={countBadge}>{totalItemsCount}</span>
          </div>
          <div style={cartScrollArea}>
            {cart.length === 0 ? <p style={emptyText}>basket is empty.</p> : cart.map((item) => (
              <div key={item.cartId} style={auraCartItem}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: '0.9rem' }}>{item.name.toLowerCase()}</div>
                  <div style={{fontSize:'0.75rem', color:'#2d6a4f'}}>{formatSizeName(item.size_name)}</div>
                  {item.toppings.map(t => <div key={t.menu_item_id} style={{fontSize:'0.75rem', color:'#64748b'}}>+ {t.name.toLowerCase()}</div>)}
                </div>
                <div style={auraQtyControls}>
                  <button 
			style={auraQtyBtn} 
			onClick={() => changeQuantity(item.cartId, -1)}
			aria-label={`Decrease Quantity of ${item.name}`}
			>
			-
		  </button>
                  <span style={{minWidth: '20px', textAlign: 'center'}}>{item.quantity}</span>
                  <button 
			style={auraQtyBtn} 
			onClick={() => changeQuantity(item.cartId, 1)}
			aria-label={`Increase Quantity of ${item.name}`}
			>
			+
		</button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div style={checkoutArea}>
              <div style={loyaltyBanner}>
                {currentUser ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                      <div style={activeDot}></div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                        {currentUser.name.toLowerCase()}'s card: {currentUser.stamps || 0} / 10
                      </span>
                    </div>
                    <div style={progressBg}><div style={progressBar(currentUser.stamps || 0)}></div></div>
                    {(currentUser.stamps || 0) >= 10 && (
                        <p style={{ color: '#2d6a4f', fontSize: '0.7rem', fontWeight: '800', margin: '5px 0 0 0' }}>✨ FREE DRINK READY! ✨</p>
                    )}
                  </div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                    <span style={{fontSize:'0.7rem', fontWeight:'700', opacity:0.7}}>login to earn stamps</span>
                    <GoogleLogin 
                      onSuccess={handleLoginSuccess}
                      onError={() => setMessage("Login Failed")}
                      useOneTap
                      shape="pill"
                      size="small"
                    />
                  </div>
                )}
              </div>

              <div style={auraTotalRow}><span>total</span><span>${totalAmount.toFixed(2)}</span></div>
              <button 
                style={{
                  ...auraCheckoutBtn, 
                  backgroundColor: (currentUser && currentUser.stamps >= 10) ? '#f59e0b' : '#1b4332'
                }} 
                onClick={handlePlaceOrder}
              >
                {(currentUser && currentUser.stamps >= 10) ? "🎁 redeem free drink" : "checkout"}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// --- STYLES (Kept Original Aura Styling) ---
const auraContainer = { backgroundColor: "#e8f5e9", color: "#1b4332", minHeight: "100vh", padding: "2rem", position: 'relative' };
const backButtonStyle = { position: 'absolute', top: '30px', left: '40px', zIndex: 100, textDecoration: 'none', color: '#1b4332', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', padding: '10px 22px', borderRadius: '50px', border: '1px solid rgba(27, 67, 50, 0.1)', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const auraHeader = { marginBottom: "3rem", marginTop: "40px" };
const headerContent = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '1400px', margin: '0 auto' };
const logoStyle = { margin: 0, fontSize: "3.5rem", fontWeight: "800", color: "#1b4332", letterSpacing: '-1px' };
const subtitleStyle = { color: "#2d6a4f", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", fontSize: "0.7rem", margin: 0, opacity: 0.6 };
const weatherCapsule = { background: 'rgba(255, 255, 255, 0.5)', padding: '6px 20px', borderRadius: '50px', border: '1px solid #c8e6c9', backdropFilter: 'blur(10px)' };
const tabContainer = { display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' };
const tabStyle = (isActive) => ({ padding: "10px 24px", borderRadius: "50px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", border: "1px solid", borderColor: isActive ? "#2d6a4f" : "rgba(45, 106, 79, 0.1)", background: isActive ? "#2d6a4f" : "rgba(255, 255, 255, 0.4)", color: isActive ? "white" : "#2d6a4f", backdropFilter: "blur(5px)" });
const mainLayout = { display: "grid", gridTemplateColumns: "1fr 340px", gap: "3rem", maxWidth: "1400px", margin: "0 auto", alignItems: "start" };
const menuGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" };
const auraItemCard = { background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)", borderRadius: "32px", padding: "2rem", border: "1px solid rgba(255, 255, 255, 0.3)", textAlign: 'center' };
const imageCircle = { height: "100px", width: "100px", backgroundColor: "#f1f8f1", borderRadius: "50%", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" };
const itemTitle = { fontSize: '1.25rem', fontWeight: '800', color: '#1b4332', margin: '0 0 10px 0' };
const itemDescription = { fontSize: "0.85rem", color: "#64748b", height: "45px", overflow: "hidden", margin: '0 0 1.5rem 0' };
const priceText = { fontSize: "1.1rem", fontWeight: "800", color: "#2d6a4f" };
const auraAddBtn = { backgroundColor: "#2d6a4f", color: "white", border: "none", borderRadius: "50px", padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: "700" };
const glassCart = { background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderRadius: "32px", padding: "2rem", position: "sticky", top: "2rem", border: "1px solid rgba(255, 255, 255, 0.5)", maxHeight: "80vh", display: "flex", flexDirection: "column" };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(27, 67, 50, 0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const auraModal = { background: 'white', padding: '2.5rem', borderRadius: '40px', width: 'min(920px, 94vw)', maxHeight: '90vh', overflowY: 'auto', textAlign: 'center' };
const gachaContainer = { display: 'flex', justifyContent: 'center', width: '100%', paddingTop: '2rem' };
const gachaCard = { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '40px', padding: '3rem', width: '100%', maxWidth: '450px', textAlign: 'center', border: '2px solid #c8e6c9' };
const resultBox = { background: 'white', borderRadius: '30px', padding: '2rem', border: '4px solid', marginBottom: '2rem' };
const gachaSpinBtn = (hasRolls) => ({ width: '100%', padding: '1.2rem', background: hasRolls ? '#1b4332' : '#94a3b8', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '800', cursor: hasRolls ? 'pointer' : 'not-allowed' });
const sizePicker = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', margin: '1.5rem 0 0.5rem' };
const sizeBtn = { padding: '0.85rem', border: '1px solid #c8e6c9', borderRadius: '18px', background: '#f8fff8', color: '#2d6a4f', cursor: 'pointer', fontWeight: '700' };
const activeSizeBtn = { ...sizeBtn, background: '#2d6a4f', color: 'white' };
const toppingGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', margin: '2rem 0' };
const toppingBtn = { padding: '1rem', border: '1px solid #c8e6c9', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' };
const auraAddBtnLarge = { width:'100%', padding:'1.2rem', background:'#1b4332', color:'white', border:'none', borderRadius:'50px', fontWeight:'700', cursor:'pointer' };
const cancelBtn = { border:'none', background:'none', marginTop:'15px', color:'#64748b', cursor:'pointer' };
const priceActionRow = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const cartTop = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" };
const countBadge = { backgroundColor: "#2d6a4f", color: 'white', padding: "2px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" };
const cartScrollArea = { flexGrow: 1, overflowY: "auto", margin: "1rem 0" };
const auraCartItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px dashed #e2e8f0" };
const auraQtyControls = { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f1f8f1", padding: "4px 8px", borderRadius: "50px" };
const auraQtyBtn = { background: "none", border: "none", color: "#2d6a4f", fontSize: "1rem", cursor: "pointer", fontWeight: "bold" };
const auraTotalRow = { display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.5rem", color: '#1b4332' };
const auraCheckoutBtn = { width: "100%", padding: "1rem", backgroundColor: "#1b4332", color: "white", border: "none", borderRadius: "50px", fontSize: "1rem", fontWeight: "800", cursor: "pointer" };
const auraNotification = { position: "fixed", top: "30px", right: "30px", backgroundColor: "#1b4332", color: "white", padding: "1rem 2rem", borderRadius: "50px", zIndex: 3000, fontWeight: "700" };
const checkoutArea = { paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" };
const emptyText = { textAlign: "center", color: "#94a3b8", marginTop: "2rem", fontSize: '0.9rem' };
const gachaSub = { color: '#2d6a4f', opacity: 0.6, fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' };
const gachaHeader = { marginBottom: '2rem' };
const emptyGacha = { padding: '3rem 0', opacity: 0.5, fontWeight: '700' };
const loyaltyBanner = { marginBottom: '1.5rem', padding: '15px', borderRadius: '20px', background: '#f1f8f1', border: '1px solid #c8e6c9', textAlign: 'center' };
const activeDot = { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2d6a4f', boxShadow: '0 0 8px #2d6a4f' };
const progressBg = { height: '8px', background: '#e2e8f0', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' };
const progressBar = (stamps) => ({ height: '100%', width: `${Math.min((stamps) * 10, 100)}%`, background: '#2d6a4f', transition: 'width 0.5s ease-in-out' });
const drinkImageStyle = {width: "78px",height: "78px",objectFit: "cover",borderRadius: "50%",};
