import { useEffect, useMemo, useState } from "react";
import { fetchMenu, placeOrder } from "../services/api";

export default function CustomerPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await fetchMenu();
        setMenuItems(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load menu.");
      }
    }
    loadMenu();
  }, []);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((x) => x.menu_item_id === item.menu_item_id);
      if (existing) {
        return prev.map((x) =>
          x.menu_item_id === item.menu_item_id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.menu_item_id,
          name: item.name,
          quantity: 1,
          price: Number(item.base_price),
        },
      ];
    });
  }

  function changeQuantity(menuItemId, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menu_item_id === menuItemId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart,
        total_amount: Number(total.toFixed(2)),
      };
      const result = await placeOrder(payload);
      setMessage(`Success! Order #${result.order_id} is being prepared.`);
      setCart([]);
      setTimeout(() => setMessage(""), 5000); // Clear message after 5s
    } catch (err) {
      setMessage(err.message || "Failed to place order.");
    }
  }

  const grouped = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={pageContainer}>
      {/* Header Area */}
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "900" }}>BOBA SHOP</h1>
        <p style={{ color: "#aa3bff", fontWeight: "bold", letterSpacing: "2px" }}>SELECT YOUR DRINK</p>
      </header>

      {message && (
        <div style={notificationStyle}>
          {message}
        </div>
      )}

      <div style={mainGrid}>
        {/* Menu Section */}
        <div style={menuSection}>
          {Object.keys(grouped).map((category) => (
            <div key={category} style={{ marginBottom: "3rem" }}>
              <h2 style={categoryTitle}>{category}</h2>
              <div style={itemGrid}>
                {grouped[category].map((item) => (
                  <div key={item.menu_item_id} style={itemCard}>
                    <div style={imagePlaceholder}>🧋</div>
                    <h3 style={{ margin: "10px 0 5px 0" }}>{item.name}</h3>
                    <p style={itemDesc}>{item.description}</p>
                    <div style={priceRow}>
                      <span style={priceTag}>${Number(item.base_price).toFixed(2)}</span>
                      <button style={addButton} onClick={() => addToCart(item)}>
                        Add +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Cart */}
        <aside style={cartSidebar}>
          <div style={cartHeader}>
            <h2 style={{ margin: 0 }}>Your Order</h2>
            <span style={cartBadge}>{cart.length}</span>
          </div>

          <div style={cartItemsList}>
            {cart.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", marginTop: "2rem" }}>
                Your cart is empty... for now.
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.menu_item_id} style={cartItemRow}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>${item.price.toFixed(2)}</div>
                  </div>
                  <div style={quantityControls}>
                    <button style={qtyBtn} onClick={() => changeQuantity(item.menu_item_id, -1)}>-</button>
                    <span style={{ minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                    <button style={qtyBtn} onClick={() => changeQuantity(item.menu_item_id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={checkoutSection}>
              <div style={totalRow}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button style={checkoutButton} onClick={handlePlaceOrder}>
                PLACE ORDER
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// --- STYLES ---

const pageContainer = {
  backgroundColor: "#16171d",
  color: "white",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  padding: "2rem",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "3rem",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 350px",
  gap: "2rem",
  maxWidth: "1400px",
  margin: "0 auto",
  alignItems: "start",
};

const menuSection = {
  paddingRight: "1rem",
};

const categoryTitle = {
  textTransform: "uppercase",
  letterSpacing: "2px",
  borderBottom: "2px solid #aa3bff",
  display: "inline-block",
  paddingBottom: "5px",
  marginBottom: "1.5rem",
};

const itemGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: "1.5rem",
};

const itemCard = {
  backgroundColor: "#1f2028",
  borderRadius: "20px",
  padding: "1.5rem",
  border: "1px solid #2e303a",
  transition: "transform 0.2s ease",
};

const imagePlaceholder = {
  height: "120px",
  backgroundColor: "#2e303a",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3rem",
};

const itemDesc = {
  fontSize: "0.85rem",
  color: "#9ca3af",
  height: "40px",
  overflow: "hidden",
};

const priceRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "1rem",
};

const priceTag = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#2ecc71",
};

const addButton = {
  backgroundColor: "#aa3bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const cartSidebar = {
  backgroundColor: "#1f2028",
  borderRadius: "24px",
  padding: "1.5rem",
  position: "sticky",
  top: "2rem",
  border: "1px solid #2e303a",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
};

const cartHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "1rem",
  borderBottom: "1px solid #2e303a",
};

const cartBadge = {
  backgroundColor: "#aa3bff",
  padding: "2px 10px",
  borderRadius: "20px",
  fontSize: "0.8rem",
  fontWeight: "bold",
};

const cartItemsList = {
  flexGrow: 1,
  overflowY: "auto",
  margin: "1rem 0",
};

const cartItemRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.8rem 0",
  borderBottom: "1px solid #2e303a",
};

const quantityControls = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "#16171d",
  padding: "5px 10px",
  borderRadius: "10px",
};

const qtyBtn = {
  background: "none",
  border: "none",
  color: "#aa3bff",
  fontSize: "1.2rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const checkoutSection = {
  paddingTop: "1rem",
  borderTop: "2px solid #2e303a",
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "1.4rem",
  fontWeight: "bold",
  marginBottom: "1rem",
};

const checkoutButton = {
  width: "100%",
  padding: "1.2rem",
  backgroundColor: "#2ecc71",
  color: "white",
  border: "none",
  borderRadius: "15px",
  fontSize: "1.1rem",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)",
};

const notificationStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  backgroundColor: "#2ecc71",
  color: "white",
  padding: "1rem 2rem",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
  zIndex: 1000,
  fontWeight: "bold",
};