import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus } from "../services/api";
import { Link } from "react-router-dom";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      // Only show 'pending' orders
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
        <h1 style={{fontSize: '2.5rem', margin: 0}}>Kitchen Queue</h1>
        <Link to="/"><button style={{padding: '10px 20px', cursor: 'pointer'}}>Portal</button></Link>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
        {orders.length === 0 ? (
          <p style={{color: '#9ca3af'}}>No active orders.</p>
        ) : (
          orders.map(order => (
            <div key={order.order_id} style={{ border: "2px solid #aa3bff", borderRadius: "16px", background: "#1f2028", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2e303a", paddingBottom: "10px" }}>
                <h2 style={{ margin: 0 }}>Order #{order.order_id}</h2>
                <span style={{ color: "#aa3bff", fontWeight: "bold" }}>{order.order_time}</span>
              </div>

              <div style={{ margin: "25px 0" }}>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: '0 0 5px 0' }}>ORDER TOTAL</p>
                <h3 style={{ fontSize: "2rem", margin: 0 }}>${Number(order.total_amount).toFixed(2)}</h3>
                <p style={{ color: "#2ecc71", marginTop: '10px' }}>● Status: {order.status}</p>
              </div>

              <button onClick={() => handleComplete(order.order_id)} style={{ width: "100%", padding: "15px", backgroundColor: "#2ecc71", border: "none", borderRadius: "10px", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: '1.1rem' }}>
                MARK AS READY
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}