import { useState, useEffect } from "react";

const TEAM = [
  {
    name: "Garv Puri",
    role: "Fullstack · Scrum Master",
    emoji: "🎰",
    contrib: [
      "Built the Gacha \"Surprise Me!\" feature with rarity tiers",
      "Constructed the Cashier page with topping toggles & order submission",
      "Served as Scrum Master across all three sprints",
    ],
  },
  {
    name: "Andrew Siv",
    role: "Fullstack",
    emoji: "📊",
    contrib: [
      "Designed the full PostgreSQL database schema",
      "Implemented all manager reports (Sales, Usage, X/Z-Report)",
      "Collaborated on customer interface & accessibility features",
    ],
  },
  {
    name: "Muhammad Ibrahime",
    role: "Fullstack",
    emoji: "🤖",
    contrib: [
      "Integrated live weather data via NWS API",
      "Built Reveille-Bot AI chatbot using Groq LLaMA 3.3",
      "Implemented the loyalty stamp reward system",
    ],
  },
  {
    name: "Sam Garces",
    role: "Fullstack",
    emoji: "🔐",
    contrib: [
      "Integrated Google OAuth across all protected routes",
      "Added toppings logic & improved kiosk navigation",
      "Designed the overall aesthetic and visual identity of the app",
    ],
  },
  {
    name: "Rian Hickey",
    role: "Frontend",
    emoji: "♿",
    contrib: [
      "Designed & implemented all three accessibility personas",
      "Built the translation API for Spanish speakers",
      "Created the weather-based drink recommendation feature",
    ],
  },
  {
    name: "Christian Bui",
    role: "Frontend",
    emoji: "🚀",
    contrib: [
      "Initialized the site structure & first implementation",
      "Deployed the frontend & backend to Render",
      "Collaborated on Weather widget & Chatbot API integration",
    ],
  },
];

const INTERFACES = [
  { icon: "🏪", name: "Customer Kiosk",    path: "/customer",    desc: "Self-service ordering with Google login, drink photos, topping customization, and a loyalty stamp card." },
  { icon: "💳", name: "Cashier Station",   path: "/cashierpage", desc: "In-store order entry. Browse drinks, toggle toppings per item, and finalize orders in one click." },
  { icon: "👨‍🍳", name: "Kitchen Queue",     path: "/kitchen",     desc: "Real-time pending order display that auto-refreshes every 5 seconds. Mark orders complete as they're made." },
  { icon: "📊", name: "Manager Dashboard", path: "/manager",     desc: "Sales & ingredient usage reports, X/Z-reports, inventory levels, employee directory, and menu item creation." },
  { icon: "📋", name: "Menu Board",        path: "/menuboard",   desc: "Public-facing digital menu sorted by category. No login required." },
];

const CORE_FEATURES = [
  { icon: "🔑", text: "Google OAuth — secure one-click login on all protected pages" },
  { icon: "🧋", text: "Topping customization modal on every drink" },
  { icon: "🛒", text: "Cart management — add, remove, and adjust quantities before checkout" },
  { icon: "⚡", text: "Live order status updates (pending → completed)" },
  { icon: "🌡️", text: "Live weather widget — current College Station temperature via NWS API" },
  { icon: "🤖", text: "Reveille-Bot AI chatbot — Aggie-themed drink recommendations (Groq)" },
  { icon: "📈", text: "Sales & ingredient usage reports with date-range filters" },
  { icon: "📄", text: "X-Report — hourly revenue breakdown for the current day" },
  { icon: "🔒", text: "Z-Report — finalize and reset daily totals (one-time per day)" },
  { icon: "📦", text: "Inventory management — view and update stock levels in real time" },
  { icon: "👥", text: "Employee directory — hire staff and assign roles from the dashboard" },
];

const BEYOND_FEATURES = [
  {
    icon: "🎰",
    name: "Surprise Me! (Gacha)",
    color: "#8b5cf6",
    desc: "Can't decide? Hit Surprise Me! to spin for a random drink. Three rarity tiers — Common, Rare, Ultra Rare — with odds weighted toward temperature-appropriate drinks. You get 3 spins per session.",
  },
  {
    icon: "🌡️",
    name: "Weather-Based Recommendations",
    color: "#0ea5e9",
    desc: "The Recommended tab reads the live outside temperature. Below 60°F → hot drinks are surfaced. At or above 60°F → cold drinks take the spotlight.",
  },
  {
    icon: "🎁",
    name: "Loyalty Stamp Rewards",
    color: "#f59e0b",
    desc: "Log in with Google on the kiosk to earn 1 stamp per order (20% chance for a bonus stamp). Hit 10 stamps and your next order is free. Stamps persist across sessions in the database.",
  },
];

const A11Y_FEATURES = [
  {
    icon: "🔍",
    name: "Text Size Controls",
    persona: "For Jacob — visual impairment",
    color: "#52b788",
    steps: [
      "Click the 🔍 button fixed to the bottom-left corner of any page.",
      "Use A+ to grow text and A− to shrink it across five levels: 100% → 125% → 150% → 175% → 200%.",
      "Click Reset to jump back to 100% at any time.",
      "Your chosen size is saved and remembered on your next visit.",
    ],
  },
  {
    icon: "🔎",
    name: "Live Magnifier Lens",
    persona: "For Jacob — visual impairment",
    color: "#52b788",
    steps: [
      "Open the accessibility panel (🔍 button) and toggle the Lens switch.",
      "Or press M on your keyboard to toggle it instantly from anywhere.",
      "Hover over any text — a floating lens appears showing that text at ~1.85× its original size.",
      "Press Esc or M again to dismiss it.",
    ],
  },
  {
    icon: "🌐",
    name: "Language Translation",
    persona: "For Maria — bilingual / Spanish speaker",
    color: "#3b82f6",
    steps: [
      "On the Customer Kiosk page, look for the language selector.",
      "Choose your preferred language (e.g. Spanish) from the dropdown.",
      "All visible menu text, labels, and navigation are re-rendered.",
      "Optimised for mobile — works on phones and tablets.",
    ],
  },
  {
    icon: "⌨️",
    name: "Screen Reader & Keyboard Navigation",
    persona: "For Emily — limited hand mobility",
    color: "#f59e0b",
    steps: [
      "All interactive elements carry ARIA labels for screen readers.",
      "Tab moves focus forward through buttons and form fields.",
      "Enter or Space activates the focused element.",
      "Buttons use enlarged hit-boxes to reduce precision needed.",
    ],
  },
];

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("team");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [expandedA11y, setExpandedA11y] = useState(null);

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

              {tab === "team" && (
                <div style={grid2}>
                  {TEAM.map((m, i) => (
                    <div
                      key={i}
                      style={{ ...memberCard, ...(expandedTeam === i ? memberCardExpanded : {}) }}
                      onClick={() => setExpandedTeam(expandedTeam === i ? null : i)}
                    >
                      <div style={memberRow}>
                        <span style={memberEmoji}>{m.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={memberName}>{m.name}</div>
                          <div style={memberRole}>{m.role}</div>
                        </div>
                        <span style={chevron}>{expandedTeam === i ? "▲" : "▼"}</span>
                      </div>
                      {expandedTeam === i && (
                        <ul style={contribList}>
                          {m.contrib.map((c, j) => (
                            <li key={j} style={contribItem}>
                              <span style={contribDot}>•</span>{c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "features" && (
                <div>
                  <h3 style={sectionHead}>5 Interfaces</h3>
                  <div style={grid2}>
                    {INTERFACES.map((iface, i) => (
                      <div key={i} style={ifaceCard}>
                        <div style={ifaceTop}>
                          <span style={ifaceIcon}>{iface.icon}</span>
                          <div>
                            <div style={ifaceName}>{iface.name}</div>
                            <div style={ifacePath}>{iface.path}</div>
                          </div>
                        </div>
                        <p style={ifaceDesc}>{iface.desc}</p>
                      </div>
                    ))}
                  </div>
                  <h3 style={{ ...sectionHead, marginTop: "1.5rem" }}>Core Features</h3>
                  <div style={grid2}>
                    {CORE_FEATURES.map((f, i) => (
                      <div key={i} style={coreRow}>
                        <span style={coreIcon}>{f.icon}</span>
                        <span style={coreText}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "beyond" && (
                <div style={beyondContainer}>
                  <p style={beyondIntro}>Three features built above and beyond the base project requirements.</p>
                  {BEYOND_FEATURES.map((b, i) => (
                    <div key={i} style={{ ...beyondCard, borderLeftColor: b.color }}>
                      <div style={beyondTop}>
                        <span style={{ ...beyondBadge, background: b.color }}>{b.icon}</span>
                        <span style={{ ...beyondName, color: b.color }}>{b.name}</span>
                      </div>
                      <p style={beyondDesc}>{b.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "a11y" && (
                <div style={a11yContainer}>
                  <p style={beyondIntro}>Aura Boba was built with three accessibility personas in mind.</p>
                  {A11Y_FEATURES.map((f, i) => (
                    <div key={i} style={{ ...a11yCard, borderLeftColor: f.color }}>
                      <div
                        style={a11yHeader}
                        onClick={() => setExpandedA11y(expandedA11y === i ? null : i)}
                      >
                        <div style={a11yTitleRow}>
                          <span style={{ ...a11yBadge, background: f.color }}>{f.icon}</span>
                          <div>
                            <div style={a11yName}>{f.name}</div>
                            <div style={a11yPersona}>{f.persona}</div>
                          </div>
                        </div>
                        <span style={chevron}>{expandedA11y === i ? "▲" : "▼"}</span>
                      </div>
                      {expandedA11y === i && (
                        <ol style={stepList}>
                          {f.steps.map((step, j) => (
                            <li key={j} style={stepItem}>
                              <span style={{ ...stepNum, background: f.color }}>{j + 1}</span>
                              <span style={stepText}>{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" };
const memberCard = {
  background: "white", border: "1px solid #d1fae5", borderRadius: "14px",
  padding: "1rem", cursor: "pointer", transition: "box-shadow 0.15s",
  boxShadow: "0 2px 8px rgba(27,67,50,0.04)",
};
const memberCardExpanded = { boxShadow: "0 4px 20px rgba(27,67,50,0.1)", borderColor: "#52b788" };
const memberRow = { display: "flex", alignItems: "center", gap: "0.75rem" };
const memberEmoji = {
  fontSize: "1.6rem", width: "2.4rem", height: "2.4rem", background: "#e8f5e9",
  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const memberName = { fontWeight: 700, fontSize: "0.92rem", color: "#1b4332" };
const memberRole = { fontSize: "0.75rem", color: "#2d6a4f", fontStyle: "italic" };
const chevron = { fontSize: "0.65rem", color: "#94a3b8", flexShrink: 0 };
const contribList = {
  margin: "0.75rem 0 0", padding: 0, listStyle: "none",
  borderTop: "1px dashed #d1fae5", paddingTop: "0.75rem",
  display: "flex", flexDirection: "column", gap: "0.4rem",
};
const contribItem = { display: "flex", gap: "0.5rem", fontSize: "0.8rem", color: "#334155", lineHeight: 1.4 };
const contribDot = { color: "#52b788", flexShrink: 0, fontWeight: 700 };
const sectionHead = { fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#2d6a4f", margin: "0 0 0.9rem" };
const ifaceCard = { background: "white", border: "1px solid #d1fae5", borderRadius: "14px", padding: "1rem", boxShadow: "0 2px 8px rgba(27,67,50,0.04)" };
const ifaceTop = { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" };
const ifaceIcon = { fontSize: "1.4rem", width: "2.2rem", height: "2.2rem", background: "#e8f5e9", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const ifaceName = { fontWeight: 700, fontSize: "0.88rem", color: "#1b4332" };
const ifacePath = { fontSize: "0.7rem", color: "#52b788", fontFamily: "monospace" };
const ifaceDesc = { fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: 1.5 };
const coreRow = { display: "flex", alignItems: "flex-start", gap: "0.6rem", background: "white", border: "1px solid #f1f8f1", borderRadius: "10px", padding: "0.65rem 0.9rem" };
const coreIcon = { fontSize: "1rem", flexShrink: 0, marginTop: "1px" };
const coreText = { fontSize: "0.8rem", color: "#334155", lineHeight: 1.45 };
const beyondContainer = { display: "flex", flexDirection: "column", gap: "1rem" };
const beyondIntro = { fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.5rem", lineHeight: 1.5 };
const beyondCard = { background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid", padding: "1.1rem 1.2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };
const beyondTop = { display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.65rem" };
const beyondBadge = { width: "2rem", height: "2rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 };
const beyondName = { fontWeight: 700, fontSize: "1rem" };
const beyondDesc = { margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6 };
const a11yContainer = { display: "flex", flexDirection: "column", gap: "0.85rem" };
const a11yCard = { background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", borderLeft: "5px solid", overflow: "hidden" };
const a11yHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.2rem", cursor: "pointer" };
const a11yTitleRow = { display: "flex", alignItems: "center", gap: "0.75rem" };
const a11yBadge = { width: "2.2rem", height: "2.2rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 };
const a11yName = { fontWeight: 700, fontSize: "0.92rem", color: "#1b4332" };
const a11yPersona = { fontSize: "0.72rem", color: "#64748b", fontStyle: "italic" };
const stepList = { margin: 0, padding: "0.75rem 1.2rem 1rem", listStyle: "none", borderTop: "1px solid #f1f8f1", display: "flex", flexDirection: "column", gap: "0.55rem", background: "#fafffe" };
const stepItem = { display: "flex", alignItems: "flex-start", gap: "0.6rem" };
const stepNum = { width: "1.3rem", height: "1.3rem", borderRadius: "50%", color: "white", fontSize: "0.65rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" };
const stepText = { fontSize: "0.8rem", color: "#334155", lineHeight: 1.5 };