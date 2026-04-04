import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import PortalPage from "./pages/PortalPage"; 
import CustomerPage from "./pages/CustomerPage";
import ManagerStats from "./components/ManagerStats";
import KitchenPage from "./pages/KitchenPage";
import MenuBoardPage from "./pages/MenuBoardPage";
import CashierPage from "./pages/CashierPage";

// The Manager Dashboard View
function AdminPlaceholder() {
  return (
    <div style={{ 
      padding: "4rem", 
      fontFamily: "Arial, sans-serif", 
      backgroundColor: "#16171d", 
      color: "white", 
      minHeight: "100vh",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Manager Dashboard</h1>
      
      <div style={{ background: "#1f2028", padding: "2rem", borderRadius: "15px", maxWidth: "1000px", margin: "0 auto" }}>
        <ManagerStats /> 
      </div>

      <div style={{ marginTop: "3rem", borderTop: "1px solid #2e303a", paddingTop: "2rem" }}>
        <p style={{ color: "#9ca3af" }}>Advanced Inventory and Employee tools coming soon.</p>
        
        <Link to="/">
          <button style={{ 
            marginTop: "2rem", 
            padding: "1rem 2.5rem", 
            backgroundColor: "#aa3bff", 
            color: "white", 
            border: "none", 
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1rem"
          }}>
            ← Back to Portal
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<PortalPage />} />
        
        {/* System Pages */}
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/manager" element={<AdminPlaceholder />} /> 
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/menuboard" element={<MenuBoardPage />} />
        <Route path="/cashierpage" element={<CashierPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}