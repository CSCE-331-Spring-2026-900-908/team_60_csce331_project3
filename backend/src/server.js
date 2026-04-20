import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from 'google-auth-library';
import pool from "./config/db.js"; 
import fs from 'fs';

// --- Route Imports ---
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// --- 1. Middleware & CORS ---
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// --- 2. Google OAuth Configuration ---
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Initialize with the secret included
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

// --- 3. Auth Routes ---

/**
 * Initiates the Google OAuth flow.
 * Captures the 'state' (the intended page like /kitchen) to pass to Google.
 */
app.get("/auth/google", (req, res) => {
    const { state } = req.query; // Capture /kitchen, /manager, etc.
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:8080'}/auth/google/callback`,
        client_id: CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        state: state || '/manager', // Pass intent to Google
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };
    const queryString = new URLSearchParams(options).toString();
    res.redirect(`${rootUrl}?${queryString}`);
});

/**
 * Handles the return trip from Google.
 * Receives the auth code and the original state (destination).
 */
app.get("/auth/google/callback", async (req, res) => {
    const { code, state } = req.query; // State is the destination
    try {
        // 1. Exchange the code for a token
        const { tokens } = await client.getToken({
            code,
            redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:8080'}/auth/google/callback`
        });
        
        // 2. Get user info from the token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        // 3. Determine Role
        const managers = ["ok.samgarces@gmail.com", "reveille.bubbletea@gmail.com", "ibrahimerandhawa@gmail.com", "4andrew.siv@gmail.com", "christianb62791@gmail.com", "rch27@tamu.edu"];
        const cashiers = ["purigarv@tamu.edu", "cqb.23000@tamu.edu", "andrewsiv14@tamu.edu", "garcesam0@tamu.edu", "ibrahime@tamu.edu"];
        
        let role = "customer";
        if (managers.includes(payload.email)) role = "manager";
        else if (cashiers.includes(payload.email)) role = "cashier";

        // 4. Redirect to frontend with role AND destination (dest)
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/login-success?role=${role}&name=${payload.given_name}&id=${payload.sub}&dest=${state}`);
        
    } catch (err) {
        console.error("Callback Error:", err);
        res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/portal`);
    }
});

/**
 * POST route for Customer Login (Popup method)
 */
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const googleId = payload.sub;
        const fullName = payload.name;

        const managers = ["ok.samgarces@gmail.com", "reveille.bubbletea@gmail.com", "ibrahimerandhawa@gmail.com", "4andrew.siv@gmail.com", "christianb62791@gmail.com", "rch27@tamu.edu"];
        const cashiers = ["purigarv@tamu.edu", "cqb.23000@tamu.edu", "andrewsiv14@tamu.edu", "garcesam0@tamu.edu", "ibrahime@tamu.edu"];

        let role = "customer";
        if (managers.includes(userEmail)) role = "manager";
        else if (cashiers.includes(userEmail)) role = "cashier";

        let stamps = 0; // Default for new users

        if (role === "customer") {
            // 1. Try to insert the user if they don't exist
            await pool.query(
                `INSERT INTO public.customers (customer_id, name, stamps, lucky_draw_eligible, reward_points) 
                 VALUES ($1, $2, 0, false, 0) ON CONFLICT (customer_id) DO NOTHING`,
                [googleId, fullName]
            );

            // 2. Fetch the actual current data for this customer
            const customerData = await pool.query(
                "SELECT stamps FROM public.customers WHERE customer_id = $1",
                [googleId]
            );
            
            if (customerData.rows.length > 0) {
                stamps = customerData.rows[0].stamps; // Get their real stamp count
            }
        }

        // 3. Send stamps back to the kiosk so it can display "7/10" etc.
        res.json({ 
            success: true, 
            role, 
            name: fullName.split(' ')[0], 
            customer_id: googleId,
            stamps: stamps 
        });
    } catch (err) {
        console.error("Kiosk Auth Error:", err);
        res.status(401).json({ error: "Invalid Token" });
    }
});

// --- 4. API Routes ---
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/reports", reportRoutes);

// --- 5. AI Chat & Weather ---
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const url = "https://api.groq.com/openai/v1/chat/completions";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are Reveille-Bot. Personality: Energetic, polite, Aggie pride ('Howdy', 'Gig 'em')." },
          { role: "user", content: req.body.message }
        ]
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI error" });
  }
});

// Add these variables ABOVE your routes (near the top of server.js)
let cachedWeather = null;
let lastFetchTime = 0;

// Update your weather route
app.get("/api/weather", async (req, res) => {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  // If we have a recent temperature (less than 15 mins old), use it!
  if (cachedWeather !== null && (now - lastFetchTime) < fifteenMinutes) {
    return res.json({ temp: cachedWeather, source: "cache" });
  }

  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.334&current=temperature_2m&temperature_unit=fahrenheit", {
      headers: { 'User-Agent': 'AuraBobaApp/1.0' }
    });

    if (!response.ok) {
      // If we hit a 429 but have OLD data, just use the old data instead of failing
      if (response.status === 429 && cachedWeather !== null) {
        return res.json({ temp: cachedWeather, source: "stale-cache-on-error" });
      }
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json();
    cachedWeather = Math.round(data.current.temperature_2m);
    lastFetchTime = now;

    res.json({ temp: cachedWeather, source: "live" });
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    // Fallback so the UI doesn't break
    res.status(500).json({ error: "Weather unavailable", details: error.message });
  }
});

// --- 6. Status Route ---
app.get("/", (req, res) => {
    res.send("🚀 Aura Boba Backend is Live and Running!");
});

// --- 7. Server Start ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Aura Backend running on port ${PORT}`);
});