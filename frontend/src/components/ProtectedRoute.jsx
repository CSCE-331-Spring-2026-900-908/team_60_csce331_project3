import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function ProtectedRoute({ children, requiredRole }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async (resp) => {
    // Note: If you are testing on Render, change localhost to your Render URL
    try {
      const res = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resp.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        // Validation: Managers can see everything. Cashiers only see cashier pages.
        const hasAccess = data.role === "manager" || data.role === requiredRole;
        
        if (hasAccess) {
          setSession(data);
        } else {
          setError(`Access Denied: ${requiredRole} privileges required.`);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Server connection failed. Is your backend running?");
    }
  };

  // If logged in and authorized, show the protected page
  if (session) return children;

  // Otherwise, show the Aura-themed login screen
  return (
    <div style={authPageStyle}>
      <div style={authCard}>
        <h1 style={logoStyle}>aura <span style={{fontWeight:'300'}}>access</span></h1>
        <p style={subtitleStyle}>{requiredRole} portal authentication</p>
        
        <div style={loginWrapper}>
          <GoogleLogin 
            onSuccess={handleLogin} 
            onError={() => setError("Google Login Failed")} 
          />
        </div>
        
        {error && <div style={errorStyle}>{error}</div>}
        
        <p style={footerNote}>Please use an authorized project email.</p>
      </div>
    </div>
  );
}

// STYLES to match your kiosk aesthetic
const authPageStyle = { 
  height:'100vh', 
  display:'flex', 
  alignItems:'center', 
  justifyContent:'center', 
  backgroundColor:'#e8f5e9' 
};

const authCard = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  padding: '3rem',
  borderRadius: '40px',
  textAlign: 'center',
  border: '1px solid #c8e6c9',
  boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
  width: '100%',
  maxWidth: '400px'
};

const logoStyle = { fontSize: '3rem', fontWeight: '800', color: '#1b4332', margin: 0, letterSpacing: '-1px' };
const subtitleStyle = { color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.7rem', fontWeight: '700', margin: '10px 0 30px 0', opacity: 0.6 };
const loginWrapper = { display: 'flex', justifyContent: 'center', margin: '20px 0' };
const footerNote = { fontSize: '0.75rem', color: '#64748b', marginTop: '20px' };

const errorStyle = { 
  marginTop: '20px', 
  padding: '10px', 
  background: '#fee2e2', 
  color: '#b91c1c', 
  borderRadius: '12px', 
  fontSize: '0.85rem',
  fontWeight: '600',
  border: '1px solid #fecaca' 
};