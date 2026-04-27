import { useState, useEffect } from "react";

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("team");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tabs = [
    { id: "team",     label: "Team",          icon: "👥" },
    { id: "features", label: "Features",      icon: "🧋" },
    { id: "beyond",   label: "Beyond",        icon: "⭐" },
    { id: "a11y",     label: "Accessibility", icon: "♿" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="App information"
        style={triggerBtn}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(27,67,50,0.35)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,67,50,0.25)";
        }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>ⓘ</span>
      </button>

      {open && (
        <div
          style={overlay}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div style={panel}>

            <div style={panelHeader}>
              <div>
                <h2 style={panelTitle}>aura <span style={{ fontWeight: 300 }}>boba</span></h2>
                <p style={panelSubtitle}>built by team 60 · csce 331 · spring 2026</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={closeBtn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >✕</button>
            </div>

            <div style={tabBar}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{ ...tabBtn, ...(tab === t.id ? tabBtnActive : {}) }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div style={body}>
              <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Content coming soon...</p>
            </div>

            <div style={panelFooter}>
              <span style={footerText}>press esc or click outside to close</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

const triggerBtn = {
  position: "fixed", top: "1.2rem", right: "1.2rem", zIndex: 9000,
  width: "2.4rem", height: "2.4rem", borderRadius: "50%",
  background: "#1b4332", color: "white",
  border: "2px solid rgba(82,183,136,0.6)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 16px rgba(27,67,50,0.25)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease", fontFamily: "inherit",
};
const overlay = {
  position: "fixed", inset: 0, zIndex: 9001,
  background: "rgba(15,30,20,0.65)", backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
};
const panel = {
  background: "#f8fdf9", borderRadius: "28px", width: "100%", maxWidth: "780px",
  maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden",
  boxShadow: "0 32px 80px rgba(0,0,0,0.25)", border: "1px solid rgba(82,183,136,0.25)",
};
const panelHeader = {
  background: "#1b4332", padding: "1.4rem 1.8rem",
  display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
};
const panelTitle = { margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "white", letterSpacing: "-0.5px" };
const panelSubtitle = { margin: "4px 0 0", fontSize: "0.7rem", color: "#52b788", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" };
const closeBtn = {
  background: "transparent", border: "none", color: "rgba(255,255,255,0.7)",
  fontSize: "1.2rem", cursor: "pointer", width: "2rem", height: "2rem",
  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background 0.15s", flexShrink: 0,
};
const tabBar = { display: "flex", borderBottom: "1px solid #d1fae5", background: "white", flexShrink: 0 };
const tabBtn = {
  flex: 1, padding: "0.85rem 0.5rem", background: "transparent", border: "none",
  borderBottom: "3px solid transparent", cursor: "pointer", fontSize: "0.78rem",
  fontWeight: 700, color: "#64748b", display: "flex", flexDirection: "column",
  alignItems: "center", gap: "3px", transition: "color 0.15s, border-color 0.15s", fontFamily: "inherit",
};
const tabBtnActive = { color: "#1b4332", borderBottomColor: "#2d6a4f", background: "#f1f8f1" };
const body = { overflowY: "auto", padding: "1.4rem 1.8rem", flex: 1 };
const panelFooter = { padding: "0.7rem 1.8rem", background: "white", borderTop: "1px solid #d1fae5", flexShrink: 0 };
const footerText = { fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic" };