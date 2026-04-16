import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const role = searchParams.get("role");
        const dest = searchParams.get("dest"); // Get it directly from the URL

        if (role) {
            localStorage.setItem("userRole", role);
            
            if (role === "manager") {
                // Use the 'dest' we passed through the whole Google loop
                navigate(dest || "/manager"); 
            } else if (role === "cashier") {
                navigate("/cashierpage");
            } else {
                navigate("/");
            }
        }
    }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20%", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#2d6a4f" }}>Aura Access Verified</h2>
      <p>Redirecting you to your station...</p>
    </div>
  );
}