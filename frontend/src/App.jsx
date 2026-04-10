import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import PortalPage from "./pages/PortalPage"; 
import CustomerPage from "./pages/CustomerPage";
import ManagerStats from "./components/ManagerStats";
import KitchenPage from "./pages/KitchenPage";
import MenuBoardPage from "./pages/MenuBoardPage";
import CashierPage from "./pages/CashierPage";
import ManagerDashboard from "./components/ManagerDashboard";

// 1. Import your new protection component
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Modernized Manager Dashboard Placeholder
 * Uses CSS variables from index.css for a bright aesthetic.
 */
function AdminPlaceholder() {
  return (
    <div style={{ 
      padding: "4rem", 
      fontFamily: "var(--sans)", 
      backgroundColor: "var(--bg)", 
      color: "var(--text)", 
      minHeight: "100vh",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem", color: "var(--text-h)" }}>
        Manager Dashboard
      </h1>
      
      <div style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "20px", 
        maxWidth: "1000px", 
        margin: "0 auto",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)" 
      }}>
        <ManagerStats /> 
      </div>

      <div style={{ marginTop: "3rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
        <p style={{ color: "#64748b" }}>Advanced Inventory and Employee tools coming soon.</p>
        <Link to="/">
          <button style={{ 
            marginTop: "2rem", 
            padding: "1rem 2.5rem", 
            backgroundColor: "var(--accent)", 
            color: "white", 
            border: "none", 
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1rem",
            transition: "all 0.2s ease"
          }}>
            ← Back to Portal
          </button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Main Application Component
 * Handles routing for the POS system.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publicly accessible routes */}
        <Route path="/" element={<PortalPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/menuboard" element={<MenuBoardPage />} />

        {/* 2. Protected Manager/Kitchen routes */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        /> 
        
        <Route 
          path="/kitchen" 
          element={
            <ProtectedRoute requiredRole="manager">
              <KitchenPage />
            </ProtectedRoute>
          } 
        />

        {/* 3. Protected Cashier route */}
        <Route 
          path="/cashierpage" 
          element={
            <ProtectedRoute requiredRole="cashier">
              <CashierPage />
            </ProtectedRoute>
          } 
        /> 
        
      </Routes>
    </BrowserRouter>
  );
}