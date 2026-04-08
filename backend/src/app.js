import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- AI CHAT ROUTE (GROQ + MENU KNOWLEDGE) ---
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY; 
  const url = "https://api.groq.com/openai/v1/chat/completions";

  // 1. The Strict Knowledge Base
  const menuData = `
    OFFICIAL REVEILLE BOBA MENU (ONLY USE THESE):
    - Taro Milk Tea: $6.00
    - Fruit Teas: $5.75 (Mango, Passionfruit, Peach, Strawberry)
    - Slushes: $6.25 (Mango, Strawberry)
    - Classic Milk Tea: $5.50
    - Matcha Latte: $6.25
  `;

  // 2. The Strict Instructions
  const systemInstructions = "You are Reveille-Bot, the friendly mascot for Reveille Bubble Tea. Always be polite, say 'Howdy' or 'Gig 'em', and ONLY use the provided menu and prices. Keep it to one sentence.";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.0, // Absolute zero creativity
        messages: [
          { role: "system", content: systemInstructions },
          { 
            role: "user", 
            content: `Context: ${menuData}\n\nUser Question: ${req.body.message}\n\nAnswer only using the context provided:` 
          }
        ],
        max_completion_tokens: 50 
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    console.log("✅ Bot Replied:", reply);
    res.json({ reply });

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

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/manager", managerRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key Detected: ${process.env.GROQ_API_KEY ? "YES" : "NO"}`);
});

export default app;