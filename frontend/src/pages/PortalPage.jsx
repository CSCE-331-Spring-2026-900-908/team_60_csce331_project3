import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Weather from "../components/Weather";
import ChatBot from "../components/ChatBot";
import { fetchDogFeature } from "../services/api";
import { fetchJoke } from "../services/api";
export default function PortalPage() {
  const [dogFeature, setDogFeature] = useState(null);
  const [dogError, setDogError] = useState("");
  const [joke, setJoke] = useState("");
  // Logic to handle the redirect and save the clicked destination
  const handleProtectedLogin = (e, destination) => {
    e.preventDefault();

    const displayLabel = destination.replace("/", "");
    window.narrate(`Opening ${displayLabel} page`);
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    // Pass the destination in the URL
    setTimeout(() => {
	window.location.href = `${BACKEND_URL}/auth/google?state=${destination}`; 
    }, 300 );
  };

  useEffect(() => {
    let isMounted = true;

    fetchDogFeature()
      .then((data) => {
        if (isMounted) {
          setDogFeature(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDogError("the shop dog is off on a walk right now.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
  let isMounted = true;

  fetchJoke()
    .then((data) => {
      if (isMounted) {
        setJoke(data.joke);
      }
    })
    .catch(() => {
      if (isMounted) {
        setJoke("Why did the boba bring a dog to work? For paw-sitive customer service.");
      }
    });

  return () => {
    isMounted = false;
  };
}, []);

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.4)", 
    borderRadius: "32px",                 
    padding: "2.5rem 1.5rem",
    width: "240px", 
    textAlign: "center",
    textDecoration: "none",
    color: "#1e293b",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer"
  };

  const titleStyle = {
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    fontWeight: "600",
    textTransform: "lowercase",
    color: "#2d6a4f", 
  };

  const descStyle = {
    fontSize: "0.85rem",
    color: "#64748b",
    lineHeight: "1.4",
    margin: 0,
    opacity: 0.8
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#e8f5e9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative"
    }}>
      
      {/* Weather Widget */}
      <div style={{ position: "absolute", top: "2rem", right: "2rem", background: "#2d6a4f", padding: "0.5rem 1.2rem", borderRadius: "50px" }}>
        <Weather />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "4.5rem", margin: "0", fontWeight: "800", color: "#1b4332" }}>
          aura <span style={{fontWeight:'300'}}>boba</span>
        </h1>
        <p style={{ color: "#2d6a4f", fontSize: "0.75rem", marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.6rem", opacity: 0.85 }}>
          est. 2026
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center", maxWidth: "1000px" }}>
        
        {/* PUBLIC ROUTES */}
        <Link 
		to="/customer"
		style={cardStyle} 
		className="hover-lift"
		aria-label = "Menu Kiosk Page. Self serving ordering."
		onClick = {(e) => {
			e.preventDefault();
			window.narrate("Opening kiosk page");

			setTimeout(() => {
				window.location.href = "/customer";
			}, 300);
		}}
	>
          <h2 style={titleStyle}>kiosk</h2>
          <p style={descStyle}>self-service ordering</p>
        </Link>

        {/* PROTECTED ROUTES: Now passing the route string to the handler */}
        <a 
		href="#" 
		onClick={(e) => handleProtectedLogin(e, "/cashierpage")} 
		style={cardStyle} 
		className="hover-lift"
		aria-label = "Cashier Page. In store employee order processing."
	>
          <h2 style={titleStyle}>cashier</h2>
          <p style={descStyle}>in-store processing</p>
        </a>

        <a 
		href="#" 
		onClick={(e) => handleProtectedLogin(e, "/kitchen")} 
		style={cardStyle} 
		className="hover-lift"
		aria-label = "Kitchen Page. In store employee order fulfillment."
	>
          <h2 style={titleStyle}>kitchen</h2>
          <p style={descStyle}>order fulfillment queue</p>
        </a>

        <a 
		href="#" 
		onClick={(e) => handleProtectedLogin(e, "/manager")} 
		style={cardStyle} 
		className="hover-lift"
		aria-label = "Manager page. View in store employee stats and inventory."
	>
          <h2 style={titleStyle}>manager</h2>
          <p style={descStyle}>stats and inventory</p>
        </a>

        <Link 
		to="/menuboard" 
		style={cardStyle} 
		className="hover-lift"
		aria-label = "Menu board page. Digital storefront display."
		onClick = {(e) => {
			e.preventDefault();
			window.narrate("Opening menu board page.");
			setTimeout(() => {
				window.location.href = "/menuboard";
			}, 300);
		}}
	>
          <h2 style={titleStyle}>menu</h2>
          <p style={descStyle}>digital storefront display</p>
        </Link>

      </div>

      <section style={vibeSection}>
        <div style={vibeHeadingRow}>
          <div>
            <p style={eyebrowStyle}>dog api</p>
            <h2 style={vibeTitle}>paw of the moment</h2>
          </div>
          <p style={vibeCopy}>A rotating shop companion to keep the portal charming for absolutely no operational reason.</p>
        </div>

        {dogError ? (
          <div style={vibeFallback}>{dogError}</div>
        ) : (
          <div style={dogCard}>
            <div style={dogImageWrap}>
              {dogFeature?.imageUrl ? (
                <img src={dogFeature.imageUrl} alt={dogFeature.breedName} style={dogImage} />
              ) : (
                <div style={dogImageFallback}>dog loading...</div>
              )}
            </div>
            <div style={dogMeta}>
              <span style={dogTag}>today's aura mascot</span>
              <h3 style={dogName}>{dogFeature?.breedName || "Mystery Pup"}</h3>
              <p style={dogDescription}>
                Temperament: {dogFeature?.temperament || "sweet, surprising, and ready for a spotlight"}.
              </p>
              <div style={dogFacts}>
                <span>origin: {dogFeature?.origin || "somewhere adorable"}</span>
                <span>life span: {dogFeature?.lifeSpan || "unknown"}</span>
                <span>bred for: {dogFeature?.bredFor || "being a very good dog"}</span>
                {joke && (
                <div style={jokeCard}>
                <p style={jokeLabel}>joke of the day</p>
                <p style={jokeText}>{joke}</p>
                </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <ChatBot />

      <style>{`
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}

const vibeSection = {
  width: "min(1120px, 100%)",
  marginTop: "3.5rem",
  padding: "2rem 2.25rem 2.25rem",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "30px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 25px rgba(27,67,50,0.06)",
};

const vibeHeadingRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: "1.5rem",
  flexWrap: "wrap",
  marginBottom: "1.5rem",
};

const eyebrowStyle = {
  margin: 0,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.3rem",
  color: "#2d6a4f",
  opacity: 0.7,
};

const vibeTitle = {
  margin: "0.35rem 0 0",
  color: "#1b4332",
  fontSize: "2rem",
  textTransform: "lowercase",
};

const vibeCopy = {
  margin: 0,
  maxWidth: "360px",
  color: "#5f6f68",
  lineHeight: 1.5,
  fontSize: "0.95rem",
};

const dogCard = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 320px) 1fr",
  gap: "1.4rem",
  alignItems: "center",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(45,106,79,0.14)",
  borderRadius: "24px",
  padding: "1.15rem",
  color: "#1e293b",
  minHeight: "220px",
};

const dogImageWrap = {
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: "22px",
  overflow: "hidden",
  background: "#eef8ee",
};

const dogImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const dogImageFallback = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2d6a4f",
  fontSize: "1rem",
  fontWeight: "700",
  textTransform: "lowercase",
};

const dogMeta = {
  minWidth: 0,
};

const dogTag = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1rem",
  color: "#2d6a4f",
};

const dogName = {
  margin: "0.35rem 0",
  fontSize: "1.6rem",
  color: "#1b4332",
  textTransform: "lowercase",
};

const dogDescription = {
  margin: 0,
  fontSize: "0.95rem",
  color: "#64748b",
  lineHeight: 1.55,
};

const dogFacts = {
  display: "grid",
  gap: "0.55rem",
  marginTop: "1rem",
  fontSize: "0.82rem",
  color: "#5f6f68",
  textTransform: "lowercase",
};

const vibeFallback = {
  padding: "1rem 1.25rem",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.72)",
  color: "#64748b",
  fontWeight: "600",
};

const jokeCard = {
  marginTop: "1.25rem",
  padding: "1rem 1.15rem",
  borderRadius: "18px",
  background: "rgba(232,245,233,0.75)",
  border: "1px solid rgba(45,106,79,0.14)",
};

const jokeLabel = {
  margin: "0 0 0.35rem",
  fontSize: "0.7rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.12rem",
  color: "#2d6a4f",
};

const jokeText = {
  margin: 0,
  fontSize: "0.9rem",
  color: "#64748b",
  lineHeight: 1.5,
};
