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

// --- AI CHAT ROUTE (GROQ) ---
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY; 
  const url = "https://api.groq.com/openai/v1/chat/completions";

  console.log("🚀 Calling Groq API (Llama 3)...");
  console.log("📩 User Message:", req.body.message);

  if (!apiKey) {
    console.error("❌ ERROR: GROQ_API_KEY is not defined in .env");
    return res.status(500).json({ error: "AI configuration missing." });
  }

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
          { 
            role: "system", 
            content: "You are Reveille-Bot, a friendly AI for a Boba Tea Shop. You love Texas A&M and suggest boba drinks. Keep answers short and fun." 
          },
          { 
            role: "user", 
            content: req.body.message 
          }
        ],
        max_completion_tokens: 150 
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Groq Error:", data.error.message);
      return res.status(400).json({ error: data.error.message });
    }

    const reply = data.choices[0].message.content;
    console.log("✅ Bot Replied:", reply);
    res.json({ reply });

  } catch (error) {
    console.error("🛑 Network Error:", error.message);
    res.status(500).json({ error: "AI is currently offline." });
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

// --- ROUTES ---
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