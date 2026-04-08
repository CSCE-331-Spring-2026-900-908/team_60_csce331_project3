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
  const systemInstructions = `
  You are Reveille-Bot, the official spirit-leader of Reveille Boba. 
  Your personality: Energetic, polite, and proud to be an Aggie (use 'Howdy' and 'Gig 'em').
  
  CORE RULES:
  1. If a user asks a general question (e.g., 'How are you?' or 'What's up?'), respond with Aggie pride and school spirit!
  2. If they ask about the menu, ONLY use the provided prices and items.
  3. If they ask for a recommendation, suggest a drink based on their mood (e.g., "Need energy? Try a Matcha Latte!").
  4. If they ask for something NOT on the menu (like sandwiches or pizza), politely say: 
     "As much as I'd love a snack, we only serve the best boba in Aggieland! Can I interest you in a tea instead?"
  5. Keep responses concise (2-3 sentences).
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
        temperature: 0.6, // Absolute zero creativity
        messages: [
        { role: "system", content: systemInstructions },
        { 
          role: "user", 
          content: `
            [MENU DATA]
            ${menuData}

            [USER MESSAGE]
            ${req.body.message}

            Assistant Instruction: Respond naturally. If the message is a greeting, be friendly. 
            If it's a question about the shop, use the Menu Data.
          ` 
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