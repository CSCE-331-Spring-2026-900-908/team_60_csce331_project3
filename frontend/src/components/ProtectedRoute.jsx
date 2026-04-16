import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  // MANAGER BYPASS: Managers have permission for all protected routes.
  const hasAccess = userRole === "manager" || userRole === requiredRole;

  if (hasAccess) {
    console.log(`Access granted to ${userName} for role: ${requiredRole}`);
    return children;
  }

  // Redirect to portal if they don't have the right role
  return <Navigate to="/" replace />;
}