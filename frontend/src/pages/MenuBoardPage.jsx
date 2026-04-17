import { useEffect, useState } from "react";
import Weather from '../components/Weather';
import { fetchMenu } from "../services/api";
import { Link } from "react-router-dom";

export default function MenuBoardPage() {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    // This now uses the dynamic API_BASE from your fixed api.js
    fetchMenu()
      .then((items) => {
        const menuOnly = items.filter(item => 
          item.category?.toString().trim().toLowerCase() !== 'topping'
        );
        setMenu(menuOnly);

        const uniqueCategories = ["all", ...new Set(menuOnly.map(item => item.category))];
        setCategories(uniqueCategories);
      })
      .catch(err => console.error("Menu fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredMenu = activeCategory === "all" 
    ? menu 
    : menu.filter(item => item.category === activeCategory);

  if (loading) return <div style={loadingScreen}>steeping the menu...</div>;

  return (
    <div style={pageStyle}>
      <Link to="/" style={backBtnStyle}>← portal</Link>

      <div style={{ position: "absolute", top: "2rem", right: "2rem", background: "#2d6a4f", padding: "0.5rem 1.2rem", borderRadius: "50px" }}>
        <Weather />
      </div>

      
      <header style={titleHeader}>
        <h1 style={logoStyle}>aura <span style={{fontWeight: '300'}}>menu</span></h1>
        <p style={subtitleStyle}>steeped in nature</p>
      </header>

      <div style={tabContainer}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            style={tabStyle(activeCategory === cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={gridContainer}>
        {filteredMenu.map((item) => (
          <div key={item.menu_item_id} style={menuCard}>
            <div>
              <h2 style={itemTitle}>{item.name.toLowerCase()}</h2>
              <p style={itemDescription}>{item.description}</p>
            </div>
            <div style={priceContainer}>
              <span style={priceBadge}>
                ${parseFloat(item.base_price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Added Loading Screen Style for consistency with Kitchen/Stats
const loadingScreen = { 
  background: '#e8f5e9', 
  height: '100vh', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  color: '#1b4332', 
  fontWeight: '700',
  fontFamily: '"Inter", sans-serif'
};

// ... keep all your other existing styles exactly the same
const pageStyle = { backgroundColor: '#e8f5e9', minHeight: '100vh', padding: '2rem', color: '#1e293b', position: 'relative', fontFamily: '"Inter", sans-serif' };
const backBtnStyle = { position: 'absolute', top: '30px', left: '40px', zIndex: 100, textDecoration: 'none', color: '#1b4332', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', padding: '10px 22px', borderRadius: '50px', border: '1px solid rgba(27, 67, 50, 0.1)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const headerLayout = { display: 'flex', justifyContent: 'flex-end', maxWidth: '1400px', margin: '0 auto', marginTop: '10px' };
const titleHeader = { textAlign: 'center', marginBottom: '4rem', marginTop: '20px' };
const logoStyle = { fontSize: '4.5rem', fontWeight: '800', color: '#1b4332', margin: 0 };
const subtitleStyle = { color: '#2d6a4f', fontSize: '0.75rem', letterSpacing: '0.6rem', textTransform: 'uppercase', opacity: 0.6, margin: 0 };
const tabContainer = { display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '5rem', flexWrap: 'wrap' };
const tabStyle = (isActive) => ({ padding: "10px 24px", borderRadius: "50px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", textTransform: "lowercase", transition: "all 0.3s ease", border: "1px solid", borderColor: isActive ? "#2d6a4f" : "rgba(45, 106, 79, 0.2)", background: isActive ? "#2d6a4f" : "rgba(255, 255, 255, 0.5)", color: isActive ? "white" : "#2d6a4f", backdropFilter: "blur(5px)" });
const gridContainer = { display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' };
const menuCard = { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderRadius: '32px', padding: '2.5rem', width: '320px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const itemTitle = { color: '#1b4332', fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', margin: 0 };
const itemDescription = { color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' };
const priceContainer = { textAlign: 'right', marginTop: '1.5rem' };
const priceBadge = { background: '#c8e6c9', padding: '6px 16px', borderRadius: '50px', fontWeight: '700', color: '#2d6a4f', fontSize: '0.9rem' };