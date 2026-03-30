import { Link } from "react-router-dom";

export default function PortalPage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Reveille Bubble Tea</h1>
      <p>Select an interface.</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "220px" }}>
          <h2>Customer Kiosk</h2>
          <p>Browse drinks and place an order.</p>
          <Link to="/customer">Open Customer Kiosk</Link>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "220px" }}>
          <h2>Cashier</h2>
          <p>Coming soon</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "1rem", width: "220px" }}>
          <h2>Manager</h2>
          <p>Coming soon</p>
        </div>
	
	<div style = {{ border: "1px solid #ccc", padding: "1rem", width: "220px" }}>
		<h2>Menu Board</h2>
		<p>Coming soon</p>
	</div>

	<div style = {{ border: "1px solid #ccc", padding: "1rem", width: 220px" }}>
		<h2>Cashier Interface</h2>
		<p>Coming Soon<p>
	</div>
      </div>
    </div>
  );
}
