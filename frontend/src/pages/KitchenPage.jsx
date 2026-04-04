import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus } from "../services/api";
import { Link } from "react-router-dom";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data.filter(o => o.status === "pending").sort((a, b) => a.order_id - b.order_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
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

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '5rem'}}>Loading Kitchen...</div>;

  return (
    <div style={{ padding: "2rem", backgroundColor: "#16171d", minHeight: "100vh", color: "white", fontFamily: 'sans-serif' }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", alignItems: 'center' }}>
        <h1 style={{fontSize: '2.5rem', margin: 0, fontWeight: 'bold'}}>Kitchen Queue</h1>
        <Link to="/"><button style={{padding: '8px 16px', cursor: 'pointer', background: '#555', color: 'white', border: 'none', borderRadius: '4px'}}>Portal</button></Link>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
        {orders.length === 0 ? (
          <p style={{color: '#9ca3af'}}>No active orders.</p>
        ) : (
          orders.map(order => (
            <div key={order.order_id} style={{ border: "2px solid #aa3bff", borderRadius: "20px", background: "#1f2028", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2e303a", paddingBottom: "10px" }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Order #{order.order_id}</h2>
                <span style={{ color: "#aa3bff", fontWeight: "bold" }}>{order.order_time}</span>
              </div>

              <div style={{ margin: "20px 0", textAlign: 'center' }}>
                <p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: '0' }}>ORDER TOTAL</p>
                <h3 style={{ fontSize: "2.5rem", margin: '5px 0' }}>${Number(order.total_amount).toFixed(2)}</h3>
                
                {/* ITEMS SECTION */}
                <div style={{ background: "#16171d", padding: "15px", borderRadius: "10px", marginTop: "15px", textAlign: 'left', border: '1px solid #2e303a' }}>
                   <p style={{ fontSize: "0.75rem", color: "#aa3bff", margin: "0 0 10px 0", fontWeight: "bold", textAlign: 'center' }}>ITEMS TO PREPARE:</p>
                   <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <li key={idx} style={{ fontSize: "1.3rem", marginBottom: "6px" }}>
                          <span style={{ color: "#aa3bff", fontWeight: "bold" }}>{item.quantity}x</span> {item.name}
                        </li>
                      ))
                    ) : (
                      <li style={{ color: "#555", fontStyle: "italic", textAlign: "center" }}>No items found</li>
                    )}
                   </ul>
                </div>

                <p style={{ color: "#2ecc71", marginTop: '15px' }}>● Status: {order.status}</p>
              </div>

              <button onClick={() => handleComplete(order.order_id)} style={{ width: "100%", padding: "18px", backgroundColor: "#2ecc71", border: "none", borderRadius: "12px", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: '1.2rem' }}>
                MARK AS READY
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}