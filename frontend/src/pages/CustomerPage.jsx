// CustomerPage.jsx - Customer-facing kiosk for browsing the menu and placing orders
import { useEffect, useMemo, useState } from "react";
import { fetchMenu, placeOrder } from "../services/api";

export default function CustomerPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]); // State for menu items fetched from the database, cart contents, and status messages
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
      const existing = prev.find(
        (x) => x.menu_item_id === item.menu_item_id
      );

      if (existing) {
        return prev.map((x) =>
          x.menu_item_id === item.menu_item_id
            ? { ...x, quantity: x.quantity + 1 }
            : x
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
          item.menu_item_id === menuItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  async function handlePlaceOrder() {
    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      const payload = {
        items: cart,
        total_amount: Number(total.toFixed(2)),
      };

      const result = await placeOrder(payload);
      setMessage(`Order placed successfully. Order ID: ${result.order_id}`);
      setCart([]);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to place order.");
    }
  }
// Group menu items by category for organized display on the page
  const grouped = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Customer Kiosk</h1>
      <p>Browse drinks below.</p>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <div>
          {Object.keys(grouped).length === 0 ? (
            <p>Loading menu...</p>
          ) : (
            Object.keys(grouped).map((category) => (
              <div key={category} style={{ marginBottom: "2rem" }}>
                <h2 style={{ textTransform: "capitalize" }}>{category}</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                  }}
                >
                  {grouped[category].map((item) => (
                    <div
                      key={item.menu_item_id}
                      style={{
                        border: "1px solid #ccc",
                        padding: "1rem",
                        borderRadius: "8px",
                      }}
                    >
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <p>${Number(item.base_price).toFixed(2)}</p>
                      <button onClick={() => addToCart(item)}>
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            position: "sticky",
            top: "1rem",
          }}
        >
          <h2>Cart</h2>

          {cart.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.menu_item_id} style={{ marginBottom: "1rem" }}>
                  <strong>{item.name}</strong>
                  <p>
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => changeQuantity(item.menu_item_id, -1)}>
                      -
                    </button>
                    <button onClick={() => changeQuantity(item.menu_item_id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}

              <h3>Total: ${total.toFixed(2)}</h3>
              <button onClick={handlePlaceOrder}>Place Order</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}