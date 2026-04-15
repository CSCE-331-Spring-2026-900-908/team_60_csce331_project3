import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/reports", reportRoutes);

// --- AI CHAT ROUTE ---
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const menuData = `
    OFFICIAL REVEILLE BOBA MENU:
    - Taro Milk Tea: $6.00
    - Fruit Teas: $5.75 (Mango, Passionfruit, Peach, Strawberry)
    - Slushes: $6.25 (Mango, Strawberry)
    - Classic Milk Tea: $5.50
    - Matcha Latte: $6.25
  `;

  const systemInstructions = `
    You are Reveille-Bot. Personality: Energetic, polite, Aggie pride ('Howdy', 'Gig 'em').
    1. Only use provided menu prices/items. 
    2. Keep responses to 2-3 sentences.
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstructions },
          { role: "user", content: `[MENU] ${menuData} [USER] ${req.body.message}` }
        ]
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI error" });
  }
});

// --- WEATHER API ---
app.get("/api/weather", async (req, res) => {
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.334&current=temperature_2m&temperature_unit=fahrenheit");
    const data = await response.json();
    res.json({ temp: Math.round(data.current.temperature_2m) });
  } catch (error) {
    res.status(500).json({ error: "Weather unavailable" });
  }
});

// --- DEPLOYMENT LOGIC: SERVE FRONTEND ---
// This serves the built React files from the 'dist' folder
const buildPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(buildPath));

// Handle React routing, return all non-API requests to index.html
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;
// We check if this file is being run directly to avoid double-listening during tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;

