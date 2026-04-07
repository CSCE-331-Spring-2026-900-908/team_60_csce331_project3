import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus } from "../services/api";
import { Link } from "react-router-dom";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      // Only show pending orders, sorted by oldest first
      const pending = data
        .filter(o => o.status?.toLowerCase() === "pending")
        .sort((a, b) => a.order_id - b.order_id);
      setOrders(pending);
    } catch (err) {
      console.error("Kitchen fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (id) => {
    try {
      await updateOrderStatus(id, "completed");
      setOrders(prev => prev.filter(o => o.order_id !== id));
    } catch (err) {
      console.error(err);
      alert("Error finishing order");
    }
  };

  /**
   * Helper: Grouping Logic
   * In the DB, toppings are separate items. We need to find items 
   * that aren't 'topping' and then check if the items following them ARE toppings.
   * This assumes the backend returns items in the order they were inserted.
   */
  const groupOrderItems = (items) => {
    if (!items) return [];
    const grouped = [];
    let currentDrink = null;

    items.forEach(item => {
      const isTopping = item.category?.toLowerCase().trim() === 'topping' || 
                        item.name?.toLowerCase().includes('topping');

      if (!isTopping) {
        currentDrink = { ...item, toppings: [] };
        grouped.push(currentDrink);
      } else if (currentDrink) {
        currentDrink.toppings.push(item);
      } else {
        // Fallback if a topping somehow appears first
        grouped.push({ ...item, toppings: [] });
      }
    });
    return grouped;
  };

  if (loading) return <div style={loadingScreen}>preparing aura kitchen...</div>;

  return (
    <div style={auraContainer}>
      <header style={auraHeader}>
        <div>
          <h1 style={logoStyle}>aura <span style={{fontWeight: '300'}}>kitchen</span></h1>
          <p style={subtitle}>active preparation queue</p>
        </div>
        <Link to="/" style={backBtn}>← portal</Link>
      </header>
      
      <div style={orderGrid}>
        {orders.length === 0 ? (
          <div style={emptyState}>no pending orders. everything is steeped to perfection.</div>
        ) : (
          orders.map(order => {
            const groupedItems = groupOrderItems(order.items);
            return (
              <div key={order.order_id} style={orderCard}>
                <div style={cardHeader}>
                  <div style={orderBadge}>#{order.order_id}</div>
                  <span style={timeText}>{new Date(order.order_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                <div style={itemsArea}>
                  {groupedItems.map((drink, idx) => (
                    <div key={idx} style={drinkRow}>
                      <div style={drinkName}>
                        <span style={qtyMark}>1x</span> {drink.name.toLowerCase()}
                      </div>
                      {drink.toppings.length > 0 && (
                        <div style={toppingList}>
                          {drink.toppings.map((t, tIdx) => (
                            <div key={tIdx} style={toppingItem}>+ {t.name.toLowerCase()}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={footer}>
                   <button onClick={() => handleComplete(order.order_id)} style={completeBtn}>
                    MARK AS READY
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// --- AURA KITCHEN STYLES ---
const auraContainer = { 
  padding: "2rem", 
  backgroundColor: "#f1f8f1", 
  minHeight: "100vh", 
  color: "#1b4332", 
  fontFamily: '"Inter", sans-serif' 
};

const auraHeader = { 
  display: "flex", 
  justifyContent: "space-between", 
  marginBottom: "3rem", 
  alignItems: 'flex-start' 
};

const logoStyle = { fontSize: '2.5rem', margin: 0, fontWeight: '800', letterSpacing: '-1px' };
const subtitle = { margin: 0, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px' };
const backBtn = { textDecoration: 'none', color: '#1b4332', fontWeight: '700', border: '1px solid rgba(27,67,50,0.2)', padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem' };

const orderGrid = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
  gap: "2rem" 
};

const orderCard = { 
  background: "white", 
  borderRadius: "30px", 
  padding: "1.5rem", 
  display: 'flex', 
  flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(27,67,50,0.05)',
  border: '1px solid rgba(27,67,50,0.05)'
};

const cardHeader = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: 'center',
  marginBottom: '1.5rem'
};

const orderBadge = { 
  background: '#1b4332', 
  color: 'white', 
  padding: '5px 15px', 
  borderRadius: '50px', 
  fontWeight: '800' 
};

const timeText = { opacity: 0.5, fontWeight: '700', fontSize: '0.9rem' };

const itemsArea = { flex: 1, marginBottom: '2rem' };

const drinkRow = { 
  marginBottom: '1.2rem', 
  paddingBottom: '1rem', 
  borderBottom: '1px solid #f1f8f1' 
};

const drinkName = { fontSize: '1.2rem', fontWeight: '700', color: '#1b4332' };
const qtyMark = { color: '#52b788', marginRight: '8px' };

const toppingList = { 
  marginTop: '5px', 
  paddingLeft: '32px' 
};

const toppingItem = { 
  fontSize: '0.9rem', 
  color: '#2d6a4f', 
  opacity: 0.8,
  fontStyle: 'italic'
};

const footer = { marginTop: 'auto' };

const completeBtn = { 
  width: "100%", 
  padding: "1.2rem", 
  backgroundColor: "#52b788", 
  border: "none", 
  borderRadius: "20px", 
  color: "#1b4332", 
  fontWeight: "800", 
  cursor: "pointer", 
  fontSize: '1rem',
  transition: 'transform 0.2s'
};

const loadingScreen = { background: '#f1f8f1', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1b4332', fontWeight: '700' };
const emptyState = { gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, marginTop: '4rem', fontWeight: '600' };