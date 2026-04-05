import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "../services/api";

const CATEGORY_ORDER = ["milk tea", "fruit tea", "tea", "latte", "slush"];

const CATEGORY_TITLES = {
  "milk tea": "Milk Tea",
  "fruit tea": "Fruit Tea",
  tea: "Tea",
  latte: "Lattes",
  slush: "Slush",
};

const FEATURED_NAMES = [
  "Brown Sugar Milk Tea",
  "Matcha Latte",
  "Thai Milk Tea",
  "Mango Fruit Tea",
  "Strawberry Fruit Tea",
  "Peach Oolong Tea",
];

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

export default function MenuBoardPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await fetchMenu();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("Unable to load menu.");
      }
    }

    loadMenu();
  }, []);

  const featuredItems = useMemo(() => {
    const featured = FEATURED_NAMES.map((name) =>
      menuItems.find((item) => item.name === name)
    ).filter(Boolean);

    if (featured.length >= 6) {
      return featured.slice(0, 6);
    }

    const extras = menuItems.filter(
      (item) =>
        !featured.some(
          (featuredItem) => featuredItem.menu_item_id === item.menu_item_id
        )
    );

    return [...featured, ...extras].slice(0, 6);
  }, [menuItems]);

  const sections = useMemo(() => {
    return CATEGORY_ORDER.map((category) => {
      const items = menuItems
        .filter((item) => item.category === category)
        .slice(0, 6);

      return {
        key: category,
        title: CATEGORY_TITLES[category] || category,
        items,
      };
    }).filter((section) => section.items.length > 0);
  }, [menuItems]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #3a3a3a 0%, #1d1d1d 35%, #111 100%)",
        color: "#f5f1e8",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          minHeight: "calc(100vh - 4rem)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              border: "3px solid #f5f1e8",
              padding: "1rem 2.5rem",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              boxShadow: "0 0 24px rgba(0,0,0,0.35)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "4rem",
                fontWeight: "800",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Bubble Tea Menu
            </h1>
          </div>

          <p
            style={{
              marginTop: "1rem",
              fontSize: "1.35rem",
              color: "#ddd6c8",
            }}
          >
            Fresh drinks made to order
          </p>

          {message && (
            <p
              style={{
                fontSize: "1.2rem",
                color: "#ffb3b3",
                marginTop: "0.75rem",
              }}
            >
              {message}
            </p>
          )}
        </div>

        <div
          style={{
            border: "2px solid rgba(245, 241, 232, 0.35)",
            borderRadius: "18px",
            padding: "1.25rem 1.5rem",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <h2
            style={{
              margin: "0 0 1rem 0",
              textAlign: "center",
              fontSize: "2rem",
              letterSpacing: "0.05em",
              color: "#ffe9b3",
            }}
          >
            Featured Drinks
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1rem",
            }}
          >
            {featuredItems.map((item) => (
              <div
                key={item.menu_item_id}
                style={{
                  border: "1px solid rgba(245, 241, 232, 0.3)",
                  borderRadius: "14px",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.02)",
                  minHeight: "110px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "700",
                    marginBottom: "0.4rem",
                  }}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    fontSize: "1rem",
                    color: "#d7cfbf",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.description}
                </div>

                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#ffe9b3",
                  }}
                >
                  {formatPrice(item.base_price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1.25rem",
          }}
        >
          {sections.map((section) => (
            <div
              key={section.key}
              style={{
                border: "2px solid rgba(245, 241, 232, 0.35)",
                borderRadius: "18px",
                padding: "1.25rem",
                background: "rgba(255,255,255,0.03)",
                boxShadow: "0 0 18px rgba(0,0,0,0.25)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "1rem",
                  textAlign: "center",
                  fontSize: "2rem",
                  color: "#f8f2e8",
                }}
              >
                {section.title}
              </h2>

              <div style={{ display: "grid", gap: "0.9rem" }}>
                {section.items.map((item) => (
                  <div key={item.menu_item_id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "600",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.name}
                      </span>

                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: "#ffe9b3",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPrice(item.base_price)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "0.2rem",
                        fontSize: "0.95rem",
                        color: "#d7cfbf",
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "2px solid rgba(245, 241, 232, 0.25)",
            paddingTop: "0.9rem",
            textAlign: "center",
            fontSize: "1.1rem",
            color: "#ddd6c8",
          }}
        >
          Ask staff about toppings, seasonal drinks, and allergen information.
        </div>
      </div>
    </div>
  );
}
