import { useEffect, useState } from "react";
import Weather from '../components/Weather';
import { fetchMenu } from "../services/api";

export default function MenuBoardPage() {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMenu().then((items) => {
      // 1. Filter out toppings from the main menu list immediately
      const menuOnly = items.filter(item => 
        item.category?.toString().trim().toLowerCase() !== 'topping'
      );
      setMenu(menuOnly);

      // 2. Extract unique categories from the DRINKS ONLY
      const uniqueCategories = ["all", ...new Set(menuOnly.map(item => item.category))];
      setCategories(uniqueCategories);
    }).catch(err => console.error("Fetch failed:", err));
  }, []);

  const filteredMenu = activeCategory === "all" 
    ? menu 
    : menu.filter(item => item.category === activeCategory);

  // Minimalist Styles
  const pageStyle = {
    backgroundColor: '#e8f5e9', // Mint Green
    minHeight: '100vh',
    fontFamily: "var(--sans)",
    padding: '3rem 2rem',
    color: '#1e293b'
  };

  const tabStyle = (isActive) => ({
    padding: "10px 24px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "lowercase",
    transition: "all 0.3s ease",
    border: "1px solid",
    borderColor: isActive ? "#2d6a4f" : "rgba(45, 106, 79, 0.2)",
    background: isActive ? "#2d6a4f" : "rgba(255, 255, 255, 0.5)",
    color: isActive ? "white" : "#2d6a4f",
    backdropFilter: "blur(5px)"
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <a href="/" style={{ textDecoration: 'none', color: '#2d6a4f', fontWeight: '700' }}>← portal</a>
        <Weather />
      </div>

      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', color: '#1b4332', textTransform: 'lowercase', margin: 0 }}>
          aura menu
        </h1>
        <p style={{ color: '#2d6a4f', fontSize: '0.75rem', letterSpacing: '0.6rem', textTransform: 'uppercase', opacity: 0.6 }}>
          steeped in nature
        </p>
      </header>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
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

      {/* Grid of Menu Items */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        {filteredMenu.map((item) => (
          <div key={item.menu_item_id} style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '32px',
            padding: '2.5rem',
            width: '320px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ color: '#1b4332', textTransform: 'lowercase', fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {item.name}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {item.description}
              </p>
            </div>
            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <span style={{ background: '#c8e6c9', padding: '6px 16px', borderRadius: '50px', fontWeight: '700', color: '#2d6a4f', fontSize: '0.9rem' }}>
                ${parseFloat(item.base_price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}