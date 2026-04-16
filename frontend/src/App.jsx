import { BrowserRouter, Route, Routes } from "react-router-dom";
import PortalPage from "./pages/PortalPage"; 
import CustomerPage from "./pages/CustomerPage";
import KitchenPage from "./pages/KitchenPage";
import MenuBoardPage from "./pages/MenuBoardPage";
import CashierPage from "./pages/CashierPage";
import LoginSuccess from "./pages/LoginSuccess";
import ManagerDashboard from "./components/ManagerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Portal access via root or /portal */}
        <Route path="/" element={<PortalPage />} />
        <Route path="/portal" element={<PortalPage />} />

        {/* Public Routes */}
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/menuboard" element={<MenuBoardPage />} />

        {/* Protected Manager/Kitchen routes */}
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

        {/* Protected Cashier route */}
        <Route 
          path="/cashierpage" 
          element={
            <ProtectedRoute requiredRole="cashier">
              <CashierPage />
            </ProtectedRoute>
          } 
        /> 

        {/* Catch the backend redirect */}
        <Route path="/login-success" element={<LoginSuccess />} />

      </Routes>
    </BrowserRouter>
  );
}